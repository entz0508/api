// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

function add_routes(app) {
    "use strict";

    app.post("/nde/episode/episodePlayHistory", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var responseOBJ = {};
            responseOBJ.play_history = [];

            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.lang = "KO";

            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            MYSQL_SLP_KW_ACTION_LOG_CONN.procGetEpisodePlayHistoryNDE(requestParams, function(err, results){
                if(err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procGetEpisodePlayHistoryNDE", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var play_history = [];

                    if ((0 < results[0].length)) {
                        var len = results[0].length;
                        var tmpTime = 0;
                        var lastSEQ = {};
                        // lastSEQ.STEP_ATTEND_ID = "none";
                        lastSEQ.SEQ_ID = "none";
                        lastSEQ.APP_ID = "none";
                        lastSEQ.ACCOUNT_ID = "none";
                        lastSEQ.PROFILE_ID = "none";
                        lastSEQ.LESSON_LIST = [];
                        var lastLesson = {};
                        lastLesson.LESSON_ID = "none";
                        var isFirst = true;
                        var isNewLessonSet = false;


                        for (var i = 0; i < len; i++) {
                            var row = results[0][i];
                            var curLesson = {};
                            curLesson.UNIT_ID = row.UNIT_ID;
                            curLesson.BEGIN_DATETIME = row.BEGIN_DT;
                            curLesson.END_DATETIME = row.END_DT;


                            if (lastSEQ.SEQ_ID === row.SEQ_ID) {
                                // SEQ 같다면 LESSON 확인
                                if (lastLesson.LESSON_ID === row.LESSON_ID) {
                                    // LESSON 이 같다면 기존 배열에 챕터만 추가
                                    tmpTime = tmpTime + row.P_TIME;
                                    lastLesson.P_TIME = tmpTime;
                                    lastLesson.UNIT_LIST.push(curLesson);
                                } else {
                                    // LESSON 이 같지 않다면 새로운 배열추가 기존의 LESSON 을 SEQ에 푸쉬
                                    if (isNewLessonSet) {
                                        // lastSEQ.LESSON_LIST.push(lastLesson);
                                        isNewLessonSet = false;
                                    }

                                    // 새로운 LESSON 세팅
                                    lastLesson = {}; // 푸쉬했으니 지난 LESSON 초기화
                                    lastLesson.LESSON_ID = row.LESSON_ID;
                                    lastLesson.P_TIME = row.P_TIME;
                                    // PRINT_LOG.info("new lesson ptime"+i,JSON.stringify(lastLesson));
                                    // PRINT_LOG.info("new lesson ptime"+i,row.P_TIME);
                                    lastLesson.BEGIN_DATETIME = row.BEGIN_DT;
                                    lastLesson.END_DATETIME = row.END_DT;
                                    lastLesson.UNIT_LIST = [];
                                    lastLesson.UNIT_LIST.push(curLesson);

                                    lastSEQ.LESSON_LIST.push(lastLesson);

                                    isNewLessonSet = true;
                                }

                                isFirst = false;
                            } else {
                                // SEQ 가 같지 않다면 lastCategory 를 play_history 에 push
                                if (!isFirst) {
                                    if (isNewLessonSet) {
                                        lastSEQ.LESSON_LIST.push(lastLesson);
                                        isNewLessonSet = false;
                                    }
                                    play_history.push(lastSEQ);
                                }

                                // 초기화
                                lastSEQ = {};
                                // lastSEQ.STEP_ATTEND_ID = row.STEP_ATTEND_ID;
                                lastSEQ.SEQ_ID = row.SEQ_ID;
                                lastSEQ.APP_ID = row.APP_ID;
                                lastSEQ.ACCOUNT_ID = row.ACCOUNT_ID;
                                lastSEQ.PROFILE_ID = row.PROFILE_ID;
                                lastSEQ.LESSON_LIST = [];
                                // 새로운 LESSON 세팅
                                lastLesson = {};
                                lastLesson.LESSON_ID = row.LESSON_ID;
                                lastLesson.P_TIME = row.P_TIME;
                                // PRINT_LOG.info("first ptime"+i,JSON.stringify(lastLesson));
                                // PRINT_LOG.info("first ptime"+i,row.P_TIME);
                                lastLesson.UNIT_LIST = [];
                                lastLesson.UNIT_LIST.push(curLesson);

                                lastSEQ.LESSON_LIST.push(lastLesson);
                                isFirst = false;
                            }
                        }
                        play_history.push(lastSEQ);

                    }

                    PACKET.sendSuccess(req, res, {play_history: play_history});
                }
            });

        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;


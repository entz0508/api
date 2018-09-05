/**
 * Created by kkuris on 2017-12-29.
 */
require('date-utils');
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function(app) {
    app.post("/nde/episode/permlistest", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_SEQID, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var SEQBuyList = [];

            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.lang = "KO";

            if (requestParams.seqID == null) requestParams.seqID = 0;

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            MYSQL_SLP_NDE.procGetEpisodePermList(requestParams, function(err, results) {
                if (err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procGetEpisodePermList", err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                if ((0 < results[0].length)) {
                    var len = results[0].length;

                    var lastSEQ = {};
                    lastSEQ.SEQ_ID = "none";
                    lastSEQ.APP_ID = "none";
                    lastSEQ.PDT_ID = "none";
                    lastSEQ.ACCOUNT_ID = "none";
                    lastSEQ.BUY_DATE = "none";
                    lastSEQ.BEGIN_DATETIME = "none";
                    lastSEQ.END_DATETIME = "none";
                    lastSEQ.EXPIRED = "none";
                    lastSEQ.LESSON_LIST = [];
                    var lastLesson = {};
                    lastLesson.LESSON_ID = "none";
                    var isFirst = true;
                    var isNewLessonSet = false;

                    var compCurCnt = 0;

                    for (var i = 0; i < len; i++) {
                        var row = results[0][i];
                        var curUnit = {};
                        curUnit.UNIT_ID = row.UNIT_ID;
                        curUnit.complete = row.complete;

                        compCurCnt += row.complete;

                        if (lastSEQ.SEQ_ID === row.SEQ_ID) {
                            // SEQ 같다면 LESSON 확인
                            if (lastLesson.LESSON_ID === row.LESSON_ID) {
                                lastLesson.COMPLETEUNITCNT = compCurCnt;
                                // LESSON 이 같다면 기존 배열에 유닛리스트만 추가

                                lastLesson.UNIT_LIST.push(curUnit);

                            } else {
                                // LESSON 이 같지 않다면 새로운 배열추가 기존의 LESSON 을 SEQ에 푸쉬
                                if (isNewLessonSet) isNewLessonSet = false;

                                // 새로운 LESSON 세팅

                                lastLesson = {}; // 푸쉬했으니 지난 LESSON 초기화
                                compCurCnt = 0;
                                compCurCnt += row.complete;

                                lastLesson.LESSON_ID = row.LESSON_ID;
                                lastLesson.TOTALUNITCNT = 5;
                                lastLesson.COMPLETEUNITCNT = compCurCnt;
                                lastLesson.UNIT_LIST = [];
                                lastLesson.UNIT_LIST.push(curUnit);

                                lastSEQ.LESSON_LIST.push(lastLesson);

                                isNewLessonSet = true;
                            }

                            isFirst = false;
                        } else {
                            // SEQ 가 같지 않다면 lastCategory 를 rotation_play_history 에 push
                            if (!isFirst) {
                                if (isNewLessonSet) {
                                    // lastSEQ.LESSON_LIST.push(lastLesson);
                                    isNewLessonSet = false;
                                }
                                SEQBuyList.push(lastSEQ);
                            }

                            // 초기화
                            lastSEQ = {};
                            lastSEQ.SEQ_ID = row.SEQ_ID;
                            lastSEQ.APP_ID = row.APP_ID;
                            lastSEQ.PDT_ID = row.PDT_ID;
                            lastSEQ.ACCOUNT_ID = row.ACCOUNT_ID;
                            lastSEQ.BUY_DATE = row.BUY_DATE;
                            lastSEQ.BEGIN_DATETIME = row.BEGIN_DATETIME;
                            lastSEQ.END_DATETIME = row.END_DATETIME;
                            lastSEQ.EXPIRED = row.EXPIRED;
                            lastSEQ.LESSON_LIST = [];

                            if (lastSEQ.EXPIRED == 'Y'){
                                lastSEQ = {};
                                lastSEQ.SEQ_ID = row.SEQ_ID;
                                lastSEQ.APP_ID = row.APP_ID;
                                lastSEQ.PDT_ID = row.PDT_ID;
                                lastSEQ.ACCOUNT_ID = row.ACCOUNT_ID;
                                lastSEQ.BUY_DATE = row.BUY_DATE;
                                lastSEQ.BEGIN_DATETIME = row.BEGIN_DATETIME;
                                lastSEQ.END_DATETIME = row.END_DATETIME;
                                lastSEQ.EXPIRED = row.EXPIRED;
                                lastSEQ.EXPIRED_DATE = row.EXPIRED_DATE;

                            } else {

                                // 새로운 LESSON 세팅
                                lastLesson = {};
                                lastLesson.LESSON_ID = row.LESSON_ID;
                                lastLesson.TOTALUNITCNT = 5;
                                lastLesson.COMPLETEUNITCNT = 0;
                                lastLesson.UNIT_LIST = [];
                                lastLesson.UNIT_LIST.push(curUnit);

                                lastSEQ.LESSON_LIST.push(lastLesson);
                                isFirst = false;
                            }

                        }
                    }
                    SEQBuyList.push(lastSEQ);
                }

                PACKET.sendSuccess(req, res, {SEQBuyList: SEQBuyList, MSG: row.MSG});
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
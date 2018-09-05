/**
 * Created by kkuris on 2017-12-07.
 */
// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;


exports.add_routes = function(app) {

    app.post("/nde/checkup/result", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

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
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.corretChkCnt = COMMON_UTIL.trim(req.body.correct_check_count);
            requestParams.wrongChkCnt = COMMON_UTIL.trim(req.body.wrong_check_count);
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.lang = "KO";

            var quizCheckCount = [];

            MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUpResult(requestParams, function(err, results) {

                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUp, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {

                    if((0 < results[0].length)) {
                        var len = results[0].length;

                        var HaveSEQID = {};
                        HaveSEQID.ACCOUNT_ID = "none";
                        HaveSEQID.SEQID =  "none";
                        HaveSEQID.PROFILE_ID = "none";
                        HaveSEQID.CHECKUP_LIST = [];

                        var lastLevel = {};
                        lastLevel.LEVEL_ID = "none";
                        lastLevel.LEVELTOTALQS = "none";
                        lastLevel.LEVELCORETANS = "none";

                        var lastLesson = {};
                        lastLesson.LESSON_ID = "none";
                        var isFirst = true;
                        var isNewLessonSet = false;
                        var isNewLevelSet = false;

                        var count ={
                            total: 0,
                            curtotal: 0,
                            correct: 0,
                            curcorrect: 0
                        };

                        for(var i = 0; i < len; i++){

                            var row = results[0][i];
                            var curUnit = {};

                            curUnit.UNIT_ID = row.unit_id;
                            curUnit.TOTALQUESTIONS = row.total_chk_cnt;
                            curUnit.CORRECTANS = row.correct_chk_cnt;
                            curUnit.WRONGANS = row.wrong_chk_cnt;
                            curUnit.PERCENTANS = row.per_correct_ans;
                            curUnit.BEGIN_DATETIME = row.begin_datetime;
                            curUnit.END_DATETIME = row.end_datetime;

                            count.curtotal += row.total_chk_cnt;
                            count.curcorrect += row.correct_chk_cnt;

                            count.total = count.curtotal;
                            count.correct = count.curcorrect;

                            // console.log(count);

                            if(HaveSEQID.SEQID === row.seq_id){
                                //SEQID 가 같다면

                                if(lastLevel.LEVEL_ID === row.level_id){
                                    // LEVEL ID 가 같다면

                                    lastLevel.LEVELTOTALQS = count.total;
                                    lastLevel.LEVELCORETANS = count.correct;

                                    if(lastLesson.LESSON_ID === row.lesson_id){
                                        //SEQID가 같고 LESSONID 가 같다면

                                        lastLesson.UNIT_LIST.push(curUnit);

                                    } else {
                                        if(isNewLessonSet){
                                            isNewLessonSet = false;
                                        }

                                        //새로운 LESSON 세팅
                                        lastLesson = {};
                                        lastLesson.LESSON_ID = row.lesson_id;
                                        lastLesson.UNIT_LIST = [];
                                        lastLesson.UNIT_LIST.push(curUnit);

                                        lastLevel.LESSON_LIST.push(lastLesson);

                                        isNewLessonSet = true;
                                    }

                                    isFirst = false;
                                } else {
                                    if(isNewLevelSet){
                                        isNewLevelSet = false;
                                    }
                                    //새로운 레슨 세팅
                                    lastLesson = {};
                                    lastLesson.LESSON_ID = row.lesson_id;
                                    lastLesson.UNIT_LIST = [];
                                    lastLesson.UNIT_LIST.push(curUnit);

                                    //새로운 레벨 세팅
                                    count.curtotal = 0;
                                    count.curcorrect = 0;

                                    count.curtotal += row.total_chk_cnt;
                                    count.curcorrect += row.correct_chk_cnt;

                                    count.total = count.curtotal;
                                    count.correct = count.curcorrect;

                                    lastLevel = {};
                                    lastLevel.LEVEL_ID = row.level_id;
                                    lastLevel.LEVELTOTALQS = count.total;
                                    lastLevel.LEVELCORETANS = count.correct;
                                    lastLevel.LESSON_LIST = [];
                                    lastLevel.LESSON_LIST.push(lastLesson);

                                    HaveSEQID.CHECKUP_LIST.push(lastLevel);

                                    isNewLevelSet = true;
                                }

                            } else {
                                //SEQ가 같지 않다면
                                if(!isFirst){
                                    if(isNewLessonSet){
                                        HaveSEQID.CHECKUP_LIST.push(lastLevel);
                                        isNewLessonSet = false;
                                    }
                                    quizCheckCount.push(HaveSEQID);
                                }

                                //초기화
                                HaveSEQID = {};
                                HaveSEQID.SEQID = row.seq_id;
                                HaveSEQID.ACCOUNT_ID = requestParams.accountID;
                                HaveSEQID.PROFILE_ID = requestParams.profileID;
                                HaveSEQID.CHECKUP_LIST = [];

                                lastLesson = {};
                                lastLesson.LESSON_ID = row.lesson_id;
                                lastLesson.UNIT_LIST = [];
                                lastLesson.UNIT_LIST.push(curUnit);

                                count.curtotal = 0;
                                count.curcorrect = 0;

                                count.curtotal += row.total_chk_cnt;
                                count.curcorrect += row.correct_chk_cnt;

                                count.total = count.curtotal;
                                count.correct = count.curcorrect;

                                lastLevel = {};
                                lastLevel.LEVEL_ID = row.level_id;
                                lastLevel.LEVELTOTALQS = count.total;
                                lastLevel.LEVELCORETANS = count.correct;
                                lastLevel.LESSON_LIST = [];
                                lastLevel.LESSON_LIST.push(lastLesson);


                                HaveSEQID.CHECKUP_LIST.push(lastLevel);
                                isFirst = true;

                            }
                        }
                        quizCheckCount.push(HaveSEQID);

                    }

                    PACKET.sendSuccess(req, res, {quizCheckCount: quizCheckCount});
                }
            });


        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
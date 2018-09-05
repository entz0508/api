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

    var updateQuiz = function(requestParams, idx, callBack) {
        var step = requestParams.quizResult.step;
        var quizLen = requestParams.quizResult.quiz.length;
        var quizId = requestParams.quizResult.quiz[idx].id;
        var result = requestParams.quizResult.quiz[idx].result;
        MYSQL_SLP_KW_ACTION_LOG_CONN.procUpdateQuiz(requestParams, step, quizId, result, function (err, results) {
            var resData = {};
            resData.isSuccess = false;
            resData.res = -1;
            resData.err = null;
            resData.errMsg = "";

            if (err) {
                resData.isSuccess = false;
                resData.res = ERROR_CODE_UTIL.RES_FAILED_DB;
                resData.err = err;
                resData.errMsg = "Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procUpdateMedal, ";
                PRINT_LOG.setErrorLog(resData.errMsg, err);
                callBack(resData);
            } else {
                var sql = COMMON_UTIL.getMysqlRES(results);
                if (0 != sql.res) {
                    resData.isSuccess = false;
                    resData.res = sql.res;
                    resData.err = sql.err;
                    resData.errMsg = "Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procTmp, " + sql.msg;
                    PRINT_LOG.setErrorLog(resData.errMsg, resData.err);
                    callBack(resData);
                } else {
                    if ((quizLen - 1) == idx) {
                        resData.isSuccess = true;
                        resData.res = 0;
                        resData.err = null;
                        resData.errMsg = "";
                        callBack(resData);
                    } else {
                        updateQuiz(requestParams, idx+1, function (resRsult) {
                            callBack(resRsult);
                        });
                    }
                }
            }
        });
    };

    var updateMedal = function(requestParams, idx, callBack) {
        var step = requestParams.quizResult.step;
        var medalLen = requestParams.quizResult.medal.length;
        var medalID = requestParams.quizResult.medal[idx].id;
        var status = requestParams.quizResult.medal[idx].status;

        MYSQL_SLP_KW_ACTION_LOG_CONN.procUpdateMedal(requestParams, step, medalID, status, function (err, results) {
            var resData = {};
            resData.isSuccess = false;
            resData.res = -1;
            resData.err = null;
            resData.errMsg = "";

            if (err) {
                resData.isSuccess = false;
                resData.res = ERROR_CODE_UTIL.RES_FAILED_DB;
                resData.err = err;
                resData.errMsg = "Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procUpdateMedal, ";
                PRINT_LOG.setErrorLog(resData.errMsg, err);
                callBack(resData);
            } else {
                var sql = COMMON_UTIL.getMysqlRES(results);
                if (0 != sql.res) {
                    resData.isSuccess = false;
                    resData.res = sql.res;
                    resData.err = sql.err;
                    resData.errMsg = "Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procUpdateMedal, " + sql.msg;
                    PRINT_LOG.setErrorLog(resData.errMsg, resData.err);
                    callBack(resData);
                } else {
                    if ((medalLen - 1) == idx) {
                        resData.isSuccess = true;
                        resData.res = 0;
                        resData.err = null;
                        resData.errMsg = "";
                        callBack(resData);
                    } else {
                        updateMedal(requestParams, idx + 1, function (resRsult) {
                            callBack(resRsult);
                        });
                    }
                }
            }
        });
    };

    var isValidQuizIdList = function(quizList) {
        var len = quizList.length;
        if (0 >= len) {
            return false;
        } else {
            for (var i = 0; i < len; i++) {
                if (!COMMON_UTIL.isValidQuizID(quizList[i].id)) {
                    return false;
                }
            }
            return true;
        }
    };

    var isValidMedalIdList = function(medalList) {
        var len = medalList.length;
        if( 0 >= len ) {
            return false;
        } else {
            for (var i = 0; i < len; i++) {
                if (!COMMON_UTIL.isValidMedalID(medalList[i].id)) {
                    return false;
                }
            }
            return true;
        } 
    };

    app.post("/sen/quiz/result/update", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();

            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);

            var quizString = COMMON_UTIL.trim(req.body.quiz);
            if(COMMON_UTIL.isNull(quizString)) {
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                return;
            }
            quizString = quizString.replace(/\\/gi,"");
            requestParams.quizResult = JSON.parse(quizString);
            requestParams.lang = "KO";
            requestParams.groupSRL = 0;


            var step = requestParams.quizResult.step;
            //var medalLen = requestParams.quizResult.medal.length;
            //var quizLen = requestParams.quizResult.quiz.length;
            if( !COMMON_UTIL.isValidStepID(step) || !isValidQuizIdList(requestParams.quizResult.quiz) || !isValidMedalIdList(requestParams.quizResult.medal) ) {
                PRINT_LOG.error(__filename, API_PATH, ", " + JSON.stringify(req.body) ) ;
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            } else {
                MYSQL_SLP_KW_ACTION_LOG_CONN.procGetQuizGroupSRL(requestParams, function(err, results){
                    if(err) {
                        PRINT_LOG.error(__filename, API_PATH, "Failed, DB, MYSQL_SLP_KW_ACTION_LOG_CONN.procGetQuizGroupSRL");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {
                        var sql = COMMON_UTIL.getMysqlRES(results);
                        if (0 != sql.res) {
                            requestParams.groupSRL = Number(results[0][0].SRL);
                            if( 0 >= requestParams.groupSRL) {
                                PRINT_LOG.error(__filename, API_PATH, "Failed, DB, MYSQL_SLP_KW_ACTION_LOG_CONN.procGetQuizGroupSRL, " + sql.msg + ", groupSRL" + requestParams.groupSRL );
                                PACKET.sendFail(req, res, sql.res);
                            } else {
                                updateQuiz(requestParams, 0,  function (resData) {
                                    if (!resData.isSuccess) {
                                        PRINT_LOG.error(__filename, API_PATH, "failed, update quiz result");
                                        PACKET.sendFail(req, res, resData.res);
                                    } else {
                                        updateMedal(requestParams, 0, function (resData2) {
                                            if (!resData2.isSuccess) {
                                                PRINT_LOG.error(__filename, API_PATH, "failed, update medal status");
                                                PACKET.sendFail(req, res, resData2.res);
                                            } else {
                                                var responseOBJ = {};
                                                PACKET.sendSuccess(req, res, responseOBJ);
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            PRINT_LOG.error(__filename, API_PATH, "Failed, DB, MYSQL_SLP_KW_ACTION_LOG_CONN.procGetQuizGroupSRL, " + sql.msg);
                            PACKET.sendFail(req, res, sql.res);
                        }
                    }

                });

            }
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;
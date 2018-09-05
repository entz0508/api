/**
 * Created by kkuris on 2018-01-24.
 */
/**
 * Created by kkuris on 2018-01-17.
 */
// nodejs npm
const CRYPTO = require("crypto");
var request = require("request");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function (app) {

    var ebsLang_check = function (exParam, callBack) {
        // var url = "http://s-www.ebslang.co.kr";
        var path = "/app/getStuStatus.ebs";            // 관리자 구매
        var url =  global.CONFIG.EBS_SERVICE.STAGE_URL + path;
        // var url =  global.CONFIG.EBS_SERVICE.SERVICE_URL + path;
        // url = url + path;

        try {
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: exParam
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // PRINT_LOG.info(__filename, 'ebsLang_check', body);          // {"res":-1}
                    // 성공시 DB에 성공처리
                    PRINT_LOG.info(__filename, 'ebsLang_check', body);
                    callBack(JSON.parse(body));
                }
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };

    // app Login(web Login ����)

    app.post("/slp.user.account.nde.web.login", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var encKey = "blueark_proc_prod";
            var appID = 1000000007;

            var xtt = COMMON_UTIL.trim(req.body.token);
            PRINT_LOG.info(__filename,",,",xtt);
            // xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);
            var xa = xtt.split("|");

            requestParams.bluearkUid = xa[1];
            requestParams.lessonTmplID = xa[2];
            requestParams.pdtID = xa[3];
            requestParams.stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);

            PRINT_LOG.info(__filename, "", " stepAttendID : " + requestParams.stepAttendID);
            PRINT_LOG.info(__filename, "", " bluearkUid : " + requestParams.bluearkUid);
            PRINT_LOG.info(__filename, "", " lessonTmplID : " + requestParams.lessonTmplID);
            PRINT_LOG.info(__filename, "", " pdtID : " + requestParams.pdtID);
            //PRINT_LOG.error(__filename, API_PATH, " UNIT_ID : " + UNIT_ID);

            MYSQL_SLP_ACCOUNT_CONN.procUserAccountLogin_nde_web(requestParams, function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin_nde_web, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                // PRINT_LOG.info(__filename, API_PATH, " results : " + results);

                // var responseObj = { account_id: 0, is_allow_app: 0 };
                var responseObj = {};
                for (var i = 0, len = results[0].length; i < len; i++) {
                    var row = results[0][i];
                    responseObj.account_id = row.ACCOUNT_ID; //
                    responseObj.access_token = row.ACCESS_TOKEN;
                    responseObj.is_allow_app = row.IS_ALLOW_APP;
                    responseObj.email = row.accountEmail;
                    responseObj.signUpPath = row.signUpPath;
                    responseObj.lesson_tmpl_id = row.lessonTmplID;
                    responseObj.seqID = row.seq_id; //
                    responseObj.unit_id = row.UNIT_ID; //
                    responseObj.PDT_ID = row.PDT_ID;
                    responseObj.RES = row.res;
                }

                PRINT_LOG.info(__filename, "", " responseObj : " + JSON.stringify(responseObj));

                MYSQL_SLP_NDE.procCallStudyStatusPLATFORM(requestParams, function(err, results) {
                    if (err) {
                        PRINT_LOG.error(__filename, API_PATH, " procCallStudyStatus, Fail DB, error");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {

                        if (results[0].length > 0) {
                            var row1 = results[0][0];

                            var exParam = {};
                            exParam.app_id = row1.app_id;
                            exParam.enc_user_id = row1.enc_user_id;
                            exParam.ext_pdt_id = row1.ext_pdt_id;
                            exParam.step_attend_id = row1.step_attend_id;

                            PRINT_LOG.info(__filename, API_PATH, 'to Study Status exParam : ' + JSON.stringify(exParam));

                            ebsLang_check(exParam, function (resData) {
                                PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                                PRINT_LOG.info(__filename, API_PATH, JSON.stringify(exParam));
                            });

                            if (Number(responseObj.RES) == -20000) {
                                PRINT_LOG.error(__filename, "", row);
                                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_EXPIRED_TOKEN);
                                // } else if(Number(row1.RES == -1)){
                                //     PACKET.sendFail(req, res, {RES:row1.RES});
                            } else {
                                PACKET.sendSuccess(req, res, responseObj);
                            }

                        } else {
                            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);

                        }
                        

                    }

                });

            });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });


    app.post("/slp.user.account.nde.web.login2", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var encKey = "blueark_proc_prod";
            var appID = 1000000007;

            var xtt = COMMON_UTIL.trim(req.body.token);
            PRINT_LOG.info(__filename,",,",xtt);
            // xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);
            var xa = xtt.split("|");

            requestParams.bluearkUid = xa[1];
            // requestParams.lessonTmplID = xa[2];
            // requestParams.pdtID = xa[3];
            requestParams.stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);

            MYSQL_SLP_ACCOUNT_CONN.procSpWebReport(requestParams, function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin_nde_web, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                var responseObj = {};
                for (var i = 0, len = results[0].length; i < len; i++) {
                    var row = results[0][i];
                    responseObj.account_id = row.ACCOUNT_ID; //
                    responseObj.access_token = row.ACCESS_TOKEN;
                    responseObj.res = row.RES;
                    responseObj.seq_id = row.seq_id;
                    // responseObj.email = row.accountEmail;
                    // responseObj.signUpPath = row.signUpPath;
                    // responseObj.seqID = row.seq_id; //
                    // responseObj.lesson_tmpl_id = "";
                    // responseObj.unit_id = ""; //
                    // responseObj.PDT_ID = 0;
                }

                MYSQL_SLP_NDE.procCallStudyStatusPLATFORM(requestParams, function(err, results) {
                    if (err) {
                        PRINT_LOG.error(__filename, API_PATH, " procCallStudyStatus, Fail DB, error");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {

                        var row1 = results[0][0];

                        if (results[0].length > 0) {
                            var exParam = {};
                            exParam.app_id = row1.app_id;
                            exParam.enc_user_id = row1.enc_user_id;
                            exParam.ext_pdt_id = row1.ext_pdt_id;
                            exParam.step_attend_id = row1.step_attend_id;

                            PRINT_LOG.info(__filename, API_PATH, 'to Study Status exParam : ' + JSON.stringify(exParam));

                            ebsLang_check(exParam, function (resData) {
                                PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                                PRINT_LOG.info(__filename, API_PATH, JSON.stringify(exParam));
                            });

                            if (Number(responseObj.res) == -20000) {
                                PRINT_LOG.error(__filename, "", row);
                                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_EXPIRED_TOKEN);
                                // } else if(Number(row1.RES == -1)){
                                //     PACKET.sendFail(req, res, {RES:row1.RES});
                            } else {
                                PACKET.sendSuccess(req, res, responseObj);
                            }
                        } else {
                            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
                        }
                    }
                });
            });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
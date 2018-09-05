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
    // function checkParams(API_PATH, appID, clientUID, accountEmail, pwd, signUpPath) {
    //     var errParam;
    //
    //     if (!COMMON_UTIL.isNumber(appID)) errParam = "appID";
    //     if (!COMMON_UTIL.isValidClientUID(clientUID)) errParam = "clientUID";
    //     if (!COMMON_UTIL.isEmailNDE(accountEmail)) errParam = "accountEmail";
    //     if (!COMMON_UTIL.isEmailNDE(pwd)) errParam = "pwd";
    //     if (!COMMON_UTIL.isValidSignupPath(signUpPath)) errParam = "signUpPath";
    //
    //     if (errParam) PRINT_LOG.error(__filename, API_PATH, " error parameter " + errParam);
    //     return !errParam;
    // }

    // app Login(web Login ����)

    var ebsLang_check = function (exParam, callBack) {
        var url = "http://s-www.ebslang.co.kr";
        var path = "/app/getStuStatus.ebs";            // 관리자 구매
        url = url + path;

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

    app.post("/slp.user.account.nde.web.login", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var userTokenList = [];
            var token = {};
            var xtt = null;
            var encKey = "blueark_proc_prod";
            var appID = 1000000007;
            var msg = null;
            var appResult = 0;

            var stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);
            var token = null;
            var pdtID = null;
            var lessonTmplID = null;

            var xtt = COMMON_UTIL.trim(req.body.token);
            xtt = ENCS.decryptLang(xtt, encKey);
            var xa = xtt.split("|");

            token = xa[1];
            lessonTmplID = xa[2];
            pdtID = xa[3];
            requestParams.UNIT_ID = xa[2];

            PRINT_LOG.error(__filename, "", " stepAttendID : " + stepAttendID);
            PRINT_LOG.error(__filename, "", " token : " + token);
            PRINT_LOG.error(__filename, "", " lessonTmplID : " + lessonTmplID);
            PRINT_LOG.error(__filename, "", " pdtID : " + pdtID);
            //PRINT_LOG.error(__filename, API_PATH, " UNIT_ID : " + UNIT_ID);

            MYSQL_SLP_ACCOUNT_CONN.procUserAccountLogin_nde_web(stepAttendID, token, lessonTmplID, pdtID,function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin_nde_web, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                PRINT_LOG.error(__filename, API_PATH, " results : " + results);

                // var responseObj = { account_id: 0, is_allow_app: 0 };
                var responseObj = {};
                for (var i = 0, len = results[0].length; i < len; i++) {
                    var row = results[0][i];
                    responseObj.account_id = row.ACCOUNT_ID; //
                    responseObj.access_token = row.ACCESS_TOKEN;
                    responseObj.is_allow_app = row.IS_ALLOW_APP;
                    responseObj.email = row.accountEmail;
                    responseObj.signUpPath = row.signUpPath;
                    responseObj.lesson_tmpl_id = lessonTmplID;
                    responseObj.seqID = row.seq_id; //
                    responseObj.unit_id = row.UNIT_ID; //
                    responseObj.PDT_ID = row.PDT_ID;
                }
                PRINT_LOG.error(__filename, "", " responseObj : " + JSON.stringify(responseObj));

                MYSQL_SLP_NDE.procCallStudyStatus(stepAttendID, function(err, results) {
                    if (err) {
                        PRINT_LOG.error(__filename, API_PATH, " procCallStudyStatus, Fail DB, error");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {

                        // var xtt2 = COMMON_UTIL.trim(req.body.token);
                        // xtt2 = ENCS.decryptLang(xtt, encKey);
                        // var xa2 = xtt2.split("|");

                        var row1 = results[0][0];

                        var exParam = {};
                        exParam.app_id = row1.app_id;
                        exParam.enc_user_id = row1.enc_user_id;
                        exParam.ext_pdt_id = row1.ext_pdt_id;
                        exParam.step_attend_id = row1.step_attend_id;

                        stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);


                        PRINT_LOG.info(__filename, API_PATH, 'to Study Status exParam : ' + JSON.stringify(exParam));

                        ebsLang_check(exParam, function (resData) {
                            PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                            //             //PACKET.sendSuccess2(req, res, { exParam: JSON.stringify(resData) });
                            //             //PACKET.sendSuccess(req, res, { exParam: JSON.stringify(resData) });
                        });

                        // PACKET.sendSuccess(req, res, {responseObj: responseObj, exParam: exParam, app_id: row1.app_id, step_attend_id: row1.step_attend_id, ext_pdt_id: row1.ext_pdt_id, enc_user_id: row1.enc_user_id});
                        PACKET.sendSuccess(req, res, responseObj);
                    }

                });

                // PACKET.sendSuccess(req, res, responseObj);
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

            var userTokenList = [];
            var token = {};
            var xtt = null;
            var encKey = "blueark_proc_prod";
            var appID = 1000000007;
            var msg = null;
            var appResult = 0;

            var stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);
            var token = null;

            var xtt = COMMON_UTIL.trim(req.body.token);
            xtt = ENCS.decryptLang(xtt, encKey);
            var xa = xtt.split("|");

            token = xa[1];
            lessonTmplID = "";
            pdtID = "";
            //requestParams.UNIT_ID = 0;

            PRINT_LOG.error(__filename, API_PATH, " token : " + token);


            MYSQL_SLP_ACCOUNT_CONN.procUserAccountLogin_nde_web(stepAttendID, token, lessonTmplID, pdtID, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin_nde_web, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                /*
                 {
                 "account_id": 100029324,
                 "is_allow_app": 1,
                 "access_token": "0ca9e559d090f2128cfac99cd6e0a5acdb9523c6",
                 "email": "ebs15154651245079@ebs.com",
                 "signUpPath": "ebs",
                 "lesson_tmpl_id": "",
                 "seqID": 612,
                 "unit_id": "",
                 "res": 0
                 }
                 */

                var responseObj = {};
                for (var i = 0, len = results[0].length; i < len; i++) {
                    var row = results[0][i];
                    responseObj.account_id = row.ACCOUNT_ID; //
                    responseObj.access_token = row.ACCESS_TOKEN;
                    responseObj.is_allow_app = row.IS_ALLOW_APP;
                    responseObj.email = row.accountEmail;
                    responseObj.signUpPath = row.signUpPath;
                    responseObj.seqID = row.seq_id; //
                    responseObj.lesson_tmpl_id = "";
                    responseObj.unit_id = ""; //
                    responseObj.PDT_ID = 0;
                }
                PACKET.sendSuccess(req, res, responseObj);
            });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
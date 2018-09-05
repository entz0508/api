require('date-utils'); // Date.prototype ����

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;

exports.add_routes = function (app) {
    "use strict";


    app.post("/adb/bible/join", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
        try {
            PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));


            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var signupID = COMMON_UTIL.trim(req.body.signup_id);
            var pwd = COMMON_UTIL.trim(req.body.password);
            var signupName = COMMON_UTIL.trim(req.body.signup_name);
            var signUpPath = COMMON_UTIL.trim(req.body.signup_path);


            // !COMMON_UTIL.isValidEmail(accountEmail) ||    (6 > len) || (32 < len)
            //if (!COMMON_UTIL.isValidPassword(pwd) || !COMMON_UTIL.isValidSignupPath(signUpPath)) {
            //    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            //}
            //PRINT_LOG.error(__filename, API_PATH, "signupID" + signupID);
            //
            //MYSQL_ADB_ACCOUNT_CONN.procUserAccountCreate({
            //    clientUID: clientUID,
            //    clientIP: CLIENT_IP,
            //    signupID: signupID,
            //    accountPWD: crypto.createHash("sha512").update(pwd).digest("base64"),
            //    userName: signupName,
            //    signUpPath: signUpPath
            //}, function (err, results) {
            //    if (err) {
            //        PRINT_LOG.error(__filename, API_PATH, " procUserAccountCreate, faile db, error" + err);
            //        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
            //    }
            //
            //    var retV = COMMON_UTIL.getMysqlRES(results);
            //    if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
            //        PRINT_LOG.error(__filename, API_PATH, retV.msg);
            //        return PACKET.sendFail(req, res, retV.res);
            //    }
            //
            //    var row = results[0][0];
            //    //PACKET.sendSuccess(req, res, { account_id: row.ACCOUNT_ID, access_token: row.ACCESS_TOKEN });
            //    PACKET.sendSuccess(req, res, null, { access_token: row.ACCESS_TOKEN, account_name: row.ACCOUNT_NAME });
            //
            //    // 이메일 발송 생략
            //
            //});
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, null);
        }

    });


};
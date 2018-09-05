/*======================================================================================================
 @desc	route middleware - 인증처리용
 ====================================================================================================*/

// common
//require('date-utils'); // TimeDate Package
const PACKET = require("../util/packet_sender.js");
const COMMON_UTIL = require("../util/common.js");
const ERROR_CODE_UTIL = require('../util/error_code_util.js');
const HTTP_REQUEST_UTIL = require("../../common/util/http_request_util.js");

const PRINT_LOG = global.PRINT_LOGGER;
//const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

module.exports = {
    DEFAULT: function(req, res, next) {
        var API_PATH = req.route.path;
        var os;

        /***********************/
        //var loginfo = {};
        //try {
        //    loginfo.path = API_PATH;
        //    loginfo.headers = JSON.stringify(req.headers);
        //    loginfo.body = JSON.stringify(req.body);
        //    loginfo.result = true;
        //} catch (e) {
        //    loginfo.path = API_PATH;
        //    loginfo.headers = req.headers;
        //    loginfo.body = req.body;
        //    loginfo.result = e;
        //}
        //COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        //    if (!isSuccess) {
        //        PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        //    }
        //});
        /***********************/

        if ("POST" === req.method) {
            os = COMMON_UTIL.trim(req.body.os);
        } else {
            os = COMMON_UTIL.trim(req.query.os);
        }

        if (!COMMON_UTIL.isValidOS(os)) {
            PRINT_LOG.error(__filename, API_PATH, " route_middleware.DEFAULT, RES ERROR PARAMETER, OS");
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "", {});
            return;
        }
        next();
    },
    NO_AUTH_APP: function (req, res, next) {
        var API_PATH = req.route.path;
        next();
    },
    LOGGED_IN_ACCOUNT: function (req, res, next) {
        var fnTitle = " route_middleware.LOGGED_IN_ACCOUNT, ";
        var API_PATH = req.route.path;
        var clientUID, os, accountID, accessToken;

        if ("POST" === req.method) {
            clientUID = COMMON_UTIL.trim(req.body.client_uid);
            os = COMMON_UTIL.trim(req.body.os);
            accessToken = COMMON_UTIL.trim(req.body.access_token);
        }

        if (!COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidOS(os) || !COMMON_UTIL.isValidAccessToken(accessToken)) {
            if (!COMMON_UTIL.isValidClientUID(clientUID)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "clientUID " + clientUID);             // return !((0 > len) || (64 < len));
            if (!COMMON_UTIL.isValidOS(os)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "os " + os);                                         // return ("android" === str) || ("ios" === str) || ("web" === str);
            if (!COMMON_UTIL.isValidAccessToken(accessToken)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "accessToken " + accessToken);     // return !isNull(authToken) && 40 === authToken.length;
            //PRINT_LOG.error(__filename, API_PATH, fnTitle + "RES ERROR PARAMETER " + JSON.stringify(req.body));
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "parameter error", {});
            return;
        }

        HTTP_REQUEST_UTIL.httpIsLoggedInAccount(clientUID, accessToken, function (err, resData) {
            //PRINT_LOG.info(__filename, API_PATH, "LOGGED_IN_ACCOUNT resData : " + JSON.stringify(resData));
            if (err || !resData.isLoggedIn) {
                PRINT_LOG.error(__filename, API_PATH, " route_middleware.LOGGED_IN_ACCOUNT,  no login user, " + JSON.stringify(req.body));
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN, "no login user", {});
                return;
            } else {
                //PRINT_LOG.error(__filename, API_PATH, " route_middleware.LOGGED_IN_ACCOUNT,  ok login user, " + JSON.stringify(req.body));
                req.body.isAccountID = resData.isAccountID;
            }
            next();
        });

    },
    AUTH_APP_LOGIN_USER_ALLOW_APP: function (req, res, next) {

        next();
    }
};
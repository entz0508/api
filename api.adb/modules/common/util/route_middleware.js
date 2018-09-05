/*======================================================================================================
 @desc	route middleware
 ====================================================================================================*/

// common
const PACKET = require("../util/packet_sender.js");
const COMMON_UTIL = require("../util/common.js");
const ERROR_CODE_UTIL = require('../util/error_code_util.js');
const HTTP_REQUEST_UTIL = require("../../common/util/http_request_util.js");

const PRINT_LOG = global.PRINT_LOGGER;

module.exports = {
	DEFAULT: function(req, res, next) {
		var API_PATH = req.route.path;
		var os;
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
            if (!COMMON_UTIL.isValidClientUID(clientUID)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "clientUID " + clientUID);
            if (!COMMON_UTIL.isValidOS(os)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "os " + os);
            if (!COMMON_UTIL.isValidAccessToken(accessToken)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "accessToken " + accessToken);
            //PRINT_LOG.error(__filename, API_PATH, fnTitle + "RES ERROR PARAMETER " + JSON.stringify(req.body));
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "parameter error", {});
            return;
        }

        HTTP_REQUEST_UTIL.httpIsLoggedInAccount(clientUID, accessToken, function (err, resData) {
            if (err || !resData.isLoggedIn) {
                PRINT_LOG.error(__filename, API_PATH, " route_middleware.LOGGED_IN_ACCOUNT,  no login user, " + JSON.stringify(req.body));
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN, "no login user", {});
                return;
            } else {
                req.body.isAccountID = resData.isAccountID;
            }
            next();
        });
        
    },
    AUTH_APP_LOGIN_USER_ALLOW_APP: function (req, res, next) {

        next();
    }
};
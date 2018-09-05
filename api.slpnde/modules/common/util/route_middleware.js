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
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

module.exports = {
	DEFAULT: function(req, res, next) {
		var API_PATH = req.route.path;
		var appID;
		var os;
        
        /***********************/
        var loginfo = {};
        try {
            loginfo.path = API_PATH;
            loginfo.headers = JSON.stringify(req.headers);
            loginfo.body = JSON.stringify(req.body);
            loginfo.result = true;
        } catch (e) {
            loginfo.path = API_PATH;
            loginfo.headers = req.headers;
            loginfo.body = req.body;
            loginfo.result = e;
        }
        COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
            if (!isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
            }
        });
        /***********************/


		if ("POST" === req.method) {
			appID = COMMON_UTIL.trim(req.body.app_id);
			os = COMMON_UTIL.trim(req.body.os);
		} else {
			appID = COMMON_UTIL.trim(req.query.app_id);
			os = COMMON_UTIL.trim(req.query.os);
		}

		if (!COMMON_UTIL.isValidOS(os)) {
			PRINT_LOG.error(__filename, API_PATH, " route_middleware.DEFAULT, RES ERROR PARAMETER, OS");
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			return;
		}

		if (!COMMON_UTIL.isValidAppID(appID)) {
			PRINT_LOG.error(__filename, API_PATH, " route_middleware.DEFAULT, RES ERROR PARAMETER, APP_ID");
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			return;
        }
        
		next();
	},
    NO_AUTH_APP: function (req, res, next) {
        var API_PATH = req.route.path;
        /***********************/
        var loginfo = {};
        try {
            loginfo.path = API_PATH;
            loginfo.headers = JSON.stringify(req.headers);
            loginfo.body = JSON.stringify(req.body);
            loginfo.result = true;
        } catch (e) {
            loginfo.path = API_PATH;
            loginfo.headers = req.headers;
            loginfo.body = req.body;
            loginfo.result = e;
        }
        COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
            if (!isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
            }
        });
        /***********************/
		next();
	},
	LOGGED_IN_ACCOUNT_WITHOUT_PROFILE: function(req, res, next) {
		var API_PATH = req.route.path;
		var appID, clientUID, os, accountID, accessToken, country;

        
        /***********************/
        var loginfo = {};
        try {
            loginfo.path = API_PATH;
            loginfo.headers = JSON.stringify(req.headers);
            loginfo.body = JSON.stringify(req.body);
            loginfo.result = true;
        } catch (e) {
            loginfo.path = API_PATH;
            loginfo.headers = req.headers;
            loginfo.body = req.body;
            loginfo.result = e;
        }
        COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
            if (!isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
            }
        });
        /***********************/
        

		if ("POST" === req.method) {
			appID = COMMON_UTIL.trim(req.body.app_id);
			clientUID = COMMON_UTIL.trim(req.body.client_uid);
			os = COMMON_UTIL.trim(req.body.os);
			accountID = COMMON_UTIL.trim(req.body.account_id);
			accessToken = COMMON_UTIL.trim(req.body.access_token);
			country = COMMON_UTIL.trim(req.body.country);
		}

		if (!COMMON_UTIL.isValidAppID(appID) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidOS(os) ||
			!COMMON_UTIL.isValidAccountID(accountID) || !COMMON_UTIL.isValidAccessToken(accessToken) || !COMMON_UTIL.isValidCountry(country)) {

			if (!COMMON_UTIL.isValidAccessToken(accessToken)) PRINT_LOG.error(__filename, API_PATH, accessToken);
			if (!COMMON_UTIL.isValidCountry(country)) PRINT_LOG.error(__filename, API_PATH, country);

			PRINT_LOG.error(__filename, API_PATH, " route_middleware.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, RES ERROR PARAMETER " + JSON.stringify(req.body));
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			return;
		}

		HTTP_REQUEST_UTIL.httpIsLoggedInAccountWithoutProfile(appID, clientUID, accountID, accessToken, function(err, resData) {
			if (err || !resData.isLoggedIn) {
				PRINT_LOG.error(__filename, API_PATH, " route_middleware.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE,  no login user, " + JSON.stringify(req.body));
				PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN);
				return;
			}
			next();
		});
	},
	LOGGED_IN_ACCOUNT_WITH_PROFILE: function(req, res, next) {
		var fnTitle = " route_middleware.LOGGED_IN_ACCOUNT_WITH_PROFILE, ";
		var API_PATH = req.route.path;
		var appID, clientUID, os, accountID, accessToken, country, profileID;

        /***********************/
        var loginfo = {};
        try {
            loginfo.path = API_PATH;
            loginfo.headers = JSON.stringify(req.headers);
            loginfo.body = JSON.stringify(req.body);
            loginfo.result = true;
        } catch (e) {
            loginfo.path = API_PATH;
            loginfo.headers = req.headers;
            loginfo.body = req.body;
            loginfo.result = e;
        }

        COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
            if (!isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
            }
        });
        /***********************/

		if ("POST" === req.method) {
			appID = COMMON_UTIL.trim(req.body.app_id);
			clientUID = COMMON_UTIL.trim(req.body.client_uid);
			os = COMMON_UTIL.trim(req.body.os);
			accountID = COMMON_UTIL.trim(req.body.account_id);
			accessToken = COMMON_UTIL.trim(req.body.access_token);
			country = COMMON_UTIL.trim(req.body.country);
			profileID = COMMON_UTIL.trim(req.body.pf_id);
		}

		if (!COMMON_UTIL.isValidAppID(appID) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidOS(os) ||
			!COMMON_UTIL.isValidAccountID(accountID) || !COMMON_UTIL.isValidAccessToken(accessToken) || !COMMON_UTIL.isValidCountry(country) || !COMMON_UTIL.isValidProfileID(profileID)) {

			if (!COMMON_UTIL.isValidAppID(appID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "appID " + appID);
			if (!COMMON_UTIL.isValidOS(os)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "os " + os);
			if (!COMMON_UTIL.isValidAccountID(accountID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "accountID " + accountID);
			if (!COMMON_UTIL.isValidAccessToken(accessToken)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "accessToken " + accessToken);
			if (!COMMON_UTIL.isValidProfileID(profileID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "profileID " + profileID);
			if (!COMMON_UTIL.isValidCountry(country)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "country " + country);

			PRINT_LOG.error(__filename, API_PATH, fnTitle + "RES ERROR PARAMETER " + JSON.stringify(req.body));
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			return;
		}

		HTTP_REQUEST_UTIL.httpIsLoggedInAccountWithProfile(appID, clientUID, accountID, accessToken, profileID, function(err, resData) {
			if (err || !resData.isLoggedIn) {
				PRINT_LOG.error(__filename, API_PATH, fnTitle + "no login user, " + JSON.stringify(req.body));
				PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN);
				return;
			}
			next();
		});
	},

	// SEQID MIDDLE WARE
    LOGGED_IN_ACCOUNT_WITH_SEQID: function(req, res, next) {
        var fnTitle = " route_middleware.LOGGED_IN_ACCOUNT_WITH_SEQID, ";
        var API_PATH = req.route.path;
        var appID, clientUID, os, accountID, accessToken, country, seqID;

        /***********************/
        var loginfo = {};
        try {
            loginfo.path = API_PATH;
            loginfo.headers = JSON.stringify(req.headers);
            loginfo.body = JSON.stringify(req.body);
            loginfo.result = true;
        } catch (e) {
            loginfo.path = API_PATH;
            loginfo.headers = req.headers;
            loginfo.body = req.body;
            loginfo.result = e;
        }
        COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
            if (!isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
            }
        });
        /***********************/

        if ("POST" === req.method) {
            appID = COMMON_UTIL.trim(req.body.app_id);
            clientUID = COMMON_UTIL.trim(req.body.client_uid);
            os = COMMON_UTIL.trim(req.body.os);
            accountID = COMMON_UTIL.trim(req.body.account_id);
            accessToken = COMMON_UTIL.trim(req.body.access_token);
            country = COMMON_UTIL.trim(req.body.country);
            // profileID = COMMON_UTIL.trim(req.body.pf_id);
            seqID = COMMON_UTIL.trim(req.body.seq_id);
        }

        if (!COMMON_UTIL.isValidAppID(appID) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidOS(os) ||
            !COMMON_UTIL.isValidAccountID(accountID) || !COMMON_UTIL.isValidAccessToken(accessToken) || !COMMON_UTIL.isValidCountry(country) || !COMMON_UTIL.isValidSEQID(seqID)) {

            if (!COMMON_UTIL.isValidAppID(appID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "appID " + appID);
            if (!COMMON_UTIL.isValidOS(os)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "os " + os);
            if (!COMMON_UTIL.isValidAccountID(accountID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "accountID " + accountID);
            if (!COMMON_UTIL.isValidAccessToken(accessToken)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "accessToken " + accessToken);
            // if (!COMMON_UTIL.isValidProfileID(profileID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "profileID " + profileID);
            if (!COMMON_UTIL.isValidCountry(country)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "country " + country);
            if (!COMMON_UTIL.isValidSEQID(seqID)) PRINT_LOG.info(__filename, API_PATH, fnTitle + "seqID " + seqID);

            PRINT_LOG.error(__filename, API_PATH, fnTitle + "RES ERROR PARAMETER " + JSON.stringify(req.body));
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            return;
        }

        HTTP_REQUEST_UTIL.httpIsLoggedInAccountWithSeqID(appID, clientUID, accountID, accessToken, seqID, function(err, resData) {
            if (err || !resData.isLoggedIn) {
                PRINT_LOG.error(__filename, API_PATH, fnTitle + "seqID error, " + JSON.stringify(req.body));
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_SEQID);
                return;
            }
            next();
        });
    }
};
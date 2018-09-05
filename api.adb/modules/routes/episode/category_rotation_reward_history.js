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
	app.post("/nde/episode/categoryRotationRewardHistory", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res) {
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
			requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.lang = "KO";

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

            MYSQL_SLP_NDE.procCategoryRotationRewardHistory(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_DLA_CONN.procCategoryRotationRewardHistory", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var REWARD_HISTORY = [];
				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];
					REWARD_HISTORY.push({ CATEGORY_ID: row.CATEGORY_ID, REG_DATETIME: row.REG_DATETIME });
				}
				PACKET.sendSuccess(req, res, { REWARD_HISTORY: REWARD_HISTORY });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
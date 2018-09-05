// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

exports.add_routes = function(app) {
	function checkParams(API_PATH, appID, clientUID, accountID, accessToken, profileID) {
		var errParam;

		if (!COMMON_UTIL.isNumber(appID)) errParam = "appID";
		if (!COMMON_UTIL.isValidClientUID(clientUID)) errParam = "clientUID";
		if (!COMMON_UTIL.isNumber(accountID)) errParam = "accountID";
		if (!COMMON_UTIL.isValidAccessToken(accessToken)) errParam = "accessToken";
		if (!COMMON_UTIL.isValidProfileID(profileID)) errParam = "profileID";

		if (errParam) PRINT_LOG.error(__filename, API_PATH, " error parameter " + errParam);

		return !errParam;
	}

	app.post("/slp/user/account/isloggedin/with", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_USER_ALLOW_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var accountID = COMMON_UTIL.trim(req.body.account_id);
			var accessToken = COMMON_UTIL.trim(req.body.access_token);
			var profileID = COMMON_UTIL.trim(req.body.pf_id);


			if (!checkParams(API_PATH, appID, clientUID, accountID, accessToken, profileID)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccountWithProfileID(appID, clientUID, accountID, accessToken, profileID, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				PACKET.sendSuccess(req, res, {
					is_logged_in: 1 === Number(results[0][0].IS_LOGIN) ? 1 : 0,
					is_kidswatts_app_logged_in: 0 < Number(results[0][0].IS_KIDSWATTS_APP_LOGIN) ? 1 : 0
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
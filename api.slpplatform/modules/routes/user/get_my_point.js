// nodejs npm

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
	app.post("/slp.user.get.my.point", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.countryCode = COMMON_UTIL.trim(req.body.country);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);

			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			MYSQL_SLP_ACCOUNT_CONN.procGetMyPoint(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetMyPoint", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				PACKET.sendSuccess(req, res, {
					MSG: results[0][0].MSG,
					POINT: results[0][0].STAR_POINT,
					ACCOUNT_ID: requestParams.accountID
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
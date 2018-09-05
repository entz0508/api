// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

exports.add_routes = function(app) {
	app.post("/slp.user.account.profile.status", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = {};
			requestParams.CLIENT_IP = COMMON_UTIL.getClientIP(req);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
			requestParams.curUnixtime = COMMON_UTIL.getUnixTimestamp();

			if (!COMMON_UTIL.isNumber(requestParams.appID) || !COMMON_UTIL.isValidClientUID(requestParams.clientUID) ||
				!COMMON_UTIL.isNumber(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken) ||
				!COMMON_UTIL.isValidProfileID(requestParams.profileID)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_KW_ACTION_LOG_CONN.procGetProfilePingStatus(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procProfileAdd, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);

				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_INSERT_ACCOUNT_ALLOW_ACCESS_APP);
				}

				var row = results[0][0];
				var tick = Number(row.TICK);
				PACKET.sendSuccess(req, res, {
					pf_id: row.PROFILE_ID,
					on_time: row.PLAY_TIME,
					app_id: row.APP_ID,
					online: (0 < tick) && (300 >= tick) ? 1 : 0
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
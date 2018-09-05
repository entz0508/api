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
	var checkParams = function(requestParams) {
		if (!COMMON_UTIL.isNumber(requestParams.appID)) {
			PRINT_LOG.error(__filename, requestParams.API_PATH, " error parameter appID");
			return false;
		}

		if (!COMMON_UTIL.isValidClientUID(requestParams.clientUID)) {
			PRINT_LOG.error(__filename, requestParams.API_PATH, " error parameter clientUID");
			return false;
		}


		if (!COMMON_UTIL.isNumber(requestParams.accountID)) {
			PRINT_LOG.error(__filename, requestParams.API_PATH, " error parameter accountID");
			return false;
		}

		if (COMMON_UTIL.isNull(requestParams.accessToken)) {
			PRINT_LOG.error(__filename, requestParams.API_PATH, " error parameter accessToken");
			return false;
		}

		if (COMMON_UTIL.isNull(requestParams.reason) || (2 > requestParams.reason.length)) {
			PRINT_LOG.error(__filename, requestParams.API_PATH, " error parameter reason");
			return false;
		}
		return true;
	};

	app.post("/slp.user.account.secession", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = COMMON_UTIL.getClientIP(req);
			requestParams.countryCode = COMMON_UTIL.trim(req.body.country);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			//requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);

			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.reason = COMMON_UTIL.trim(req.body.reason);
			requestParams.curUnixtime = COMMON_UTIL.getUnixTimestamp();


			if (!checkParams(requestParams)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_ACCOUNT_CONN.procAccountSecession(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procAccountSecession, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}
				PACKET.sendSuccess(req, res, {});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
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
	app.post("/slp.user.account.chk.signup.path", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var accountEmail = COMMON_UTIL.trim(req.body.email);

			if (!COMMON_UTIL.isNumber(appID) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isEmail(accountEmail)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_ACCOUNT_CONN.procGetUserAccountSignupPath(appID, clientUID, accountEmail, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procGetUserAccountSignupPath, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var row = results[0][0];
				PACKET.sendSuccess(req, res, { signup_path: row.SIGNUP_PATH, secession: row.SECESSION });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
// nodejs npm
const CRYPTO = require("crypto");

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
	app.post("/slp.user.login.account.password.change", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestPrams = {};
			requestPrams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestPrams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestPrams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestPrams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestPrams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestPrams.currentPwd = COMMON_UTIL.trim(req.body.cur_password);
			requestPrams.pwd = COMMON_UTIL.trim(req.body.password);
			requestPrams.curUnixtime = COMMON_UTIL.getUnixTimestamp();

			if (!COMMON_UTIL.isValidPassword(requestPrams.currentPwd) || !COMMON_UTIL.isValidPassword(requestPrams.pwd)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			if (requestPrams.currentPwd === requestPrams.pwd) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			requestPrams.accountCurrentPWD = CRYPTO.createHash("sha512").update(requestPrams.currentPwd).digest("base64");
			requestPrams.accountPWD = CRYPTO.createHash("sha512").update(requestPrams.pwd).digest("base64");

			MYSQL_SLP_ACCOUNT_CONN.procChangeLoginUserAccountPassword(requestPrams, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
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
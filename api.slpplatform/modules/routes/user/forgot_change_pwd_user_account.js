// 이 파일은 사용되어지지 않을 수 있습니다.


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
	app.post("/slp.user.account.forgot.password.change", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var chToken = COMMON_UTIL.trim(req.body.ch_token);
			var pwd = COMMON_UTIL.trim(req.body.password);

			var accountEmail = COMMON_UTIL.trim(req.body.email);

			if (!COMMON_UTIL.isEmail(accountEmail) || !COMMON_UTIL.isValidPassword(pwd) || COMMON_UTIL.isNull(chToken)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter, " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			var accountPWD = CRYPTO.createHash("sha512").update(pwd).digest("base64");
			MYSQL_SLP_ACCOUNT_CONN.procForgotUserAccountPasswordChange(appID, clientUID, CLIENT_IP, accountEmail, accountPWD, chToken, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var row = results[0][0];
				PACKET.sendSuccess(req, res, { email: row.EMAIL });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
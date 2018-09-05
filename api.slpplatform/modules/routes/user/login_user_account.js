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
	function checkParams(API_PATH, appID, clientUID, accountEmail, pwd, signUpPath) {
		var errParam;

		if (!COMMON_UTIL.isNumber(appID)) errParam = "appID";
		if (!COMMON_UTIL.isValidClientUID(clientUID)) errParam = "clientUID";
		if (!COMMON_UTIL.isEmail(accountEmail)) errParam = "accountEmail";
		if (!COMMON_UTIL.isValidPassword(pwd)) errParam = "pwd";
		if (!COMMON_UTIL.isValidSignupPath(signUpPath)) errParam = "signUpPath";

		if (errParam) PRINT_LOG.error(__filename, API_PATH, " error parameter " + errParam);

		return !errParam;
	}

	app.post("/slp.user.account.login", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var accountEmail = COMMON_UTIL.trim(req.body.email);
			var pwd = COMMON_UTIL.trim(req.body.password);
			var signUpPath = COMMON_UTIL.trim(req.body.signup_path);

			if (!checkParams(API_PATH, appID, clientUID, accountEmail, pwd, signUpPath)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			var accountPWD = CRYPTO.createHash("sha512").update(pwd).digest("base64");

			MYSQL_SLP_ACCOUNT_CONN.procUserAccountLogin(appID, clientUID, CLIENT_IP, accountEmail, accountPWD, signUpPath, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var responseObj = { account_id: 0, access_token: 0, is_allow_app: 0 };
				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];
					responseObj.account_id = row.ACCOUNT_ID;
					responseObj.access_token = row.ACCESS_TOKEN;
					responseObj.is_allow_app = row.IS_ALLOW_APP;
					responseObj.email = accountEmail;
					responseObj.signUpPath = signUpPath;
				}

				PACKET.sendSuccess(req, res, responseObj);


			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
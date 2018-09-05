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
const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;

exports.add_routes = function(app) {
	app.post("/slp.developer.developer.login", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = {
				EMAIL: COMMON_UTIL.trim(req.body.email),
				PWD: COMMON_UTIL.trim(req.body.pwd),
				COMPANY: COMMON_UTIL.trim(req.body.company)
			};
			
			if (requestParams.COMPANY === "") PRINT_LOG.error(__filename, API_PATH, " error parameter COMPANY");
			if (!COMMON_UTIL.isEmail(requestParams.EMAIL)) PRINT_LOG.error(__filename, API_PATH, " error parameter EMAIL");
			if (!COMMON_UTIL.isValidPassword(requestParams.PWD)) PRINT_LOG.error(__filename, API_PATH, " error parameter PWD");
			
			// 비밀번호를 암호화
			requestParams.PWD = CRYPTO.createHash("sha512").update(requestParams.PWD).digest("base64");
			
			MYSQL_SLP_PLATFORM_CONN.procDeveloperLogin(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_PLATFORM_CONN.procDeveloperLogin", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				PACKET.sendSuccess(req, res, {});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
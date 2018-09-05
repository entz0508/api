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
	app.post('/slp.versionInfo.list', ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {

			var requestParams = {
				passwd: COMMON_UTIL.trim(req.body.passwd),
				appID: COMMON_UTIL.trim(req.body.app_id),
				os: COMMON_UTIL.trim(req.body.os)
			};

			if (!(requestParams.os === "android" || requestParams.os === "ios")) requestParams.os = "ALL";

			if (global.CONFIG.SERVER_INFO.PASSWORD !== requestParams.passwd)
				return PACKET.sendFail(req, res, { MSG: "password unmatch" });

			MYSQL_SLP_PLATFORM_CONN.procAppVerList(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_PLATFORM_CONN.procAppVerList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var LIST = [];

				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];
					LIST.push({
						SEQ: row.SEQ,
						APP_ID: row.APP_ID,
						OS: row.OS,
						VER: row.VER,
						SUMMIT: row.SUMMIT,
						FORCE_UPDATE: row.FORCE_UPDATE,
						REG_DATETIME: row.REG_DATETIME
					});
				}

				PACKET.sendSuccess(req, res, { LIST: LIST });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
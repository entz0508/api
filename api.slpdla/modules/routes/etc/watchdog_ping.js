// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;
const MYSQL_SLP_EN_INFO_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN_INFO;
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

exports.add_routes = function add_routes(app) {
	app.post("/sen/watchdog/ping", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		try {
			MYSQL_SLP_EN_INFO_CONN.procWatchdogPing(function(errPlatform, isPlatformSuccess) {
				if (errPlatform || !isPlatformSuccess)
					return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Platform" });

				MYSQL_SLP_EN_CONN.procWatchdogPing(function(errAccount, isAccountSuccess) {
					if (errAccount || !isAccountSuccess)
						return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Account" });

					MYSQL_SLP_KW_ACTION_LOG_CONN.procWatchdogPing(function(errKwActionLog, isKwActionLogSuccess) {
						if (errKwActionLog || !isKwActionLogSuccess)
							return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Account" });

						MYSQL_SLP_COMMON_CONN.procWatchdogPing(function(errCommon, isCommonSuccess) {
							if (errCommon || !isCommonSuccess)
								return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Account" });

							PACKET.sendSuccess(req, res, {});
						});
					});
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
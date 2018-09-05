// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function(app) {
	app.post("/nde/app/device/connect", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
			requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();

            MYSQL_SLP_NDE.procAddLastConnect(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog(__filename + ", " + API_PATH + ", MYSQL_SLP_EN_CONN.procAddLastConnect, err", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (ERROR_CODE_UTIL.RES_SUCCESS !== COMMON_UTIL.getMysqlRES(results).res) {
					PRINT_LOG.error(__filename + ", " + API_PATH + ", MYSQL_SLP_EN_CONN.procAddLastConnect, err");
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
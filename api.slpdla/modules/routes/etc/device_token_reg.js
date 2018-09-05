// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;

const MONGO_CACHE = require("../../database/mongo_db_cache.js");

exports.add_routes = function(app) {
	"use strict";
	app.post("/sen/devicetoken/reg", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
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
			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
			requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
			requestParams.deviceToken = COMMON_UTIL.trim(req.body.d_token);
			requestParams.lang = "KO";
			
			if (!COMMON_UTIL.isValidDeviceToken(requestParams.deviceToken)) {
				PRINT_LOG.error(__filename, API_PATH, " err, device token : " + requestParams.deviceToken);
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}
			
			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) requestParams.accountID = 0;
			if (!COMMON_UTIL.isValidProfileID(requestParams.profileID)) requestParams.profileID = 0;
			
			MYSQL_SLP_EN_CONN.procRegDeviceToken(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetEnglishEpisodeList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				
				var retV = COMMON_UTIL.getMysqlRES(results);
				if (0 !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, " err, res:" + retV.res + ", msg:" + retV.msg);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
				}
				
				PACKET.sendSuccess(req, res, {});
				MONGO_CACHE.regDeviceToken(requestParams);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
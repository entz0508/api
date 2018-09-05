// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_INFO_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN_INFO;

exports.add_routes = function(app) {
	app.post("/sen/app/res", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
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

			MYSQL_SLP_EN_INFO_CONN.procGetAppRes(requestParams, function(err, results) {
				var responseObj = { bundle_base_url: "", resources: [] };

				if (err || COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.setErrorLog(__filename + ", " + API_PATH + ", procGetAppRes, err", err);
				} else {
					for (var i = 0, len = results[0].length; i < len; i++) {
						var resKey = results[0][i].RES_KEY;
						var resVal = results[0][i].RES_VALUE;
						var resVer = results[0][i].RES_VER;
						if ("BUNDLE_BASE_URL" === resKey) {
							responseObj.bundle_base_url = resVal;
						} else if ("IMG_SERVER_URL" === resKey) {
							responseObj.img_server_url = resVal;
						} else if (("PRIMARY_DATA" === resKey)) {
							responseObj.resources.push({ id: "primary_data", name: resVal, ver: resVer });
						} else if (("STICKER" === resKey)) {
							responseObj.resources.push({ id: "sticker", name: resVal, ver: resVer });
						} else if (("THUMBNAIL" === resKey)) {
							responseObj.resources.push({ id: "thumbnail", name: resVal, ver: resVer });
						}
					}
				}
				PACKET.sendSuccess(req, res, responseObj);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
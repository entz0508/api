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
	app.post("/nde/buy/buyHistory", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.country = COMMON_UTIL.trim(req.body.country);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.lang = "KO";

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
				return PACKET.sendSuccess(req, res, { MSG: "invalid AccessToken" });
			}


            MYSQL_SLP_NDE.procGetBuyHistory(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_DLA_CONN.procGetBuyHistory", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var buy_list = [];
				if ((0 < results[0].length)) {
					for (var i = 0, len = results[0].length; i < len; i++) {
						var row = results[0][i];
						buy_list.push({
							app_id: row.app_id,
							product_id: row.product_id,
							pay_method: row.pay_method,
							price: row.price,
							receipt: row.receipt,
							reg_date: row.reg_date,
							expired_date: row.expired_date,
							period: row.period,
							refund: row.refund,
							goods_name: row.goods_name,
							using_unit: row.using_unit,
							period_type: row.period_type
						});
					}
				}

				PACKET.sendSuccess(req, res, { buy_list: buy_list });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
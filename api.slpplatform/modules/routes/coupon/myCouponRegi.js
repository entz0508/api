// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

exports.add_routes = function(app) {
	app.post("/slp.coupon.myCouponRegi", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = {
				appID: COMMON_UTIL.trim(req.body.app_id),
				accountID: COMMON_UTIL.trim(req.body.account_id),
				couponCode: COMMON_UTIL.trim(req.body.coupon_code),
				country: COMMON_UTIL.trim(req.body.country)
			};

			if (COMMON_UTIL.isNull(requestParams.appID))
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
			if (COMMON_UTIL.isNull(requestParams.accountID))
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
			if (COMMON_UTIL.isNull(requestParams.couponCode))
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
			if (COMMON_UTIL.isNull(requestParams.country))
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);

			MYSQL_SLP_COMMON_CONN.procCouponRegi(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procCouponRegi", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				PACKET.sendSuccess(req, res, {
					success: Number(results[0][0].RES) === 0 ? "TRUE" : "FALSE", MSG: results[0][0].MSG
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
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
	app.post("/slp.coupon.myCouponList", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_COMMON_CONN.spCouponMyCouponList({
				appID: COMMON_UTIL.trim(req.body.app_id),
				accountID: COMMON_UTIL.trim(req.body.account_id)
			}, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.spCouponMyCouponList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var myCouponList = [];
				if ((0 < results[0].length)) {
					for (var i = 0, len = results[0].length; i < len; i++) {
						var row = results[0][i];
						myCouponList.push({
							coupon_title: row.COUPON_TITLE,
							app_id: row.APP_ID,
							product_id: row.PRODUCT_ID,
							coupon_code: row.COUPON_CODE,
							skin_id: row.SKIN_ID,
							special_skin_code: row.SPECIAL_SKIN_CODE,
							start_date: row.START_DATE,
							end_date: row.END_DATE,
							reg_date: row.REG_DATE
						});
					}
				}
				PACKET.sendSuccess(req, res, { myCouponList: myCouponList });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
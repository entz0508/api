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
	app.post("/slp.coupon.list", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_COMMON_CONN.procGetCouponList({
				appID: COMMON_UTIL.trim(req.body.app_id),
				userType: COMMON_UTIL.trim(req.body.user_type) || 'all'
			}, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procGetCouponList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				var couponList = [];

				if ((0 < results[0].length)) {
					for (var i = 0, len = results[0].length; i < len; i++) {
						var row = results[0][i];
						couponList.push({
							seq: row.seq,
							title: row.title,
							skin_id: row.skin_id,
							special_skin_code: row.special_skin_code,
							app_id: row.app_id,
							use_limit: row.use_limit,
							product_id: row.product_id,
							key_value: row.key_value,
							user_type: row.user_type,
							use_yn: row.use_yn,
							reg_date: row.reg_date,
							start_date: row.start_date,
							end_date: row.end_date,
							editor_name: row.editor_name,
							publisher: row.publisher
						});
					}
				}

				PACKET.sendSuccess(req, res, { couponList: couponList });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
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
	app.post("/slp.coupon.create", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_COMMON_CONN.procCouponCreate({
				appID: COMMON_UTIL.trim(req.body.app_id),
				title: COMMON_UTIL.trim(req.body.title),
				useLimit: COMMON_UTIL.trim(req.body.useLimit),
				numOfCoupon: COMMON_UTIL.trim(req.body.numofcoupon),
				productID: COMMON_UTIL.trim(req.body.productID),
				keyValue: COMMON_UTIL.trim(req.body.keyValue),
				userType: COMMON_UTIL.trim(req.body.userType),
				couponType: COMMON_UTIL.trim(req.body.couponType),
				useArea: COMMON_UTIL.trim(req.body.useArea),
				startDate: COMMON_UTIL.trim(req.body.startDate),
				endDate: COMMON_UTIL.trim(req.body.endDate),
				editorName: COMMON_UTIL.trim(req.body.editorName),
				skinID: COMMON_UTIL.trim(req.body.skinID),
				specialSkinCode: COMMON_UTIL.trim(req.body.specialSkinCode),
				publisher: COMMON_UTIL.trim(req.body.publisher)
			}, function(err, results) {
				if (err || COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				PACKET.sendSuccess(req, res, { msg: results[0][0].MSG });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
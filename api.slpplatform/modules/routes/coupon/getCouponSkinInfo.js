var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	app.post("/slp.coupon.getCouponSkinInfo", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var uri = global.CONFIG.CDN_INFO.URI + "PLATFORM/data/bae_coupon.xml";
			request({ uri: uri, method: "GET" }, function(error, response, body) {
				parser.parseString(body, function(err, result) {
					var couponSkinOptions = "";
					var i = 0;
					while (i < Number(result.root.coupon[0].skin.length)) {
						var curSkin = result.root.coupon[0].skin[i];
						couponSkinOptions += '<option value="' + curSkin.id + '">' + curSkin.id + '(' + curSkin.support_desc + ')</option>';
						i++;
					}
					PACKET.sendSuccess(req, res, { skins: couponSkinOptions });
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	app.post("/slp.coupon.getProductList", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var requestParams = { appID: COMMON_UTIL.trim(req.body.app_id), lang: COMMON_UTIL.trim(req.body.language) };
			var url = global.CONFIG.CDN_INFO.URI;

			switch (requestParams.appID) {
				case "1000000001":
					url += (requestParams.lang === "kr" ? "dea/data/product_dea_kr.xml" : "dea/data/product_dea_en.xml");
					break;
				case "1000000003":
					url += "dla/data/dla_S1_product.xml";
					break;
				case "1000000004":
					url += "dla/data/dla_S2_product.xml";
					break;
				case "1000000005":
					url += "dla/data/dla_S3_product.xml";
					break;
				default :
					PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
					break;
			}

			request({ uri: url, method: "GET" }, function(error, response, body) {
				parser.parseString(body, function(err, result) {
					var i = 0, productOptions = "", curProduct;
					if (requestParams.appID === "1000000001") {
						while (i < Number(result.root.products[0].product.length)) {
							curProduct = result.root.products[0].product[i];
							productOptions += '<option value="' + curProduct.$.id + '">' + curProduct.$.id + '(' + curProduct.title + ')</option>';
							i++;
						}
						PACKET.sendSuccess(req, res, { products: productOptions });
					} else {
						while (i < Number(result.root.products[0].product.length)) {
							curProduct = result.root.products[0].product[i];
							productOptions += '<option value="' + curProduct.id + '">' + curProduct.id + '(' + curProduct.title + ')</option>';
							i++;
						}
						PACKET.sendSuccess(req, res, { products: productOptions });
					}
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
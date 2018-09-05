var async = require('async');
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

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

exports.add_routes = function(app) {
	app.post("/slp.coupon.use", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {
				req: req,
				res: res,
				API_PATH: API_PATH,
				CLIENT_IP: CLIENT_IP,
				appID: COMMON_UTIL.trim(req.body.app_id),
				email: COMMON_UTIL.trim(req.body.email),
				coupon_code: COMMON_UTIL.trim(req.body.coupon_code),
				os: COMMON_UTIL.trim(req.body.os),
				couponSeq: 0,
				accountID: 0,
				productID: "",
				title: "",
				point: 0,
				period: 0,
				usingUnit: "",
				periodType: "",
				levelIDs: "",
				episodeIDs: "",
				goodsIDs: "",
				goodsCount: 0,
				payMethod: "COUPON",
				reciept: "none"
			};
			// 이메일 유효성체크
			// 키벨류 숫자알파벳 체크 ( 필요시 )

			async.waterfall([function(callback) {
				// SQL에서 쿠폰 코드 값으로 product ID ,를 받아온다.
				MYSQL_SLP_COMMON_CONN.procGetCouponsProductID(requestParams, function(err, results) {
					if (err) {
						PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procGetCouponsProductID", err);
						PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						return callback('Err Get ProductID From SQL err');
					}
					if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
						PRINT_LOG.error(__filename, API_PATH, " db results is null");
						PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						return callback('Err Get ProductID From SQL result null');
					}
					if (Number(results[0][0].product_count) === 1) {
						requestParams.productID = results[0][0].product_id;
						requestParams.couponSeq = results[0][0].seq;
						requestParams.accountID = results[0][0].account_id;
						return callback(null, requestParams.productID);
					}
					PACKET.sendFail(req, res, -1);
				});
			}, function(productID, callback) {
				// productID 를 이용하여 저장소 FTP or CDN 에 있는 product.XML 을 읽어와 파싱하여 requestParams에 배정한다.
				var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
				var isMatch = false;

				switch (requestParams.appID) {
					case "1000000001":
						url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea.xml";
						break;
					case "1000000003":
						url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S1_product.xml";
						break;
					case "1000000004":
						url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S2_product.xml";
						break;
					case "1000000005":
						url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S3_product.xml";
						break;
					default :
						//PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
						callback("AppID is Wrong");
						break;
				}

				request({ uri: url, method: "GET" }, function(error, response, body) {
					parser.parseString(body, function(err, result) {
						for (var i = 0, len = result.root.products[0].product.length; i < len; i++) {
							var curProduct = result.root.products[0].product[i];
							if (curProduct.use === "true" && curProduct.id === requestParams.productID) {
								isMatch = true;
								requestParams.title = curProduct.title;
								requestParams.point = curProduct.point;
								requestParams.period = curProduct.period;
								requestParams.periodType = curProduct.period_type;
								requestParams.usingUnit = curProduct.using_unit;
								requestParams.levelIDs = requestParams.appID === "1000000001" ? curProduct.level_id : curProduct.category_id;
								requestParams.episodeIDs = curProduct.episode_id;
								requestParams.goodsIDs = requestParams.usingUnit === "level_id" || requestParams.usingUnit === "category_id" ? requestParams.levelIDs : requestParams.episodeIDs;
							}
						}


						if (requestParams.appID === "1000000001" && !(requestParams.usingUnit === "level_id" || requestParams.usingUnit === "episode_id"))
							return callback(" using_unit is invalid");
						if (!(requestParams.usingUnit === "category_id" || requestParams.usingUnit === "episode_id"))
							return callback(" using_unit is invalid");
						if (!isMatch)
							return callback("step2 err");

						callback(null, isMatch);
					});
				});
			}], function(err, result) {
				if (err) return PRINT_LOG.error(__filename, API_PATH, err);
				if (!result) {
					PRINT_LOG.error(__filename, API_PATH, " unmatched product id");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
				}

				// using_unit 에 따라 공백을 제거하여 goodsIDs 에 배정
				requestParams.goodsCount = String(requestParams.goodsIDs).split(",").length;

				// buy product SP는 각 디비별로 있기 때문에 SQL 에서 분기합니다.
				// spBuyProduct_facade 를 호출하면 appID 에 따라 각각 다른 SP 를 호출합니다.
				// Node 에서는 하나만 부를 수 있도록 함
				// 만약 각각의 구매 SP의 파라미터를 수정할 경우 이곳을 바꾸어주지 않으면 에러가 발생합니다. <주의>
				MYSQL_SLP_COMMON_CONN.spBuyProduct_facade(requestParams, function(err, results) {
					if (err) {
						PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.spBuyProduct_facade", err);
						return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
					}
					if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
						PRINT_LOG.error(__filename, API_PATH, " db results is null");
						return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
					}
					var result = results[0][0];

					if (Number(result.CODE) < 0) return PACKET.sendFail(req, res, -1);

					PACKET.sendSuccess(req, res, {
						ACCOUNT_ID: requestParams.accountID,
						CODE: result.CODE,
						MSG: result.MSG,
						RESCODE: result.resCode
					});
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
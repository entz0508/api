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
const MYSQL_SLP_DLA_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_DLA;

exports.add_routes = function (app) {
    app.post("/sdla/buy/buyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
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
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id) || 0; // 프로필 아이디가 없으면 0으로 세팅
            requestParams.productID = COMMON_UTIL.trim(req.body.product_id);
            requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);
            requestParams.reciept = COMMON_UTIL.trim(req.body.reciept);
            requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);
            requestParams.title = "";
            requestParams.point = -1;
            requestParams.period = -1;
            requestParams.usingUnit = "";
            requestParams.periodType = "";
            requestParams.categoryIDs = "";
            requestParams.episodeIDs = "";
            requestParams.goodsIDs = "";
            requestParams.goodsCount = 0;
            requestParams.timeZone = COMMON_UTIL.trim(req.body.time_zone) || "Asia/Seoul";

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                PRINT_LOG.debug("invalid accountID : " + requestParams.accountID);
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                PRINT_LOG.debug("invalid accessTokken : " + requestParams.accessToken);
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            // 상품구매에 관련된 3가지 파라미터가 없는 경우 에러 반환
            if (COMMON_UTIL.isNull(requestParams.productID) || COMMON_UTIL.isNull(requestParams.payMethod) || COMMON_UTIL.isNull(requestParams.reciept)) {
                PRINT_LOG.error(__filename, API_PATH, " parameters are not invalid - product id - pay method - reciept");
            }

            var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
            var isMatch = false;


            switch (requestParams.appID) {
                case "1000000003":
                    url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S1_product.xml";
                    if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "dla/data/dla_S1_product.xml";
                    break;
                case "1000000004":
                    url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S2_product.xml";
                    if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "dla/data/dla_S2_product.xml";
                    break;
                case "1000000005":
                    url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S3_product.xml";
                    if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "dla/data/dla_S3_product.xml";
                    break;
                default:
                    PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
                    break;
            }

            request({ uri: url, method: "GET" }, function (error, response, body) {
                parser.parseString(body, function (err, result) {
                    var i = 0;
                    while (i < result.root.products[0].product.length) {
                        var curProduct = result.root.products[0].product[i];

                        if (curProduct.use == "true" && curProduct.id == requestParams.productID) {
                            isMatch = true;
                            requestParams.title = curProduct.title;
                            requestParams.point = curProduct.point;
                            requestParams.period = curProduct.period;
                            requestParams.periodType = curProduct.period_type;
                            requestParams.usingUnit = curProduct.using_unit;
                            requestParams.categoryIDs = curProduct.category_id;
                            requestParams.episodeIDs = curProduct.episode_id;
                        }
                        i++;
                    }

                    if (!(requestParams.usingUnit == "category_id" || requestParams.usingUnit == "episode_id")) {
                        PRINT_LOG.error(__filename, API_PATH, " using_unit is invalid");
                    }

                    // 파라미터 프로덕트 아이디와 매칭되지 않을 경우 -1 상태
                    if (!isMatch) {
                        PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                    }

                    // uning_unit 에 따라 공백을 제거하여 goodsIDs 에 배정
                    if (requestParams.usingUnit == "category_id") {
                        requestParams.goodsIDs = requestParams.categoryIDs;
                    }
                    if (requestParams.usingUnit == "episode_id") {
                        requestParams.goodsIDs = requestParams.episodeIDs;
                    }

                    requestParams.goodsCount = String(requestParams.goodsIDs).split(",").length;

                    if (isMatch) {
                        MYSQL_SLP_DLA_CONN.procBuyProduct(requestParams, function (err, results) {
                            if (err) {
                                PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_DLA_CONN.procBuyProduct", err);
                                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            }
                            if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                                PRINT_LOG.error(__filename, API_PATH, " db results is null");
                                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            }

                            PACKET.sendSuccess(req, res, {
                                ACCOUNT_ID: requestParams.accountID, CODE: results[0][0].CODE, MSG: results[0][0].MSG
                            });
                        });
                    }
                });
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
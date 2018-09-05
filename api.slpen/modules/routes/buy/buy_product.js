// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;

function add_routes(app) {
    "use strict";
    app.post("/sen/buy/buyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var responseOBJ = {};
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
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);

            requestParams.productID = COMMON_UTIL.trim(req.body.product_id);
            requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);
            requestParams.reciept = COMMON_UTIL.trim(req.body.reciept);
            requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);
            requestParams.title = "";
            requestParams.point = -1;
            requestParams.period = -1;
            requestParams.usingUnit = "";
            requestParams.periodType = "";
            requestParams.levelIDs = "";
            requestParams.episodeIDs = "";
            requestParams.goodsIDs = "";
            requestParams.goodsCount = 0;

            requestParams.timeZone = "Asia/Seoul";

            requestParams.timeZone = COMMON_UTIL.trim(req.body.time_zone);
            if (requestParams.timeZone == "") {
                requestParams.timeZone = "Asia/Seoul";
            }

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                PRINT_LOG.info("", "", "invalid accountID : " + requestParams.accountID);
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                PRINT_LOG.info("", "", "invalid accessTokken : " + requestParams.accessToken);
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            // 상품구매에 관련된 3가지 파라미터가 없는 경우 에러 반환
            if (COMMON_UTIL.isNull(requestParams.productID) || COMMON_UTIL.isNull(requestParams.payMethod) || COMMON_UTIL.isNull(requestParams.reciept)) {
                if (COMMON_UTIL.isNull(requestParams.productID)) {
                    PRINT_LOG.info("param null", "productID", requestParams.productID);
                }
                if (COMMON_UTIL.isNull(requestParams.payMethod)) {
                    PRINT_LOG.info("param null", "payMethod", requestParams.payMethod);
                }
                if (COMMON_UTIL.isNull(requestParams.reciept)) {
                    PRINT_LOG.info("param null", "reciept", requestParams.reciept);
                }
                PRINT_LOG.error(__filename, API_PATH, " parameters are not invalid - product id - pay method - reciept");
            }

            //PRINT_LOG.info("Language Check : " + req.body.language);

            // 프로필 아이디가 없으면 프로필 아이디를 0 으로 세팅합니다.
            if (null == requestParams.profileID) { requestParams.profileID = 0; }

            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();
            var request = require("request");
            var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
            var isMatch = false;


            switch (requestParams.appID) {
                case "1000000001":
                    url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea.xml";
                    if (requestParams.isTest == "true") {
                        var url = global.CONFIG.CDN_INFO.DEV_CDN + "dea/data/product_dea.xml";
                    }
                    break;
                default:
                    PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
                    break;
            }

            //PRINT_LOG.info("c_ver","c_ver ",requestParams.clientVer);


            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {

                parser.parseString(body, function (err, result) {
                    var i = 0;

                    while (i < result.root.products[0].product.length) {
                        var curProduct = result.root.products[0].product[i];

                        if (curProduct.use == "true") {
                            if (curProduct.id == requestParams.productID) {
                                isMatch = true;
                                requestParams.title = curProduct.title;
                                requestParams.point = curProduct.point;
                                requestParams.period = curProduct.period;
                                requestParams.periodType = curProduct.period_type;
                                requestParams.usingUnit = curProduct.using_unit;
                                requestParams.levelIDs = curProduct.level_id;
                                requestParams.episodeIDs = curProduct.episode_id;
                            }
                        }
                        i++;
                    }
                    if (requestParams.usingUnit == "level_id" || requestParams.usingUnit == "episode_id") {

                    } else {
                        PRINT_LOG.error(__filename, API_PATH, " using_unit is invalid");
                    }

                    // 파라미터 프로덕트 아이디와 매칭되지 않을 경우 -1 상태
                    if (!isMatch) {
                        PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                    }

                    // uning_unit 에 따라 공백을 제거하여 goodsIDs 에 배정
                    if (requestParams.usingUnit == "level_id") {
                        requestParams.goodsIDs = requestParams.levelIDs;
                    }
                    if (requestParams.usingUnit == "episode_id") {
                        requestParams.goodsIDs = requestParams.episodeIDs;
                    }

                    requestParams.goodsCount = String(requestParams.goodsIDs).split(",").length;

                    if (isMatch) {
                        MYSQL_SLP_EN_CONN.procBuyProduct(requestParams, function (err, results) {
                            if (err) {
                                PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procBuyProduct", err);
                                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            } else if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                                PRINT_LOG.error(__filename, API_PATH, " db results is null");
                                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            } else {
                                if (results[0][0].RES < 0) {
                                    //responseOBJ.res = results[0][0].RES;
                                    //responseOBJ.CODE = results[0][0].CODE;
                                    //responseOBJ.MSG = results[0][0].MSG;
                                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                                } else {

                                    responseOBJ.ACCOUNT_ID = requestParams.accountID;
                                    responseOBJ.result = results[0][0].RES;

                                    responseOBJ.CODE = results[0][0].CODE;
                                    responseOBJ.MSG = results[0][0].MSG;

                                    PACKET.sendSuccess(req, res, responseOBJ);
                                }
                            }
                        });
                    }

                });
            });

        } catch (catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }

    });



}

exports.add_routes = add_routes;


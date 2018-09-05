var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function (app) {

    // NDE 구매처리 -> "/nde/open/buyProduct" 으로 이동
    /*
     app.post("/nde/buy/BuyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
     var API_PATH = req.route.path;
     var CLIENT_IP = COMMON_UTIL.getClientIP(req);
     try {
     var requestParams = {};
     requestParams.req = req;
     requestParams.res = res;
     requestParams.API_PATH = API_PATH;
     requestParams.CLIENT_IP = CLIENT_IP;

     //post man or client 에서 받는 파라미터
     requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
     requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
     requestParams.os = COMMON_UTIL.trim(req.body.os);
     requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
     requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
     requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);            // ???
     requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
     requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id) || 0;       // 프로필 아이디가 없으면 0으로 세팅
     requestParams.productID = COMMON_UTIL.trim(req.body.product_id);
     requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);
     requestParams.reciept = COMMON_UTIL.trim(req.body.reciept);
     requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);

     //xml 로 파라미터 받음
     requestParams.title = "";
     requestParams.point = -1;
     requestParams.period = -1;
     requestParams.usingUnit = "";
     requestParams.periodType = "";
     requestParams.lessonIDs = "";
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

     var isMatch = false;
     var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
     switch (requestParams.appID) {
     case "1000000007":
     url = global.CONFIG.CDN_INFO.REAL_CDN + "nde/data/nde_product.xml";                                         // nde ftp url  http://cdn.bluearkedu.com/nde/data/nde_product.xml
     if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "nde/data/nde_product.xml";      // http://ftp.bluearkedu.com/nde/data/nde_product.xml
     break;
     default:
     PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
     break;
     }

     request({ uri: url, method: "GET" }, function (error, response, body) {
     parser.parseString(body, function (err, result) {
     var i = 0;
     while (i < result.root.product.length) {
     var curProduct = result.root.product[i];
     if (curProduct.use == "true" && curProduct.id == requestParams.productID) {
     isMatch = true;
     requestParams.title = curProduct.title;
     requestParams.period = curProduct.period;
     }
     i++;
     }

     // 파라미터 프로덕트 아이디와 매칭되지 않을 경우 -1 상태
     if (!isMatch) {
     PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
     PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
     }

     if (isMatch) {
     PRINT_LOG.info(__filename, API_PATH, 'requestParams : ' + requestParams);

     MYSQL_SLP_NDE.procBuyProduct(requestParams, function (err, results) {
     if (err) {
     PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procBuyProduct", err);
     return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
     }
     if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
     PRINT_LOG.error(__filename, API_PATH, " db results is null");
     return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
     }

     // EBS 전달 변수
     var exParam = {};
     exParam.app_id = "APP6ef74743-23e2-496c-a67d-a1010a10c016";
     exParam.enc_user_id = results[0][0].ENC_USER_ID;     // db 조회값
     exParam.store = "google";                            // google or ios
     exParam.ext_pdt_id = results[0][0].ext_id;           // db 조회값
     exParam.buy_ymd = results[0][0].buy_ymd;             // db 처리날짜
     exParam.buy_time = results[0][0].buy_time;           // db 처리시간

     PRINT_LOG.info(__filename, API_PATH, 'productID : ' + requestParams.productID);
     PRINT_LOG.info(__filename, API_PATH, 'results : ' + JSON.stringify(results[0]));
     PRINT_LOG.info(__filename, API_PATH, 'exParam : ' + JSON.stringify(exParam));

     ebsLang_check(exParam, function (resData) {
     PRINT_LOG.info(__filename, API_PATH, resData);
     PACKET.sendSuccess2(req, res, { exParam: JSON.stringify(resData) });
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
     */


    // NDE 로그저장
    app.post("/nde/buy/BuyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;

            //post man or client 에서 받는 파라미터
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);            // ???
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id) || 0;       // 프로필 아이디가 없으면 0으로 세팅
            requestParams.productID = COMMON_UTIL.trim(req.body.product_id);            //
            requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);            // cash
            requestParams.reciept = COMMON_UTIL.trim(req.body.reciept);
            requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);
            requestParams.encUserID = "";
            requestParams.exProductID = 0;

            //xml 로 파라미터 받음
            requestParams.title = "";
            requestParams.point = -1;
            requestParams.period = -1;
            requestParams.usingUnit = "";
            requestParams.periodType = "";
            requestParams.lessonIDs = "";
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

            var isMatch = false;
            var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
            switch (requestParams.appID) {
                case "1000000007":
                    url = global.CONFIG.CDN_INFO.REAL_CDN + "nde/data/nde_product.xml";                                         // nde ftp url  http://cdn.bluearkedu.com/nde/data/nde_product.xml
                    if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "nde/data/nde_product.xml";      // http://ftp.bluearkedu.com/nde/data/nde_product.xml
                    break;
                default:
                    PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
                    break;
            }

            request({ uri: url, method: "GET" }, function (error, response, body) {
                parser.parseString(body, function (err, result) {
                    var i = 0;
                    while (i < result.root.product.length) {
                        var curProduct = result.root.product[i];
                        if (curProduct.use == "true" && curProduct.id == requestParams.productID) {
                            isMatch = true;
                            requestParams.title = curProduct.title;
                            requestParams.period = curProduct.period;
                        }
                        i++;
                    }

                    // 파라미터 프로덕트 아이디와 매칭되지 않을 경우 -1 상태
                    if (!isMatch) {
                        PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                    }

                    if (isMatch) {
                        MYSQL_SLP_NDE.procBuyTempCreate(requestParams, function (err, results) {
                            if (err) {
                                PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procBuyTempCreate", err);
                                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            }
                            if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                                PRINT_LOG.error(__filename, API_PATH, " db results is null");
                                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                            }

                            // EBS 전달 변수
                            var exParam = {};
                            exParam.app_id = "APP6ef74743-23e2-496c-a67d-a1010a10c016";
                            exParam.enc_user_id = results[0][0].ENC_USER_ID;     // db 조회값
                            exParam.store = "google";                            // google or ios
                            exParam.ext_pdt_id = results[0][0].ext_id;           // db 조회값
                            exParam.buy_ymd = results[0][0].buy_ymd;             // db 처리날짜
                            exParam.buy_time = results[0][0].buy_time;           // db 처리시간
                            exParam.trade_id = results[0][0].TRADE_ID;
                            PRINT_LOG.info(__filename, API_PATH, 'BuyCartCreate exParam : ' + JSON.stringify(exParam));



                            ebsLang_check(exParam, function (resData) {
                                PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                                //PACKET.sendSuccess2(req, res, { exParam: JSON.stringify(resData) });
                                //PACKET.sendSuccess(req, res, { exParam: JSON.stringify(resData) });
                                PACKET.sendSuccess(req, res, { exParam: exParam, resData: resData });
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

    var ebsLang_check = function (exParam, callBack) {
        // var url = "http://s-www.ebslang.co.kr";
        //var url = "http://www.ebslang.co.kr";
        //var path = "/app/extPdtBuySave.ebs";              // 상품구매 동기
        var path = "/app/extPdtFreeBuySave.ebs";            // 관리자 구매
        //var path = "/app/extPdtBuySave.ebs";
        // url = url + path;
        var url =  global.CONFIG.EBS_SERVICE.STAGE_URL + path;
        // var url =  global.CONFIG.EBS_SERVICE.SERVICE_URL + path;

        try {
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: exParam
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // PRINT_LOG.info(__filename, 'ebsLang_check', body);          // {"res":-1}
                    // 성공시 DB에 성공처리
                    PRINT_LOG.info(__filename, 'ebsLang_check', body);
                    callBack(JSON.parse(body));
                }
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };

    // 최종 구매처리
    app.post("/nde/open/buyProduct", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        // [난수4자리][step_attend_id][buy_id][blueark_uid][ext_pdt_id][ebs auth key][user ip address] -> enc_user_Id
        /*
         {
         "data":[
         "q1db",
         "5958592",
         "1000000007",
         "f6573a11a4a789883a6a48ca996ce9dc1ad1b5ac",
         "2",
         "EbsLang",
         "104.199.129.129"
         ],
         "res":true
         }
         */
        var userTokenList = [];
        var token = {};
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var appID = 1000000007;
        var msg = null;
        var appResult = 0;

        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);

            var xa = xtt.split("|");
            if (xa.length > 0) {

                var requestParams = {};
                requestParams.req = req;
                requestParams.res = res;
                requestParams.API_PATH = API_PATH;
                requestParams.CLIENT_IP = CLIENT_IP;

                requestParams.appID = COMMON_UTIL.trim(appID);
                requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
                requestParams.buyID = COMMON_UTIL.trim(xa[2]);
                requestParams.bluearkUid = COMMON_UTIL.trim(xa[3]);
                requestParams.extPdtID = COMMON_UTIL.trim(xa[4]);       // 프로필 아이디가 없으면 0으로 세팅
                requestParams.buyIP = COMMON_UTIL.trim(xa[6]);

                MYSQL_SLP_NDE.procOpenBuyProduct(requestParams, function (err, results) {
                    if (err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procOpenBuyProduct", err);
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    }
                    if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    }
                    //PRINT_LOG.info(__filename, API_PATH, 'results : ' + JSON.stringify( results ));

                    //PACKET.sendSuccess2(req, res, { data: userTokenList });
                    //PACKET.sendSuccess2(req, res, {});
                    if(results[0][0].RES == 0 ){
                        var obj2 = {};
                        obj2.success = true;
                        obj2.error = null;
                        obj2.data = {};
                        PRINT_LOG.info(__filename,API_PATH,JSON.stringify(obj2));
                        PACKET.sendSuccess2(req, res, {});
                    } else {
                        var obj2 = {};
                        obj2.success = false;
                        obj2.error = null;
                        obj2.data = {};
                        msg = results[0][0].MSG;
                        PACKET.sendFail2(req, res, msg, {});
                    }
                });

            }

        } catch (ex) {
            msg = ex;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }

    });





    // EBSLang - EBS WEB 구매 동기처리 api
    app.post("/nde/buy/exBuyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            //post man or client 에서 받는 파라미터

            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);                    // nde 고정
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);            // account_id or enc_user_id
            requestParams.os = COMMON_UTIL.trim(req.body.os);                           // android / ios or web
            requestParams.productID = COMMON_UTIL.trim(req.body.product_id);            // product_id or ext_product_id
            requestParams.reciept = COMMON_UTIL.trim(req.body.reciept);                 // reciept or EBS BuyInfo

            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id) || 0;           // 프로필 아이디가 없으면 0으로 세팅
            requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);
            requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);

            //xml 로 파라미터 받음
            requestParams.title = "";
            requestParams.point = -1;
            requestParams.period = -1;
            requestParams.usingUnit = "";
            requestParams.periodType = "";
            requestParams.lessonIDs = "";
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

                case "1000000007":
                    url = global.CONFIG.CDN_INFO.REAL_CDN + "nde/data/nde_product.xml"; //nde ftp url
                    if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "nde/data/nde_product.xml";
                    break;
                default :
                    PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
                    break;

            }

            request({ uri: url, method: "GET" }, function(error, response, body) {
                parser.parseString(body, function(err, result) {
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
                            requestParams.lessonIDs = curProduct.lesson_id;
                            requestParams.episodeIDs = curProduct.episode_id;
                        }
                        i++;
                    }

                    if (!(requestParams.usingUnit == "lesson_id" || requestParams.usingUnit == "episode_id")) {
                        PRINT_LOG.error(__filename, API_PATH, " using_unit is invalid");
                    }

                    // 파라미터 프로덕트 아이디와 매칭되지 않을 경우 -1 상태
                    if (!isMatch) {
                        PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                    }

                    // uning_unit 에 따라 공백을 제거하여 goodsIDs 에 배정
                    if (requestParams.usingUnit == "lesson_id") {
                        requestParams.goodsIDs = requestParams.lessonIDs;
                    }
                    if (requestParams.usingUnit == "episode_id") {
                        requestParams.goodsIDs = requestParams.episodeIDs;
                    }

                    requestParams.goodsCount = String(requestParams.goodsIDs).split(",").length;

                    if (isMatch) {
                        MYSQL_SLP_NDE.procBuyProduct(requestParams, function(err, results) {
                            if (err) {
                                PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procBuyProduct", err);
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

                        // EBSLang 동기화 호출, step_attend_id 저장
                    }
                });
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
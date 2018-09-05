// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;


function add_routes(app) {
    "use strict";

    app.post("/sen/episode/buyProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res){
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
            requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            
            requestParams.productID = COMMON_UTIL.trim(req.body.product_id);
            requestParams.payMethod = COMMON_UTIL.trim(req.body.pay_method);
            requestParams.receipt = COMMON_UTIL.trim(req.body.receipt);
            
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
			// 하루짜리 상품 구매시 스탭명 혹은 에피소드명
			requestParams.goodsID = COMMON_UTIL.trim(req.body.goods_id);

            requestParams.lang = "KO";

            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;         
                requestParams.accessToken = "";
            }
            
            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
            MYSQL_SLP_COMMON_CONN.procBuyProduct(requestParams, function(err, results){
                if(err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procBuyProduct", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    // 디비 메세지 확인 
                    //PRINT_LOG.error(__filename, API_PATH, "result.res :" + results[0][0]["RES"] );
                    
                    
                    var resultOBJ = {};
                    
                    //resultOBJ.msg = results[0][0].MSG;
					resultOBJ.ACCOUNT_POINT = results[0][0].ACCOUNT_POINT;
                    PACKET.sendSuccess(req, res, resultOBJ);
                }
            });
            
            
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;


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

    app.post("/sen/etc/setSubscribeFalse", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res){
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

            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);

            requestParams.lang = "KO";

            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
            
                MYSQL_SLP_COMMON_CONN.procSetSubscribeFalse(requestParams, function(err, results){
                    if(err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procSetSubscribeFalse", err);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {

                        MYSQL_SLP_COMMON_CONN.procGetProductPerm(requestParams, function(err, results){
                    if(err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetLevelPermList", err);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {
                        var responseOBJ = {};
                        responseOBJ.product_list = [];

                        if( (0 < results[0].length) ) {                      
                            var len = results[0].length;
                            for(var i=0; i<len; i++) {
                                var row = results[0][i];
                                var obj = {};
                                obj.app_id = row.APP_ID;
                                obj.account_id = row.ACCOUNT_ID;
                                obj.product_id = row.PRODUCT_ID;
                                obj.reg_datetime = row.REG_DATETIME;
                                obj.end_datetime = row.END_DATETIME; 

                                responseOBJ.product_list.push(obj);
                            }
                        }

                        PACKET.sendSuccess(req, res, responseOBJ);

                    }
                });
                    
                    

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


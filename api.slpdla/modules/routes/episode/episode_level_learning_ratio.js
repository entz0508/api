// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

function add_routes(app) {
    "use strict";

    app.post("/sen/episode/levelLearningRatio", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);

            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);

            requestParams.lang = "KO";

            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;         
                requestParams.accessToken = "";
            }
            
            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
                
            MYSQL_SLP_KW_ACTION_LOG_CONN.procGetEpisodePlayHistory(requestParams, function(err, results){
                if(err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetEpisodePlayHistory", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var responseOBJ = {};
                    responseOBJ.learningRatio = [];
            
                    
                    if( (0 < results[0].length) ) {                      
                        var len = results[0].length;
                        
                        var epiCount_lv1 = 24;
                        var epiCount_lv2 = 28;
                        
                        var playCount_lv1 = 0;
                        var playCount_lv2 = 0;
                        
                        var obj = {};
                        
                        for(var i=0; i<len; i++) {
                            var row = results[0][i];
                            
                            if( row.LEVEL_ID == 1 ) playCount_lv1++;
                            if( row.LEVEL_ID == 2 ) playCount_lv2++;
                        }
                        obj.level = "lv1";
                        obj.episodePlayCount = playCount_lv1;
                        obj.learningRatio = (playCount_lv1/epiCount_lv1)*100;
                        responseOBJ.learningRatio.push(obj);
                        
                        var obj2 = {};
                        obj2.level = "lv2";
                        obj2.episodePlayCount = playCount_lv2;
                        obj2.learningRatio = (playCount_lv2/epiCount_lv2)*100;
                        responseOBJ.learningRatio.push(obj2);
                        
                    } else {
                        //var obj = {};
                        //responseOBJ.msg = "no record";
                        //responseOBJ.learningRatio[0].push(obj);
                    }

                    PACKET.sendSuccess(req, res, responseOBJ);
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


// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_DLA_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_DLA;

function add_routes(app) {
    "use strict";

    app.post("/sdla/episode/categoryRotationRewordRequest", ROUTE_MIDDLEWARE.DEFAULT, function(req, res){
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
			requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.categoryID = COMMON_UTIL.trim(req.body.category_id);

            requestParams.lang = "KO";

            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;         
                requestParams.accessToken = "";
            }
            
            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
            MYSQL_SLP_DLA_CONN.procCategoryRotationRewordRequest(requestParams, function(err, results){
                if(err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_DLA_CONN.procCategoryRotationRewordRequest", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
					responseOBJ.MSG = results[0][0].MSG; 
					responseOBJ.POINT = results[0][0].POINT;
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


// nodejs npm

// common
const ROUTE_MIDDLEWARE   = require('../../common/util/route_middleware.js');
const PACKET     = require('../../common/util/packet_sender.js');
const COMMON_UTIL     = require('../../common/util/common.js');
const ERROR_CODE_UTIL     = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;



function add_routes(app) {
    "use strict";
    
    app.post("/slp.coupon.list", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
            var requestParams = {};
            requestParams.req           = req;
            requestParams.res           = res;
            requestParams.API_PATH      = API_PATH;
            requestParams.CLIENT_IP     = CLIENT_IP;
			
			var responseOBJ = {};
				
			MYSQL_SLP_COMMON_CONN.procGetCouponList(requestParams, function(err, results){
				if(err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procGetCouponList", err); 
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else {

					responseOBJ.MSG = results[0][0].MSG;
					responseOBJ.CODE = results[0][0].CODE;
					responseOBJ.QUEST_ID = requestParams.questID;
					responseOBJ.ACCOUNT_ID = requestParams.accountID;
					responseOBJ.ACCOUNT_POINT = results[0][0].ACCOUNT_POINT;
					responseOBJ.PROFILE_ID = requestParams.profileID;

					PACKET.sendSuccess(req, res, responseOBJ);
				}
			});
			
			
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
    
    app.post("/slp.coupon.create", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
            var requestParams = {};
            requestParams.req           = req;
            requestParams.res           = res;
            requestParams.API_PATH      = API_PATH;
            requestParams.CLIENT_IP     = CLIENT_IP;
            requestParams.appID         = COMMON_UTIL.trim(req.body.app_id);
            requestParams.title         = COMMON_UTIL.trim(req.body.title);
            requestParams.useLimit		= COMMON_UTIL.trim(req.body.useLimit);
            requestParams.productID		= COMMON_UTIL.trim(req.body.productID);
            requestParams.keyValue		= COMMON_UTIL.trim(req.body.keyValue);
            requestParams.startDate		= COMMON_UTIL.trim(req.body.startDate);
            requestParams.endDate		= COMMON_UTIL.trim(req.body.endDate);
            requestParams.editorName	= COMMON_UTIL.trim(req.body.editorName);
			
			var responseOBJ = {};
				
			MYSQL_SLP_COMMON_CONN.procCouponCreate(requestParams, function(err, results){
				if(err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procGetCouponList", err);
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else {
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
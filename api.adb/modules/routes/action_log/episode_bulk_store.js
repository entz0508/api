// nodejs npm

// common
const ROUTE_MIDDLEWARE   = require('../../common/util/route_middleware.js');
const PACKET     = require('../../common/util/packet_sender.js');
const COMMON_UTIL     = require('../../common/util/common.js');
const ERROR_CODE_UTIL     = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;


function add_routes(app) {
    "use strict";

    app.post("/sen/action/episodeBulkStore", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            //requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);

            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);

            requestParams.episodeRecord = COMMON_UTIL.trim(req.body.episode_record);
			requestParams.episodeID = "";
			requestParams.playTime = 0;
			requestParams.startUnixTimeStemp = 0;
			requestParams.endUnixTimeStemp = 0;
			
			var responseObj = {};
			var epRecord = JSON.parse(requestParams.episodeRecord);
			
			//responseObj.msg = epRecord.playHistory.length;
			//responseObj.json = epRecord;
			var isSuccess = false;
			for ( var i = 0 ; i < epRecord.playHistory.length ; i++ ) {
				requestParams.startUnixTimeStemp = new Date(epRecord.playHistory[i]["BEGIN_DATETIME"].split(' ').join('T')).getTime() /1000;
				requestParams.endUnixTimeStemp = new Date(epRecord.playHistory[i]["END_DATETIME"].split(' ').join('T')).getTime() /1000;
				requestParams.episodeID = epRecord.playHistory[i]["EPISODE_ID"];
				requestParams.playTime = epRecord.playHistory[i]["PLAY_TIME"];
				MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLogEnStartEnd(requestParams, function (err, results) {
					if (err) {
						PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLogEnStartEnd, faile db, error");
						isSuccess = false;
					} else {
						isSuccess = true;
					}
				});
			}
			
			// 올라갔음에도 불구하고 isSuccess 가 false 로 나옴 
			
			responseObj.msg = "success";
			//PRINT_LOG.error(__filename, API_PATH, " success");
			PACKET.sendSuccess(req, res, responseObj);
			/*
			if (isSuccess) {
				responseObj.msg = "success";
				//PRINT_LOG.error(__filename, API_PATH, " success");
				PACKET.sendSuccess(req, res, responseObj);
			} else {
				responseObj.msg = "fail";
				//PRINT_LOG.error(__filename, API_PATH, " fail");
				PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
			}
			*/
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;
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
    
    app.post("/sen/quest/questRequestList_json", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req           = req;
            requestParams.res           = res;
            requestParams.API_PATH      = API_PATH;
            requestParams.CLIENT_IP     = CLIENT_IP;
            requestParams.countryCode   = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID         = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os            = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID     = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer     = COMMON_UTIL.trim(req.body.c_ver);
            
            requestParams.accountID     = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken   = COMMON_UTIL.trim(req.body.account_access_token);
            requestParams.profileID     = COMMON_UTIL.trim(req.body.profile_id);

			requestParams.questId = "";
			requestParams.questClass = "";
			requestParams.questDuplicateUnit = "";
			requestParams.questStarpoint = "";
			requestParams.questCount = 0;
			
            if(!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            
            if(!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
			
			// 프로필 아이디가 없으면 프로필 아이디를 0 으로 세팅합니다.
            if( null == requestParams.profileID ) { requestParams.profileID = 0; }
			
			
			
			var questArr = require("/data/www/SERVICE_XML/slpen/dea_quest.json");
            var arrTemp = questArr.quests;
			
			var i = 0;
			
			requestParams.questCount = arrTemp.length;
			
			while( i < arrTemp.length ) {
				requestParams.questId += arrTemp[i]["quest_id"];
				requestParams.questClass += arrTemp[i]["class"];
				requestParams.questDuplicateUnit += arrTemp[i]["duplicate_unit"];
				requestParams.questStarpoint += arrTemp[i]["point"];
				
				i++;
				
				if ( i < ( arrTemp.length )  ) {
					requestParams.questId += ",";
					requestParams.questClass += ",";
					requestParams.questDuplicateUnit += ",";
					requestParams.questStarpoint += ",";
				} 
			}
			
			
			
			/* 테스트용 코드
			responseOBJ.profileID = requestParams.profileID;
			responseOBJ.length = arrTemp.length;
			responseOBJ.paramQuestId = paramQuestId;
			responseOBJ.paramQuestClass = paramQuestClass;
			responseOBJ.paramQuestDuplicateUnit = paramQuestDuplicateUnit;
			PACKET.sendSuccess(req, res, responseOBJ);
            */
		   
			MYSQL_SLP_COMMON_CONN.procQuestRequestList(requestParams, function(err, results){
				if(err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procQuestRequestList", err);
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				} else {
					var responseOBJ = {};
					
					responseOBJ.QUEST_LIST = JSON.parse("[" + results[0][0].MSG + "]");
					responseOBJ.ACCOUNT_ID = results[0][0].ACCOUNT_ID;
					responseOBJ.PROFILE_ID = results[0][0].PROFILE_ID;

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


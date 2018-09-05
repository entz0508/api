// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;



function add_routes(app) {
    "use strict";

    app.post("/sen/test/inwhan", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
			require('date-utils');
			var dt = new Date();
					
			var today = new Date();
			var ss = today.getSeconds();
			var min = today.getMinutes();
			var hh = today.getHours();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd='0'+dd
			} 
			if(mm<10) {
				mm='0'+mm
			} 
			today = yyyy+mm+dd+hh+min+ss;

			var responseOBJ = {};
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

            MYSQL_SLP_EN_CONN.procGetEpisodePermList(requestParams, function(err, results){
                if(err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetEpisodePermList", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if(COMMON_UTIL.isNull(results) || (0 >= results.length) ) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    
                    if( (0 < results[0].length) ) {
												
						responseOBJ.level = [];
						
						var cur_level = {};
						cur_level.level_id = "FUCK";
						cur_level.total_episodeCount		= 0;
						cur_level.available_episodeCount	= 0;
						cur_level.step = [];
						
						var cur_step = {};
						cur_step.step_id = "FUCK";
						cur_step.total_episodeCount			= 0;
						cur_step.available_episodeCount		= 0;
						cur_step.episode = [];
						
						var len = results[0].length;
						
						
						for(var i = 0 ; i < len ; i++){
							var obj	= {};
							var times = {};
							var row = results[0][i];
							
							obj.level_id		= row.level_id;
							obj.step_id			= row.step_id;
							obj.episode_id		= row.episode_id;
							obj.use				= row.use;
							obj.type			= row.type;
							obj.begin_datetime	= row.begin_datetime;
							obj.end_datetime	= row.end_datetime;
							obj.available		= row.available;
							
							times.begintime		= obj.begin_datetime;
							
							var t = new Date(2017,5,23);
							Number(t);
							
							console.log(i+t);
							
							
//							if(times.begintime < today){
//								console.log("begin time is post")
//							} else {
//								console.log("begin time is past")
//							}
//							
//							if(times.endtime > today){
//								console.log("endtime is post");
//							} else {
//								console.log("endtime is past");
//							}
							
							if( i == 0 ) {
								cur_level							= {};
								cur_level.level_id					= obj.level_id;
								cur_level.total_episodeCount		= 0;
								cur_level.available_episodeCount	= 0;
								cur_level.begin_datetime			= obj.begin_datetime;
								cur_level.end_datetime				= obj.end_datetime;
								cur_level.step						= [];
								
								cur_step							= {};
								cur_step.step_id					= obj.step_id;
								cur_step.total_episodeCount			= 0;
								cur_step.available_episodeCount		= 0;
								cur_step.begin_datetime				= obj.begin_datetime;
								cur_step.end_datetime				= obj.end_datetime;
								cur_step.episode					= [];		
								
//								cur_level.total_episodeCount++;
								cur_step.total_episodeCount++;
								if(obj.available == 'y'){
									cur_step.available_episodeCount++;
								}
								cur_step.episode.push(obj);
							} else {
								
								// 스텝이 같으면
								if(obj.step_id == cur_step.step_id) {	
									
									// 카운트 증가
									cur_step.total_episodeCount++;
									cur_level.total_episodeCount++;
									if(obj.available == 'y'){
										cur_step.available_episodeCount++;
										cur_level.available_episodeCount++;
									}
									
									// 스텝에 에피소드 푸시
									cur_step.episode.push(obj);
								} else {
									// 스텝이 다르면
									// --------- 스텝초기화 ----------
									cur_level.step.push(cur_step);
									cur_step							= {};									
									cur_step.step_id					= obj.step_id;
									cur_step.total_episodeCount			= 0;
									cur_step.available_episodeCount		= 0;
									cur_step.begin_datetime				= obj.begin_datetime;
									cur_step.end_datetime				= obj.end_datetime;
									cur_step.episode					= [];
									// --------- 스텝초기화 ----------
									
									// 카운트 증가
									cur_step.total_episodeCount++;
									cur_level.total_episodeCount++;
									if(obj.available == 'y'){
										cur_step.available_episodeCount++;
										cur_level.available_episodeCount++;
									}
									// 스텝에 에피소드 푸시
									cur_step.episode.push(obj);
								}
								// 레벨이 같으면
								if(obj.level_id == cur_level.level_id){
									// 같으면 뭘하지?
								} else {
									// 레벨이 다르면
									// --------- 레벨초기화 ----------
									responseOBJ.level.push(cur_level);	
									cur_level							= {};
									cur_level.level_id					= obj.level_id;
									cur_level.total_episodeCount		= 0;
									cur_level.available_episodeCount	= 0;
									cur_level.begin_datetime			= obj.begin_datetime;
									cur_level.end_datetime				= obj.end_datetime;
									cur_level.step						= [];
									// --------- 레벨초기화 ----------
								}	
							}
						}
						responseOBJ.level.push(cur_level);
                    }
					// 지역별 현재 날자 반환 업데이트 해야 합니다.
                    
                    responseOBJ.local_date = dt.toFormat('YYYY-MM-DD HH24:MI:SS');					
					console.log("today is "+today);
					PACKET.sendSuccess(req, res, times);
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
require('date-utils');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

exports.add_routes = function(app) {
	app.post("/sdla/quest/questRequestList", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {
				req: req,
				res: res,
				API_PATH: API_PATH,
				CLIENT_IP: CLIENT_IP,
				countryCode: COMMON_UTIL.trimCountry(req.body.country),
				appID: COMMON_UTIL.trim(req.body.app_id),
				os: COMMON_UTIL.trim(req.body.os),
				clientUID: COMMON_UTIL.trim(req.body.client_uid),
				clientVer: COMMON_UTIL.trim(req.body.c_ver),
				accountID: COMMON_UTIL.trim(req.body.account_id),
				accessToken: COMMON_UTIL.trim(req.body.access_token),
				profileID: COMMON_UTIL.trim(req.body.profile_id) || 0, // 프로필 아이디가 없으면 0 으로 세팅
				isTest: COMMON_UTIL.trim(req.body.is_test),
				questId: "",
				questAppID: "",
				questClass: "",
				questDuplicateUnit: "",
				questStarpoint: "",
				questCount: 0,
				timeZone: COMMON_UTIL.trim(req.body.time_zone) || "Asia/Seoul"
			};

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			var url = (requestParams.isTest == "true" ? global.CONFIG.CDN_INFO.DEV_CDN : global.CONFIG.CDN_INFO.URI) + "dla/data/dla_quest.xml";
			request({ uri: url, method: "GET" }, function(error, response, body) {
				parser.parseString(body, function(err, result) {
					// console.log("\n## GET ## " + url);

					requestParams.questCount = 0;

					var i = 0;
					while (i < result.root.quest.length) {
						var curQuest = result.root.quest[i];
						var questAppIDArr = String(curQuest.app_id).replace(/ /g, "").split(",");

						if (questAppIDArr.indexOf(String(requestParams.appID)) != -1 && curQuest.use == "true") {
							requestParams.questId += curQuest.quest_id + ",";
							requestParams.questClass += curQuest.class + ",";
							requestParams.questDuplicateUnit += curQuest.duplicate_unit + ",";
							requestParams.questStarpoint += curQuest.point + ",";
							requestParams.questAppID += String(curQuest.app_id).replace(/ /g, "").replace(/,/g, "|") + ",";
							requestParams.questCount++;
						}
						i++;
					}

					if (requestParams.questAppID == "") requestParams.questAppID = requestParams.appID;

					MYSQL_SLP_COMMON_CONN.procQuestRequestList(requestParams, function(err, results) {
						if (err) {
							PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procQuestRequestList", err);
							return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						}
						if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
							PRINT_LOG.error(__filename, API_PATH, " db results is null");
							return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						}

						var QUEST_LIST = JSON.parse("[" + results[0][0].MSG + "]");

						// console.log("\n QUEST_LIST");
						// console.log(QUEST_LIST);
						PACKET.sendSuccess(req, res, {
							QUEST_LIST: QUEST_LIST,
							ACCOUNT_ID: results[0][0].ACCOUNT_ID,
							PROFILE_ID: results[0][0].PROFILE_ID,
							ACCOUNT_POINT: results[0][0].ACCOUNT_POINT,
							LOCAL_DATE: (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS')
						});
					});
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
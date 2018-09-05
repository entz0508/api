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
	app.post("/sdla/quest/questRequest", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
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
			requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
			requestParams.profileID = COMMON_UTIL.trim(req.body.profile_id) || 0; // 프로필 아이디가 없으면 0 으로 세팅
			requestParams.questID = COMMON_UTIL.trim(req.body.quest_id);
			requestParams.questRewardType = COMMON_UTIL.trim(req.body.quest_reward_type);
			requestParams.isTest = COMMON_UTIL.trim(req.body.is_test);
			requestParams.questClass = "";
			requestParams.questDuplicateUnit = "";
			requestParams.questStarpoint = "";
			requestParams.questDesc = "";
			requestParams.questAppID = "";
			requestParams.questIds = "";
			requestParams.questClasses = "";
			requestParams.questDuplicateUnits = "";
			requestParams.questStarpoints = "";
			requestParams.questCount = 0;
			requestParams.timeZone = COMMON_UTIL.trim(req.body.time_zone) || "Asia/Seoul";

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			if (!(requestParams.questRewardType == "point" || requestParams.questRewardType == "episode")) {
				PRINT_LOG.debug(__filename, API_PATH, "questRewardType is wrong");
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			var isMatchedQuestID = false;
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
							if (curQuest["quest_id"] == requestParams.questID) {
								requestParams.questClass = curQuest.class;
								requestParams.questDuplicateUnit = curQuest.duplicate_unit;

								if (requestParams.questRewardType == "episode") requestParams.questStarpoint = 0;
								if (requestParams.questRewardType == "point") requestParams.questStarpoint = curQuest.point;

								requestParams.questDesc = curQuest.desc;
								requestParams.questAppID = String(curQuest.app_id).replace(/ /g, "");
								isMatchedQuestID = true;
							}

							requestParams.questIds += curQuest.quest_id;
							requestParams.questClasses += curQuest.class;
							requestParams.questDuplicateUnits += curQuest.duplicate_unit;
							requestParams.questCount++;

							i++;

							if (i < result.root.quest.length) {
								requestParams.questIds += ",";
								requestParams.questClasses += ",";
								requestParams.questDuplicateUnits += ",";
							}
						} else {
							i++;
						}
					}

					if (requestParams.questAppID == "") {
						PRINT_LOG.debug(__filename, API_PATH, "questAppID is Empty");
						isMatchedQuestID = false;
					}

					if (!isMatchedQuestID) return PACKET.sendSuccess(req, res, { msg: "There is no QuestID. Check Quest ID again!" });

					MYSQL_SLP_COMMON_CONN.procQuestRequest(requestParams, function(err, results) {
						if (err) {
							PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procQuestRequest", err);
							return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						}
						if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
							PRINT_LOG.error(__filename, API_PATH, " db results is null");
							return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
						}

						PACKET.sendSuccess(req, res, {
							MSG: results[0][0].MSG,
							CODE: results[0][0].CODE,
							ACCOUNT_POINT: results[0][0].ACCOUNT_POINT,
							QUEST_ID: requestParams.questID,
							ACCOUNT_ID: requestParams.accountID,
							PROFILE_ID: requestParams.profileID
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
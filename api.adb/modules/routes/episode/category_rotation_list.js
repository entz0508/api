// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function(app) {
	app.post("/nde/episode/categoryRotationList", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {};
			var rotation_play_history = [];
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
			requestParams.lang = "KO";

			if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

			if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
				requestParams.accountID = 0;
				requestParams.accessToken = "";
			}

            MYSQL_SLP_NDE.procGetCategoryRotationList(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_DLA_CONN.procGetCategoryRotationList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if ((0 < results[0].length)) {
					var len = results[0].length;

					var lastCategory = {};
					lastCategory.CATEGORY_ID = "none";
					lastCategory.EPISODE_LIST = [];
					var lastEpisode = {};
					lastEpisode.EPISODE_ID = "none";
					var isFirst = true;
					var isNewEpisodeSet = false;

					for (var i = 0; i < len; i++) {
						var row = results[0][i];
						var curChapter = {};
						curChapter.CHAPTER_ID = row.CHAPTER;

						if (lastCategory.CATEGORY_ID === row.CATEGORY_ID) {
							// 카테고리가 같다면 에피소드 확인
							if (lastEpisode.EPISODE_ID === row.EPISODE_ID) {
								// 에피소드가 같다면 기존 배열에 챕터만 추가
								lastEpisode.CHAPTER.push(curChapter);
							} else {
								// 에피소드가 같지 않다면 새로운 배열추가 기존의 에피소드를 카테고리에 푸쉬
								if (isNewEpisodeSet) {
									lastCategory.EPISODE_LIST.push(lastEpisode);
									isNewEpisodeSet = false;
								}

								// 새로운 에피소드 세팅
								lastEpisode = {}; // 푸쉬했으니 지난 에피소드 초기화
								lastEpisode.EPISODE_ID = row.EPISODE_ID;
								lastEpisode.CHAPTER = [];
								lastEpisode.CHAPTER.push(curChapter);

								isNewEpisodeSet = true;
							}

							isFirst = false;
						} else {
							// 카테고리가 같지 않다면 lastCategory 를 rotation_play_history 에 push
							if (!isFirst) {
								if (isNewEpisodeSet) {
									lastCategory.EPISODE_LIST.push(lastEpisode);
									isNewEpisodeSet = false;
								}
								rotation_play_history.push(lastCategory);
							}

							// 초기화
							lastCategory = {};
							lastCategory.CATEGORY_ID = row.CATEGORY_ID;
							lastCategory.EPISODE_LIST = [];
							// 새로운 에피소드 세팅
							lastEpisode = {};
							lastEpisode.EPISODE_ID = row.EPISODE_ID;
							lastEpisode.CHAPTER = [];
							lastEpisode.CHAPTER.push(curChapter);

							lastCategory.EPISODE_LIST.push(lastEpisode);
							isFirst = false;
						}
					}
					rotation_play_history.push(lastCategory);
				}

				PACKET.sendSuccess(req, res, { rotation_play_history: rotation_play_history });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
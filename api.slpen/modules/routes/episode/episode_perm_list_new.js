require('date-utils');
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;

exports.add_routes = function (app) {
    app.post("/sen/episode/permlistNew", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
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

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            MYSQL_SLP_EN_CONN.procGetEpisodePermList(requestParams, function (err, results) {
                if (err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetEpisodePermList", err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                var responseOBJ = { level: [] };
                var cur_level = {
                    level_id: "NEW",
                    total_episodeCount: 0,
                    available_episodeCount: 0,
                    begin_datetime: "null",
                    end_datetime: "null",
                    step: []
                };
                var cur_step = {
                    step_id: "NEW",
                    total_episodeCount: 0,
                    available_episodeCount: 0,
                    begin_datetime: "null",
                    end_datetime: "null",
                    episode: []
                };

                for (var i = 0, len = results[0].length; i < len; i++) {
                    var row = results[0][i];
                    var obj = {
                        level_id: row.level_id,
                        step_id: row.step_id,
                        episode_id: row.episode_id,
                        use: row.use,
                        type: row.type,
                        begin_datetime: row.begin_datetime,
                        end_datetime: row.end_datetime,
                        available: row.available
                    };

                    if (i === 0) {
                        cur_level.level_id = obj.level_id;
                        cur_step.step_id = obj.step_id;
                    } else {
                        if (cur_step.step_id !== obj.step_id) {
                            cur_level.step.push(cur_step);
                            cur_step = {};
                            cur_step.step_id = obj.step_id;
                            cur_step.total_episodeCount = 0;
                            cur_step.available_episodeCount = 0;
                            cur_step.begin_datetime = "null";
                            cur_step.end_datetime = "null";
                            cur_step.episode = [];
                        }

                        if (cur_level.level_id != obj.level_id) {
                            responseOBJ.level.push(cur_level);
                            cur_level = {};
                            cur_level.level_id = obj.level_id;
                            cur_level.total_episodeCount = 0;
                            cur_level.available_episodeCount = 0;
                            cur_level.begin_datetime = "null";
                            cur_level.end_datetime = "null";
                            cur_level.step = [];
                        }

                        cur_step.episode.push(obj);

                        // 레벨별 스텝별 총 에피소드카운트 누적
                        cur_step.total_episodeCount += 1;
                        cur_level.total_episodeCount += 1;

                        // 유효한 에피소드 카운트 누적
                        if (obj.available != "n") {
                            cur_step.available_episodeCount += 1;
                            cur_level.available_episodeCount += 1;

                            // 유효할 경우 레벨별 최초 시작날짜 갱신
                            if (cur_level.begin_datetime == "null") {
                                cur_level.begin_datetime = obj.begin_datetime;
                            } else {
                                if (Number(cur_level.begin_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, "")) > Number(obj.begin_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, ""))) {
                                    cur_level.begin_datetime = obj.begin_datetime;
                                }
                            }
                            // 유효할 경우 레벨별 최근 종료날짜 갱신
                            if (cur_level.end_datetime == "null") {
                                cur_level.end_datetime = obj.end_datetime;
                            } else {
                                if (Number(cur_level.end_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, "")) < Number(obj.end_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, ""))) {
                                    cur_level.end_datetime = obj.end_datetime;
                                }
                            }
                            // 유효할 경우 스텝별 최초 시작날짜 갱신
                            if (cur_step.begin_datetime == "null") {
                                cur_step.begin_datetime = obj.begin_datetime;
                            } else {
                                if (Number(cur_step.begin_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, "")) > Number(obj.begin_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, ""))) {
                                    cur_step.begin_datetime = obj.begin_datetime;
                                }
                            }
                            // 유효할 경우 스텝별 최근 종료날짜 갱신
                            if (cur_step.end_datetime == "null") {
                                cur_step.end_datetime = obj.end_datetime;
                            } else {
                                if (Number(cur_step.end_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, "")) < Number(obj.end_datetime.replace(/-/gi, "").replace(/:/gi, "").replace(/ /gi, ""))) {
                                    cur_step.end_datetime = obj.end_datetime;
                                }
                            }
                        }


                    }
                }
                // 루프가 끈나면 마지막 스텝을 레벨에 푸쉬, 마지막레벨을 responseOBJ 에 푸쉬
                cur_level.step.push(cur_step);
                responseOBJ.level.push(cur_level);
                responseOBJ.local_date = (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS');

                PACKET.sendSuccess(req, res, responseOBJ);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
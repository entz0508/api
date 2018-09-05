/**
 * Created by kkuris on 2017-10-26.
 */
// common
var request = require("request");

const ROUTE_MIDDLEWARE = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');
const ERROR_CODE_UTIL = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

/*----------------------------------------------------------------
 | < action_type >
 |   ep_start : 에피소드 시작
 |   ep_end   : 에피소드 중단
 |   ep_end   : 에피소드 완료
 |   app_bg   : APP Foreground to Background 로 전환
 |   app_fg   : APP Background to Foreground 로 전환
 |   ping     : ping 5분에 한번씩 클라이언트가 APP 실행중임을 서버로 알림.
 ----------------------------------------------------------------*/
exports.add_routes = function(app) {
    var checkParams = function(requestParams) {
        requestParams.isSuccess = false;
        if (!COMMON_UTIL.isValidAppID(requestParams.appID)
            || !COMMON_UTIL.isValidClientUID(requestParams.clientUID)
            || !COMMON_UTIL.isValidAccountID(requestParams.accountID)
            || !COMMON_UTIL.isValidActionType(requestParams.actionType)
            || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)
        // || !COMMON_UTIL.isValidCounrtyCodeAlpha2(requestParams.countryCode)
        ) {
            PRINT_LOG.debug("", "", "param err 1");
            return requestParams;
        }
        if (COMMON_UTIL.ACTION_TYPE_EPISODE_START === requestParams.actionType) {
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.episodeID)) {
                PRINT_LOG.debug("", "", "param err 2");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
                requestParams.playTime = 0;
            }
        } else if (COMMON_UTIL.ACTION_TYPE_EPISODE_END === requestParams.actionType) {
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.episodeID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                PRINT_LOG.debug("", "", "param err 3");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
            }
        } else if (COMMON_UTIL.ACTION_TYPE_EPISODE_EXIT === requestParams.actionType) {
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.episodeID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                PRINT_LOG.debug("", "", "param err 4");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
            }
        } else if ((COMMON_UTIL.ACTION_TYPE_APP_BACKGROUND === requestParams.actionType) ||
            (COMMON_UTIL.ACTION_TYPE_APP_FOREGROUND === requestParams.actionType)) {
            requestParams.isSuccess = true;
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.episodeID)) {
                requestParams.episodeID = "";
            }
            if (!COMMON_UTIL.isValidChapter(requestParams.chapter)) {
                requestParams.chapter = 0;
            }
            if (!COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                requestParams.playTime = 0;
            }
        } else if ((COMMON_UTIL.ACTION_TYPE_PING === requestParams.actionType)) {
            requestParams.isSuccess = true;
            requestParams.episodeID = "";
            requestParams.chapter = 0;
            requestParams.playTime = 0;
        } else {
            PRINT_LOG.debug("", "", "param err 5");
        }

        return requestParams;
    };

    // var ebsLang_check;
    var ebsLang_check = function (exParam, callBack) {
        // var url = "http://s-www.ebslang.co.kr";
        var path = "/app/extAttendHistSave.ebs";            // 관리자 구매
        var url =  global.CONFIG.EBS_SERVICE.STAGE_URL + path;
        // var url =  global.CONFIG.EBS_SERVICE.SERVICE_URL + path;

        // url = url + path;

        try {
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: exParam
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // PRINT_LOG.info(__filename, 'ebsLang_check', body);          // {"res":-1}
                    // 성공시 DB에 성공처리
                    PRINT_LOG.info(__filename, 'ebsLang_check', body);
                    callBack(JSON.parse(body));
                }

                PRINT_LOG.info("","body : ",body);
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };


    app.post("/nde/action/log", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res) {
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
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.actionType = COMMON_UTIL.trim(req.body.action_type);
            requestParams.episodeID = COMMON_UTIL.trim(req.body.ep_id); // ep_start, ep_end Episode ID, 그외에는 무시함
            requestParams.lessonID = COMMON_UTIL.trim(req.body.lesson_id);
            requestParams.chapter = 0;
            requestParams.playTime = COMMON_UTIL.trim(req.body.p_time); // ep_end 시에만 유효함 에피소드 플레이 시간, 분단위
            requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.levelID = COMMON_UTIL.trim(req.body.level_id);

            requestParams = checkParams(requestParams);

            if (!requestParams.isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            }

            MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLog_nde(requestParams, function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLog_nde, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                PRINT_LOG.info(__filename,API_PATH,"proc");
                // EBS 전달 변수
                var msg = null;
                var exParam = {};

                exParam.step_attend_id = results[0][0].step_attend_id;
                exParam.lesson_tmpl_id = results[0][0].lesson_tmpl_id;     // db 조회값
                exParam.send_dt = results[0][0].send_dt;

                if (requestParams.actionType == 'ep_end') {
                    exParam.save_type = 'lesson_finish';
                    exParam.compl_yn = 'Y';
                } else if (requestParams.actionType == 'ep_start'){
                    exParam.save_type = 'lesson_start';
                    exParam.compl_yn = '';
                }

                if((results[0][0].step_attend_id == 0) || (results[0][0].step_attend_id == null)){
                    exParam.step_attend_id = 0;
                    exParam.lesson_tmpl_id = 0;
                }
                var row = results[0][0];
                ebsLang_check(exParam, function (resData) {
                    // PRINT_LOG.info(__filename,"resData : ",resData);
                    PRINT_LOG.info(__filename,"exParam : ",JSON.stringify(exParam));

                    if(Number(row.RES == 0)){
                        PACKET.sendSuccess2(req, res, {});
                        PRINT_LOG.info(API_PATH,"res = 0 ",row);
                    } else {
                        msg = "DB result ; " + row.RES;
                        PACKET.sendFail2(req, res, msg, {});
                        PRINT_LOG.error(API_PATH,"res != 0",row);
                    }
                });



            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
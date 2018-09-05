/**
 * Created by kkuris on 2017-12-08.
 */

// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;


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
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.unitID)) {
                PRINT_LOG.debug("", "", "param err 2");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
                requestParams.playTime = 0;
            }
        } else if (COMMON_UTIL.ACTION_TYPE_EPISODE_END === requestParams.actionType) {
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.unitID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                PRINT_LOG.debug("", "", "param err 3");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
            }
        } else if (COMMON_UTIL.ACTION_TYPE_EPISODE_EXIT === requestParams.actionType) {
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.unitID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                PRINT_LOG.debug("", "", "param err 4");
            } else {
                requestParams.isSuccess = true;
                requestParams.chpter = 0;
            }
        } else if ((COMMON_UTIL.ACTION_TYPE_APP_BACKGROUND === requestParams.actionType) ||
            (COMMON_UTIL.ACTION_TYPE_APP_FOREGROUND === requestParams.actionType)) {
            requestParams.isSuccess = true;
            if (!COMMON_UTIL.isValidNDEUnitID(requestParams.unitID)) {
                requestParams.unitID = "";
            }
            if (!COMMON_UTIL.isValidChapter(requestParams.chapter)) {
                requestParams.chapter = 0;
            }
            if (!COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
                requestParams.playTime = 0;
            }
        } else if ((COMMON_UTIL.ACTION_TYPE_PING === requestParams.actionType)) {
            requestParams.isSuccess = true;
            requestParams.unitID = "";
            requestParams.chapter = 0;
            requestParams.playTime = 0;
        } else {
            PRINT_LOG.debug("", "", "param err 5");
        }

        return requestParams;
    };

    app.post("/nde/checkup", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.corretChkCnt = COMMON_UTIL.trim(req.body.correct_check_count);
            requestParams.wrongChkCnt = COMMON_UTIL.trim(req.body.wrong_check_count);
            requestParams.unitID = COMMON_UTIL.trim(req.body.unit_id);
            // requestParams.episodeID = COMMON_UTIL.trim(req.body.unit_id);
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.actionType = COMMON_UTIL.trim(req.body.action_type);
            // requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();
            requestParams.playTime = COMMON_UTIL.trim(req.body.p_time); // ep_end 시에만 유효함 에피소드 플레이 시간, 분단위
            requestParams.lang = "KO";

            requestParams = checkParams(requestParams);

            if (!requestParams.isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            }

            MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUpStartEnd(requestParams, function(err, results) {

                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUpStartEnd, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {

                    var retV = COMMON_UTIL.getMysqlRES(results);
                    if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
                        if ((COMMON_UTIL.ACTION_TYPE_EPISODE_END === requestParams.actionType) && ((501000 === retV.res) || (501001 === retV.res))) {
                            PRINT_LOG.error(__filename, API_PATH, " error ep_end res:" + retV.res);
                            return PACKET.sendSuccess(req, res, {});
                        }
                        PRINT_LOG.error(__filename, API_PATH, retV.msg);
                        return PACKET.sendFail(req, res, retV.res);
                    }

                    PACKET.sendSuccess(req, res, {});
                }
            });


        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
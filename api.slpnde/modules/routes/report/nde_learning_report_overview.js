/**
 * Created by kkuris on 2017-11-21.
 */
/**
 * Created by kkuris on 2017-11-09.
 */
// common
const ROUTE_MIDDLEWARE = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');
const ERROR_CODE_UTIL = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

exports.add_routes = function(app) {
    app.post("/nde/report/learning/overview", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.lessonID = COMMON_UTIL.trim(req.body.lessonid);
            requestParams.lang = "KO";

            MYSQL_SLP_KW_ACTION_LOG_CONN.procGetNDEReportOverView(requestParams, function(err, results) {
                // var completeList= [];

                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procGetNDEReportOverView, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {

                    var result = results[0][0];

                    var responseOBJ = {
                        profile_id: result.PROFILE_ID,
                        lesson_id: result.LESSON_ID,
                        play_history: []
                    };


                    for (var i = 0, len = results[0].length; i < len; i++) {
                        var row = results[0][i];

                        var unit_report = {
                            // profile_id:row.PROFILE_ID,
                            lesson_id: row.LESSON_ID,
                            unit_id: row.EPISODE_ID,
                            begin_datetime:  row.BEGIN_DT,
                            end_datetime: row.END_DT,
                            play_time: row.P_TIME
                        };
                        responseOBJ.play_history.push(unit_report);
                    }

                    PACKET.sendSuccess(req, res, responseOBJ);
                }
            });

        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

};
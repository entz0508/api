/**
 * Created by kkuris on 2017-11-16.
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
    // var checkParams = function(requestParams) {
    //     requestParams.isSuccess = false;
    //     if (!COMMON_UTIL.isValidAppID(requestParams.appID)
    //         || !COMMON_UTIL.isValidClientUID(requestParams.clientUID)
    //         || !COMMON_UTIL.isValidAccountID(requestParams.accountID)
    //         || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)
    //
    //     ) {
    //         PRINT_LOG.debug("", "", "param err 1");
    //         return requestParams;
    //     }
    //
    //     return requestParams;
    // };

    app.post("/nde/report/getUnitList", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var responseOBJ = {};
            responseOBJ.completeLesson = [];

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
            requestParams.lang = "KO";

            // if(!checkParams(req.body)){
            //     PRINT_LOG.error(__filename, API_PATH, "Parameter Error");
            // }

            MYSQL_SLP_KW_ACTION_LOG_CONN.procGetUnitList(requestParams, function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procGetNdeReportCompleteLesson, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var completeLessonList = [];
                    if( (0 < results[0].length) ) {
                        var len = results[0].length;

                        for(var i=0; i<len; i++) {
                            var row = results[0][i];

                            completeLessonList.push({
                                profile_id: row.PROFILE_ID,
                                lesson_id: row.LESSON_ID,
                                unit_id: row.EPISODE_ID,
                                begin_datetime: row.BEGIN_DT,
                                end_datetime: row.END_DT
                            });
                        }
                    }
                    PACKET.sendSuccess(req, res, {completeLessonList: completeLessonList});
                }
            });

        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
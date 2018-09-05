/**
 * Created by kkuris on 2017-12-07.
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
    "use strict";

    app.post("/nde/checkup/update", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res){
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
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.lang = "KO";

            MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUp(requestParams, function(err, results) {

                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procNDECheckUp, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {

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
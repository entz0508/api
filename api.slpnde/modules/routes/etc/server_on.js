/**
 * Created by kkuris on 2017-12-13.
 */
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
// const MYSQL_SLP_EN_INFO_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN_INFO;
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function(app) {
    app.post("/nde/server/onoff", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            // requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            // requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
            // requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            // requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            // requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);

            MYSQL_SLP_NDE.procServerPing_nde(requestParams, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_NDE.procServerPing_nde, fail db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                if ((0 < results[0].length)) {

                    var len = results[0].length;
                    for (var i = 0; i < len; i++) {
                        var row = results[0][i];
                        var responseOBJ = {};
                        responseOBJ.MSG = row.MSG;
                        responseOBJ.RES = row.RES;
                    }

                    PACKET.sendSuccess(req, res, responseOBJ);
                }

            })

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
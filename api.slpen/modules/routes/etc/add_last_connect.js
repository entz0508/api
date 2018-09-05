// nodejs npm

// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;


function add_routes(app) {
    "use strict";

    app.post("/sen/app/device/connect", ROUTE_MIDDLEWARE.DEFAULT, function(req, res){
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
            requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();

            MYSQL_SLP_EN_CONN.procAddLastConnect( requestParams, function(err, results){
                if(err) {
                    var msg = __filename + ", " + API_PATH + ", MYSQL_SLP_EN_CONN.procAddLastConnect, err";
                    PRINT_LOG.setErrorLog(msg, err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var retV = COMMON_UTIL.getMysqlRES(results);
                    if(ERROR_CODE_UTIL.RES_SUCCESS != retV.res) {
                        var msg = __filename + ", " + API_PATH + ", MYSQL_SLP_EN_CONN.procAddLastConnect, err";
                        PRINT_LOG.error(msg);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {
                        var responseObj = {};
                        PACKET.sendSuccess(req, res, responseObj);
                    }
                }
            });
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;
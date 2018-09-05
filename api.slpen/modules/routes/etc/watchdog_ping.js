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
const MYSQL_SLP_EN_INFO_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN_INFO;
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

function add_routes(app) {
    "use strict";
    app.post("/sen/watchdog/ping", ROUTE_MIDDLEWARE.DEFAULT, function(req, res){
        try {
            MYSQL_SLP_EN_INFO_CONN.procWatchdogPing(function(errPlatform, isPlatformSuccess){
                if(errPlatform || !isPlatformSuccess) {
                    var errPlatformResultOBJ = {};
                    errPlatformResultOBJ.msg ="Error, DB, Platform";
                    PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, errPlatformResultOBJ);
                } else {
                    MYSQL_SLP_EN_CONN.procWatchdogPing(function(errAccount, isAccountSuccess){
                        if(errAccount || !isAccountSuccess) {
                            var errAccountResultOBJ = {};
                            errAccountResultOBJ.msg ="Error, DB, Account";
                            PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, errAccountResultOBJ);
                        } else {
                            MYSQL_SLP_KW_ACTION_LOG_CONN.procWatchdogPing(function(errKwActionLog, isKwActionLogSuccess){
                                if(errKwActionLog || !isKwActionLogSuccess) {
                                    var errKwActionLogResultOBJ = {};
                                    errKwActionLogResultOBJ.msg ="Error, DB, Account";
                                    PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, errKwActionLogResultOBJ);
                                } else {
                                    MYSQL_SLP_COMMON_CONN.procWatchdogPing(function(errCommon, isCommonSuccess){
                                        if(errCommon || !isCommonSuccess) {
                                            var errCommonObj = {};
                                            errCommonObj.msg ="Error, DB, Account";
                                            PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, errCommonObj);
                                        } else {
                                            var resultOBJ = {};
                                            PACKET.sendSuccess(req,res, resultOBJ);
                                        }
                                    });
                                }
                            });
                        }
                    });
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
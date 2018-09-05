/**
 * Created by kkuris on 2017-07-25.
 */
// common
const ROUTE_MIDDLEWARE   = require("../common/util/route_middleware.js");
const PACKET     = require("../common/util/packet_sender.js");
const COMMON_UTIL     = require("../common/util/common.js");
const ERROR_CODE_UTIL     = require("../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;


function add_routes(app) {
    "use strict";

    app.post("/nde/testpage", function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
                requestParams.RES = 'testpage';


                PACKET.sendSuccess(req, res, requestParams);

        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;


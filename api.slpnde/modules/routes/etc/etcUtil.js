require('date-utils'); // Date.prototype ����

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;


exports.add_routes = function (app) {
    "use strict";

    app.post("/adb/etc/check", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
			PACKET.sendSuccess(req, res, null, { clientIP: CLIENT_IP });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, null);
        }

    });


};
require('date-utils');
//var fs = require("fs");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const NODE_MAILER = require('../../common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;

const fs = require("fs");

exports.add_routes = function (app) {
    "use strict";

    var sendMailWelcome = function (toEmailAddr, lang) {
        var mail = new NODE_MAILER();
        mail.init();
        var subject = "회원이 되신 것을 환영합니다!";
        //var html = fs.readFileSync('./public/mailForm/kr/welcome.html', 'utf8');
        //html = html.replace("[USER_EMAIL]", toEmailAddr);
        var html = "메일 발송 테스트중임돠..";

        mail.send(toEmailAddr, subject, html, lang, function (error, success) {
            if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail sendMailWelcome, Failed ", error);
        });
    };
    
    app.post("/adb/etc/check", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        //var CLIENT_IP = "127.0.0.1"; 
        
        try { 
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
            PRINT_LOG.info(__filename, API_PATH, "api call:" + JSON.stringify(req.body));
			PACKET.sendSuccess(req, res, null, { clientIP: CLIENT_IP });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, null);
        }
    });

    app.post("/adb/etc/check2", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        sendMailWelcome("moon94270@gmail.com", "ko");

        try {
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
            PRINT_LOG.info(__filename, API_PATH, "api call:" + JSON.stringify(req.body));
            PACKET.sendSuccess(req, res, null, { clientIP: CLIENT_IP, accountID: req.body.isAccountID });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, null);
        }

    });


};
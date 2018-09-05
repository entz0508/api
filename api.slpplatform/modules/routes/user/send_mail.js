var fs = require("fs");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const NODE_MAILER = require('../../common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	var sendMail = function(toEmailAddr, lang) {
		var mail = new NODE_MAILER();
		mail.init();

		var subject, html;
		if ("kr" === lang) {
			subject = "[Learn with Dora]에서 PUSH 알림 수신동의 확인 안내드립니다.";
			html = fs.readFileSync('./public/mailForm/kr/push_agreement.html', 'utf8');
		}
		else {
			subject = "[Learn with Dora] PUSH Notifications Agreement.";
			html = fs.readFileSync('./public/mailForm/kr/push_agreement.html', 'utf8');
		}

		mail.send(toEmailAddr, subject, html, lang, function(error, success) {
			if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail ForgotPassword, Failed ", error);
		});
	};

	app.post("/slp.user.send.email", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			if (CLIENT_IP === "14.63.82.58") {
				sendMail(COMMON_UTIL.trim(req.body.emailList), COMMON_UTIL.trim(req.body.targetCountry));
				PACKET.sendSuccess(req, res, {});
			} else {
				PRINT_LOG.setErrorLog("[" + __filename + "] send Mail 사무실이 아닌 외부 아이피에서 대량메일 전송 시도 ", error);
				PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
			}
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
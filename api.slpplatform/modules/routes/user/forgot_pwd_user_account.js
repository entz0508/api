var fs = require("fs");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const NODE_MAILER = require('../../common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

exports.add_routes = function(app) {
	var sendMailForgotPasswordToken = function(toEmailAddr, token, lang) {
		var mail = new NODE_MAILER();
		mail.init();

		var subject, html;

		if ("kr" === lang) {
			subject = "[도라의 러닝어드벤처] 비밀번호 재설정을 요청하셨습니다.";
			html = fs.readFileSync('./public/mailForm/kr/slp_forgot_password.html', 'utf8');
		} else {
			subject = "[Dora's Learning Adventure] Password Reset Confirmation.";
			html = fs.readFileSync('./public/mailForm/en/slp_forgot_password.html', 'utf8');
		}

		html = html.replace("[EMAIL]", encodeURI(toEmailAddr));
		html = html.replace("[EMAIL]", encodeURI(toEmailAddr));
		html = html.replace("[TOKEN]", encodeURI(token));
		html = html.replace("[TOKEN]", encodeURI(token));

		mail.send(toEmailAddr, subject, html, lang, function(error, success) {
			if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail ForgotPassword, Failed ", error);
		});
	};

	app.post("/slp.user.account.forgot.password", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var accountEmail = COMMON_UTIL.trim(req.body.email);

			if (!COMMON_UTIL.isEmail(accountEmail))
				return PRINT_LOG.error(__filename, API_PATH, " error parameter accountEmail");

			MYSQL_SLP_ACCOUNT_CONN.procForgotUserAccountPasswordToken(appID, clientUID, CLIENT_IP, accountEmail, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var row = results[0][0];
				PACKET.sendSuccess(req, res, {});
				var tmpToken = row.TOKEN;
				console.log(tmpToken);
				sendMailForgotPasswordToken(row.EMAIL, row.TOKEN, req.body.country);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
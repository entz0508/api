// nodejs npm
const CRYPTO = require("crypto");
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
	var sendMailWelcome = function(toEmailAddr, lang) {
		var mail = new NODE_MAILER();
		mail.init();

		var subject = "[도라의 러닝어드벤처] 회원이 되신 것을 환영합니다!";
		var html = fs.readFileSync('./public/mailForm/kr/slp_welcome.html', 'utf8');

		// TODO 언어 대응
		// if ("kr" === lang) {
		// 	subject = "[도라의 러닝어드벤처] 회원이 되신 것을 환영합니다!";
		// 	html = fs.readFileSync('./public/mailForm/kr/slp_welcome.html', 'utf8');
		// } else {
		// 	subject = "[Dora’s Learning Adventure] We welcome your membership with us!";
		// 	html = fs.readFileSync('./public/mailForm/en/slp_welcome.html', 'utf8');
		// }

		html = html.replace("[USER_EMAIL]", toEmailAddr);

		mail.send(toEmailAddr, subject, html, lang, function(error, success) {
			if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail sendMailWelcome, Failed ", error);
		});
	};

	app.post("/slp.user.account.new.email.pwd", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var accountID = COMMON_UTIL.trim(req.body.account_id);
			var accountEmail = COMMON_UTIL.trim(req.body.email);
			var pwd = COMMON_UTIL.trim(req.body.password);
			var accountCountry = COMMON_UTIL.trim(req.body.country);
			var signUpPath = COMMON_UTIL.trim(req.body.signup_path);


			if (!COMMON_UTIL.isNumber(appID) || !COMMON_UTIL.isEmail(accountEmail) || !COMMON_UTIL.isValidPassword(pwd) || !COMMON_UTIL.isValidCountry(accountCountry) || !COMMON_UTIL.isValidSignupPath(signUpPath)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			accountCountry = accountCountry.toUpperCase();
			var accountPWD = CRYPTO.createHash("sha512").update(pwd).digest("base64");

			MYSQL_SLP_ACCOUNT_CONN.procUserAccountNewEmailPWD(accountID, accountEmail, accountPWD, signUpPath, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountNewEmailPWD, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var row = results[0][0];
				PACKET.sendSuccess(req, res, { account_id: row.ACCOUNT_ID, access_token: row.ACCESS_TOKEN });
                console.log("access token in set new email: "+row.ACCESS_TOKEN);
				sendMailWelcome(accountEmail, accountCountry);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
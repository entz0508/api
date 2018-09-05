// nodejs npm
var fs = require("fs");
const CRYPTO = require("crypto");

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
	app.post("/slp.user.account.create", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var CLIENT_IP = COMMON_UTIL.getClientIP(req);
			var clientUID = ""; //COMMON_UTIL.trim(req.body.client_uid);
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var accountEmail = COMMON_UTIL.trim(req.body.email);
			var pwd = COMMON_UTIL.trim(req.body.password);
			var accountCountry = COMMON_UTIL.trim(req.body.country);
			var signUpPath = COMMON_UTIL.trim(req.body.signup_path);
			var profileName = "guest"; // req.body.pf_name;
			var profileBirthday = "2015-01-01"; // req.body.pf_birthday;
			var profileGender = "m"; // req.body.pf_gender;
			
			if (!COMMON_UTIL.isNumber(appID) || !COMMON_UTIL.isEmail(accountEmail) ||
				!COMMON_UTIL.isValidPassword(pwd) || !COMMON_UTIL.isValidCountry(accountCountry) ||
				!COMMON_UTIL.isValidSignupPath(signUpPath) || !COMMON_UTIL.isValidProfileName(profileName) ||
				!COMMON_UTIL.isValidChildBirthday(profileBirthday) || !COMMON_UTIL.isValidGender(profileGender)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}
			
			accountCountry = accountCountry.toUpperCase();
			MYSQL_SLP_ACCOUNT_CONN.procUserAccountCreate({
				appID: appID,
				clientUID: clientUID,
				CLIENT_IP: CLIENT_IP,
				accountEmail: accountEmail,
				accountPWD: CRYPTO.createHash("sha512").update(pwd).digest("base64"),
				accountCountry: accountCountry,
				signUpPath: signUpPath,
				profileName: profileName,
				profileBirthday: profileBirthday,
				profileGender: profileGender
			}, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountCreate, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				
				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var row = results[0][0];
				PACKET.sendSuccess(req, res, { account_id: row.ACCOUNT_ID, access_token: row.ACCESS_TOKEN });


				// 회원가입 이메일 임시 정지 ?
				(function(toEmail, lang) {
					var mail = new NODE_MAILER();
					mail.init();
					
					var to = toEmail;
					var subject = "[도라의 러닝어드벤처] 회원이 되신 것을 환영합니다!";
					var html = fs.readFileSync('./public/mailForm/kr/slp_welcome.html', 'utf8');
					
					// TODO 영문 변환 체크
					// if ("kr" !== lang) {
					// 	subject = "[Dora’s Learning Adventure] We welcome your membership with us!";
					// 	html = fs.readFileSync('./public/mailForm/en/slp_welcome.html', 'utf8');
					// }
					
					html = html.replace("[USER_EMAIL]", toEmail);
					
					mail.send(to, subject, html, lang, function(error) {
						if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail sendMailWelcome, Failed ", error);
					});
				})(accountEmail, accountCountry);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const NODE_MAILER = require('../../common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	app.post("/send.alarm.mail.nginx", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var mail = new NODE_MAILER();
			mail.init();
			
			mail.send(global.CONFIG.SERVER_MANAGER_EMAIL_LIST, "NGINX Server has a Trouble!!!", "NGINX Server has a Trouble!!!", lang, function(error, success) {
				if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Alarm Nginx, Failed ", error);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
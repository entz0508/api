// npm mudules
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var util = require("util");
var multipart = require("connect-multiparty");

// custom loaders
require("./modules/loader/loaders.js");

const PRINT_LOG = global.PRINT_LOGGER;

var app = exports.app = express();

// view engine setup
app.set('port', global.CONFIG.SERVER_INFO.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.enable('trust proxy');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart());

process.on('uncaughtException', function(err) {
	util.log('==============================================================');
	util.log("[" + global.CONFIG.LOG_INFO.CATEGORY + "] uncaughtException");
	util.log('--------------------------------------------------------------');
	util.log('[Stack]\n' + err.stack);
	util.log('[Arguments] ' + err.arguments);
	util.log('[Type] ' + err.type);
	util.log('[Message] ' + err.message);
	util.log('==============================================================\n');
	PRINT_LOG.logger.error('\n==============================================================\n[uncaughtException2]\n--------------------------------------------------------------\n[Stack]\n' + err.stack + '\n[Arguments] : ' + err.arguments + '\n[Type] : ' + err.type + '\n[Message] : ' + err.message + '\n==============================================================\n');
});


app.get('/', function(req, res) {
	"use strict";
	res.send(global.CONFIG.LOG_INFO.CATEGORY);
});

app.get('/favicon.ico', function(req, res) {
	"use strict";
	res.writeHead(200, { 'Content-Type': 'image/x-icon' });
	res.end();
});

// Router
require("./modules/routes/app/auth_app.js").add_routes(app);
require("./modules/routes/app/service_app_list.js").add_routes(app);
require("./modules/routes/app/slp_en_product_list.js").add_routes(app);

require("./modules/routes/developer/create_developer.js").add_routes(app);
require("./modules/routes/developer/developer_login.js").add_routes(app);

require("./modules/routes/etc/watchdog_ping.js").add_routes(app);
require("./modules/routes/etc/watchdog_ping_node.js").add_routes(app);

require("./modules/routes/etc/send_alarm_mail_nginx.js").add_routes(app);

require("./modules/routes/ext/is_logged_in_account.js").add_routes(app);
require("./modules/routes/ext/is_logged_in_account_with_profile.js").add_routes(app);
require("./modules/routes/ext/is_logged_in_account_without_profile.js").add_routes(app);

require("./modules/routes/user/account_secession.js").add_routes(app);
require("./modules/routes/user/allow_app_user_account.js").add_routes(app);
require("./modules/routes/user/change_login_user_account_password.js").add_routes(app);
require("./modules/routes/user/chk_signup_path_user_account.js").add_routes(app);
require("./modules/routes/user/create_user_account.js").add_routes(app);
require("./modules/routes/user/create_user_account_nde.js").add_routes(app);
require("./modules/routes/user/forgot_change_pwd_user_account.js").add_routes(app);
require("./modules/routes/user/forgot_pwd_user_account.js").add_routes(app);
require("./modules/routes/user/get_login_user_account_info.js").add_routes(app);
require("./modules/routes/user/login_user_account.js").add_routes(app);
require("./modules/routes/user/login_user_account_nde.js").add_routes(app);
require("./modules/routes/user/set_new_email_pwd.js").add_routes(app);
require("./modules/routes/user/get_my_point.js").add_routes(app);
require("./modules/routes/user/get_buy_history.js").add_routes(app);
require("./modules/routes/user/send_mail.js").add_routes(app);
// 비밀번호 생성용
require("./modules/routes/user/makePassword.js").add_routes(app);

require("./modules/routes/profile/profile_add.js").add_routes(app);
require("./modules/routes/profile/profile_delete.js").add_routes(app);
require("./modules/routes/profile/profile_edit.js").add_routes(app);
require("./modules/routes/profile/profile_edit_limittime.js").add_routes(app);
require("./modules/routes/profile/profile_img_upload.js").add_routes(app);
require("./modules/routes/profile/profile_status.js").add_routes(app);

require("./modules/routes/quest/questList.js").add_routes(app);

require("./modules/routes/test/test.js").add_routes(app);

require("./modules/routes/coupon/couponCreate.js").add_routes(app);
require("./modules/routes/coupon/couponList.js").add_routes(app);
require("./modules/routes/coupon/couponUse.js").add_routes(app);
require("./modules/routes/coupon/myCouponRegi.js").add_routes(app);
require("./modules/routes/coupon/myCouponList.js").add_routes(app);
require("./modules/routes/coupon/myCouponUseHistory.js").add_routes(app);
require("./modules/routes/coupon/getProductList.js").add_routes(app);
require("./modules/routes/coupon/getCouponSkinInfo.js").add_routes(app);

//admin page passwd 인증용
require("./modules/routes/manager/auth.js").add_routes(app);
require("./modules/routes/manager/auth.js").add_routes(app);

require("./modules/routes/user/login_user_account_nde_web.js").add_routes(app);
require("./modules/routes/user/open_status_user.js").add_routes(app);

//version_info routes
require("./modules/routes/version_info/insert.js").add_routes(app);
require("./modules/routes/version_info/list.js").add_routes(app);
require("./modules/routes/version_info/update.js").add_routes(app);

// require("./modules/routes/uptime/uptime.js").add_routes(app);
require("./modules/routes/user/nde_ebs_token_crypto").add_routes(app);


const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const platformName = require("os").platform();
if ("win32" === platformName) {
	app.listen(app.get("port"));
	PRINT_LOG.info(__filename, "listening on port " + app.get("port") + ", mode:" + app.settings.env + ", platformName:" + platformName + ", pid:" + process.pid);
} else {
	if (cluster.isMaster) {
		// 클러스터 워커 프로세스 포크
		for (var i = 0; i < numCPUs; i++) cluster.fork();
		
		cluster.on('online', function(worker) {
			PRINT_LOG.info(__filename, '생성된 워커의 아이디 : ' + worker.process.pid);
		});
		
		cluster.on('exit', function(worker, code, signal) {
			PRINT_LOG.info(__filename, '죽은 워커의 아이디 : ' + worker.process.pid);
			PRINT_LOG.info(__filename, '죽은 워커의 exit code : ' + code);
			PRINT_LOG.info(__filename, '죽은 워커의 signal : ' + signal);
		});
	} else {
		app.listen(app.get("port"));
		PRINT_LOG.info(__filename, "listening on port " + app.get("port") + ", mode:" + app.settings.env + ", platformName:" + platformName + ", pid:" + process.pid);
	}
}

function getPingFn(DBName) {
	return function(connErr, isSuccess) {
		if (!isSuccess) {
			PRINT_LOG.error(__filename, "Failed, MySQL Connect, " + DBName);
			PRINT_LOG.error(__filename, "Process EXIT");
			return process.exit(1);
		}
		// PRINT_LOG.info(__filename, "Success, MySQL Connect, " + DBName);
	};
}

global.MYSQL_CONNECTOR_POOLS.SLP_COMMON.procWatchdogPing(getPingFn("SLP COMMON INFO DB"));
global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT.procWatchdogPing(getPingFn("SLP Account DB"));
global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM.procWatchdogPing(getPingFn("SLP Platform DB"));
global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG.procWatchdogPing(getPingFn("SLP KW Action Log DB"));

module.exports = app;
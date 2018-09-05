// npm mudules
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var util = require("util");
var multipart = require("connect-multiparty");
// var methodOverride = require("method-override");

global.j_log = function() {
	console.log(process.pid);
	for (var i = 0; i < arguments.length; i++) console.log(arguments[i]);
	console.log(process.pid);
};

// custom loaders
require("./modules/loader/loaders.js");

// const MONGO_CACHE   = require("./modules/database/mongo_db_cache.js");

const PRINT_LOG = global.PRINT_LOGGER;

var app = exports.app = express();

// view engine setup
app.set('port', global.CONFIG.SERVER_INFO.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.enable('trust proxy');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
//app.use(methodOverride());
app.use(multipart());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
	//process.exit(1);
});


app.get('/', function(req, res) {
	res.send(global.CONFIG.LOG_INFO.CATEGORY);
});

app.get('/favicon.ico', function(req, res) {
	res.writeHead(200, { 'Content-Type': 'image/x-icon' });
	res.end();
});

// Router
require("./modules/routes/action_log/action_log.js").add_routes(app);
require("./modules/routes/action_log/action_ping.js").add_routes(app);

require("./modules/routes/buy/buy_product.js").add_routes(app);
require("./modules/routes/buy/get_buy_history.js").add_routes(app);

require("./modules/routes/episode/category_rotation_list.js").add_routes(app);
require("./modules/routes/episode/category_rotation_reward_history.js").add_routes(app);
require("./modules/routes/episode/category_rotation_reward_request.js").add_routes(app);
require("./modules/routes/episode/episode_perm_list.js").add_routes(app);
require("./modules/routes/episode/episode_play_history.js").add_routes(app);
require("./modules/routes/episode/get_top_rank_episode_play.js").add_routes(app);

require("./modules/routes/etc/add_last_connect.js").add_routes(app);
require("./modules/routes/etc/app_res.js").add_routes(app);
require("./modules/routes/etc/app_ver.js").add_routes(app);
require("./modules/routes/etc/watchdog_ping.js").add_routes(app);
require("./modules/routes/etc/makeSequenceXMLToSQL.js").add_routes(app);

require("./modules/routes/quest/questRequest.js").add_routes(app);
require("./modules/routes/quest/questRequestList.js").add_routes(app);


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

global.MYSQL_CONNECTOR_POOLS.SLP_DLA.procWatchdogPing(getPingFn("SLP_DLA DB"));
//global.MYSQL_CONNECTOR_POOLS.SLP_COMMON.procWatchdogPing(getPingFn("SLP_COMMON DB"));
//global.MYSQL_CONNECTOR_POOLS.SLP_DLA_INFO.procWatchdogPing(getPingFn("SLP_DLA_INFO DB"));
//global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG.procWatchdogPing(getPingFn("SLP_KW_ACTION_LOG DB"));

module.exports = app;
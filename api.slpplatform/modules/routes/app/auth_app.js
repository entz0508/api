// nodejs npm

// common
const ROUTE_MIDDLEWARE = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');
const ERROR_CODE_UTIL = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;

exports.add_routes = function(app) {
	var authApp = function(req, res, appID, apiKey, redirectURL) {
		var API_PATH = req.route.path;
		
		if (!COMMON_UTIL.isNumber(appID) || (0 >= Number(appID))) {
			PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
			return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
		}
		
		MYSQL_SLP_PLATFORM_CONN.procAuthApp(appID, apiKey, COMMON_UTIL.getClientIP(req), function(err, results) {
			if (err) return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
			
			var retV = COMMON_UTIL.getMysqlRES(results);
			if (0 !== retV.res) {
				PRINT_LOG.error(__filename, API_PATH, retV.msg);
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID);
			}
			
			var row = results[0][0];
			PACKET.sendJson(req, res,
				(0 < Number(appID)) && (0 < Number(row.APP_ID)) && (Number(appID) === Number(row.APP_ID)) ?
					ERROR_CODE_UTIL.RES_SUCCESS : ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID,
				{ app_id: row.APP_ID, app_name: row.APP_NAME, icon_url: row.ICON_URL, redirect_url: redirectURL });
		});
	};
	
	app.get('/slp.auth.app', ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var appID = COMMON_UTIL.trim(req.query.app_id);
		var appKey = COMMON_UTIL.trim(req.query.app_key);
		var redirectURL = COMMON_UTIL.trim(req.query.redirect_uri);
		authApp(req, res, appID, appKey, redirectURL);
	});
	
	app.post('/slp.auth.app', ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var appID = COMMON_UTIL.trim(req.body.app_id);
		var appKey = COMMON_UTIL.trim(req.body.app_key);
		var redirectURL = COMMON_UTIL.trim(req.body.redirect_uri);
		authApp(req, res, appID, appKey, redirectURL);
	});
};
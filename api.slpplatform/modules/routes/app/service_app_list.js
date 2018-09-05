// common
const ROUTE_MIDDLEWARE = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');
const ERROR_CODE_UTIL = require('../../common/util/error_code_util.js');

// mysql
const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;

exports.add_routes = function add_routes(app) {
	app.post('/slp.app.list', ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		MYSQL_SLP_PLATFORM_CONN.procGetServiceAPPList(function(err, results) {
			var apps = [];
			
			if (err) return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
			
			if (ERROR_CODE_UTIL.RES_SUCCESS === COMMON_UTIL.getMysqlRES(results).res) {
				for (var i = 0, len = results[0].length; i < len; i++) {
					var result = results[0][i];
					apps.push({
						app_id: Number(result.APP_ID),
						app_name: result.APP_NAME,
						icon_url: result.ICON_URL,
						package_name: result.PACKAGE_NAME,
						scheme: result.SCHEME,
						ios_store_url: result.IOS_STORE_URL
					});
				}
			}
			
			PACKET.sendSuccess(req, res, { apps: apps });
		});
	});
};

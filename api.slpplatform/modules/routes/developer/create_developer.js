// nodejs npm
const crypto = require('crypto');

// common
const routeAuth = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const mysqlConnSlpPlatform = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;

exports.add_routes = function(app) {
	app.post('/slp.developer.create.account', routeAuth.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		
		var email = COMMON_UTIL.trim(req.body.email);
		var enPWD = crypto.createHash("sha512").update(COMMON_UTIL.trim(req.body.password)).digest("base64");
		var companyName = COMMON_UTIL.trim(req.body.company_name);
		
		mysqlConnSlpPlatform.procCreateDeveloperAccount(email, enPWD, companyName, function(err, results) {
			if (err || COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length))
				return PRINT_LOG.error(__filename, API_PATH, " procCreateDeveloperAccount, faile db, error");
			
			var row = results[0][0];
			
			if (1 !== Number(row.RES)) {
				PRINT_LOG.error(__filename, API_PATH, " procCreateDeveloperAccount, code:" + row.CODE + ", msg:" + row.MSG);
				return PACKET.sendFail(req, res, row.CODE);
			}
			
			PACKET.sendSuccess(req, res, {
				developer_id: row.DEVELOPER_ID,
				email: row.EMAIL,
				companay_name: row.COMPANAY_NAME,
				reg_datetime: row.REG_DATETIME
			});
		});
	});
};
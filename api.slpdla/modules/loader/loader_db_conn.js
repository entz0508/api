var PRINT_LOG = global.PRINT_LOGGER;

function checkConnect(pool, errTitle) {
	// Mysql connection keep alive check
	setInterval(function() {
		try {
			pool.getConnection(function(err, connection) {
				if (err) return PRINT_LOG.setErrorLog(errTitle, err);
				connection.query("SELECT 1", function(connErr) {
					if (!connErr) return connection.release();
					PRINT_LOG.setErrorLog(errTitle + ", connection.query", connErr);
					connection.end();
				});
			});
		} catch (err) {
			PRINT_LOG.setErrorLog("dora_account_query.setInterval catch", err);
		}
	}.bind(this), 10000);
}

function runQS(connection, queryStr, callBack) {
	connection.query(queryStr, function(connErr, rows) {
		connection.release();
		callBack(connErr, rows);
	});
}

var DLA = require("../database/mysql_slp_dla_connector.js")(checkConnect, runQS);
var Common = require("../database/mysql_slp_common_connector.js")(checkConnect, runQS);
var DLA_Info = require("../database/mysql_slp_dla_info_connector.js")(checkConnect, runQS);
var KwActionLog = require("../database/mysql_slp_kw_action_log_connector.js")(checkConnect, runQS);

// DB Connector
global.MYSQL_CONNECTOR_POOLS = {
	SLP_DLA: new DLA(),
	SLP_COMMON: new Common(),
	SLP_DLA_INFO: new DLA_Info(),
	SLP_KW_ACTION_LOG: new KwActionLog()
};
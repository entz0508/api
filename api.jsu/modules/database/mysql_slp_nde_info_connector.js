var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_NDE_INFO.HOST,
	port: global.CONFIG.MYSQL_SLP_NDE_INFO.PORT,
	user: global.CONFIG.MYSQL_SLP_NDE_INFO.USER,
	password: global.CONFIG.MYSQL_SLP_NDE_INFO.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_NDE_INFO.DATABASE,
	connectionLimit: global.CONFIG.MYSQL_SLP_NDE_INFO.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_NDE_INFO() {
		checkConnect(pool, "MYSQL_SLP_NDE_INFO.setInterval, pool.getConnection");
	}

    MYSQL_SLP_NDE_INFO.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};

    MYSQL_SLP_NDE_INFO.prototype.procGetAppRes = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetAppRes(  " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientVer) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_NDE_INFO.prototype.procGetAppVersion = function(params, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetAppVersion(  " + Number(params.appID) + ", " +
				connection.escape(params.os) + ", " +
				connection.escape(params.clientVer) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	return MYSQL_SLP_NDE_INFO;
};
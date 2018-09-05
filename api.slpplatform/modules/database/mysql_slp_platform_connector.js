// checked by J
var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_PLATFORM.HOST,
	port: global.CONFIG.MYSQL_SLP_PLATFORM.PORT,
	user: global.CONFIG.MYSQL_SLP_PLATFORM.USER,
	password: global.CONFIG.MYSQL_SLP_PLATFORM.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_PLATFORM.DATABASE,
	connectionLimit: 3
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_PLATFORM_CONN() {
		checkConnect(pool, "MYSQL_SLP_PLATFORM_CONN.setInterval, pool.getConnection");
	}

	MYSQL_SLP_PLATFORM_CONN.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procCreateDeveloperAccount = function(email, pwd, companyName, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCreateDeveloperAccount(  " + connection.escape(email) + ", " + connection.escape(pwd) + ", " + connection.escape(companyName) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procAuthApp = function(appID, apiKey, clientIP, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAuthApp(  " + connection.escape(appID) + ", " + connection.escape(apiKey) + ", " + connection.escape(clientIP) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procAuthAppID = function(appID, authToken, clientIP, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAuthAppID(  " + Number(appID) + ", " +
				connection.escape(authToken) + ", " +
				connection.escape(clientIP) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_PLATFORM_CONN.prototype.procGetServiceAPPList = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = "CALL sp_get_service_app_list()";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procDeveloperLogin = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spDeveloperLogin( " + connection.escape(requestParams.EMAIL) + ", " +
				connection.escape(requestParams.PWD) + ", " +
				connection.escape(requestParams.COMPANY) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procAppVerList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAppVerList( " + Number(requestParams.appID) + " , " +
				connection.escape(requestParams.os) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procAppVerInsert = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAppVerInsert( " + Number(requestParams.appID) + " , " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.ver) + ", " +
				connection.escape(requestParams.summit) + ", " +
				connection.escape(requestParams.forceUpdate) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_PLATFORM_CONN.prototype.procAppVerUpdate = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAppVerUpdate( " + Number(requestParams.appID) + " , " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.ver) + ", " +
				connection.escape(requestParams.summit) + ", " +
				connection.escape(requestParams.forceUpdate) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	return MYSQL_SLP_PLATFORM_CONN;
};
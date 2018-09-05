var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_EN.HOST,
	port: global.CONFIG.MYSQL_SLP_EN.PORT,
	user: global.CONFIG.MYSQL_SLP_EN.USER,
	password: global.CONFIG.MYSQL_SLP_EN.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_EN.DATABASE,
	connectionLimit: global.CONFIG.MYSQL_SLP_EN.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_EN_CONN() {
		checkConnect(pool, "MYSQL_SLP_EN_CONN.setInterval, pool.getConnection");
	}
	
	MYSQL_SLP_EN_CONN.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};
	
	MYSQL_SLP_EN_CONN.prototype.procGetEnglishEpisodeList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_english_episode_list( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.lang) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_EN_CONN.prototype.procRegDeviceToken = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_reg_device_token( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				connection.escape(requestParams.accountID) + ", " +
				connection.escape(requestParams.profileID) + ", " +
				connection.escape(requestParams.deviceToken) + ", " +
				connection.escape(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_EN_CONN.prototype.procAddLastConnect = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_add_last_connect( " + connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				connection.escape(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_EN_CONN.prototype.procBuyProduct = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spBuyProduct( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.point) + " , " +
				Number(requestParams.period) + " , " +
				connection.escape(requestParams.periodType) + " , " +
				connection.escape(requestParams.os) + " , " +
				connection.escape(requestParams.productID) + " , " +
				connection.escape(requestParams.payMethod) + " , " +
				connection.escape(requestParams.reciept) + " , " +
				connection.escape(requestParams.title) + " , " +
				connection.escape(requestParams.usingUnit) + " , " +
				connection.escape(requestParams.goodsIDs) + " , " +
				Number(requestParams.goodsCount) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_EN_CONN.prototype.procGetEpisodePermList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetEpisodePermList( " + Number(requestParams.accountID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	return MYSQL_SLP_EN_CONN;
};
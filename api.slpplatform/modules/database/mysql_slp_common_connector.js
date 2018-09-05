var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_COMMON.HOST,
	port: global.CONFIG.MYSQL_SLP_COMMON.PORT,
	user: global.CONFIG.MYSQL_SLP_COMMON.USER,
	password: global.CONFIG.MYSQL_SLP_COMMON.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_COMMON.DATABASE,
	connectionLimit: global.CONFIG.MYSQL_SLP_COMMON.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_COMMON_CONN() {
		checkConnect(pool, "MYSQL_SLP_COMMON_CONN.setInterval, pool.getConnection");
	}

	MYSQL_SLP_COMMON_CONN.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procGetEpisodePermList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_episode_perm_list(  " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procGetBuyHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetBuyHistory(  " + Number(requestParams.appID) + ", " +
				Number(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procCouponCreate = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCouponCreate(  " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.title) + ", " +
				Number(requestParams.useLimit) + ", " +
				Number(requestParams.numOfCoupon) + ", " +
				connection.escape(requestParams.productID) + ", " +
				connection.escape(requestParams.keyValue) + ", " +
				connection.escape(requestParams.userType) + ", " +
				connection.escape(requestParams.couponType) + ", " +
				connection.escape(requestParams.useArea) + ", " +
				connection.escape(requestParams.startDate) + ", " +
				connection.escape(requestParams.endDate) + ", " +
				connection.escape(requestParams.editorName) + ", " +
				connection.escape(requestParams.skinID) + ", " +
				connection.escape(requestParams.specialSkinCode) + ", " +
				connection.escape(requestParams.publisher) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procGetCouponList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCouponList(  " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.userType) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procGetCouponUseHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCouponUseHistory( " + Number(requestParams.appID) + ", " +
				Number(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procCouponRegi = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCouponRegi( " + Number(requestParams.appID) + ", " +
				Number(requestParams.accountID) + ", " +
				connection.escape(requestParams.couponCode) + ", " +
				connection.escape(requestParams.country) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.spCouponMyCouponList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spCouponMyCouponList( " + Number(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.procGetCouponsProductID = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetCouponsProductID( " + connection.escape(requestParams.coupon_code) + " , " +
				connection.escape(requestParams.email) + " )";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_COMMON_CONN.prototype.spBuyProduct_facade = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spBuyProduct_facade( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.point) + " , " +
				Number(requestParams.period) + " , " +
				Number(requestParams.couponSeq) + " , " +
				connection.escape(requestParams.periodType) + " , " +
				connection.escape(requestParams.email) + " , " +
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

	return MYSQL_SLP_COMMON_CONN;
};
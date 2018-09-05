var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_DLA.HOST,
	port: global.CONFIG.MYSQL_SLP_DLA.PORT,
	user: global.CONFIG.MYSQL_SLP_DLA.USER,
	password: global.CONFIG.MYSQL_SLP_DLA.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_DLA.DATABASE,
	connectionLimit: global.CONFIG.MYSQL_SLP_DLA.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_DLA_CONN() {
		checkConnect(pool, "MYSQL_SLP_DLA_CONN.setInterval, pool.getConnection");
	}

	MYSQL_SLP_DLA_CONN.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procIsLoggedIn = function(appID, os, clientUID, userID, userAccessToken, slpAccountID, slpAccountAccessToken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spIsLoggedIn( " + Number(appID) + ", " + connection.escape(os) + ", " +
				connection.escape(clientUID) + ", " + Number(slpAccountID) + " , " + connection.escape(slpAccountAccessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procGetEpisodeList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetEpisodeList( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_DLA_CONN.prototype.procShopGetGooglePayload = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spShopGetGooglePayload( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.userID) + ", " +
				connection.escape(requestParams.userAccessToken) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + ", " +
				connection.escape(requestParams.build) + ", " +
				connection.escape(requestParams.store) + ", " +
				Number(requestParams.packageID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_DLA_CONN.prototype.procShopGoogleConsume = function(requestParams, payload, orderID, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spShopGoogleConsume( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.userID) + ", " +
				connection.escape(requestParams.userAccessToken) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + ", " +
				connection.escape(requestParams.build) + ", " +
				connection.escape(requestParams.store) + ", " +
				Number(requestParams.packageID) + ", " +
				connection.escape(payload) + ", " +
				connection.escape(orderID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procShopAppleConsume = function(requestParams, payload, orderID, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spShopAppleConsume( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.userID) + ", " +
				connection.escape(requestParams.userAccessToken) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + ", " +
				connection.escape(requestParams.build) + ", " +
				connection.escape(requestParams.store) + ", " +
				Number(requestParams.packageID) + ", " +
				connection.escape(payload) + ", " +
				connection.escape(orderID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procAddPhotos = function(requestParams, serverIdx, destPathIdx, imageDefaultFileName, imageThumbnailFileName, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spAddPhotos( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + ", " +
				Number(requestParams.profileID) + ", " +
				connection.escape(requestParams.episode_id) + ", " +
				Number(requestParams.curUnixtime) + ", " +
				Number(serverIdx) + ", " +
				Number(destPathIdx) + ", " +
				connection.escape(imageDefaultFileName) + ", " +
				connection.escape(imageThumbnailFileName) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_DLA_CONN.prototype.procGetPhotosList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetPhotosList( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.slpAccountID) + ", " +
				connection.escape(requestParams.slpAccountAccessToken) + ", " +
				Number(requestParams.profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procGetCategoryRotationList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetCategoryRotationRewardList( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procCategoryRotationRewardRequest = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetCategoryRotationRewardRequest( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + " , " +
				connection.escape(requestParams.categoryID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procCategoryRotationRewardHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetCategoryRotationRewardHistory( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_DLA_CONN.prototype.procGetTopRankEpisodePlay = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetTopRankEpisodePlay( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.searchLimit) + " , " +
				connection.escape(requestParams.searchBoundary) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procBuyProduct = function(requestParams, callBack) {
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
			console.log("\n queryStr");
			console.log(queryStr);
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procGetBuyHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetBuyHistory(  " + Number(requestParams.appID) + ", " +
				Number(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_DLA_CONN.prototype.procGetEpisodePermList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetEpisodePermList( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " ) ";
			console.log("\n## procGetEpisodePermList queryStr ##");
			console.log(queryStr);
			runQS(connection, queryStr, callBack);
		});
	};

	return MYSQL_SLP_DLA_CONN;
};
var mysql = require('mysql');
var pool = mysql.createPool({
    host: global.CONFIG.MYSQL_ADB_ACCOUNT.HOST,
    port: global.CONFIG.MYSQL_ADB_ACCOUNT.PORT,
    user: global.CONFIG.MYSQL_ADB_ACCOUNT.USER,
    password: global.CONFIG.MYSQL_ADB_ACCOUNT.PASSWORD,
    database: global.CONFIG.MYSQL_ADB_ACCOUNT.DATABASE,
    connectionLimit: global.CONFIG.MYSQL_ADB_ACCOUNT.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_NDE() {
		checkConnect(pool, "MYSQL_SLP_NDE.setInterval, pool.getConnection");
	}

    MYSQL_SLP_NDE.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};

    MYSQL_SLP_NDE.prototype.procIsLoggedIn = function(appID, os, clientUID, userID, userAccessToken, slpAccountID, slpAccountAccessToken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spIsLoggedIn( " + Number(appID) + ", " + connection.escape(os) + ", " +
				connection.escape(clientUID) + ", " + Number(slpAccountID) + " , " + connection.escape(slpAccountAccessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_NDE.prototype.procGetEpisodeList = function(requestParams, callBack) {
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


    MYSQL_SLP_NDE.prototype.procShopGetGooglePayload = function(requestParams, callBack) {
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


    MYSQL_SLP_NDE.prototype.procShopGoogleConsume = function(requestParams, payload, orderID, callBack) {
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

    MYSQL_SLP_NDE.prototype.procShopAppleConsume = function(requestParams, payload, orderID, callBack) {
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
    //
    // MYSQL_SLP_NDE.prototype.procAddPhotos = function(requestParams, serverIdx, destPathIdx, imageDefaultFileName, imageThumbnailFileName, callBack) {
	// 	pool.getConnection(function(err, connection) {
	// 		if (err) return callBack(err);
	// 		var queryStr = " CALL spAddPhotos( " + Number(requestParams.appID) + ", " +
	// 			connection.escape(requestParams.os) + ", " +
	// 			connection.escape(requestParams.clientUID) + ", " +
	// 			Number(requestParams.slpAccountID) + ", " +
	// 			connection.escape(requestParams.slpAccountAccessToken) + ", " +
	// 			Number(requestParams.profileID) + ", " +
	// 			connection.escape(requestParams.episode_id) + ", " +
	// 			Number(requestParams.curUnixtime) + ", " +
	// 			Number(serverIdx) + ", " +
	// 			Number(destPathIdx) + ", " +
	// 			connection.escape(imageDefaultFileName) + ", " +
	// 			connection.escape(imageThumbnailFileName) + " ) ";
	// 		runQS(connection, queryStr, callBack);
	// 	});
	// };


    MYSQL_SLP_NDE.prototype.procGetPhotosList = function(requestParams, callBack) {
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

    // MYSQL_SLP_NDE.prototype.procGetCategoryRotationList = function(requestParams, callBack) {
	// 	pool.getConnection(function(err, connection) {
	// 		if (err) return callBack(err);
	// 		var queryStr = " CALL spGetCategoryRotationRewardList( " + Number(requestParams.appID) + " , " +
	// 			Number(requestParams.accountID) + " , " +
	// 			Number(requestParams.profileID) + " ) ";
	// 		runQS(connection, queryStr, callBack);
	// 	});
	// };
    //
    // MYSQL_SLP_NDE.prototype.procCategoryRotationRewardRequest = function(requestParams, callBack) {
	// 	pool.getConnection(function(err, connection) {
	// 		if (err) return callBack(err);
	// 		var queryStr = " CALL spGetCategoryRotationRewardRequest( " + Number(requestParams.appID) + " , " +
	// 			Number(requestParams.accountID) + " , " +
	// 			Number(requestParams.profileID) + " , " +
	// 			connection.escape(requestParams.categoryID) + " ) ";
	// 		runQS(connection, queryStr, callBack);
	// 	});
	// };
    //
    // MYSQL_SLP_NDE.prototype.procCategoryRotationRewardHistory = function(requestParams, callBack) {
	// 	pool.getConnection(function(err, connection) {
	// 		if (err) return callBack(err);
	// 		var queryStr = " CALL spGetCategoryRotationRewardHistory( " + Number(requestParams.appID) + " , " +
	// 			Number(requestParams.accountID) + " , " +
	// 			Number(requestParams.profileID) + " ) ";
	// 		runQS(connection, queryStr, callBack);
	// 	});
	// };


    MYSQL_SLP_NDE.prototype.procGetTopRankEpisodePlay = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetTopRankEpisodePlay( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.searchLimit) + " , " +
				connection.escape(requestParams.searchBoundary) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_NDE.prototype.procEpisodeBegining = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_episode_begining( " + Number(requestParams.appID) + " , " +
                Number(requestParams.accountID) + " , " +
                connection.escape(requestParams.seqID) + " , " +
                connection.escape(requestParams.beginDate) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_NDE.prototype.procEpisodeBeginings = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_episode_beginings( " + Number(requestParams.appID) + " , " +
                Number(requestParams.stepAttendID) + " , " +
                connection.escape(requestParams.beginDate) + " , " +
                connection.escape(requestParams.endDate) + " , " +
                connection.escape(requestParams.bluearkUid) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    // APP���� �ӽ����� ����
    MYSQL_SLP_NDE.prototype.procBuyTempCreate = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBuyTempCreate( " + Number(requestParams.appID) + " , " +
                Number(requestParams.accountID) + " , " +
                connection.escape(requestParams.encUserID) + " , " +
                connection.escape(requestParams.os) + " , " +
                connection.escape(requestParams.productID) + " , " +
                Number(requestParams.exProductID) + " , " +
                connection.escape(requestParams.payMethod) + " , " +
                connection.escape(requestParams.reciept) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    // �� ���ŷ��� - ��������
    MYSQL_SLP_NDE.prototype.procBuyProduct = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spBuyProduct( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.period) + " , " +
                connection.escape(requestParams.os) + " , " +
                connection.escape(requestParams.productID) + " , " +
                connection.escape(requestParams.reciept) + " , " +
                connection.escape(requestParams.title) + " ) ";

                // + " , " +
                //Number(requestParams.point) + " , " +
                //connection.escape(requestParams.periodType) + " , " +
                //connection.escape(requestParams.payMethod) + " , " +
                //connection.escape(requestParams.usingUnit) + " , " +
                //connection.escape(requestParams.goodsIDs) + " , " +
				//Number(requestParams.goodsCount) + " ) ";
			console.log("\n queryStr");
			console.log(queryStr);
			runQS(connection, queryStr, callBack);
		});
    };

    // ���� ����ó��
    /*
    appID bigint,
    bluearkUid VARCHAR(40),
    extPdtID int,
    stepAttendID int,
    buyID int,
    buyIP varchar(15)
    */
    MYSQL_SLP_NDE.prototype.procOpenBuyProduct = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spOpenBuyProduct( " + Number(requestParams.appID) + " , " +
                connection.escape(requestParams.bluearkUid) + " , " +
                Number(requestParams.extPdtID) + " , " +
                Number(requestParams.stepAttendID) + " , " +
                Number(requestParams.buyID) + " , " +
                connection.escape(requestParams.buyIP) + " ) ";

            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_NDE.prototype.procGetBuyHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetBuyHistory(  " + Number(requestParams.appID) + ", " +
				Number(requestParams.accountID) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_NDE.prototype.procGetEpisodePermList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetEpisodePermList( " + Number(requestParams.appID) + " , " +
                Number(requestParams.accountID) + " , " +
                Number(requestParams.seqID) + " ) ";
			console.log("\n## procGetEpisodePermList queryStr ##");
			console.log(queryStr);
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_NDE.prototype.procServerPing_nde = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_server_ping_nde( " + Number(requestParams.appID) + " ) ";

            console.log("\n## procServerPing_nde queryStr ##");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_NDE.prototype.procRefundPermition = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spRefundPermition( " + Number(requestParams.seqID) + " , " +
                Number(requestParams.accountID) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_NDE.prototype.procOpenRefundProduct = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spOpenRefundPermition( " + Number(requestParams.stepAttendID) + " , " +
				Number(requestParams.refundID) + " , " +
				connection.escape(requestParams.refundStatCD) + " , " +
                connection.escape(requestParams.refundRsnCD) + " , " +
				connection.escape(requestParams.refundTime) + " , " +
				Number(requestParams.refundAmt) + " , " +
                connection.escape(requestParams.bluearkUid) + " ) ";
                // connection.escape(requestParams.buyIP) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

	return MYSQL_SLP_NDE;
};
// checked by J
var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_ACCOUNT.HOST,
	port: global.CONFIG.MYSQL_SLP_ACCOUNT.PORT,
	user: global.CONFIG.MYSQL_SLP_ACCOUNT.USER,
	password: global.CONFIG.MYSQL_SLP_ACCOUNT.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_ACCOUNT.DATABASE,
	connectionLimit: 3
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_ACCOUNT_CONN() {
		checkConnect(pool, "MYSQL_SLP_ACCOUNT_CONN.setInterval, pool.getConnection");
	}

    MYSQL_SLP_ACCOUNT_CONN.prototype.procWatchdogPing = function (callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            connection.query(" SELECT 1 AS `RES` ", function (connErr) {
                connection.release();
                callBack(connErr, !connErr);
            });
        });
    };

    MYSQL_SLP_ACCOUNT_CONN.prototype.procTokenAdd = function (appID, encUserID, tradeID, extPdtID, clientIP, signUpPath, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserTokenCreate(  " + Number(appID) + ", " +
                connection.escape(encUserID) + ", " +
                Number(tradeID) + " , " +
                Number(extPdtID) + " , " +
                connection.escape(clientIP) + ", " +
                connection.escape(signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_ACCOUNT_CONN.prototype.procUserChk = function (appID, clientUID, encUserID, userPass, clientIP, signUpPath, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserAccountCheck_nde(  " + Number(appID) + ", " +
                connection.escape(clientUID) + ", " +
                connection.escape(clientIP) + ", " +
                connection.escape(encUserID) + ", " +
                connection.escape(userPass) + ", " +
                connection.escape(signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_ACCOUNT_CONN.prototype.procGetOpenUserTokenVal = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spGetUserTokenVal(  " + Number(requestParams.stepAttendID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountLogin_nde = function (appID, clientUID, clientIP, accountEmail, accountPWD, signUpPath, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserAccountLogin_nde(  " + Number(appID) + ", " +
                connection.escape(clientUID) + ", " +
                connection.escape(clientIP) + ", " +
                connection.escape(accountEmail) + ", " +
                connection.escape(accountPWD) + ", " +
                connection.escape(signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    /*
	MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountCreate = function(params, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spUserAccountCreate(  " + Number(params.appID) + ", " +
				connection.escape(params.clientUID) + ", " +
				connection.escape(params.CLIENT_IP) + ", " +
				connection.escape(params.accountEmail) + ", " +
				connection.escape(params.accountPWD) + ", " +
				connection.escape(params.accountCountry) + ", " +
				connection.escape(params.signUpPath) + ", " +
				connection.escape(params.profileName) + ", " +
				connection.escape(params.profileBirthday) + ", " +
				connection.escape(params.profileGender) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountCreate_nde = function(params, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserAccountCreate_nde(  " + Number(params.appID) + ", " +
                connection.escape(params.clientUID) + ", " +
                connection.escape(params.CLIENT_IP) + ", " +
                connection.escape(params.accountEmail) + ", " +
                // connection.escape(params.accountPWD) + ", " +
                connection.escape(params.accountCountry) + ", " +
                connection.escape(params.signUpPath) + ", " +
                connection.escape(params.profileName) + ", " +
                connection.escape(params.profileBirthday) + ", " +
                connection.escape(params.profileGender) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };


	MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountLogin = function(appID, clientUID, clientIP, accountEmail, accountPWD, signUpPath, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spUserAccountLogin(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				connection.escape(accountEmail) + ", " +
				connection.escape(accountPWD) + ", " +
				connection.escape(signUpPath) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

    MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountLogin_nde = function (appID, clientUID, clientIP, accountEmail, accountPWD, signUpPath, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserAccountLogin_nde(  " + Number(appID) + ", " +
                connection.escape(clientUID) + ", " +
                connection.escape(clientIP) + ", " +
                connection.escape(accountEmail) + ", " +
                connection.escape(accountPWD) + ", " +
                connection.escape(signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };


	MYSQL_SLP_ACCOUNT_CONN.prototype.procIsLoginUserAccount = function(appID, clientUID, accountID, accessToken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spIsLoginUserAccount(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procIsLoginUserAccountWithProfileID = function(appID, clientUID, accountID, accessToken, profileID, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spIsLoginUserAccountWithProfileID(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + ", " +
				Number(profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountAllowApp = function(appID, clientUID, accountID, accessToken, clientIP, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spUserAccountAllowApp(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + ", " +
				connection.escape(clientIP) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_ACCOUNT_CONN.prototype.procGetUserAccountSignupPath = function(appID, clientUID, accountEmail, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetUserAccountSignupPath(  " + Number(appID) + "," +
				connection.escape(clientUID) + ", " +
				connection.escape(accountEmail) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procProfileAdd = function(appID, clientUID, accountID, accessToken, profileName, profileBirthday, profileGender, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spProfileAdd(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + ", " +
				connection.escape(profileName) + ", " +
				connection.escape(profileBirthday) + ", " +
				connection.escape(profileGender) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procProfileEdit = function(requestPrams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spProfileEdit(  " + Number(requestPrams.appID) + ", " +
				connection.escape(requestPrams.clientUID) + ", " +
				Number(requestPrams.accountID) + ", " +
				connection.escape(requestPrams.accessToken) + ", " +
				Number(requestPrams.profileID) + ", " +
				connection.escape(requestPrams.profileName) + ", " +
				connection.escape(requestPrams.profileBirthday) + ", " +
				connection.escape(requestPrams.profileGender) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procProfileEditLimitTime = function(requestPrams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_profile_edit_limittime(  " + Number(requestPrams.appID) + ", " +
				connection.escape(requestPrams.clientUID) + ", " +
				Number(requestPrams.accountID) + ", " +
				connection.escape(requestPrams.accessToken) + ", " +
				Number(requestPrams.profileID) + ", " +
				Number(requestPrams.limitTime) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_ACCOUNT_CONN.prototype.procForgotUserAccountPasswordChange = function(appID, clientUID, clientIP, accountEmail, accountPWD, chtoken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spForgotUserAccountPasswordChange(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				connection.escape(accountEmail) + ", " +
				connection.escape(accountPWD) + ", " +
				connection.escape(chtoken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procForgotUserAccountPasswordToken = function(appID, clientUID, clientIP, accountEmail, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spForgotUserAccountPasswordToken(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				connection.escape(accountEmail) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procProfileDelete = function(appID, clientUID, clientIP, accountID, accessToken, profileID, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spProfileDelete(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + ", " +
				Number(profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procGetUserAccountWithProfileInfo = function(appID, clientUID, clientIP, accountID, accessToken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetUserAccountWithProfileInfo(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_ACCOUNT_CONN.prototype.procIsAllowAPP = function(appID, clientUID, clientIP, accountID, accessToken, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spIsAllowAPP(  " + Number(appID) + ", " +
				connection.escape(clientUID) + ", " +
				connection.escape(clientIP) + ", " +
				Number(accountID) + ", " +
				connection.escape(accessToken) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procUpdateProfileIMG = function(requestParams, serverIdx, imageDefaultFileName, imageThumbnailFileName, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spProfileImgUpdate( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + ", " +
				connection.escape(requestParams.accessToken) + ", " +
				Number(requestParams.profileID) + ", " +
				Number(serverIdx) + ", " +
				connection.escape(imageDefaultFileName) + ", " +
				connection.escape(imageThumbnailFileName) + ", " +
				Number(requestParams.curUnixtime) + ") ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_ACCOUNT_CONN.prototype.procAccountSecession = function(requestPrams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_user_account_secession(  " + Number(requestPrams.appID) + ", " +
				connection.escape(requestPrams.clientUID) + ", " +
				Number(requestPrams.accountID) + ", " +
				connection.escape(requestPrams.accessToken) + ", " +
				connection.escape(requestPrams.reason) + ", " +
				Number(requestPrams.curUnixtime) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};


	MYSQL_SLP_ACCOUNT_CONN.prototype.procChangeLoginUserAccountPassword = function(requestPrams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_change_login_user_account_password(  " + Number(requestPrams.appID) + ", " +
				connection.escape(requestPrams.clientUID) + ", " +
				Number(requestPrams.accountID) + ", " +
				connection.escape(requestPrams.accessToken) + ", " +
				connection.escape(requestPrams.accountCurrentPWD) + ", " +
				connection.escape(requestPrams.accountPWD) + ", " +
				Number(requestPrams.curUnixtime) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountNewEmailPWD = function(accountID, accountEmail, accountPWD, signUpPath, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spUserAccountIDPWChange(  " + Number(accountID) + ", " +
				connection.escape(accountEmail) + ", " +
				connection.escape(accountPWD) + ", " +
				connection.escape(signUpPath) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};

	MYSQL_SLP_ACCOUNT_CONN.prototype.procGetMyPoint = function(requestPrams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL spGetMyPoint(  " + Number(requestPrams.accountID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
    */
    
	return MYSQL_SLP_ACCOUNT_CONN;
};
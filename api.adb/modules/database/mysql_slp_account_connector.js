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

    MYSQL_SLP_ACCOUNT_CONN.prototype.procUserAccountCreate = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spUserAccountCreate(  " + connection.escape(params.clientUID) + ", " +
                connection.escape(params.CLIENT_IP) + ", " +
                connection.escape(params.signupID) + ", " +
                connection.escape(params.accountPWD) + ", " +
                connection.escape(params.signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
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

    MYSQL_SLP_ACCOUNT_CONN.prototype.procGetOpenUserTokenVal = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spGetUserTokenVal(  " + Number(requestParams.stepAttendID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    
	return MYSQL_SLP_ACCOUNT_CONN;
};
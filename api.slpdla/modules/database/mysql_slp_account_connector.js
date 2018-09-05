var mysql = require('mysql');

var PRINT_LOG = global.PRINT_LOGGER;

var pool  = mysql.createPool({
    connectionLimit : global.CONFIG.MYSQL_SLP_COMMON.CONNECTION_LIMIT,
    host            : global.CONFIG.MYSQL_SLP_ACCOUNT.HOST,
    port            : global.CONFIG.MYSQL_SLP_ACCOUNT.PORT,
    user            : global.CONFIG.MYSQL_SLP_ACCOUNT.USER,
    password        : global.CONFIG.MYSQL_SLP_ACCOUNT.PASSWORD,
    database        : global.CONFIG.MYSQL_SLP_ACCOUNT.DATABASE
});

var isNull = function(value) {
    "use strict";
    if( (null === value)  || ("undefined" === typeof value) || ('' === value)  || (undefined === value) )  {
        return true;
    } else {
        return false;
    }
};

function MySQLConnectorForSlpAccount() {
    // Mysql connection keep alive check
    setInterval(function () {
        "use strinct";
        try {
            pool.getConnection(function(err, connection) {
                if (err) {
                    PRINT_LOG.setErrorLog("MySQLConnectorForSlpAccount.setInterval, pool.getConnection", err);
                } else {
                    connection.query("SELECT 1", function (connErr, rows) {
                        //PRINT_LOG.info(__filename,"MySQLConnectorForSlpAccount, SELECT 1");
                        if (connErr) {
                            PRINT_LOG.setErrorLog("MySQLConnectorForSlpAccount.setInterval, pool.getConnection, connection.query", connErr);
                            connection.end();
                        } else {
                            connection.release();
                        }
                    });
                }
            });
        } catch (err) {
            PRINT_LOG.setErrorLog("dora_account_query.setInterval catch", err);
        }
    }.bind(this), 1000 * 10);
}


MySQLConnectorForSlpAccount.prototype.procWatchdogPing = function(callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpAccount.procPing, ", err);
            callBack(err, null);
        } else {
            var queryStr = " SELECT 1 AS `RES` ";
            connection.query(queryStr, function (connErr, rows) {
                var isSuccess = false;
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpAccount.procPing, db failed query:' + queryStr, connErr);
                    isSuccess = false;
                } else {
                    isSuccess = true;
                }
                connection.release();
                callBack(connErr, isSuccess);
            });
        }
    });
};





MySQLConnectorForSlpAccount.prototype.procIsLoginUserAccountWithoutProfile = function(appID, clientUID, accountID, accessToken, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpAccount.procUserAccountLogin, ", err);
            callBack(err, null);
        } else {

            var queryStr = " CALL spIsLoginUserAccount(  " +  Number(appID) + ", " +
                                                                connection.escape(clientUID) + ", " +
                                                                Number(accountID) + ", " +
                                                                connection.escape(accessToken) + " ) ";


            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpAccount.spUserAccountLogin, db failed query:' + queryStr, connErr);
                }
                callBack(connErr, rows);
                connection.release();
            });
        }
    });
};

MySQLConnectorForSlpAccount.prototype.procIsLoginUserAccountWithProfile = function(appID, clientUID, accountID, accessToken, profileID, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpAccount.procUserAccountLogin, ", err);
            callBack(err, null);
        } else {

            var queryStr = " CALL spIsLoginUserAccountWithProfileID(  " +  Number(appID) + ", " +
                                                                            connection.escape(clientUID) + ", " +
                                                                            Number(accountID) + ", " +
                                                                            connection.escape(accessToken) + ", " +
                                                                            Number(profileID) + " ) ";


            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpAccount.spUserAccountLogin, db failed query:' + queryStr, connErr);
                }
                callBack(connErr, rows);
                connection.release();
            });
        }
    });
};

module.exports = MySQLConnectorForSlpAccount;
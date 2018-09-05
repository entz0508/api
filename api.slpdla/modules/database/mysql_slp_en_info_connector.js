var mysql = require('mysql');

var PRINT_LOG = global.PRINT_LOGGER;

var pool  = mysql.createPool({
    connectionLimit : global.CONFIG.MYSQL_SLP_EN_INFO.CONNECTION_LIMIT,
    host            : global.CONFIG.MYSQL_SLP_EN_INFO.HOST,
    port            : global.CONFIG.MYSQL_SLP_EN_INFO.PORT,
    user            : global.CONFIG.MYSQL_SLP_EN_INFO.USER,
    password        : global.CONFIG.MYSQL_SLP_EN_INFO.PASSWORD,
    database        : global.CONFIG.MYSQL_SLP_EN_INFO.DATABASE
});



var isNull = function(value) {
    "use strict";
    if( (null === value)  || ("undefined" === typeof value) || ('' === value)  || (undefined === value) )  {
        return true;
    } else {
        return false;
    }
};

function MySQLConnectorForSlpENInfo() {
    // Mysql connection keep alive check
    setInterval(function () {
        "use strinct";
        try {
            pool.getConnection(function(err, connection) {
                if (err) {
                    PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.setInterval, pool.getConnection", err);
                } else {
                    connection.query("SELECT 1", function (connErr, rows) {
                        //PRINT_LOG.info(__filename,"MySQLConnectorForSlpENInfo, SELECT 1");
                        if (connErr) {
                            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.setInterval, pool.getConnection, connection.query", connErr);
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


MySQLConnectorForSlpENInfo.prototype.procWatchdogPing = function(callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procWatchdogPing, ", err);
            callBack(err, null);
        } else {
            var queryStr = " SELECT 1 AS `RES` ";
            connection.query(queryStr, function (connErr, rows) {
                var isSuccess = false;
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpENInfo.procWatchdogPing, db failed query:' + queryStr, connErr);
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

MySQLConnectorForSlpENInfo.prototype.procGetAppRes = function( requestParams, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procGetAppRes, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL sp_get_app_res(  " + Number(requestParams.appID) + ", " +
                                                    connection.escape(requestParams.os) + ", " +
                                                    connection.escape(requestParams.clientVer) + ") ";

            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procGetAppRes, db failed query:" + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

MySQLConnectorForSlpENInfo.prototype.procGetAppVersion = function( requestParams, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procGetAppVersion, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL sp_get_app_version(  " + Number(requestParams.appID) + ", " +
                                                        connection.escape(requestParams.os) + ", " +
                                                        connection.escape(requestParams.clientVer) + ") ";



            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procGetAppVersion, db failed query:" + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

/*
MySQLConnectorForSlpENInfo.prototype.procCreateDeveloperAccount = function(email, pwd, companyName, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procCreateDeveloperAccount, ", err);
            callBack(err, null);
        } else {

            var queryStr = " CALL spCreateDeveloperAccount(  " + connection.escape(email) + ", " + connection.escape(pwd) + ", " + connection.escape(companyName) + " ) ";

            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpENInfo.procCreateDeveloperAccount, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

MySQLConnectorForSlpENInfo.prototype.procAuthApp = function(appID, apiKey, clientIP, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procAuthApp, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL spAuthApp(  " + connection.escape(appID) + ", " + connection.escape(apiKey) + ", " + connection.escape(clientIP) + " ) ";
            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpENInfo.procAuthApp, CALL spAuthApp, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

MySQLConnectorForSlpENInfo.prototype.procAuthAppID = function(appID, authToken, clientIP, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpENInfo.procAuthAppID, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL spAuthAppID(  " + Number(appID) + ", " +
                                                        connection.escape(authToken) + ", " +
                                                        connection.escape(clientIP) + " ) ";
            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpENInfo.procAuthAppID, CALL spAuthAppID, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};
*/

module.exports = MySQLConnectorForSlpENInfo;
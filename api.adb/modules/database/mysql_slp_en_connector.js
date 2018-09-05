var mysql = require('mysql');

var PRINT_LOG = global.PRINT_LOGGER;

var pool  = mysql.createPool({
    connectionLimit : global.CONFIG.MYSQL_SLP_EN.CONNECTION_LIMIT,
    host            : global.CONFIG.MYSQL_SLP_EN.HOST,
    port            : global.CONFIG.MYSQL_SLP_EN.PORT,
    user            : global.CONFIG.MYSQL_SLP_EN.USER,
    password        : global.CONFIG.MYSQL_SLP_EN.PASSWORD,
    database        : global.CONFIG.MYSQL_SLP_EN.DATABASE
});

var isNull = function(value) {
    "use strict";
    if( (null === value)  || ("undefined" === typeof value) || ('' === value)  || (undefined === value) )  {
        return true;
    } else {
        return false;
    }
};

function MySQLConnectorForSlpEN() {
    // Mysql connection keep alive check
    setInterval(function () {
        "use strinct";
        try {
            pool.getConnection(function(err, connection) {
                if (err) {
                    PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.setInterval, pool.getConnection", err);
                } else {
                    connection.query("SELECT 1", function (connErr, rows) {
                        //PRINT_LOG.info(__filename,"MySQLConnectorForSlpEN, SELECT 1");
                        if (connErr) {
                            PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.setInterval, pool.getConnection, connection.query", connErr);
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


MySQLConnectorForSlpEN.prototype.procWatchdogPing = function(callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.procWatchdogPing, ", err);
            callBack(err, null);
        } else {
            var queryStr = " SELECT 1 AS `RES` ";
            connection.query(queryStr, function (connErr, rows) {
                var isSuccess = false;
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpEN.procWatchdogPing, db failed query:' + queryStr, connErr);
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

MySQLConnectorForSlpEN.prototype.procGetEnglishEpisodeList = function(requestParams, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.procGetEnglishEpisodeList, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL sp_get_english_episode_list( " + Number(requestParams.appID) + ", " +
                                                                    connection.escape(requestParams.os)  + ", " +
                                                                    connection.escape(requestParams.lang)  + " ) ";

            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpEN.sp_get_english_episode_list, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

MySQLConnectorForSlpEN.prototype.procRegDeviceToken = function(requestParams, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.procRegDeviceToken, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL sp_reg_device_token( " + Number(requestParams.appID) + ", " +
                                                            connection.escape(requestParams.os)  + ", " +
                                                            connection.escape(requestParams.clientUID)  + ", " +
                                                            connection.escape(requestParams.accountID)  + ", " +
                                                            connection.escape(requestParams.profileID)  + ", " +
                                                            connection.escape(requestParams.deviceToken)  + ", " +
                                                            connection.escape(requestParams.curUnixtimeStamp)  + " ) ";

            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpEN.sp_get_english_episode_list, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

MySQLConnectorForSlpEN.prototype.procAddLastConnect = function(requestParams, callBack) {
    "use strict";
    pool.getConnection(function(err, connection){
        if(err) {
            PRINT_LOG.setErrorLog("MySQLConnectorForSlpEN.procAddLastConnect, ", err);
            callBack(err, null);
        } else {
            var queryStr = " CALL sp_add_last_connect( " + connection.escape(requestParams.os)  + ", " +
                                                           connection.escape(requestParams.clientUID)  + ", " +
                                                           connection.escape(requestParams.curUnixtimeStamp)  + " ) ";

            connection.query(queryStr, function (connErr, rows) {
                if (connErr) {
                    PRINT_LOG.setErrorLog('MySQLConnectorForSlpEN.sp_add_last_connect, db failed query:' + queryStr, connErr);
                }
                connection.release();
                callBack(connErr, rows);
            });
        }
    });
};

module.exports = MySQLConnectorForSlpEN;
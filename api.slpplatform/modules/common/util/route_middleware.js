/*======================================================================================================
 @desc	route middleware - 인증처리용
 ====================================================================================================*/

// common
//require('date-utils'); // TimeDate Package
var PACKET = require("../util/packet_sender.js");
var COMMON_UTIL = require("../util/common.js");
var ERROR_CODE_UTIL = require('../util/error_code_util.js');


const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

const PRINT_LOG = global.PRINT_LOGGER;
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;

var NO_AUTH_APP = function (req, res, next) {
    "use strict";

    var API_PATH = req.route.path;

    var appID = null;
    var appToken = null;
    var clientIP = COMMON_UTIL.getClientIP(req);

    /***********************/
    var loginfo = {};
    try {
        loginfo.path = API_PATH;
        loginfo.headers = JSON.stringify(req.headers);
        loginfo.body = JSON.stringify(req.body);
        loginfo.result = true;
    } catch (e) {
        loginfo.path = API_PATH;
        loginfo.headers = req.headers;
        loginfo.body = req.body;
        loginfo.result = e;
    }
    COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        if (!isSuccess) {
            PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        }
    });
    /***********************/

    if("POST" === req.method) {
        appID = COMMON_UTIL.trim(req.body.app_id);
        appToken = COMMON_UTIL.trim(req.body.app_token);
    }
    else{
        appID = COMMON_UTIL.trim(req.query.app_id);
        appToken = COMMON_UTIL.trim(req.query.app_token);
    }

    next();
};


var AUTH_APP = function (req, res, next) {
    "use strict";
    var API_PATH = req.route.path;

    var appID = null;
    var appToken = null;
    var clientIP = COMMON_UTIL.getClientIP(req);

    /***********************/
    var loginfo = {};
    try {
        loginfo.path = API_PATH;
        loginfo.headers = JSON.stringify(req.headers);
        loginfo.body = JSON.stringify(req.body);
        loginfo.result = true;
    } catch (e) {
        loginfo.path = API_PATH;
        loginfo.headers = req.headers;
        loginfo.body = req.body;
        loginfo.result = e;
    }
    COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        if (!isSuccess) {
            PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        }
    });
    /***********************/

    if("POST" === req.method) {
        appID = COMMON_UTIL.trim(req.body.app_id);
        appToken = COMMON_UTIL.trim(req.body.app_token);
    }
    else{
        appID = COMMON_UTIL.trim(req.query.app_id);
        appToken = COMMON_UTIL.trim(req.query.app_token);
    }

    if( !COMMON_UTIL.isNumber(appID) ) {
        PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP, RES ERROR PARAMETER appID:" + appID);
        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
    } else {
        COMMON_UTIL.isAuthAppID(MYSQL_SLP_PLATFORM_CONN, appID, appToken, clientIP, function(isAuth){
            if(!isAuth) {
                PRINT_LOG.error(__filename, API_PATH, "  no auth app_id:" + appID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID);
            } else {
                next();
            }
        });
    }
};


var AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE = function (req, res, next) {
    "use strict";
    var API_PATH = req.route.path;

    var appID = null;
    var appToken = null;
    var clientUID = null;
    var clientIP = COMMON_UTIL.getClientIP(req);

    var accountID = null;
    var accessToken = null;

    /***********************/
    var loginfo = {};
    try {
        loginfo.path = API_PATH;
        loginfo.headers = JSON.stringify(req.headers);
        loginfo.body = JSON.stringify(req.body);
        loginfo.result = true;
    } catch (e) {
        loginfo.path = API_PATH;
        loginfo.headers = req.headers;
        loginfo.body = req.body;
        loginfo.result = e;
    }
    COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        if (!isSuccess) {
            PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        }
    });
    /***********************/

    if("POST" === req.method) {
        appID = COMMON_UTIL.trim(req.body.app_id);
        appToken = COMMON_UTIL.trim(req.body.app_token);
        clientUID = COMMON_UTIL.trim(req.body.client_uid);

        accountID = COMMON_UTIL.trim(req.body.account_id);
        accessToken = COMMON_UTIL.trim(req.body.access_token);

    } else{
        appID = COMMON_UTIL.trim(req.query.app_id);
        appToken = COMMON_UTIL.trim(req.query.app_token);
        clientUID = COMMON_UTIL.trim(req.query.client_uid);

        accountID = COMMON_UTIL.trim(req.query.account_id);
        accessToken = COMMON_UTIL.trim(req.query.access_token);
    }


    if( COMMON_UTIL.isNull(appID) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidAccessToken(accessToken)) {
        var MSG = "";
        if( COMMON_UTIL.isNull(appID) ) { MSG = " ( null appID ) "; }
        if( !COMMON_UTIL.isValidClientUID(clientUID) ) { MSG += " ( invalid clientUID  ) "; }
        if( !COMMON_UTIL.isValidAccessToken(accessToken) ) { MSG += " ( invalid accessToken ) "; }
                
        //PRINT_LOG.error(__filename, API_PATH, " route_middleware ERR check point 1 : "+ MSG +" : AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE, RES ERROR PARAMETER ");
        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
    } else {
        COMMON_UTIL.isAuthAppID(MYSQL_SLP_PLATFORM_CONN, appID, appToken, clientIP, function(isAuth){
            if(!isAuth) {
                //PRINT_LOG.error(__filename, API_PATH, " route_middleware ERR check point 2 : auth AppID is not invalid : AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE,  no auth app_id:" + appID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID);
            } else {
                COMMON_UTIL.isLoginUserAccountWithoutProfile(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, accountID, accessToken, function(isSuccess) {
                    if (!isSuccess) {
                        //PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE,  no login user, app_id:" + appID + ", accountID:" + accountID);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN);
                    } else {
                        next();
                    }
                });
            }
        });
    }
};


var AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE = function (req, res, next) {
    "use strict";
    var API_PATH = req.route.path;

    var appID = null;
    var appToken = null;
    var clientUID = null;
    var clientIP = COMMON_UTIL.getClientIP(req);

    var accountID = null;
    var accessToken = null;
    var profileID = null;

    /***********************/
    var loginfo = {};
    try {
        loginfo.path = API_PATH;
        loginfo.headers = JSON.stringify(req.headers);
        loginfo.body = JSON.stringify(req.body);
        loginfo.result = true;
    } catch (e) {
        loginfo.path = API_PATH;
        loginfo.headers = req.headers;
        loginfo.body = req.body;
        loginfo.result = e;
    }
    COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        if (!isSuccess) {
            PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        }
    });
    /***********************/

    if("POST" === req.method) {
        appID = COMMON_UTIL.trim(req.body.app_id);
        appToken = COMMON_UTIL.trim(req.body.app_token);
        clientUID = COMMON_UTIL.trim(req.body.client_uid);

        accountID = COMMON_UTIL.trim(req.body.account_id);
        accessToken = COMMON_UTIL.trim(req.body.access_token);
        profileID = COMMON_UTIL.trim(req.body.pf_id);

    } else{
        appID = COMMON_UTIL.trim(req.query.app_id);
        appToken = COMMON_UTIL.trim(req.query.app_token);
        clientUID = COMMON_UTIL.trim(req.query.client_uid);

        accountID = COMMON_UTIL.trim(req.query.account_id);
        accessToken = COMMON_UTIL.trim(req.query.access_token);
        profileID = COMMON_UTIL.trim(req.query.pf_id);
    }


    if( COMMON_UTIL.isNull(appID) || !COMMON_UTIL.isValidClientUID(clientUID) ||
        !COMMON_UTIL.isValidAccessToken(accessToken) || !COMMON_UTIL.isValidProfileID(profileID)) {
        PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE, RES ERROR PARAMETER ");
        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
    } else {
        COMMON_UTIL.isAuthAppID(MYSQL_SLP_PLATFORM_CONN, appID, appToken, clientIP, function(isAuth){
            if(!isAuth) {
                PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE,  no auth app_id:" + appID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID);
            } else {
                COMMON_UTIL.isLoginUserAccountWithProfile(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, accountID, accessToken, profileID, function(isSuccess) {
                    if (!isSuccess) {
                        PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE,  no login user, app_id:" + appID + ", accountID:" + accountID);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN);
                    } else {
                        next();
                    }
                });
            }
        });
    }
};


var AUTH_APP_LOGIN_USER_ALLOW_APP = function (req, res, next) {
    "use strict";
    var API_PATH = req.route.path;

    var appID = null;
    var appToken = null;
    var clientUID = null;
    var clientIP = COMMON_UTIL.getClientIP(req);

    var accountID = null;
    var accessToken = null;

    //PRINT_LOG.info(__filename, API_PATH, JSON.stringify(req.body));
    /***********************/
    
    var loginfo = {};
    try {
        loginfo.path = API_PATH;
        loginfo.headers = JSON.stringify(req.headers);
        loginfo.body = JSON.stringify(req.body);
        loginfo.result = true;
    } catch (e) {
        loginfo.path = API_PATH;
        loginfo.headers = req.headers;
        loginfo.body = req.body;
        loginfo.result = e;
    }
    
    COMMON_UTIL.isAddCheckLog(MYSQL_SLP_KW_ACTION_LOG_CONN, loginfo.path, loginfo.headers, loginfo.body, loginfo.result, function (isSuccess) {
        if (!isSuccess) {
            PRINT_LOG.info(__filename, API_PATH, " route_middleware ERR check point 3 : loginUserAccountWithoutProfile is invalid : Check Log added, isSuccess:" + isSuccess);
        }
    });
    /***********************/

    if("POST" === req.method) {
        appID = COMMON_UTIL.trim(req.body.app_id);
        appToken = COMMON_UTIL.trim(req.body.app_token);
        clientUID = COMMON_UTIL.trim(req.body.client_uid);

        accountID = COMMON_UTIL.trim(req.body.account_id);
        accessToken = COMMON_UTIL.trim(req.body.access_token);

    } else{
        appID = COMMON_UTIL.trim(req.query.app_id);
        appToken = COMMON_UTIL.trim(req.query.app_token);
        clientUID = COMMON_UTIL.trim(req.query.client_uid);

        accountID = COMMON_UTIL.trim(req.query.account_id);
        accessToken = COMMON_UTIL.trim(req.query.access_token);
    }


    if( !COMMON_UTIL.isNumber(appID) || !COMMON_UTIL.isValidClientUID(clientUID) ||
        !COMMON_UTIL.isNumber(accountID) || !COMMON_UTIL.isValidAccessToken(accessToken) ) {
        PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_USER_ALLOW_APP, RES ERROR PARAMETER " +
            ", appID:" + appID + ", clientUID:" + clientUID + ", accountID:" + accountID + ", accessToken:" + accessToken);
        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
    } else {
        COMMON_UTIL.isAuthAppID(MYSQL_SLP_PLATFORM_CONN, appID, appToken, clientIP, function(isAuth){
            if(!isAuth) {
                PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_USER_ALLOW_APP,  NO AUTH app_id:" + appID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NO_AUTH_APP_ID);
            } else {
                COMMON_UTIL.isValidAllowAPP(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, clientIP, accountID, accessToken, function(isAllowAPP){
                    if(!isAllowAPP) {
                        PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_USER_ALLOW_APP,  NO ALLOW APP app_id:" + appID);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_ALLOW_APP);
                    } else {
                        COMMON_UTIL.isLoginUserAccountWithoutProfile(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, accountID, accessToken, function (isSuccess) {
                            if (!isSuccess) {
                                PRINT_LOG.error(__filename, API_PATH, " route_middleware : AUTH_APP_LOGIN_USER_ALLOW_APP,  NO LOGIN USER, app_id:" + appID + ", accountID:" + accountID);
                                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_LOGIN);
                            } else {
                                next();
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports = {
    NO_AUTH_APP : NO_AUTH_APP,
    AUTH_APP : AUTH_APP,
    AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE : AUTH_APP_LOGIN_ACCOUNT_WITHOUT_PROFILE,
    AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE : AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE,
    AUTH_APP_LOGIN_USER_ALLOW_APP  : AUTH_APP_LOGIN_USER_ALLOW_APP
};

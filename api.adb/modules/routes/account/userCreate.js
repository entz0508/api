require('date-utils'); // Date.prototype ����
var fs = require("fs"),
    uninitialized = undefined;

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const NODE_MAILER = require('../../common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;

// nodejs npm
const crypto = require('crypto');

exports.add_routes = function (app) {
    "use strict";

    // 비밀번호 변경 메일 관련
    var sendMailWelcome = function (toEmailAddr, sendType, sendValue) {
        var mail = new NODE_MAILER();
        mail.init();

        var subject = "[드라마 바이블] " + sendValue.account_name + "님 비밀번호 변경 안내입니다.";

        // JSON.stringify(req.body)  @@name / @@time / @@token
        // apidev.doralab.co.kr",   host
        var html = null;
        var strHost = new String(sendValue.host);
        var strHost2 = new String("adbtest.blueark.com");
        
        if (strHost.toUpperCase() == strHost2.toUpperCase()) {
            html = fs.readFileSync('./public/mailForm/forgot_pass.html', 'utf8');
        } else {
            html = fs.readFileSync('./public/mailForm/forgot_pass.html', 'utf8');
        }

        html = html.replace(/@@serviceURL/gi, global.CONFIG.MAILER_INFO.SERVICE_URL);
        html = html.replace("@@name", sendValue.account_name);
        html = html.replace("@@time", sendValue.live_time);
        html = html.replace("@@token", sendValue.email_token);
        
        mail.send(toEmailAddr, subject, html, "", function (error, success) {
            if (error) PRINT_LOG.setErrorLog("[" + __filename + "] send Mail sendMailWelcome, Failed ", error);
        });
    };

    function checkParams(API_PATH, clientUID, signupID, pwd, signUpPath) {
        var errParam;
        if (!COMMON_UTIL.isValidClientUID(clientUID)) errParam = "clientUID";
        if (!COMMON_UTIL.isEmail(accountEmail)) errParam = "accountEmail";
        if (!COMMON_UTIL.isValidPassword(pwd)) errParam = "pwd";
        if (!COMMON_UTIL.isValidSignupPath(signUpPath)) errParam = "signUpPath";
        if (errParam) PRINT_LOG.error(__filename, API_PATH, " error parameter " + errParam);
        return !errParam;
    }

    // 회원가입
    app.post("/adb/account/join", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
        try {
            var signUpPath = COMMON_UTIL.trim(req.body.signup_path);
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
            var signupID = COMMON_UTIL.trim(req.body.signup_id);
            var pwd = COMMON_UTIL.trim((signUpPath == "adb") ? req.body.password : req.body.signup_id);
            var signupName = COMMON_UTIL.trim(req.body.signup_name);
            var snsEmail = COMMON_UTIL.trim(req.body.sns_email);
            
            if (!COMMON_UTIL.isValidSignupPath(signUpPath) || !COMMON_UTIL.isValidClientUID(clientUID) || !COMMON_UTIL.isValidOS(os)
                || (signUpPath == "adb" && !COMMON_UTIL.isValidEmail(signupID)) || (signUpPath == "adb" && !COMMON_UTIL.isValidPassword(pwd)) || (signUpPath == "adb" && !COMMON_UTIL.isValidProfileName(signupName))
            ) {
                var fnTitle = "Parameter error : ";
                if (!COMMON_UTIL.isValidSignupPath(signUpPath)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "signUpPath " + signUpPath);
                if (!COMMON_UTIL.isValidClientUID(clientUID)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "clientUID " + clientUID);
                if (!COMMON_UTIL.isValidOS(os)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "os " + os);
                if (signUpPath == "adb" && !COMMON_UTIL.isValidEmail(signupID)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "signupID " + signupID);
                if (!COMMON_UTIL.isValidPassword(pwd)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "pwd " + pwd);
                if (signUpPath == "adb" && !COMMON_UTIL.isValidProfileName(signupName)) PRINT_LOG.error(__filename, API_PATH, fnTitle + "signupName " + signupName);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "parameter error", {});
                return;
            }
            
            MYSQL_ADB_ACCOUNT_CONN.procAccountCreate({
                clientUID: clientUID,
                clientIP: CLIENT_IP,
                signupID: signupID,
                accountPWD: crypto.createHash("sha512").update(pwd).digest("base64"),
                userName: signupName,
                snsEmail: snsEmail,
                signUpPath: signUpPath
            }, function (err, results) {

                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procAccountCreate, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
            
                var row = results[0][0];
                //PRINT_LOG.info(__filename, API_PATH, " procAccountCreate, results : " + JSON.stringify(row));

                if (row.RES == "0") {
                    var responseObj = {};
                    PACKET.sendSuccess(req, res, "가입 성공", { access_token: row.ACCESS_TOKEN, account_name: row.ACCOUNT_NAME });
                } else {
                    PACKET.sendFail(req, res, row.RES, row.MSG, {});
                }
            
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, null);
        }       
        
    });

    app.post("/adb/account/login", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var signUpPath = COMMON_UTIL.trim(req.body.signup_path);
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var signupID = COMMON_UTIL.trim(req.body.signup_id);
            var pwd = COMMON_UTIL.trim((signUpPath == "adb") ? req.body.password : req.body.signup_id);

            //if (!checkParams(API_PATH, clientUID, signupID, pwd, signUpPath)) {
            //    PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
            //    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            //}

            //PRINT_LOG.info(__filename, API_PATH, JSON.stringify(req.body));

            MYSQL_ADB_ACCOUNT_CONN.procAccountLogin({
                clientUID: clientUID,
                clientIP: CLIENT_IP,
                signupID: signupID,
                accountPWD: crypto.createHash("sha512").update(pwd).digest("base64"),
                signUpPath: signUpPath
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procAccountLogin, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                
                var row = results[0][0];
                
                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.access_token = row.ACCESS_TOKEN;
                    responseObj.account_name = row.ACCOUNT_NAME;
                    PACKET.sendSuccess(req, res, "로그인 성공", responseObj);

                } else {
                    PACKET.sendFail(req, res, row.ERRORCODE, row.MSG, {});

                }
                
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 계정정보 조회
    app.post("/adb/account/getInfo", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;

            MYSQL_ADB_ACCOUNT_CONN.procAccountInfo({
                accountID: accountID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procAccountInfo, faile db, error." + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                var row = results[0][0];
                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.signupID = row.signupID;
                    responseObj.email = row.email;
                    responseObj.accountName = row.accountName;
                    responseObj.accountImage = (row.accountImage != "") ? COMMON_UTIL.getFileUrlPath(accountID, row.accountImage) : "";
                    responseObj.signUpPath = row.signUpPath;
                    responseObj.regDatetime = row.regDatetime;
                    PACKET.sendSuccess(req, res, "정보조회 성공", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.ERRORCODE, row.MSG, {});

                }
                
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 비밀번호 찾기, 이메일 발송, 메일 계정 회원인 경우 초기화 메일 발송됨.
    app.post("/adb/account/pwEmail", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var signupID = COMMON_UTIL.trim(req.body.signup_id);            // 초기화할 계정
            var signUpPath = COMMON_UTIL.trim(req.body.signup_path);
            if ("adb" !== signUpPath) {
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "잘못된 호출입니다." + signUpPath, {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procFindEmail({
                clientUID: clientUID,
                clientIP: CLIENT_IP,
                signupID: signupID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procFindEmail, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                
                var row = results[0][0];
                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.info = signupID;
                    responseObj.email_token = row.EMAIL_TOKEN;
                    responseObj.account_name = row.ACCOUNT_NAME;
                    responseObj.live_time = row.LIVE_TIME;
                    responseObj.host = req.host;
                    
                    sendMailWelcome(signupID, 1, responseObj);      // type  1 : 비밀번호 초기화
                    
                    PACKET.sendSuccess(req, res, "이메일이 발송되었습니다.", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.ERRORCODE, row.MSG, {});
                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 비밀번호 찾기 - 이메일토큰 인증
    app.post("/adb/account/checkToken", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var signup_token = COMMON_UTIL.trim(req.body.signup_token);
            MYSQL_ADB_ACCOUNT_CONN.proccheckToken({
                signupToken: signup_token
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " proccheckToken, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                var row = results[0][0];
                if (row.RES == "0") {
                    var responseObj = {};
                    PACKET.sendSuccess(req, res, "조회 성공", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.RES, row.MSG, {});
                }
                
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 비밀번호 찾기 - 비밀번호 변경
    app.post("/adb/account/pwChange", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var signup_token = COMMON_UTIL.trim(req.body.signup_token);
            var pwd = COMMON_UTIL.trim(req.body.signup_pass);
            
            MYSQL_ADB_ACCOUNT_CONN.procpassChange({
                signupToken: signup_token,
                accountPWD: crypto.createHash("sha512").update(pwd).digest("base64")
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procAccountLogin, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                var row = results[0][0];
                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.MSG = row.MSG;
                    PACKET.sendSuccess(req, res, "업데이트 성공", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.RES, row.MSG, {});
                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });


    // 마이페이지 - 이름변경
    app.post("/adb/account/modName", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var userName = COMMON_UTIL.trim(req.body.set_username);
            
            MYSQL_ADB_ACCOUNT_CONN.procUsernameChange({
                accountID: accountID,
                accountName: userName
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUsernameChange, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                var row = results[0][0];

                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.MSG = row.MSG;
                    PACKET.sendSuccess(req, res, "업데이트 성공", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.RES, row.MSG, {});
                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 마이페이지 - 비밀번호변경
    app.post("/adb/account/modPass", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var userPass = COMMON_UTIL.trim(req.body.set_userpass);
            
            MYSQL_ADB_ACCOUNT_CONN.procUserpassChange({
                accountID: accountID,
                accountPass: crypto.createHash("sha512").update(userPass).digest("base64")
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserpassChange, faile db, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                var row = results[0][0];

                if (row.RES == "0") {
                    var responseObj = {};
                    responseObj.MSG = row.MSG;
                    PACKET.sendSuccess(req, res, "업데이트 성공", responseObj);
                } else {
                    PACKET.sendFail(req, res, row.RES, row.MSG, {});
                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, catchErr, {});
        }
    });

    // 마이페이지 - 회원탈퇴
    app.post("/adb/account/leave", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            
            MYSQL_ADB_ACCOUNT_CONN.procUserLeave({
                accountID: accountID,
                clientIP: CLIENT_IP
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserLeave, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", {});
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "errorinfo": catchErr });
        }
    }); 

};
const PRINT_LOG = global.PRINT_LOGGER;

var isNull = function isNull(chk_value) {
    return (typeof chk_value === "undefined") || (null === chk_value) || (undefined === chk_value) || ("" === chk_value);
};

var isRegExp = function isRegExp(type, value) {
    if (isNull(value)) return false;

    var reg_exp = '';

    if (type === 'lower_case') { // 소문자
        reg_exp = /^[a-z]+$/g;
    } else if (type === 'upper_case') { // 대문자
        reg_exp = /^[A-Z]+$/g;
    } else if (type === 'alphabet') { // 영문자
        reg_exp = /^[A-Za-z]+$/g;
    } else if (type === 'number') { // 숫자
        reg_exp = /^[0-9]+$/g;
    } else if (type === 'email') { // 이메일
        reg_exp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
        // reg_exp=/^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
        //reg_exp = /^[\w!#$%&\'*+\/=?^`{|}~.-]+@(?:[ a-z\d][ a-z\d-]*(?:\.[ a-z\d][ a-z\d-]*)?)+\.(?:[a-z][a-z\d-]+)$/i;
    } else if (type === 'handphone') { // 핸드폰번호 - 국내전용(해외는 확인 필요)
        reg_exp = /^01\d{1}-\d{3,4}-\d{4}$/;
    } else if (type === 'telephone') { // 일반번호
        reg_exp = /^\d{3}-\d{3,4}-\d{4}$/;
    } else if (type === 'password') { // 비밀번호 (특수기호 제외하고 7~21)
        reg_exp = /^[a-zA-Z0-9_]+$/g;
    } else if (type === 'first_name') { // 이름 (50자 이하)
        reg_exp = /^([가-힣a-zA-Z_]{1,50})$/;
    } else if (type === 'last_name') { // 성 (10자 이하)
        reg_exp = /^([가-힣a-zA-Z_]{1,10})$/;
    } else if (type === 'nick_name') { // 성 (10자 이하)
        reg_exp = /^([가-힣a-zA-Z0-9_]{1,10})$/;
    } else if (type === 'birth') { // 생일형식
        reg_exp = /^[0-9]{8}$/;
    } else if (type === 'alphabet_number') { // 영문과 숫자만
        reg_exp = /^[A-Za-z0-9_]+$/g;
    } else if (type === 'app') {                // service 체크 dla,sns,web,adm
        reg_exp = /(\W|^)(dla|kidswell|watchdog)(\W|$)/;
    } else if (type === 'language') { // 국가 코드 확인
        reg_exp = /(\W|^)(kr|en|jp|ch|tw)(\W|$)/;
    } else if (type === 'os') { // os 확인
        reg_exp = /(\W|^)(ios|android|web)(\W|$)/;
    } else if (type === 'age_gb') { // 앱 연령 확인
        reg_exp = /(\W|^)([3456])(\W|$)/;
    } else {
        return false;
    }

    return reg_exp.test(value);
};


var calByte = function(chk_value) {
    var tmp_str = chk_value;
    var tmp_len = tmp_str.length;
    var one_chr;
    var tot_cnt = 0;

    for (var i = 0; i < tmp_len; i++) {
        one_chr = tmp_str.charAt(i);
        if (escape(one_chr).length > 4) {
            tot_cnt += 2;
        } else if (one_chr !== '\r') {
            tot_cnt++;
        }
    }
    return tot_cnt;
};

var makePassword = function(pwdLength, isSpecialChar) {
    var iteration = 0;
    var password = "";
    var randomNumber;
    if (isNull(isSpecialChar)) {
        isSpecialChar = false;
    }

    while (iteration < pwdLength) {
        randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
        if (!isSpecialChar) {
            if ((randomNumber >= 33) && (randomNumber <= 47)) {
                continue;
            }
            if ((randomNumber >= 58) && (randomNumber <= 64)) {
                continue;
            }
            if ((randomNumber >= 91) && (randomNumber <= 96)) {
                continue;
            }
            if ((randomNumber >= 123) && (randomNumber <= 126)) {
                continue;
            }
        }
        iteration++;
        password += String.fromCharCode(randomNumber);
    }

    password = password.toLowerCase();
    return password;
};

var getWeek = function(date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};


var getUnixTimestamp = function() {
    return Math.floor(new Date().getTime() / 1000);
};

var getNow = function() {
    var date = new Date();
    return date.toFormat('YYYY-MM-DD HH24:MI:SS');
};

var convertDateToDateString = function(date) {
    return date.toFormat('YYYY-MM-DD HH24:MI:SS');
};

var convertDatetimeToUnixtimestamp = function(datetime) {
    return Date.parse(datetime) / 1000;
};

var convertDatetimeToUnixtimestampLong = function(datetime) {
    return Date.parse(datetime);
};

var getFilePath = function (serverIdx) {
    //var a = global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER.HOST;
    return global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST + "/"
        + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_BEGIN.replace("/data/www/", "") + "/"
        + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_END;
};

var getFileUrlPath = function (accoutID, fileName) {
    return (!isNull(fileName)) ? global.CONFIG.SERVER_INFO.PHOTO.LOCAL_IMAGE_URL + "/"
        + ('' + accoutID).slice(-2) + "/" + ('' + accoutID).slice(-4) + "/" + accoutID + "/" + fileName : "";
};

var getClientIP = function(req) {
    if (!isNull(req.headers['x-forwarded-for'])) return req.headers['x-forwarded-for'];
    if (!isNull(req._remoteAddress)) return req._remoteAddress;
    return "0.0.0.0";
};

//var isLoggedIn = function(MYSQL_NDE_CONN, appID, os, clientUID, accountID, accessToken, callBack) {
//    MYSQL_NDE_CONN.procIsLoggedIn(appID, os, clientUID, accountID, accessToken, function(err, results) {
//		var isSuccess = false;
//		if (err) {
//			PRINT_LOG.setErrorLog("MYSQL_NDE_CONN.procIsLoggedIn, failed db, code:" + -1, err);
//		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
//			PRINT_LOG.error(__filename, "", "MYSQL_NDE_CONN.procIsLoggedIn, results is null, \t\t [ " + __filename + "]");
//		} else {
//			var row = results[0][0];
//			if (0 === Number(row.RES)) {
//				if (Number(userID) === Number(row.USER_ID)) isSuccess = true;
//			} else {
//				PRINT_LOG.error(__filename, "", "MYSQL_NDE_CONN.procIsLoggedIn, DB error : " + row.RES, ", msg:" + row.MSG);
//			}
//		}
//		callBack(isSuccess);
//	});
//};

//var isValidAllowAPP = function(MYSQL_SLP_ACCOUNT_CONN, appID, clientIdentifier, clientIP, accountID, accessToken, callBack) {
//	MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP(appID, clientIdentifier, clientIP, accountID, accessToken, function(err, results) {
//		var isSuccess = false;
//		if (err) {
//			PRINT_LOG.setErrorLog("MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, failed db, code:" + -1, err);
//		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
//			PRINT_LOG.error(__filename, "", "MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, results is null, \t\t [ " + __filename + "]");
//		} else {
//			var row = results[0][0];
//			if (0 !== Number(row.RES)) {
//				PRINT_LOG.error(__filename, "MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, DB error : " + row.CODE, row.MSG);
//			} else {
//				isSuccess = 1 === Number(row.IS_ALLOW_APP);
//			}
//		}
//		callBack(isSuccess);
//	});
//};

// EX Token Create
//var isAddExtToken = function (MYSQL_SLP_ACCOUNT_CONN, appID, encUserID, tradeID, extPdtID, clientIP, signUpPath, callBack) {
//    MYSQL_SLP_ACCOUNT_CONN.procTokenAdd(appID, encUserID, tradeID, extPdtID, clientIP, signUpPath, function (err, results) {
//        if (err) {
//            PRINT_LOG.setErrorLog("MYSQL_SLP_ACCOUNT_CONN.procTokenAdd, failed db, code:" + -1, err);
//        } else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
//            PRINT_LOG.error(__filename, "", "MYSQL_SLP_ACCOUNT_CONN.procTokenAdd, results is null, \t\t [ " + __filename + "]");
//        } else {
//            var row = results[0][0];
//            if (0 !== Number(row.RES)) {
//                PRINT_LOG.error(__filename, "MYSQL_SLP_ACCOUNT_CONN.procTokenAdd, DB error : " + row.CODE, row.MSG);
//            }
//        }
//        callBack(row);
//    });
//};

//var isAddCheckLog = function (MYSQL_SLP_KW_ACTION_LOG_CONN, path, headers, body, resultStr, callBack) {
//    MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog(path, headers, body, resultStr, function (err, results) {
//        var isSuccess = false;
//        if (err) {
//            PRINT_LOG.setErrorLog("MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, failed db, code:" + -1, err);
//        } else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
//            PRINT_LOG.error(__filename, "", "MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, results is null, \t\t [ " + __filename + "]");
//        } else {
//            var row = results[0][0];
//            if (0 !== Number(row.RES)) {
//                PRINT_LOG.error(__filename, "MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, DB error : " + row.CODE, row.MSG);
//            } else {
//                isSuccess = 1;
//            }
//        }
//        callBack(isSuccess);
//    });
//};

var isValidEmail = function(value) {
    return !isNull(value) && /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(value);
};

var isValidNumber = function(value) {
    if (isNull(value) || isNaN(value)) return false;
    return /^[0-9]+$/g.test(value);
};

var isValidPassword = function(value) {
    if (isNull(value)) return false;
    var len = value.length;
    return !((4 > len) || (12 < len));
};

var isValidCountry = function(value) {
    if (isNull(value)) return false;
    var len = value.length;
    if (2 !== len) return false;
    return /^[A-Za-z_]+$/g.test(value);
};

var isValidSignupPath = function(value) {
    if (isNull(value)) return false;
    return ("adb" === value) || ("facebook" === value) || ("google" === value) || ("kakao" === value) || ("jsu" === value);
};

var isValidProfileName = function(value) {
    if (isNull(value)) return false;
    var len = value.length;
    if ((2 > len) || (16 < len)) return false;
    return !(/^[~!@\#$%<>^&*\()\-=+\’]/.test(value));
};

var isValidDate = function(value) {
    return !isNull(value) && /^(19[7-9][0-9]|2\d{3})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(value);
};

var isValidGender = function(value) {
    return !isNull(value) && ("m" === value || "M" === value || "f" === value || "F" === value);
};

var isValidClientUID = function(value) {
    if (isNull(value)) return false;
    var len = value.length;
    return !((0 > len) || (64 < len));
};

var trim = function(str) {
    if (isNull(str)) return null;
    if ("string" === typeof str) return str.replace(/(^\s*)|(\s*$)/gi, "");
    return null;
};

var trimCountry = function(countryCode) {
    var trimStr = trim(countryCode);
    if (isNull(trimStr)) return null;
    if ("string" === typeof trimStr) return trimStr.toUpperCase();
    return null;
};

var isValidOS = function(str) {
    if (isNull(str)) return false;
    str = trim(str);
    return ("android" === str) || ("ios" === str) || ("web" === str);
};

var isValidAccountID = function(accountID) {
    return !(isNull(accountID) || isNaN(accountID)) && 0 < Number(accountID);
};

var isValidAccessToken = function(authToken) {
    return !isNull(authToken) && 40 === authToken.length;
};

var getMysqlRES = function(results) {
    var resData = {};
    resData.res = -9999999;
    resData.msg = "";
    resData.erroe_level = "";
    resData.erroe_code = "";
    resData.erroe_msg = "";

    if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
        resData.result = -1;
        resData.msg = " db results is null";
    } else {
        var resultsLength = results.length;
        for (var i = 0; i < resultsLength - 1; i++) {
            if (isNull(results[i][0]["RES"])) {
                if (!isNull(results[i][0]["Level"])) {
                    resData.erroe_level = results[i][0]["Level"];
                }
                if (!isNull(results[i][0]["Code"])) {
                    resData.erroe_code = results[i][0]["Code"];
                }
                if (!isNull(results[i][0]["Message"])) {
                    resData.erroe_msg = results[i][0]["Message"];
                }
            } else {
                resData.res = Number(results[i][0]["RES"]);
                if (0 !== resData.res) {
                    resData.msg = results[i][0]["MSG"];
                }
            }
        }
    }
    resData.msg = resData.msg + ", SHOW ERRORS " + resData.erroe_level + ", " + resData.erroe_code + ", " + resData.erroe_msg;
    return resData;
};

var isValidPackageID = function(store, packageID) {
    if (isNull(store) || isNull(packageID) || isNaN(packageID)) return false;
    packageID = Number(packageID);
    var len = global.SHOP_PACKAGE_LIST.length;
    for (var i = 0; i < len; i++) {
        if ((store === global.SHOP_PACKAGE_LIST[i].STORE) && (packageID === global.SHOP_PACKAGE_LIST[i].PACKAGE_ID) && (0 !== global.SHOP_PACKAGE_LIST[i].STATE)) {
            return true;
        }
    }
    return false;
};

var isValidStore = function(store) {
    return !isNull(store) && (("google" === store) || ("apple" === store));
};


var isValidBuild = function(build) {
    return !isNull(build) && (("google" === build) || ("apple" === build));
};

var isValidMedalID = function(medalID) {
    if (isNull(medalID) || isNaN(medalID)) return false;
    medalID = Number(medalID);
    return !isNull(global.XML_MEDAL_MAP.get(medalID));
};

var isValidPlaytime = function(playTime) {
    return !(isNull(playTime) || isNaN(playTime));
};

var isValidDeviceToken = function(deviceToken) {
    return !isNull(deviceToken) && !((0 >= deviceToken.length) || (256 < deviceToken.length));
};




module.exports = {
    // 유효성 체크
    isNull: isNull,						    // null 체크
    isRegExp: isRegExp,						// 정규식 체크
    calByte: calByte,						// byte 체크
    makePassword: makePassword,             // 난수 생성
    getWeek: getWeek,
    getClientIP: getClientIP,
    //isLoggedIn: isLoggedIn,
    isValidEmail: isValidEmail,
    isValidNumber: isValidNumber,
    isValidPassword: isValidPassword,
    isValidCountry: isValidCountry,
    isValidSignupPath: isValidSignupPath,
    isValidProfileName: isValidProfileName,
    isValidDate: isValidDate,
    isValidGender: isValidGender,
    isValidClientUID: isValidClientUID,
    //isValidAllowAPP: isValidAllowAPP,
    trim: trim,
    trimCountry: trimCountry,
    isValidOS: isValidOS,
    getMysqlRES: getMysqlRES,
    isValidAccountID: isValidAccountID,
    isValidAccessToken: isValidAccessToken,
    isValidPackageID: isValidPackageID,
    isValidStore: isValidStore,
    isValidBuild: isValidBuild,
    isValidPlaytime: isValidPlaytime,
    getUnixTimestamp: getUnixTimestamp,
    isValidDeviceToken: isValidDeviceToken,
    isValidMedalID: isValidMedalID,
    getNow: getNow,
    getFilePath: getFilePath,
    convertDateToDateString: convertDateToDateString,
    convertDatetimeToUnixtimestamp: convertDatetimeToUnixtimestamp,
    convertDatetimeToUnixtimestampLong: convertDatetimeToUnixtimestampLong,
    //isAddCheckLog: isAddCheckLog,
    //isAddExtToken: isAddExtToken,
    getFileUrlPath: getFileUrlPath
};
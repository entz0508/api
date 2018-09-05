var PRINT_LOG = global.PRINT_LOGGER;

var isNull = function isNull(chk_value) {
	return ("undefined" === typeof chk_value) || (null === chk_value) || (undefined === chk_value) || ("" === chk_value);
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
	} else if (type === "password") { // 비밀번호 (특수기호 제외하고 7~21)
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

var getClientIP = function(req) {
	var ip = req.headers['x-forwarded-for'] || req._remoteAddress || "0.0.0.0";
	return 15 < ip.length ? ip.substring(0, 14) : ip;
};



var isAddCheckLog = function (MYSQL_SLP_KW_ACTION_LOG_CONN, path, headers, body, resultStr, callBack) {
    MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog(path, headers, body, resultStr, function (err, results) {
        var isSuccess = false;
        if (err) {
            PRINT_LOG.setErrorLog("MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, failed db, code:" + -1, err);
        } else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
            PRINT_LOG.error(__filename, "", "MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, results is null, \t\t [ " + __filename + "]");
        } else {
            var row = results[0][0];
            if (0 !== Number(row.RES)) {
                PRINT_LOG.error(__filename, "MYSQL_SLP_KW_ACTION_LOG_CONN.procAddCheckLog, DB error : " + row.CODE, row.MSG);
            } else {
                isSuccess = 1;
            }
        }
        callBack(isSuccess);
    });
};

var isAuthAppID = function(MYSQL_SLP_PLATFORM_CONN, appID, appAuthToken, clientIP, callBack) {
	MYSQL_SLP_PLATFORM_CONN.procAuthAppID(appID, appAuthToken, clientIP, function(err, results) {
		var isAuth = false;
		var resData = {};
		resData.err = null;
		resData.isSuccess = false;
		resData.isAuth = 0;
		resData.code = "";
		resData.msg = "";
		if (err) {
			resData.err = err;
			resData.code = "S999";
			resData.msg = "MYSQL_SLP_PLATFORM_CONN.procAuthAppID, failed db";
			PRINT_LOG.setErrorLog(resData.msg, err);
		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
			resData.msg = "MYSQL_SLP_PLATFORM_CONN.procAuthAppID, results is null, \t\t [ " + __filename + "]";
			PRINT_LOG.error(__filename, "RESULT is Null", resData.msg);
		} else {
			var row = results[0][0];
			if (0 !== Number(row.RES)) {
				resData.code = row.CODE;
				resData.msg = row.MSG;
				PRINT_LOG.error(__filename, "DB error : " + resData.code, resData.msg);
			} else {
				resData.isSuccess = true;
				resData.isAuth = Number(row.IS_AUTH);
				if (1 === Number(row.IS_AUTH)) {
					isAuth = true;
				}
			}
		}
		callBack(isAuth);
	});
};

var isLoginUserAccountWithoutProfile = function(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, accountID, accessToken, callBack) {
	MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccount(appID, clientUID, accountID, accessToken, function(err, results) {
		var isSuccess = false;
		if (err) {
			PRINT_LOG.setErrorLog("MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccount, failed db, code:" + -1, err);
		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
			PRINT_LOG.error(__filename, "RESULT is Null", "MYSQL_SLP_ACCOUNT_CONN.procAuthAppID, results is null, \t\t [ " + __filename + "]");
		} else {
			var row = results[0][0];
			if (0 !== Number(row.RES)) {
				PRINT_LOG.error(__filename, "MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccount, DB error : " + row.CODE, row.MSG);
			} else {
				isSuccess = 1 === Number(row.IS_LOGIN);
			}
		}
		callBack(isSuccess);
	});
};

var isLoginUserAccountWithProfile = function(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, accountID, accessToken, profileID, callBack) {
	MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccountWithProfileID(appID, clientUID, accountID, accessToken, profileID, function(err, results) {
		var isSuccess = false;
		if (err) {
			PRINT_LOG.setErrorLog("MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccountWithProfileID, failed db, code:" + -1, err);
		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
			PRINT_LOG.error(__filename, "RESULT is Null", "MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccountWithProfileID, results is null, \t\t [ " + __filename + "]");
		} else {
			var row = results[0][0];
			if (0 !== Number(row.RES)) {
				PRINT_LOG.error(__filename, "MYSQL_SLP_ACCOUNT_CONN.procIsLoginUserAccountWithProfileID, DB error : " + row.CODE, row.MSG);
			} else {
				isSuccess = 1 === Number(row.IS_LOGIN);
			}
		}
		callBack(isSuccess);
	});
};

var isAllowAPP = function(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, clientIP, accountID, accessToken, callBack) {
	MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP(appID, clientUID, clientIP, accountID, accessToken, function(err, results) {
		var isSuccess = false;
		if (err) {
			PRINT_LOG.setErrorLog("MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, failed db, code:" + -1, err);
		} else if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
			PRINT_LOG.error(__filename, "RESULT is Null", "MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, results is null, \t\t [ " + __filename + "]");
		} else {
			var row = results[0][0];
			if (0 !== Number(row.RES)) {
				PRINT_LOG.error(__filename, "MYSQL_SLP_ACCOUNT_CONN.procIsAllowAPP, DB error : " + row.CODE, row.MSG);
			} else {
				isSuccess = 1 === Number(row.IS_ALLOW_APP);
			}
		}
		callBack(isSuccess);
	});
};

var isEmail = function(value) {
	return !isNull(value) && /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(value);
};

var isEmailNDE = function (value) {
    //return !isNull(value) && /^[A-Z0-9]+[A-Z0-9]{127,127}$/g.test(value);
    return true;
};

var isNumber = function(value) {
	return !(isNull(value) || isNaN(value)) && /^[0-9]+$/g.test(value);
};

var isValidAccountID = function(value) {
	return !!isNumber(value) && 0 < Number(value);
};

var isValidProfileID = function(value) {
	return isValidAccountID(value);
};

var isValidLimitTime = function(value) {
	return !(isNull(value) || isNaN(value)) && !((0 > value) || (180 < value));
};


var isValidPassword = function(value) {
	if (isNull(value)) return false;
	var len = value.length;
	return !((6 > len) || (120 < len));
};

var isValidCountry = function(value) {
	if (isNull(value)) return false;
	var len = value.length;
	return !(2 !== len) && /^[A-Za-z_]+$/g.test(value);
};

var isValidSignupPath = function(value) {
	return !isNull(value) && ("slp" === value) || ("facebook" === value) || ("google" === value) || ("ebs" === value);
    // return !isNull(value) && ("slp" === value) || ("facebook" === value) || ("google" === value) || ("kakao" === value);
};

var isValidProfileName = function(value) {
	if (isNull(value)) return false;
	var len = value.length;
	return !((1 > len) || (32 < len)) && !/^[~!@\#$%<>^&*\()\-=+\’]/.test(value);
};


var isValidChildBirthday = function(value) {
	return !isNull(value) && /^(20[0-9][0-9]|2\d{3})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(value);
};

var isValidGender = function(value) {
	return !isNull(value) && "m" === value || "M" === value || "f" === value || "F" === value;
};

var isValidClientUID = function(value) {
	if (isNull(value)) return false;
	var len = value.length;
	return !((0 > len) || (64 < len));
};

var isValidAccessToken = function(value) {
	return !isNull(value);
};

var isValidOS = function(value) {
	return !isNull(value) && ("android" === value) || ("ios" === value) || ("web" === value);
};

var isValidAppID = function (appID) {
    if (isNull(appID) || isNaN(appID)) {
        PRINT_LOG.debug("sdla", "commom.js", "No AppID");
        return false;
    }
    for (var i = 0, len = global.CONFIG.SERVER_INFO.APP_ID.length; i < len; i++) {
        if (Number(appID) === Number(global.CONFIG.SERVER_INFO.APP_ID[i])) return true;
    }
    return false;
};

var trim = function(str) {
	return isNull(str) ? null : str.replace(/(^\s*)|(\s*$)/gi, "");
};

var getMysqlRES = function(results) {
	var resData = {};
	resData.res = -9999999;
	resData.err_code = -9999999;
	resData.msg = "";
	resData.erroe_level = "";
	resData.erroe_code = "";
	resData.erroe_msg = "";
	
	if (isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
		resData.res = -1;
		resData.msg = " db results is null";
	} else {
		var resultsLength = results.length;
		for (var i = 0; i < resultsLength - 1; i++) {
			if (isNull(results[i][0].RES)) {
				if (!isNull(results[i][0].Level)) {
					resData.erroe_level = results[i][0].Level;
				}
				if (!isNull(results[i][0].Code)) {
					resData.erroe_code = results[i][0].Code;
				}
				if (!isNull(results[i][0].Message)) {
					resData.erroe_msg = results[i][0].Message;
				}
			} else {
				resData.res = Number(results[i][0].RES);
				if (0 !== resData.res) {
					resData.msg = results[i][0].MSG;
					resData.err_code = Number(results[i][0].ERR_CODE);
				}
			}
		}
	}
	resData.msg = resData.msg + ", SHOW ERRORS " + resData.erroe_level + ", " + resData.erroe_code + ", " + resData.erroe_msg;
	return resData;
};

var convertImgThURL = function(imgURL) {
	if (isNull(imgURL) || (0 >= imgURL.length)) {
		return "";
	} else {
		var imgThURL = imgURL.replace(".", "_th.");
		if (isNull(imgThURL) || (0 >= imgThURL.length)) {
			return "";
		} else {
			return imgThURL;
		}
	}
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

var getPhotosPath = function(serverIdx) {
	//var a = global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER.HOST;
	return global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST + "/"
		+ global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_BEGIN.replace("/data/www/", "") + "/"
		+ global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_END;
};

var getUniqueCode = function(length) {
	var returnVal = "";
	for (var i = 0; i < length; i++) {
		returnVal += "abcdefghijklmnopqrstuvwxyz1234567890".substr(Math.floor(Math.random() * 36), 1);
	}
	return returnVal;
};

module.exports = {
	// 유효성 체크
	isNull: isNull,						// null 체크
	isRegExp: isRegExp,						// 정규식 체크
	makePassword: makePassword,                        // 난수 생성
	getWeek: getWeek,
	getClientIP: getClientIP,
	isAuthAppID: isAuthAppID,
	isLoginUserAccountWithoutProfile: isLoginUserAccountWithoutProfile,
	isLoginUserAccountWithProfile: isLoginUserAccountWithProfile,
    isEmail: isEmail,
    isEmailNDE: isEmailNDE,
	isNumber: isNumber,
	isValidPassword: isValidPassword,
	isValidCountry: isValidCountry,
	isValidSignupPath: isValidSignupPath,
	isValidProfileName: isValidProfileName,
	isValidChildBirthday: isValidChildBirthday,
	isValidGender: isValidGender,
	isValidClientUID: isValidClientUID,
	isValidAccessToken: isValidAccessToken,
	isValidAllowAPP: isAllowAPP,
	isValidAccountID: isValidAccountID,
	isValidOS: isValidOS,
	trim: trim,
	getMysqlRES: getMysqlRES,
	isValidProfileID: isValidProfileID,
	convertImgThURL: convertImgThURL,
	getNow: getNow,
	getUnixTimestamp: getUnixTimestamp,
	convertDateToDateString: convertDateToDateString,
	convertDatetimeToUnixtimestamp: convertDatetimeToUnixtimestamp,
	convertDatetimeToUnixtimestampLong: convertDatetimeToUnixtimestampLong,
	getPhotosPath: getPhotosPath,
	getUniqueCode: getUniqueCode,
    isValidLimitTime: isValidLimitTime,
    isAddCheckLog: isAddCheckLog
};
const PRINT_LOG = global.PRINT_LOGGER;

var isNull = function isNull(chk_value) {
    return (typeof chk_value === "undefined") || (null === chk_value) || (undefined === chk_value) || ("" === chk_value);
};

var isRegExp = function isRegExp(type, value) {
    if (isNull(value)) return false;

    var reg_exp = '';
    if (type === 'lower_case') {                    // ¼Ò¹®ÀÚ
        reg_exp = /^[a-z]+$/g;
    } else if (type === 'upper_case') {             // ´ë¹®ÀÚ
        reg_exp = /^[A-Z]+$/g;
    } else if (type === 'alphabet') {               // ¿µ¹®ÀÚ
        reg_exp = /^[A-Za-z]+$/g;
    } else if (type === 'number') {                 // ¼ýÀÚ
        reg_exp = /^[0-9]+$/g;
    } else if (type === 'email') {                  // ÀÌ¸ÞÀÏ
        reg_exp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
    } else if (type === 'handphone') {              // ÇÚµåÆù¹øÈ£ - ±¹³»Àü¿ë(ÇØ¿Ü´Â È®ÀÎ ÇÊ¿ä)
        reg_exp = /^01\d{1}-\d{3,4}-\d{4}$/;
    } else if (type === 'telephone') {              // ÀÏ¹Ý¹øÈ£
        reg_exp = /^\d{3}-\d{3,4}-\d{4}$/;
    } else if (type === 'password') {               // ºñ¹Ð¹øÈ£ (Æ¯¼ö±âÈ£ Á¦¿ÜÇÏ°í 7~21)
        reg_exp = /^[a-zA-Z0-9_]+$/g;
    } else if (type === 'first_name') {             // ÀÌ¸§ (50ÀÚ ÀÌÇÏ)
        reg_exp = /^([°¡-ÆRa-zA-Z_]{1,50})$/;
    } else if (type === 'last_name') {              // ¼º (10ÀÚ ÀÌÇÏ)
        reg_exp = /^([°¡-ÆRa-zA-Z_]{1,10})$/;
    } else if (type === 'nick_name') {              // ¼º (10ÀÚ ÀÌÇÏ)
        reg_exp = /^([°¡-ÆRa-zA-Z0-9_]{1,10})$/;
    } else if (type === 'birth') {                  // »ýÀÏÇü½Ä
        reg_exp = /^[0-9]{8}$/;
    } else if (type === 'alphabet_number') {        // ¿µ¹®°ú ¼ýÀÚ¸¸
        reg_exp = /^[A-Za-z0-9_]+$/g;
    } else if (type === 'app') {                    // service Ã¼Å© dla,sns,web,adm
        reg_exp = /(\W|^)(dla|kidswell|watchdog)(\W|$)/;
    } else if (type === 'language') {               // ±¹°¡ ÄÚµå È®ÀÎ
        reg_exp = /(\W|^)(kr|en|jp|ch|tw)(\W|$)/;
    } else if (type === 'os') {                     // os È®ÀÎ
        reg_exp = /(\W|^)(ios|android|web)(\W|$)/;
    } else if (type === 'age_gb') {                 // ¾Û ¿¬·É È®ÀÎ
        reg_exp = /(\W|^)([3456])(\W|$)/;
    } else {
        return false;
    }

    return reg_exp.test(value);
};


var calByte = function (chk_value) {
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

var makePassword = function (pwdLength, isSpecialChar) {
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

var getWeek = function (date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};


var getUnixTimestamp = function () {
    return Math.floor(new Date().getTime() / 1000);
};

var getNow = function () {
    var date = new Date();
    return date.toFormat('YYYY-MM-DD HH24:MI:SS');
};

var convertDateToDateString = function (date) {
    return date.toFormat('YYYY-MM-DD HH24:MI:SS');
};

var convertDatetimeToUnixtimestamp = function (datetime) {
    return Date.parse(datetime) / 1000;
};

var convertDatetimeToUnixtimestampLong = function (datetime) {
    return Date.parse(datetime);
};

var getFilePath = function (serverIdx) {
    return global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST + "/"
        + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_BEGIN.replace("/data/www/", "") + "/"
        + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_END;
};

var getFileUrlPath = function (accoutID, fileName) {
    return (!isNull(fileName)) ? global.CONFIG.SERVER_INFO.PHOTO.LOCAL_IMAGE_URL + "/"
        + ('' + accoutID).slice(-2) + "/" + ('' + accoutID).slice(-4) + "/" + accoutID + "/" + fileName : "";
};

var getClientIP = function (req) {
    if (!isNull(req.headers['x-forwarded-for'])) return req.headers['x-forwarded-for'];
    if (!isNull(req._remoteAddress)) return req._remoteAddress;
    return "0.0.0.0";
};

var isValidEmail = function (value) {
    return !isNull(value) && /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/.test(value);
};

var isValidNumber = function (value) {
    if (isNull(value) || isNaN(value)) return false;
    return /^[0-9]+$/g.test(value);
};

var isValidPassword = function (value) {
    if (isNull(value)) return false;
    var len = value.length;
    return !((4 > len) || (12 < len));
};

var isValidCountry = function (value) {
    if (isNull(value)) return false;
    var len = value.length;
    if (2 !== len) return false;
    return /^[A-Za-z_]+$/g.test(value);
};

var isValidSignupPath = function (value) {
    if (isNull(value)) return false;
    return ("adb" === value) || ("facebook" === value) || ("google" === value) || ("kakao" === value);
};

var isValidProfileName = function (value) {
    if (isNull(value)) return false;
    var len = value.length;
    if ((2 > len) || (16 < len)) return false;
    return !(/^[~!@\#$%<>^&*\()\-=+\¡¯]/.test(value));
};

var isValidDate = function (value) {
    return !isNull(value) && /^(19[7-9][0-9]|2\d{3})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(value);
};

var isValidGender = function (value) {
    return !isNull(value) && ("m" === value || "M" === value || "f" === value || "F" === value);
};

var isValidClientUID = function (value) {
    if (isNull(value)) return false;
    var len = value.length;
    return !((0 > len) || (64 < len));
};

var trim = function (str) {
    if (isNull(str)) return null;
    if ("string" === typeof str) return str.replace(/(^\s*)|(\s*$)/gi, "");
    return null;
};

var trimCountry = function (countryCode) {
    var trimStr = trim(countryCode);
    if (isNull(trimStr)) return null;
    if ("string" === typeof trimStr) return trimStr.toUpperCase();
    return null;
};

var isValidOS = function (str) {
    if (isNull(str)) return false;
    str = trim(str);
    return ("android" === str) || ("ios" === str) || ("web" === str);
};

var isValidAccountID = function (accountID) {
    return !(isNull(accountID) || isNaN(accountID)) && 0 < Number(accountID);
};

var isValidAccessToken = function (authToken) {
    return !isNull(authToken) && 40 === authToken.length;
};

var getMysqlRES = function (results) {
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

var isValidPackageID = function (store, packageID) {
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

var isValidStore = function (store) {
    return !isNull(store) && (("google" === store) || ("apple" === store));
};


var isValidBuild = function (build) {
    return !isNull(build) && (("google" === build) || ("apple" === build));
};

var isValidMedalID = function (medalID) {
    if (isNull(medalID) || isNaN(medalID)) return false;
    medalID = Number(medalID);
    return !isNull(global.XML_MEDAL_MAP.get(medalID));
};

var isValidPlaytime = function (playTime) {
    return !(isNull(playTime) || isNaN(playTime));
};

var isValidDeviceToken = function (deviceToken) {
    return !isNull(deviceToken) && !((0 >= deviceToken.length) || (256 < deviceToken.length));
};




module.exports = {
    isNull: isNull,						    // null Ã¼Å©
    isRegExp: isRegExp,						// Á¤±Ô½Ä Ã¼Å©
    calByte: calByte,						// byte Ã¼Å©
    makePassword: makePassword,             // ³­¼ö »ý¼º
    getWeek: getWeek,
    getClientIP: getClientIP,
    isValidEmail: isValidEmail,
    isValidNumber: isValidNumber,
    isValidPassword: isValidPassword,
    isValidCountry: isValidCountry,
    isValidSignupPath: isValidSignupPath,
    isValidProfileName: isValidProfileName,
    isValidDate: isValidDate,
    isValidGender: isValidGender,
    isValidClientUID: isValidClientUID,
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
    getFileUrlPath: getFileUrlPath
};
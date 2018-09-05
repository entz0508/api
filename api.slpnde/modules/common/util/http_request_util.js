const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const PRINT_LOG = global.PRINT_LOGGER;
var request = require("request");

var makeURL = function(baseURL, targetPath, targetPort) {
	if (443 === Number(targetPort)) return "https://" + baseURL + "/" + targetPath;
	if (80 === Number(targetPort)) return "http://" + baseURL + "/" + targetPath;
	return "http://" + baseURL + ":" + Number(targetPort) + "/" + targetPath;
};

module.exports = {
	httpIsLoggedInAccountWithProfile: function(appID, clientUID, accountID, accessToken, slpProfileID, callBack) {
		(function(appID, clientUID, accountID, accessToken, slpProfileID, callBack) {
			var url = makeURL(global.CONFIG.SLP_PLATFORM.URL, global.CONFIG.SLP_PLATFORM.PATH_IS_AUTH_SLP_ACCOUNT_WITH_PROFILE, Number(global.CONFIG.SLP_PLATFORM.PORT));
			
			request({
				uri: url,
				method: "POST",
				form: {
					app_id: Number(appID),
					client_uid: clientUID,
					account_id: accountID,
					access_token: accessToken,
					pf_id: slpProfileID
				}
			}, function(error, response, body) {
				var errObj = null;
				var responseJson = {};
				
				if (error) {
					PRINT_LOG.setErrorLog(__filename + "isLoggedInSlpAccountWithProfile, error request, url:" + url, error);
					return callBack(error, responseJson);
				}
				
				responseJson.url = url;
				if (COMMON_UTIL.isNull(body)) {
					responseJson.res = ERROR_CODE_UTIL.RES_FAILED_HTTP_REQUEST;
					responseJson.msg = "http response body is null";
				} else {
					try {
						responseJson = JSON.parse(body);
					} catch (exception) {
						errObj = exception;
						PRINT_LOG.info(__filename, "", body);
						responseJson = null;
					}
				}
				callBack(errObj, responseJson);
			});
		})(appID, clientUID, accountID, accessToken, slpProfileID, function(err, httpResponseJson) {
			var resData = { res: -1, isLoggedIn: false, isKidswattsAppLoggedIn: false };
			if (err) {
				resData.msg = " error, http request, isLoggedInSlpAccountWithProfile, " + __filename;
			} else {
				resData.res = Number(httpResponseJson.res);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== resData.res) {
					resData.msg = httpResponseJson.msg;
				} else {
					resData.isLoggedIn = 1 === Number(httpResponseJson.is_logged_in);
					resData.isKidswattsAppLoggedIn = 1 === Number(httpResponseJson.is_kidswatts_app_logged_in);
				}
			}
			callBack(err, resData);
		});
	},
	httpIsLoggedInAccountWithoutProfile: function(appID, clientUID, accountID, accessToken, callBack) {
		(function(appID, clientUID, accountID, accessToken, callBack) {
			var url = makeURL(global.CONFIG.SLP_PLATFORM.URL, global.CONFIG.SLP_PLATFORM.PATH_IS_AUTH_SLP_ACCOUNT_WITHOUT_PROFILE, Number(global.CONFIG.SLP_PLATFORM.PORT));
			
			request({
				uri: url,
				method: "POST",
				form: {
					app_id: Number(appID),
					client_uid: clientUID,
					account_id: accountID,
					access_token: accessToken
				}
			}, function(error, response, body) {
				if (error) {
					PRINT_LOG.setErrorLog(__filename + "isLoggedInSlpAccountWithoutProfile, error request, url:" + url, error);
					return callBack(error, null);
				}
				var errObj = null;
				var responseJson = {};
				if (COMMON_UTIL.isNull(body)) {
					responseJson.res = ERROR_CODE_UTIL.RES_FAILED_HTTP_REQUEST;
					responseJson.msg = "http response body is null";
				} else {
					try {
						responseJson = JSON.parse(body);
					} catch (exception) {
						errObj = exception;
						PRINT_LOG.info(__filename, "", body);
						responseJson = null;
					}
				}
				callBack(errObj, responseJson);
			});
		})(appID, clientUID, accountID, accessToken, function(err, httpResponseJson) {
			var resData = { res: -1, isLoggedIn: false, isKidswattsAppLoggedIn: false };
			if (err) {
				resData.msg = " error, http request, isLoggedInSlpAccountWithoutProfile, [" + httpResponseJson.url + "], " + __filename;
			} else {
				resData.res = Number(httpResponseJson.res);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== resData.res) {
					resData.msg = httpResponseJson.msg;
				} else {
					resData.isLoggedIn = 1 === Number(httpResponseJson.is_logged_in);
					resData.isKidswattsAppLoggedIn = 1 === Number(httpResponseJson.is_kidswatts_app_logged_in);
				}
			}
			callBack(err, resData);
		});
	},
    httpIsLoggedInAccountWithSeqID: function(appID, clientUID, accountID, accessToken, seqID, callBack) {
        (function(appID, clientUID, accountID, accessToken, seqID, callBack) {
            var url = makeURL(global.CONFIG.SLP_PLATFORM.URL, global.CONFIG.SLP_PLATFORM.PATH_IS_AUTH_SLP_ACCOUNT_WITHOUT_PROFILE, Number(global.CONFIG.SLP_PLATFORM.PORT));

            request({
                uri: url,
                method: "POST",
                form: {
                    app_id: Number(appID),
                    client_uid: clientUID,
                    account_id: accountID,
                    access_token: accessToken,
					seq_id: seqID
                }
            }, function(error, response, body) {
                var errObj = null;
                var responseJson = {};

                if (error) {
                    PRINT_LOG.setErrorLog(__filename + "isLoggedInSlpAccountWithSEQID, error request, url:" + url, error);
                    return callBack(error, responseJson);
                }

                responseJson.url = url;
                if (COMMON_UTIL.isNull(body)) {
                    responseJson.res = ERROR_CODE_UTIL.RES_FAILED_HTTP_REQUEST;
                    responseJson.msg = "http response body is null";
                } else {
                    try {
                        responseJson = JSON.parse(body);
                    } catch (exception) {
                        errObj = exception;
                        PRINT_LOG.info(__filename, "", body);
                        responseJson = null;
                    }
                }
                callBack(errObj, responseJson);
            });
        })(appID, clientUID, accountID, accessToken, seqID, function(err, httpResponseJson) {
            var resData = { res: -1, isLoggedIn: false, isKidswattsAppLoggedIn: false };
            if (err) {
                resData.msg = " error, http request, isLoggedInSlpAccountWithProfile, " + __filename;
            } else {
                resData.res = Number(httpResponseJson.res);
                if (ERROR_CODE_UTIL.RES_SUCCESS !== resData.res) {
                    resData.msg = httpResponseJson.msg;
                } else {
                    resData.isLoggedIn = 1 === Number(httpResponseJson.is_logged_in);
                    resData.isKidswattsAppLoggedIn = 1 === Number(httpResponseJson.is_kidswatts_app_logged_in);
                }
            }
            callBack(err, resData);
        });
    }
};
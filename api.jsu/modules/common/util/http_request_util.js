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
    httpIsLoggedInAccount: function(clientUID, accessToken, callBack) {
        (function (clientUID, accessToken, callBack) {
            var url = makeURL(global.CONFIG.ADB_PLATFORM.URL, global.CONFIG.ADB_PLATFORM.PATH_IS_AUTH_ACCOUNT, Number(global.CONFIG.ADB_PLATFORM.PORT));
            request({
                uri: url,
                method: "POST",
                form: {
                    client_uid: clientUID,
                    access_token: accessToken
                }
            }, function(error, response, body) {
                if (error) {
                    PRINT_LOG.setErrorLog(__filename + "isLoggedInADBAccount, error request, url:" + url, error);
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
                        responseJson = null;
                    }
                }

                callBack(errObj, responseJson);
            });
        })(clientUID, accessToken, function (err, httpResponseJson) {
            var resData = { res: -1, isLoggedIn: false };
            if (err) {
                resData.msg = " error, http request, isLoggedInADBAccount, [" + httpResponseJson.url + "], " + __filename;
            } else {
                resData.res = Number(httpResponseJson.res);

                if (ERROR_CODE_UTIL.RES_SUCCESS !== resData.res) {
                    resData.msg = httpResponseJson.msg;
                } else {
                    resData.isLoggedIn = 1 === Number(httpResponseJson.data.is_logged_in);
                    resData.isAccountID = httpResponseJson.data.is_accountID;

                    //resData.isKidswattsAppLoggedIn = 1 === Number(httpResponseJson.is_kidswatts_app_logged_in);
                }
            }
            callBack(err, resData);
        });
    }
};
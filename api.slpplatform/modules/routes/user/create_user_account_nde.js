/**
 * Created by kkuris on 2017-10-18.
 */
// nodejs npm
const CRYPTO = require("crypto");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

exports.add_routes = function(app) {
    app.post("/slp.user.account.nde.create", ROUTE_MIDDLEWARE.AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        try {
            var CLIENT_IP = COMMON_UTIL.getClientIP(req);
            var clientUID = ""; //COMMON_UTIL.trim(req.body.client_uid);
            var appID = COMMON_UTIL.trim(req.body.app_id);
            var accountEmail = COMMON_UTIL.trim(req.body.email);
            var accountCountry = COMMON_UTIL.trim(req.body.country);
            var signUpPath = COMMON_UTIL.trim(req.body.signup_path);
            var profileName = "guest"; // req.body.pf_name;
            var profileBirthday = "2015-01-01"; // req.body.pf_birthday;
            var profileGender = "m"; // req.body.pf_gender;

            if (!COMMON_UTIL.isNumber(appID) || !COMMON_UTIL.isEmail(accountEmail) || !COMMON_UTIL.isValidCountry(accountCountry) ||
                !COMMON_UTIL.isValidSignupPath(signUpPath) || !COMMON_UTIL.isValidProfileName(profileName) ||
                !COMMON_UTIL.isValidChildBirthday(profileBirthday) || !COMMON_UTIL.isValidGender(profileGender)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            }

            accountCountry = accountCountry.toUpperCase();
            MYSQL_SLP_ACCOUNT_CONN.procUserAccountCreate_nde({
                appID: appID,
                clientUID: clientUID,
                CLIENT_IP: CLIENT_IP,
                accountEmail: accountEmail,
                accountCountry: accountCountry,
                signUpPath: signUpPath,
                profileName: profileName,
                profileBirthday: profileBirthday,
                profileGender: profileGender
            }, function(err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procUserAccountCreate_nde, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }

                var retV = COMMON_UTIL.getMysqlRES(results);
                if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
                    PRINT_LOG.error(__filename, API_PATH, retV.msg);
                    return PACKET.sendFail(req, res, retV.res);
                }

                var row = results[0][0];
                PACKET.sendSuccess(req, res, { account_id: row.ACCOUNT_ID, access_token: row.ACCESS_TOKEN });

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
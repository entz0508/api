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
	var checkParams = function(API_PATH, appID, clientUID, accountID, accessToken) {
		if (!COMMON_UTIL.isNumber(appID)) {
			PRINT_LOG.error(__filename, API_PATH, " error parameter appID");
			return false;
		}
		if (!COMMON_UTIL.isValidClientUID(clientUID)) {
			PRINT_LOG.error(__filename, API_PATH, " error parameter clientUID");
			return false;
		}
		if (!COMMON_UTIL.isNumber(accountID)) {
			PRINT_LOG.error(__filename, API_PATH, " error parameter accountID");
			return false;
		}
		if (COMMON_UTIL.isNull(accessToken)) {
			PRINT_LOG.error(__filename, API_PATH, " error parameter accessToken");
			return false;
		}
		return true;
	};

	app.post("/slp.user.account.get.info", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_USER_ALLOW_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			var CLIENT_IP = COMMON_UTIL.getClientIP(req);
			var appID = COMMON_UTIL.trim(req.body.app_id);
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var accountID = COMMON_UTIL.trim(req.body.account_id);
			var accessToken = COMMON_UTIL.trim(req.body.access_token);

            PRINT_LOG.info(__filename, API_PATH, " req.body " + JSON.stringify(req.body));

			if (!checkParams(API_PATH, appID, clientUID, accountID, accessToken)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_ACCOUNT_CONN.procGetUserAccountWithProfileInfo(appID, clientUID, CLIENT_IP, accountID, accessToken, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procUserAccountLogin, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}

				var result = results[0][0];
				var responseObj = {
					email: result.EMAIL,
					account_id: result.ACCOUNT_ID,
					is_allow_app: result.IS_ALLOW_APP,
					access_token: result.ACCESS_TOKEN,
					country: result.COUNTRY,
					cur_pf_id: result.CUR_PROFILE_ID,
					star: result.STAR_POINT,
					login_type: result.LOGIN_TYPE,
					pf_list: []
				};

				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];

					var profile = {
						pf_id: row.PROFILE_ID,
						name: row.NAME,
						birthday: row.BIRTHDAY,
						gender: row.GENDER,
						limit_time: row.LIMIT_TIME
					};

					var path = COMMON_UTIL.getPhotosPath(0) + accountID + "/" + profile.pf_id + "/";
					var imgURL = row.IMG_FILE_NAME;
					if (COMMON_UTIL.isNull(imgURL)) {
						imgURL = "";
						profile.img_url = "";
					} else {
						profile.img_url = path + imgURL;
					}

					var imgThURL = row.IMG_TH_FILE_NAME;
					if (COMMON_UTIL.isNull(imgThURL)) {
						imgThURL = "";
						profile.img_th_url = "";
					} else {
						profile.img_th_url = path + imgThURL;
					}
					profile.hidden = "y" === row.HIDDEN ? 1 : 0;
					responseObj.pf_list.push(profile);
				}
				PACKET.sendSuccess(req, res, responseObj);
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
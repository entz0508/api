// common
const ROUTE_MIDDLEWARE = require('../../common/util/route_middleware.js');
const PACKET = require('../../common/util/packet_sender.js');
const COMMON_UTIL = require('../../common/util/common.js');
const ERROR_CODE_UTIL = require('../../common/util/error_code_util.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;


/*----------------------------------------------------------------
 | < action_type >
 |   ep_start : ���Ǽҵ� ����
 |   ep_end   : ���Ǽҵ� �ߴ�
 |   ch_start : ���Ǽҵ� �Ϸ�
 |   ch_end   : ���Ǽҵ� �Ϸ�
 |   ep_end   : ���Ǽҵ� �Ϸ�
 |   app_bg   : APP Foreground to Background �� ��ȯ
 |   app_fg   : APP Background to Foreground �� ��ȯ
 |   ping     : ping 5�п� �ѹ��� Ŭ���̾�Ʈ�� APP ���������� ������ �˸�.
 ----------------------------------------------------------------*/

exports.add_routes = function(app) {
	var checkParams = function(requestParams) {
		requestParams.isSuccess = false;
		if (!COMMON_UTIL.isValidAppID(requestParams.appID)
			|| !COMMON_UTIL.isValidClientUID(requestParams.clientUID)
			|| !COMMON_UTIL.isValidAccountID(requestParams.accountID)
			|| !COMMON_UTIL.isValidActionType(requestParams.actionType)
			|| !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)
		// || !COMMON_UTIL.isValidCounrtyCodeAlpha2(requestParams.countryCode)
		) {
			PRINT_LOG.debug("", "", "param err 1");
			return requestParams;
		}
		if (COMMON_UTIL.ACTION_TYPE_EPISODE_START === requestParams.actionType) {
			if (!COMMON_UTIL.isValidEpisodeID(requestParams.episodeID)) {
				PRINT_LOG.debug("", "", "param err 2");
			} else {
				requestParams.isSuccess = true;
				requestParams.chpter = 0;
				requestParams.playTime = 0;
			}
		} else if (COMMON_UTIL.ACTION_TYPE_EPISODE_END === requestParams.actionType) {
			if (!COMMON_UTIL.isValidEpisodeID(requestParams.episodeID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
				PRINT_LOG.debug("", "", "param err 3");
			} else {
				requestParams.isSuccess = true;
				requestParams.chpter = 0;
			}
		} else if (COMMON_UTIL.ACTION_TYPE_EPISODE_EXIT === requestParams.actionType) {
			if (!COMMON_UTIL.isValidEpisodeID(requestParams.episodeID) || !COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
				PRINT_LOG.debug("", "", "param err 4");
			} else {
				requestParams.isSuccess = true;
				requestParams.chpter = 0;
			}
		} else if ((COMMON_UTIL.ACTION_TYPE_APP_BACKGROUND === requestParams.actionType) ||
			(COMMON_UTIL.ACTION_TYPE_APP_FOREGROUND === requestParams.actionType)) {
			requestParams.isSuccess = true;
			if (!COMMON_UTIL.isValidEpisodeID(requestParams.episodeID)) {
				requestParams.episodeID = "";
			}
			if (!COMMON_UTIL.isValidChapter(requestParams.chapter)) {
				requestParams.chapter = 0;
			}
			if (!COMMON_UTIL.isValidPlaytime(requestParams.playTime)) {
				requestParams.playTime = 0;
			}
		} else if ((COMMON_UTIL.ACTION_TYPE_PING === requestParams.actionType)) {
			requestParams.isSuccess = true;
			requestParams.episodeID = "";
			requestParams.chapter = 0;
			requestParams.playTime = 0;
		} else {
			PRINT_LOG.debug("", "", "param err 5");
		}

		return requestParams;
	};


	app.post("/sen/action/log", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
			requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
			requestParams.os = COMMON_UTIL.trim(req.body.os);
			requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
			requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
			requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
			requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
			requestParams.accessToken = COMMON_UTIL.trim(req.body.account_access_token);
			requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
			requestParams.actionType = COMMON_UTIL.trim(req.body.action_type);
            requestParams.episodeID = COMMON_UTIL.trim(req.body.ep_id); // ep_start, ep_end Episode ID, �׿ܿ��� ������
			requestParams.chapter = 0;
            requestParams.playTime = COMMON_UTIL.trim(req.body.p_time); // ep_end �ÿ��� ��ȿ�� ���Ǽҵ� �÷��� �ð�, �д���
			requestParams.curUnixtimeStamp = COMMON_UTIL.getUnixTimestamp();
			requestParams = checkParams(requestParams);

			if (!requestParams.isSuccess) {
				PRINT_LOG.info(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
			}

			MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLog(requestParams, function(err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_KW_ACTION_LOG_CONN.procAddActionLog, faile db, error");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					if ((COMMON_UTIL.ACTION_TYPE_EPISODE_END === requestParams.actionType) && ((501000 === retV.res) || (501001 === retV.res))) {
						PRINT_LOG.error(__filename, API_PATH, " error ep_end res:" + retV.res);
						return PACKET.sendSuccess(req, res, {});
					}
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, retV.res);
				}
				PACKET.sendSuccess(req, res, {});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
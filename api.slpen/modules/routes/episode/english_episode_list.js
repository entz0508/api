// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN;
const MYSQL_SLP_COMMON_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_COMMON;

exports.add_routes = function(app) {
	app.post("/sen/episode/list", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_EN_CONN.procGetEnglishEpisodeList({
				appID: COMMON_UTIL.trim(req.body.app_id), os: COMMON_UTIL.trim(req.body.os), lang: "KO"
			}, function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_EN_CONN.procGetEnglishEpisodeList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var retV = COMMON_UTIL.getMysqlRES(results);
				if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
					PRINT_LOG.error(__filename, API_PATH, retV.msg);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.convertDbErrorCodeToResultCode(retV.res));
				}

				var ep_list = [];
				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];
					ep_list.push({ en_id: row.EN_ID, unity_code: row.UNITY_CODE, ver: row.UNITY_VER });
				}
				PACKET.sendSuccess(req, res, { ep_list: ep_list });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});

	app.post("/sen/episode/listNew", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_COMMON_CONN.procGetEpisodeList(COMMON_UTIL.trim(req.body.app_id), function(err, results) {
				if (err) {
					PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_COMMON_CONN.procGetEpisodeList", err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}
				if (COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
					PRINT_LOG.error(__filename, API_PATH, " db results is null");
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
				}

				var ep_list = [];
				for (var i = 0, len = results[0].length; i < len; i++) {
					var row = results[0][i];
					ep_list.push({ level_id: row.level_id, step_id: row.step_id, episode_id: row.episode_id });
				}
				PACKET.sendSuccess(req, res, { ep_list: ep_list });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
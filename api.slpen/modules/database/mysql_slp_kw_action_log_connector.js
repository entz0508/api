var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.HOST,
	port: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.PORT,
	user: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.USER,
	password: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.PASSWORD,
	database: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.DATABASE,
	connectionLimit: global.CONFIG.MYSQL_SLP_KW_ACTION_LOG.CONNECTION_LIMIT
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_SLP_KW_ACTION_LOG_CONN() {
		checkConnect(pool, "MYSQL_SLP_KW_ACTION_LOG_CONN.setInterval, pool.getConnection");
	}
	
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procWatchdogPing = function(callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			connection.query(" SELECT 1 AS `RES` ", function(connErr) {
				connection.release();
				callBack(connErr, !connErr);
			});
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddActionLog = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_add_action_log( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				connection.escape(requestParams.actionType) + ", " +
				connection.escape(requestParams.episodeID) + ", " +
				connection.escape(requestParams.chapter) + ", " +
				Number(requestParams.playTime) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddPingLog = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_add_ping_log( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				connection.escape(requestParams.pingType) + ", " +
				connection.escape(requestParams.p1) + ", " +
				connection.escape(requestParams.p2) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procUpdateQuiz = function(requestParams, step, quizID, quizResult, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_update_quiz( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				connection.escape(step) + ", " +
				Number(quizID) + ", " +
				Number(quizResult) + ", " +
				Number(requestParams.groupSRL) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procUpdateMedal = function(requestParams, step, medalID, status, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_update_medal( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				Number(requestParams.groupSRL) + ", " +
				connection.escape(step) + ", " +
				Number(medalID) + ", " +
				Number(status) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetMedalStatus = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_medal_status( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetQuizGroupSRL = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_quiz_group_srl( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				Number(requestParams.curUnixtimeStamp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetEpisodePlayHistory = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_episode_play_history( " + Number(requestParams.accountID) + " , " + Number(requestParams.profileID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddActionLogEnStartEnd = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_add_action_log_en_start_end( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				connection.escape(requestParams.episodeID) + ", " +
				Number(requestParams.playTime) + ", " +
				Number(requestParams.startUnixTimeStemp) + ", " +
				Number(requestParams.endUnixTimeStemp) + " ) ";
			runQS(connection, queryStr, callBack);
		});
	};
	
	return MYSQL_SLP_KW_ACTION_LOG_CONN;
};
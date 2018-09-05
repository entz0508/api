// checked by J
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

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetNDEReportOverViewComplete = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_nde_report_complete( " + Number(requestParams.profileID) + " , " + Number(requestParams.lessonID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetNDEReportOverViewInprogress = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_nde_report_inprogress( " + Number(requestParams.profileID) + " , " + Number(requestParams.lessonID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetNDEReportOverViewNotStarted = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_nde_report_notstart( " + Number(requestParams.profileID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetNDEReportOverView = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_nde_report_overview( " + Number(requestParams.profileID) + " , " + Number(requestParams.lessonID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };


	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddActionLog_nde = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_add_action_log_nde( " + Number(requestParams.appID) + ", " +
				connection.escape(requestParams.os) + ", " +
				connection.escape(requestParams.clientUID) + ", " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + ", " +
				connection.escape(requestParams.actionType) + ", " +
				connection.escape(requestParams.episodeID) + ", " +
                // connection.escape(requestParams.unitID) + ", " +
                connection.escape(requestParams.lessonID) + ", " +
                // connection.escape(requestParams.levelID) + ", " +
				connection.escape(requestParams.chapter) + ", " +
				Number(requestParams.playTime) + ", " +
				Number(requestParams.curUnixtimeStamp) + " , " +
            	Number(requestParams.seqID) + " , " +
                Number(requestParams.levelID) + " ) ";
			runQS(connection, queryStr, callBack);
		});
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddRecord_nde = function (requestParams, serverIdx, defaultFileName, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_add_record_nde( " + Number(requestParams.appID) + ", " +
                Number(requestParams.accountID) + " , " +
                Number(requestParams.profileID) + ", " +
                Number(requestParams.seqID) + " , " +
                Number(requestParams.levelID) + " , " +
                Number(requestParams.lessonID) + " , " +
                connection.escape(requestParams.unitID) + ", " +
                connection.escape(requestParams.recordText) + ", " +
                connection.escape(requestParams.nativeFileName) + ", " +
                connection.escape(defaultFileName) + ", " +
                connection.escape(requestParams.contentType) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procrecordList_nde = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            //var queryStr = " CALL sp_get_record_list_nde( " + Number(requestParams.appID) + ", " +
            //    Number(requestParams.accountID) + " , " +
            //    Number(requestParams.profileID) + ", " +
            //    Number(requestParams.seqID) + " , " +
            //    Number(requestParams.levelID) + " ) ";

            var queryStr = " CALL sp_get_record_list_nde( " + Number(requestParams.appID) + ", " +
                Number(requestParams.accountID) + " , " +
                Number(requestParams.profileID) + " ) ";
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

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetEpisodePlayHistoryNDE = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_episode_play_history_nde( " + Number(requestParams.accountID) + " , " + Number(requestParams.profileID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetEpisodePlayHistoryDLA = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_episode_play_history_dla( " + Number(requestParams.appID) + " , " +
                Number(requestParams.accountID) + " , " +
                Number(requestParams.profileID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

	MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procGetCategoryRotationList = function(requestParams, callBack) {
		pool.getConnection(function(err, connection) {
			if (err) return callBack(err);
			var queryStr = " CALL sp_get_category_rotation_reword_list( " + Number(requestParams.appID) + " , " +
				Number(requestParams.accountID) + " , " +
				Number(requestParams.profileID) + " ) ";
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


    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procNDECheckUpStartEnd = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_add_checkup_cnt( " + Number(requestParams.seqID) + " , " +
                connection.escape(requestParams.unitID) + ", " +
                Number(requestParams.corretChkCnt) + " , " +
                Number(requestParams.wrongChkCnt) + ", " +
                Number(requestParams.playTime) + ", " +
                connection.escape(requestParams.actionType) + ") ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procNDECheckUpResult = function(requestParams, callBack) {
        pool.getConnection(function(err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_get_checkup_cnt_result( " + Number(requestParams.seqID) + " , " +
                Number(requestParams.accountID) + " ) " ;
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procAddCheckLog = function (requestPath, requestHeaders, requestBody, resultStr, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_add_check_log( " + connection.escape(requestPath) + ", " +
                connection.escape(requestHeaders) + ", " +
                connection.escape(requestBody) + ", " +
                connection.escape(resultStr) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procRefundPermition = function (requestParams, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sp_refund_permition( " + Number(requestParams.accountID) + " , " +
                Number(requestParams.seqID) + " ) ";
            console.log("\n queryStr");
            console.log(queryStr);
            runQS(connection, queryStr, callBack);
        });
    };

    //
    //
    // MYSQL_SLP_KW_ACTION_LOG_CONN.prototype.procNDECheckUp = function(requestParams, callBack) {
    //     pool.getConnection(function(err, connection) {
    //         if (err) return callBack(err);
    //         var queryStr = " CALL sp_add_checkup_cnt_start( " + Number(requestParams.seqID) + " , " +
    //             connection.escape(requestParams.unitID) + ", " +
    //             Number(requestParams.corretChkCnt) + " , " +
    //             Number(requestParams.wrongChkCnt) + ") ";
    //         runQS(connection, queryStr, callBack);
    //     });
    // };
	return MYSQL_SLP_KW_ACTION_LOG_CONN;
};
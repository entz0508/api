// checked by J
var mysql = require('mysql');
var pool = mysql.createPool({
	host: global.CONFIG.MYSQL_ADB_ACCOUNT.HOST,
	port: global.CONFIG.MYSQL_ADB_ACCOUNT.PORT,
	user: global.CONFIG.MYSQL_ADB_ACCOUNT.USER,
	password: global.CONFIG.MYSQL_ADB_ACCOUNT.PASSWORD,
	database: global.CONFIG.MYSQL_ADB_ACCOUNT.DATABASE,
	connectionLimit: 3
});

module.exports = function(checkConnect, runQS) {
	function MYSQL_ADB_ACCOUNT_CONN() {
		checkConnect(pool, "MYSQL_ADB_ACCOUNT_CONN.setInterval, pool.getConnection");
	}

    MYSQL_ADB_ACCOUNT_CONN.prototype.procWatchdogPing = function (callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            connection.query(" SELECT 1 AS `RES` ", function (connErr) {
                connection.release();
                callBack(connErr, !connErr);
            });
        });
    };

    // 회원가입 - 이메일중복 추가
    MYSQL_ADB_ACCOUNT_CONN.prototype.procAccountCreate = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountCreate(  " + connection.escape(params.clientUID) + ", " +
                connection.escape(params.CLIENT_IP) + ", " +
                connection.escape(params.signupID) + ", " +
                connection.escape(params.accountPWD) + ", " +
                connection.escape(params.userName) + ", " +
                connection.escape(params.snsEmail) + ", " +
                connection.escape(params.signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 로그인
    MYSQL_ADB_ACCOUNT_CONN.prototype.procAccountLogin = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountLogin(  " + connection.escape(params.clientUID) + ", " +
                connection.escape(params.CLIENT_IP) + ", " +
                connection.escape(params.signupID) + ", " +
                connection.escape(params.accountPWD) + ", " +
                connection.escape(params.signUpPath) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 내정보조회
    MYSQL_ADB_ACCOUNT_CONN.prototype.procAccountInfo = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spaccountInfo( " + Number(params.accountID) + ") ";
            runQS(connection, queryStr, callBack);
        });
    };

    
    // 비번변경 - 이메일찾기
    MYSQL_ADB_ACCOUNT_CONN.prototype.procFindEmail = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spfindEmail(  " + connection.escape(params.clientUID) + ", " +
                connection.escape(params.clientIP) + ", " +
                connection.escape(params.signupID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 비번변경 - 이메일토큰 체크
    MYSQL_ADB_ACCOUNT_CONN.prototype.proccheckToken = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spcheckToken(  " + connection.escape(params.signupToken) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 비번변경 - 비번 변경처리 with token
    MYSQL_ADB_ACCOUNT_CONN.prototype.procpassChange = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sppassChange(  " + connection.escape(params.signupToken) + ", " +
                connection.escape(params.accountPWD) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 - 이름변경
    MYSQL_ADB_ACCOUNT_CONN.prototype.procUsernameChange = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountnameChange(  " + Number(params.accountID) + ", " +
                connection.escape(params.accountName) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 - 비번변경
    MYSQL_ADB_ACCOUNT_CONN.prototype.procUserpassChange = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountpassChange(  " + Number(params.accountID) + ", " +
                connection.escape(params.accountPass) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    // 마이페이지 - 사진변경
    MYSQL_ADB_ACCOUNT_CONN.prototype.procUserphotoChange = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountMyphotoChange(  " + Number(params.accountID) + ", " +
                connection.escape(params.imageName) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    // 마이페이지 - 회원탈퇴
    MYSQL_ADB_ACCOUNT_CONN.prototype.procUserLeave = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spAccountLeave(  " + Number(params.accountID) + ", " +
                connection.escape(params.clientIP) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    // 성경 Edit - 하이라이트, 북마크 등록 - OLD
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBibleEdit = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spbibleEdit(  " + Number(params.accountID) + ", " +
                Number(params.bibleID) + ", " +
                Number(params.chapterID) + ", " +
                Number(params.verseID) + ", " +
                Number(params.editType) + ", " +
                connection.escape(params.editValue) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 Edit - 북마크 등록/삭제
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBookmarkEdit = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBookmarkEdit(  " + Number(params.accountID) + ", " +
                Number(params.bibleID) + ", " +
                Number(params.chapterID) + ", " +
                Number(params.verseID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 Edit - 하이라이트 등록/삭제
    MYSQL_ADB_ACCOUNT_CONN.prototype.procHighlightEdit = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spHighlightEdit(  " + Number(params.accountID) + ", " +
                Number(params.bibleID) + ", " +
                Number(params.chapterID) + ", " +
                connection.escape(params.verseID) + ", " +
                connection.escape(params.titleStr) + ", " +
                connection.escape(params.editValue) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    // BIBLE 노트 등록
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBibleNoteAdd = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleNoteReg(  " + Number(params.accountID) + ", " +
                connection.escape(params.titleStr) + ", " +
                connection.escape(params.contentStr) + ", " +
                Number(params.bibleID) + ", " +
                Number(params.chapterID) + ", " +
                Number(params.verseID) + ", " +
                Number(params.verseID2) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // BIBLE 노트 수정
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBibleNoteMod = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleNoteMod(  " + Number(params.noteID) + ", " +
                Number(params.accountID) + ", " +
                connection.escape(params.titleStr) + ", " +
                connection.escape(params.contentStr) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // BIBLE 노트 삭제
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBibleNoteDel = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleNoteDel(  " + Number(params.noteID) + ", " +
                Number(params.accountID)  + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
    // 성경play - 하이라이트, 북마크 정보조회
    MYSQL_ADB_ACCOUNT_CONN.prototype.procBibleRead = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleRead(  " + connection.escape(params.accountID) + ", " +
                connection.escape(params.bibleID) + ", " +
                connection.escape(params.chapterID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 읽기 기록
    MYSQL_ADB_ACCOUNT_CONN.prototype.procPlayLogAdd = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spPlayLogAdd(  " + Number(params.accountID) + ", " +
                Number(params.bibleID) + ", " +
                Number(params.chapterID) + ", " +
                Number(params.communityID) + ", " +
                Number(params.detailID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 구절찾기 by bible
    MYSQL_ADB_ACCOUNT_CONN.prototype.procSearchBible = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spSearchBible(" + connection.escape(params.searchStr) + ") ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 구절찾기 by verse
    MYSQL_ADB_ACCOUNT_CONN.prototype.procSearchVerse = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spSearchVerse(  " + Number(params.bibleID) + ", " +
                connection.escape(params.searchStr) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 성경 구절찾기 by verse - more
    MYSQL_ADB_ACCOUNT_CONN.prototype.procSearchVersemore = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spSearchVerseMore(" + Number(params.bibleID) + ", " +
                connection.escape(params.searchStr) + ", " +
                Number(params.lastID) + ", " +
                Number(params.readcount) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 최근 100개
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageHistory = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spMypageHistory(" + Number(params.accountID) + ") ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 뉴스 메인
    MYSQL_ADB_ACCOUNT_CONN.prototype.procNewsMain = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spNewsView()";
            runQS(connection, queryStr, callBack); 
        });
    };

    // 마이페이지 북마크 리스트 - more - OLD
    // `spbookmarkListMore`(accountID int, lastID int, lastID2 int, readcount int, sorttype int)
    //MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageBookmarkmore = function (params, callBack) {
    //    pool.getConnection(function (err, connection) {
    //        if (err) return callBack(err);
    //        var queryStr = " CALL spbookmarkListMore(" + Number(params.accountID) + ", " +
    //            Number(params.lastID) + ", " +
    //            Number(params.lastID2) + ", " +
    //            Number(params.readcount) + ", " +
    //            Number(params.sorttype) + " ) ";
    //        runQS(connection, queryStr, callBack);
    //    });
    //};

    // 마이페이지 북마크 리스트 - more NEW
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageBookmark = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spbookmarkList(" + Number(params.accountID) + ", " +
                Number(params.lastID) + ", " +
                Number(params.readcount) + ", " +
                Number(params.sorttype) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 하이라이트 리스트 - more - OLD
    //MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageHighlightmore = function (params, callBack) {
    //    pool.getConnection(function (err, connection) {
    //        if (err) return callBack(err);
    //        var queryStr = " CALL sphighlightListMore(" + Number(params.accountID) + ", " +
    //            Number(params.lastID) + ", " +
    //            Number(params.lastID2) + ", " +
    //            Number(params.readcount) + ", " +
    //            Number(params.sorttype) + " ) ";
    //        runQS(connection, queryStr, callBack);
    //    });
    //};

    // 마이페이지 하이라이트 리스트 - more NEW
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageHighlight = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL sphighlightList(" + Number(params.accountID) + ", " +
                connection.escape(params.lastID) + ", " +
                Number(params.readcount) + ", " +
                Number(params.sorttype) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 하이라이트 상세보기 - more NEW
    MYSQL_ADB_ACCOUNT_CONN.prototype.procHighlightLogView = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spHighlightLogView(" + Number(params.accountID) + ", " +
                Number(params.highlightID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 하이라이트 리스트 로그 삭제 - NEW
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageHighlightLogDel = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spHighlightDel(" + Number(params.accountID) + ", " +
                connection.escape(params.deleteID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 노트 리스트 - more
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageNotemore = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleNoteListMore(" + Number(params.accountID) + ", " +
                Number(params.lastID) + ", " +
                Number(params.readcount) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 노트 보기
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageNoteView = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spBibleNoteView(" + Number(params.accountID) + ", " +
                Number(params.noteID) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // 마이페이지 읽기기록 리스트 - more
    MYSQL_ADB_ACCOUNT_CONN.prototype.procMypageLogmore = function (params, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spPlaylogListMore(" + Number(params.accountID) + ", " +
                Number(params.lastID) + ", " +
                Number(params.readcount) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };

    // route_middleware - 토큰인증처리
    MYSQL_ADB_ACCOUNT_CONN.prototype.procIsLoginUserAccount = function (clientUID, accessToken, callBack) {
        pool.getConnection(function (err, connection) {
            if (err) return callBack(err);
            var queryStr = " CALL spIsLoginUserAccount(  " + connection.escape(clientUID) + ", " +
                connection.escape(accessToken) + " ) ";
            runQS(connection, queryStr, callBack);
        });
    };
    
	return MYSQL_ADB_ACCOUNT_CONN;
};
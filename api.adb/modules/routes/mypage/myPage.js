require('date-utils'); // Date.prototype ����

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;

exports.add_routes = function (app) {
    "use strict";
    
    // 마이페이지 - 메인 최근 100개 리스트
    app.post("/adb/mypage/mainHistory", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            MYSQL_ADB_ACCOUNT_CONN.procMypageHistory({
                accountID: accountID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageHistory, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                readInfo.searchCnt = results[0].length;

                var verseList = [];
                var verseInfo = {};

                if ((0 < results[0].length)) {
                    var len = results[0].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.category = results[0][i].cate;
                        switch (results[0][i].cate) {
                            case 1:
                                // 북마크
                                verseInfo.bookmark_id = results[0][i].conint4;
                                verseInfo.bible_id = results[0][i].conint1;
                                verseInfo.chapter_id = results[0][i].conint2;
                                verseInfo.verse_id = results[0][i].conint3;
                                verseInfo.verse_time = results[0][i].context4;
                                verseInfo.bible_name = results[0][i].context1;
                                verseInfo.desc = results[0][i].context3;
                                //verseInfo.bookmark = true;
                                break;
                            case 2:
                                // 하이라이트
                                verseInfo.highlight_id = results[0][i].conint4;
                                verseInfo.bible_id = results[0][i].conint1;
                                verseInfo.chapter_id = results[0][i].conint2;
                                verseInfo.verse_id = results[0][i].conint3;
                                verseInfo.verse_time = results[0][i].context4;
                                verseInfo.title = results[0][i].context1;
                                verseInfo.color = results[0][i].context2;
                                verseInfo.desc = results[0][i].context3;
                                break;
                            case 3:
                                // 듣기로그
                                verseInfo.bible_id = results[0][i].conint1;
                                verseInfo.chapter_id = results[0][i].conint2;
                                verseInfo.community_id = results[0][i].conint3;
                                verseInfo.detail_id = results[0][i].conint4;
                                verseInfo.bible_name = results[0][i].context1;
                                break;
                            case 4:
                                // 노트
                                verseInfo.note_id = results[0][i].conint1;
                                verseInfo.title = results[0][i].context2;
                                verseInfo.contents = results[0][i].context3;
                                break;
                            default:

                                break;
                        }
                        verseInfo.date = results[0][i].date;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });
    
    // 마이페이지 - 북마크 목록 - SORT
    app.post("/adb/mypage/bookmarklist", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var lastID = (req.body.last_id) ? req.body.last_id : 0;                 //  받아서 쪼개 lastID,lastID2
            var readcount = (req.body.read_count > 0) ? req.body.read_count : 10;
            var sorttype = (req.body.sort_type > 0) ? req.body.sort_type : 0;       // 0:날짜순,1:성경순

            MYSQL_ADB_ACCOUNT_CONN.procMypageBookmark({
                accountID: accountID,
                lastID: lastID,
                readcount: readcount,
                sorttype: sorttype
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageBookmark, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                readInfo.next = results[0][0].NEXT;
                readInfo.searchCnt = results[1].length;
                var verseList = [];
                var verseInfo = {};

                if ((0 < results[1].length)) {
                    var len = results[1].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.bookmark_id = (sorttype == 1) ? results[1][i].tid : results[1][i].IDX;
                        verseInfo.bible_id = results[1][i].bible_id;
                        verseInfo.chapter_id = results[1][i].chapter_id;
                        verseInfo.verse_id = results[1][i].verse_id;
                        verseInfo.verse_time = results[1][i].time;
                        verseInfo.bible_name = results[1][i].bible_name;
                        verseInfo.desc = results[1][i].desc;
                        verseInfo.date = results[1][i].date;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                var msg = "조회되었습니다.";
                PACKET.sendSuccess(req, res, msg, readInfo);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });


    // 마이페이지 - 하이라이트 목록 - SORT - NEW
    app.post("/adb/mypage/highlightlist", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var lastID = (req.body.last_id) ? req.body.last_id : "";                    //  받아서 쪼개 lastID,lastID2
            var readcount = (req.body.read_count > 0) ? req.body.read_count : 10;
            var sorttype = (req.body.sort_type > 0) ? req.body.sort_type : 0;           // 0:날짜순,1:성경순
            
            MYSQL_ADB_ACCOUNT_CONN.procMypageHighlight({
                accountID: accountID,
                lastID: lastID,
                readcount: readcount,
                sorttype: sorttype
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageHighlight, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                
                var readInfo = {};
                readInfo.next = results[0][0].NEXT;
                readInfo.searchCnt = results[1].length;
                var verseList = [];
                var verseInfo = {};

                if ((0 < results[1].length)) {
                    var len = results[1].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.highlight_id = results[1][i].tid;
                        verseInfo.bible_id = results[1][i].bible_id;
                        verseInfo.chapter_id = results[1][i].chapter_id;
                        verseInfo.verse_id = results[1][i].verse_id;
                        verseInfo.verse_time = results[1][i].time;
                        verseInfo.title = results[1][i].TITLE;
                        verseInfo.color = results[1][i].COLOR;
                        verseInfo.desc = results[1][i].desc;
                        verseInfo.date = results[1][i].date;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                var msg = "조회되었습니다.";
                PACKET.sendSuccess(req, res, msg, readInfo);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "errorinfo": catchErr });
        }
    });

    // 마이페이지 - 하이라이트 로그 보기
    app.post("/adb/mypage/highlightView", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var highlightID = (req.body.highlight_id) ? req.body.highlight_id : 0;
            
            MYSQL_ADB_ACCOUNT_CONN.procHighlightLogView({
                accountID: accountID,
                highlightID: highlightID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procHighlightLogView, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                if (results[0].length > 0) {
                    var row = results[0][0];
                    if (row.IDX > 0) {
                        readInfo.HIGHLIGHT_ID = row.IDX;
                        readInfo.TITLE = row.TITLE;
                        readInfo.DES = row.DES;

                        readInfo.BIBLE_ID = row.BID;
                        readInfo.CHAPTER_ID = row.CID;
                        readInfo.VERSE_ID = row.VID;
                        readInfo.VERSE_TIME = row.TIME;
                        readInfo.VERSE_ID2 = row.VID2;
                        readInfo.VERSE_TIME2 = row.TIME2;
                        readInfo.COLOR = row.COLOR;
                        readInfo.DATE = row.DATE;

                        var msg = "조회되었습니다.";
                        PACKET.sendSuccess(req, res, msg, readInfo);
                    } else {
                        var msg = "조회내역 없음.";
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_FOUND_DATA, msg, {});
                    }
                    
                } else {
                    var msg = "조회내역 없음..";
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_FOUND_DATA, msg, {});
                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "ERROR": catchErr });
        }
    });

    // Bible 하이라이트 로그 삭제
    app.post("/adb/mypage/highlightLogDel", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var highlightID = req.body.highlight_id;
            if (highlightID.split('_').length === 2) {
                highlightID = highlightID.split('_')[1];
            }
            if (!COMMON_UTIL.isValidNumber(highlightID)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procMypageHighlightLogDel({
                accountID: accountID,
                deleteID: highlightID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageHighlightLogDel, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { deleteID: row.MSG });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });
    
    // 마이페이지 - 노트 목록
    app.post("/adb/mypage/notelistMore", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var lastID = (req.body.last_id) ? req.body.last_id : 0;
            var readcount = (req.body.read_count > 0) ? req.body.read_count : 10;
            
            MYSQL_ADB_ACCOUNT_CONN.procMypageNotemore({
                accountID: accountID,
                lastID: lastID,
                readcount: readcount
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageNotemore, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                
                var readInfo = {};
                readInfo.next = results[0][0].NEXT;
                readInfo.searchCnt = results[1].length;
                var verseList = [];
                var verseInfo = {};

                if ((0 < results[1].length)) {
                    var len = results[1].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.note_id = results[1][i].IDX;
                        verseInfo.title = results[1][i].TITLE;
                        verseInfo.contents = results[1][i].CONTENTS;
                        verseInfo.date = results[1][i].date;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });

    // 마이페이지 - 노트 보기
    app.post("/adb/mypage/noteView", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var noteID = (req.body.note_id) ? req.body.note_id : 0;
            
            MYSQL_ADB_ACCOUNT_CONN.procMypageNoteView({
                accountID: accountID,
                noteID: noteID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageNoteView, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                
                var readInfo = {};
                if (results[0].length > 0) {
                    var row = results[0][0];
                    readInfo.NOTE_ID = row.IDX;
                    readInfo.TITLE = row.TITLE;
                    readInfo.CONTENTS = row.CONTENTS;
                    readInfo.BIBLE_ID = row.BIBLE_ID;
                    readInfo.CHAPTER_ID = row.CHAPTER_ID;
                    readInfo.VERSE_ID = row.VERSE_ID;
                    readInfo.VERSE_TIME = row.VERSE_TIME;
                    readInfo.VERSE_ID2 = row.VERSE_ID2;
                    readInfo.VERSE_TIME2 = row.VERSE_TIME2;
                    readInfo.DATE = row.date;
                    var msg = "조회되었습니다.";
                    PACKET.sendSuccess(req, res, msg, readInfo);

                } else {
                    var msg = "조회내역 없음.";
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_NOT_FOUND_DATA, msg, {});

                }

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "ERROR": catchErr });
        }
    });

    // 마이페이지 - 읽기기록 목록
    app.post("/adb/mypage/loglistMore", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var lastID = (req.body.last_id) ? req.body.last_id : 0;
            var readcount = (req.body.read_count > 0) ? req.body.read_count : 10;

            MYSQL_ADB_ACCOUNT_CONN.procMypageLogmore({
                accountID: accountID,
                lastID: lastID,
                readcount: readcount
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procMypageNotemore, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                readInfo.next = results[0][0].NEXT;
                readInfo.searchCnt = results[1].length;

                var verseList = [];
                var verseInfo = {};

                if ((0 < results[1].length)) {
                    var len = results[1].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.log_id = results[1][i].idx;
                        verseInfo.bible_id = results[1][i].bible_id;
                        verseInfo.chapter_id = results[1][i].chapter_id;
                        verseInfo.community_id = results[1][i].community_id;
                        verseInfo.detail_id = results[1][i].detail_id;
                        verseInfo.bible_name = results[1][i].name;
                        verseInfo.date = results[1][i].date;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                //var row = results[0][0];
                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });
};
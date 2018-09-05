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

	// 북마크,하이라이트 등록
    app.post("/adb/bible/edit", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);

		try {
			var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			var os = COMMON_UTIL.trim(req.body.os);
			var accessToken = COMMON_UTIL.trim(req.body.access_token);

			var bibleID = req.body.bible_id;
			var chapterID = req.body.chapter_id;
			var verseID = req.body.verse_id;
			var editType = req.body.editType;
			var editValue = COMMON_UTIL.trim(req.body.editValue);
			
			if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(chapterID) ||
				!COMMON_UTIL.isValidNumber(verseID) || !COMMON_UTIL.isValidNumber(editType)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
			}

            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            MYSQL_ADB_ACCOUNT_CONN.procBibleEdit({
				accountID: accountID,
				bibleID: bibleID,
				chapterID: chapterID,
				verseID: verseID,
				editType: editType,
				editValue: editValue
			}, function (err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procBibleEdit, faile db, error" + err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
				}

				var row = results[0][0];
				if (row.RES == 0) {
					PACKET.sendSuccess(req, res, "처리성공", { bookmark: row.bookmark, highlight: row.highlight });
				} else {
					PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
				}
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "errorinfo": catchErr });
		}
    });

    // 북마크 등록
    app.post("/adb/bible/bookmark", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
            var accessToken = COMMON_UTIL.trim(req.body.access_token);

            var bibleID = req.body.bible_id;
            var chapterID = req.body.chapter_id;
            var verseID = req.body.verse_id;

            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(chapterID) || !COMMON_UTIL.isValidNumber(verseID)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            MYSQL_ADB_ACCOUNT_CONN.procBookmarkEdit({
                accountID: accountID,
                bibleID: bibleID,
                chapterID: chapterID,
                verseID: verseID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleEdit, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var row = results[0][0];
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { bookmark: row.bookmark });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "errorinfo": catchErr });
        }
    });


    // 하이라이트 등록
    app.post("/adb/bible/highlight", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            var os = COMMON_UTIL.trim(req.body.os);
            var accessToken = COMMON_UTIL.trim(req.body.access_token);

            var bibleID = req.body.bible_id;
            var chapterID = req.body.chapter_id;
            var verseID = req.body.verse_id;
            var titleStr = COMMON_UTIL.trim(req.body.title_str);
            var editValue = COMMON_UTIL.trim(req.body.editValue);

            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(chapterID) || COMMON_UTIL.isNull(verseID) || COMMON_UTIL.isNull(titleStr) || COMMON_UTIL.isNull(editValue)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            MYSQL_ADB_ACCOUNT_CONN.procHighlightEdit({
                accountID: accountID,
                bibleID: bibleID,
                chapterID: chapterID,
                verseID: verseID,
                titleStr: titleStr,
                editValue: editValue
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleEdit, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var row = results[0][0];
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { highlight: row.highlight });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "errorinfo": catchErr });
        }
    });


	// 성경읽기 - 북마크,하이라이트,언더라인 정보 포함
    app.post("/adb/bible/play", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);

		try {
			//var clientUID = COMMON_UTIL.trim(req.body.client_uid);
			//var os = COMMON_UTIL.trim(req.body.os);
			//var accessToken = COMMON_UTIL.trim(req.body.access_token);

            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
			var bibleID = req.body.bible_id;
			var chapterID = req.body.chapter_id;
            

            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(chapterID)) {
				PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
				return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
			}
            
			MYSQL_ADB_ACCOUNT_CONN.procBibleRead({
				accountID: accountID,
				bibleID: bibleID,
				chapterID: chapterID
			}, function (err, results) {
				if (err) {
					PRINT_LOG.error(__filename, API_PATH, " procBibleRead, faile db, error" + err);
					return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
				}

				var readInfo = {};
				readInfo.searchCnt = results[0].length;

				var verseList = [];
				var verseInfo = {};
				if ((0 < results[0].length)) {
					var len = results[0].length;
					for (var i = 0; i < len; i++) {
						verseInfo.id = results[0][i].id;
						//verseInfo.time = results[0][i].time;
						//verseInfo.desc = results[0][i].desc;
						verseInfo.bookmark = results[0][i].bookmark;
						verseInfo.highlight = results[0][i].highlight;
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

    // 성경구문검색 1
    app.post("/adb/bible/searchBible", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var searchStr = COMMON_UTIL.trim(req.body.search_str);

            // 2자~16자 특수문자 안됨 /^[~!@\#$%<>^&*\()\-=+\’]/
            if (!COMMON_UTIL.isValidProfileName(searchStr)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procSearchBible({
                searchStr: searchStr
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procSearchBible, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                
                var readInfo = {};
                readInfo.searchCnt = results[0].length;

                var bibleList = [];
                var bibleInfo = {};

                if ((0 < results[0].length)) {
                    var len = results[0].length;
                    for (var i = 0; i < len; i++) {
                        bibleInfo.bibleid = results[0][i].bibleid;
                        bibleInfo.name = results[0][i].name;
                        bibleInfo.type = results[0][i].type;
                        bibleInfo.cnt = results[0][i].cnt;
                        bibleList.push(bibleInfo);
                        bibleInfo = {};
                    }
                }
                readInfo.bibleList = bibleList;
                //var row = results[0][0];
                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });


    // 성경구문검색 2
    app.post("/adb/bible/searchVerse", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            //var clientUID = COMMON_UTIL.trim(req.body.client_uid);
            //var os = COMMON_UTIL.trim(req.body.os);
            //var accessToken = COMMON_UTIL.trim(req.body.access_token);
            var bibleID = req.body.bible_id;
            var searchStr = req.body.search_str;

            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidProfileName(searchStr)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procSearchVerse({
                bibleID: bibleID,
                searchStr: searchStr
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procSearchVerse, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                readInfo.searchCnt = results[0].length;

                var verseList = [];
                var verseInfo = {};

                if ((0 < results[0].length)) {
                    var len = results[0].length;
                    for (var i = 0; i < len; i++) {
                        verseInfo.bibletype = results[0][i].type;
                        verseInfo.biblename = results[0][i].name;
                        verseInfo.bibleid = results[0][i].bibleid;
                        verseInfo.chapterid = results[0][i].chapterid;
                        verseInfo.id = results[0][i].id;
                        verseInfo.time = results[0][i].time;
                        verseInfo.desc = results[0][i].desc;
                        verseInfo.index = results[0][i].ind;
                        verseList.push(verseInfo);
                        verseInfo = {};
                    }
                }
                readInfo.verseList = verseList;
                //var row = results[0][0];
                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);
                //PACKET.sendSuccess(req, res, null, { access_token: row.ACCESS_TOKEN, account_name: row.ACCOUNT_NAME });

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });

    // 성경구문검색 2 - more
    app.post("/adb/bible/searchVersemore", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var bibleID = req.body.bible_id;
            var searchStr = req.body.search_str;
            var lastID = (req.body.last_id) ? req.body.last_id : 0;
            var readcount = (req.body.read_count > 0) ? req.body.read_count : 10;

            //PRINT_LOG.info(__filename, API_PATH, "req : " + JSON.stringify(req.body));
            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(readcount) || !COMMON_UTIL.isValidNumber(lastID) || !COMMON_UTIL.isValidProfileName(searchStr)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procSearchVersemore({
                bibleID: bibleID,
                searchStr: searchStr,
                lastID: lastID,
                readcount: readcount
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procSearchVersemore, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }

                var readInfo = {};
                readInfo.next = results[0][0].NEXT;
                readInfo.searchCnt = results[1].length;
                readInfo.bibletype = results[0][0].type;
                readInfo.biblename = results[0][0].name;
                readInfo.bibleid = results[0][0].bibleid;
                var verseList = [];
                var verseInfo = {};

                if ((0 < results[1].length)) {
                    var len = results[1].length;
                    for (var i = 0; i < len; i++) {
                        //verseInfo.bibleid = results[1][i].bible_id;
                        verseInfo.chapterid = results[1][i].chapter_id;
                        verseInfo.id = results[1][i].verse_id;
                        verseInfo.time = results[1][i].time;
                        verseInfo.desc = results[1][i].desc;
                        verseInfo.index = results[1][i].ind;
                        verseInfo.search_id = results[1][i].tid;
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

    // 듣기로그등록
    app.post("/adb/bible/setLog", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var bibleID = req.body.bible_id;
            var chapterID = req.body.chapter_id;
            var communityID = req.body.community_id;
            var detailID = req.body.detail_id;

            if (communityID == null || communityID == "") communityID = 0;
            if (detailID == null || detailID == "") detailID = 0;

            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;

            if (!COMMON_UTIL.isValidNumber(bibleID) || !COMMON_UTIL.isValidNumber(chapterID) || !COMMON_UTIL.isValidNumber(communityID) || !COMMON_UTIL.isValidNumber(detailID)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }
            
            MYSQL_ADB_ACCOUNT_CONN.procPlayLogAdd({
                accountID: accountID,
                bibleID: bibleID,
                chapterID: chapterID,
                communityID: communityID,
                detailID: detailID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleEdit, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                //PRINT_LOG.error(__filename, API_PATH, JSON.stringify(row));

                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { bookmark: row.bookmark, highlight: row.highlight });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });


    // Bible 노트 등록
    app.post("/adb/bible/addNote", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var titleStr = COMMON_UTIL.trim(req.body.title_str);
            var contentStr = COMMON_UTIL.trim(req.body.content_str);
            var bibleid = (req.body.bibleid) ? req.body.bibleid : 0;
            var chapterid = (req.body.chapterid) ? req.body.chapterid : 0;
            var verseid = (req.body.verseid) ? req.body.verseid : 0;
            var verseid2 = (req.body.verseid2) ? req.body.verseid2 : 0;

            MYSQL_ADB_ACCOUNT_CONN.procBibleNoteAdd({
                accountID: accountID,
                titleStr: titleStr,
                contentStr: contentStr,
                bibleID: bibleid,
                chapterID: chapterid,
                verseID: verseid,
                verseID2: verseid2
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleNoteAdd, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                //PRINT_LOG.error(__filename, API_PATH, JSON.stringify(row));
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { noteID: row.MSG });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });

    // Bible 노트 수정
    app.post("/adb/bible/modNote", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var noteID = req.body.note_id;
            var titleStr = COMMON_UTIL.trim(req.body.title_str);
            var contentStr = COMMON_UTIL.trim(req.body.content_str);

            if (!COMMON_UTIL.isValidNumber(noteID)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procBibleNoteMod({
                noteID: noteID,
                accountID: accountID,
                titleStr: titleStr,
                contentStr: contentStr
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleNoteMod, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { noteID: row.MSG });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });

    // Bible 노트 삭제
    app.post("/adb/bible/delNote", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            var noteID = req.body.note_id;

            if (!COMMON_UTIL.isValidNumber(noteID)) {
                PRINT_LOG.error(__filename, API_PATH, " error parameter " + JSON.stringify(req.body));
                return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER, "입력값의 형식에 문제가 있습니다.", {});
            }

            MYSQL_ADB_ACCOUNT_CONN.procBibleNoteDel({
                noteID: noteID,
                accountID: accountID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procBibleNoteDel, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var row = results[0][0];
                //PRINT_LOG.error(__filename, API_PATH, JSON.stringify(row));
                if (row.RES == 0) {
                    PACKET.sendSuccess(req, res, "처리성공", { noteID: row.MSG });
                } else {
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "처리실패", { errorCode: row.RES });
                }
            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }
    });

};
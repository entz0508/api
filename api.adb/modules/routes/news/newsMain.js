// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;


function add_routes(app) {
    "use strict";

    app.post("/adb/news/getMain", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            //var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;
            MYSQL_ADB_ACCOUNT_CONN.procNewsMain({
                //accountID: accountID
            }, function (err, results) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procNewsMain, faile db, error" + err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, err, {});
                }
                var readInfo = {};
                //readInfo.searchCnt1 = results[0].length;
                //readInfo.searchCnt2 = results[1].length;
                
                var today = {};
                var topBanners = {};
                var footBanners = {};

                var topBanner = [];
                var footBanner = [];

                var bannerCell = {};
                
                // 베너리스트가 있을경우
                if ((0 < results[0].length)) {
                    var len = results[0].length;
                    for (var i = 0; i < len; i++) {
                        bannerCell.imageUrl = "https://image.bluearkedu.com/adb/"+results[0][i].IMAGE_URL;
                        bannerCell.linkUrl = results[0][i].BANNER_LINK;
                        switch (results[0][i].BANNER_TYPE) {
                            case 1:
                                topBanner.push(bannerCell);         // topBanner
                                break;
                            case 2:
                                footBanner.push(bannerCell);        // footBanner
                                break;
                            default:

                                break;
                        }
                        //verseList.push(verseInfo);
                        bannerCell = {};
                        
                    }
                }

                topBanners.count = 3;
                topBanners.list = topBanner;

                footBanners.count = 3;
                footBanners.list = footBanner;


                if ((0 < results[1].length)) {
                    today.date = results[1][0].DAT;
                    today.bibleName = results[1][0].name;
                    today.bibleid = results[1][0].BID;
                    today.chapterid = results[1][0].CID;
                    today.verseid = results[1][0].VID;
                    today.versetime = results[1][0].TIME;
                    today.verseid2 = results[1][0].VID2;
                    today.versetime2 = results[1][0].TIME2;
                    today.text = results[1][0].DES;
                }

                readInfo.topBanner = topBanners;
                readInfo.todays = today;
                readInfo.footBanner = footBanners;


                var msg = "조회되었습니다.";

                PACKET.sendSuccess(req, res, msg, readInfo);

            });
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, null, { "테스트결과": catchErr });
        }

        /*
        try {
            var topBanner = {};
            topBanner.count = 3
            topBanner.list = [];
            var banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/card1@4x.png";
            banner.linkUrl = "";
            topBanner.list.push(banner);
            banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/card2@4x.png";
            banner.linkUrl = "http://news.naver.com/main/read.nhn?oid=001&sid1=102&aid=0009834768";
            topBanner.list.push(banner);
            banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/card3@4x.png";
            banner.linkUrl = "http://news.naver.com/main/read.nhn?oid=001&sid1=102&aid=0009834769";
            topBanner.list.push(banner);
            banner = {};

            var con = {};
            con.topBanner = topBanner;

            var todays = {};
            todays.date = "2018.02.20";
            todays.bibleName = "로마서";
            todays.bibleid = 45;
            todays.chapterid = 1;
            todays.verseid = 8;
            todays.versetime = 60.1;
            todays.verseid2 = 10;
            todays.versetime2 = 79.1;
            todays.text = "먼저 내가 예수 그리스도로 말미암아 너희 모든 사람에 관하여 내 하나님께 감사함은 너희 믿음이 온 세상에 전파됨이로다<br/>내가 그의 아들의 복음 안에서 내 심령으로 섬기는 하나님이 나의 증인이 되시거니와 항상 내 기도에 쉬지 않고 너희를 말하며<br/>어떻게 하든지 이제 하나님의 뜻 안에서 너희에게로 나아갈 좋은 길 얻기를 구하노라";
            con.todays = todays;

            topBanner = {};
            topBanner.count = 3
            topBanner.list = [];
            var banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/list1@4x.png"
            banner.linkUrl = "http://news.naver.com/main/read.nhn?oid=001&sid1=102&aid=0009834767";
            topBanner.list.push(banner);
            banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/list2@4x.png";
            banner.linkUrl = "http://news.naver.com/main/read.nhn?oid=001&sid1=102&aid=0009834768";
            topBanner.list.push(banner);
            banner = {};
            banner.imageUrl = "https://image.bluearkedu.com/adb/list3@4x.png";
            banner.linkUrl = "http://news.naver.com/main/read.nhn?oid=001&sid1=102&aid=0009834769";
            topBanner.list.push(banner);

            con.footBanner = topBanner;

            //sendSuccess: function (req, res, msg, obj) {
            //sendFail: function (req, res, error_code, msg, obj) {
            PACKET.sendSuccess(req, res, null, con);
            
        } catch (catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "실패 메세지..", null);
        }
        */

    });
}

exports.add_routes = add_routes;
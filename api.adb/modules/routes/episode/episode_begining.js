require('date-utils');
var request = require("request");
// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE = global.MYSQL_CONNECTOR_POOLS.SLP_NDE;

exports.add_routes = function (app) {
    "use strict";

    app.post("/nde/episode/episode_begining", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            //requestParams.req = req;
            //requestParams.res = res;
            //requestParams.API_PATH = API_PATH;
            //requestParams.CLIENT_IP = CLIENT_IP;

            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            //requestParams.os = COMMON_UTIL.trim(req.body.os);
            //requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            //requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);

            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.beginDate = COMMON_UTIL.trim(req.body.begin_date);
            /*
            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) || !COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }
            */
            // 정보 조회
            MYSQL_SLP_NDE.procEpisodeBegining(requestParams, function (err, results) {
                if (err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procEpisodeBegining", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var resultOBJ = {};
                    resultOBJ.code = results[0][0].CODE;
                    resultOBJ.msg = results[0][0].MSG;
                    resultOBJ.beginDate = results[0][0].BEGIN_DATE;
                    //resultOBJ.endDate = results[0][0].END_DATE;

                    // EBS 전달 변수
                    var exParam = {};
                    exParam.app_id = "APP6ef74743-23e2-496c-a67d-a1010a10c016";
                    exParam.ext_pdt_id = results[0][0].ext_id;                  // db 조회값
                    exParam.set_date = results[0][0].BEGIN_DATE;                //.replace(/-/gi, '');                // db 처리날짜 - 학습시작일
                    exParam.enc_user_id = results[0][0].enc_user_id;            // db 조회값
                    exParam.step_attend_id = results[0][0].STEP_ATTEND_ID;      // db 처리날짜 - 학습고유번호
                    //PRINT_LOG.info(__filename, API_PATH, 'BuyCartCreate exParam : ' + JSON.stringify(exParam));

                    ebsLang_check(exParam, function (resData) {
                        PACKET.sendSuccess(req, res, { exParam: exParam, resData: resData });
                    });
                }
            });
            
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

    var ebsLang_check = function (exParam, callBack) {
        var url = "http://s-www.ebslang.co.kr";
        var path = "/app/setAppPdtDate.ebs";                // 학습시작일 등록
        url = url + path;

        try {
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: exParam
            }
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callBack(JSON.parse(body));
                }
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }
    };

    // 최종 시작일 처리
    app.post("/nde/open/date", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        // [난수4자리][step_attend_id][buy_id][blueark_uid][ext_pdt_id][ebs auth key][user ip address] -> enc_user_Id 
        /*
        "data": [
            "45gt",                                         0:[난수4자리]
            "5961092",                                      1:[step_attend_id]
            "20180119",                                     2:[attend_fr_ymd]
            "20180322",                                     3:[attend_to_ymd]
            "593aa2ca87f8da2b1c9d91f634f2698057fb3de1",     4:[blueark_uid]
            "1",                                            5:[ext_pdt_id]
            "EbsLang",                                      6:[ebs auth key]
            "106.250.172.162"                               7:[user ip address]
        ]
        */
        var userTokenList = [];
        var token = {};
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var appID = 1000000007;
        var msg = null;
        var appResult = 0;

        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);

            PRINT_LOG.info(__filename, API_PATH, 'xtt : ' + xtt);

            var xa = xtt.split("|");

            if (xa.length > 0) {
                var requestParams = {};

                // nde / open / date - requestParams : { 
                //    "appID":1000000007,
                //    "stepAttendID":"5961092",
                //    "beginDate":"20180130",
                //    "endDate":"20180402",
                //    "bluearkUid":"8b19804f4ac5bc75d1d698d16888f02a5cb6b634",
                //    "extPdtID":"1",
                //    "buyIP":"106.250.172.162"
                //}

                requestParams.appID = appID;
                requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
                requestParams.beginDate = COMMON_UTIL.trim(xa[2]);
                requestParams.endDate = COMMON_UTIL.trim(xa[3]);
                requestParams.bluearkUid = COMMON_UTIL.trim(xa[4]);
                requestParams.extPdtID = COMMON_UTIL.trim(xa[5]);       // 프로필 아이디가 없으면 0으로 세팅
                requestParams.buyIP = COMMON_UTIL.trim(xa[7]);

                PRINT_LOG.info(__filename, API_PATH, 'requestParams : ' + JSON.stringify(requestParams));

                MYSQL_SLP_NDE.procEpisodeBeginings(requestParams, function (err, results) {
                    //PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procEpisodeBeginings", err);
                    //PACKET.sendSuccess2(req, res, {});

                    if (err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procEpisodeBeginings", err);
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {
                        var resultOBJ = {};
                        resultOBJ.code = results[0][0].CODE;
                        resultOBJ.msg = results[0][0].MSG;
                        resultOBJ.beginDate = results[0][0].BEGIN_DATE;
                        resultOBJ.endDate = results[0][0].END_DATE;
                        
                        PACKET.sendSuccess2(req, res, { result : resultOBJ });

                    }
                });
                
            }

        } catch (ex) {
            msg = ex;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
            PACKET.sendFail2(req, res, msg, {});
        }

    });
};
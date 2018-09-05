/**
 * Created by kkuris on 2018-01-17.
 */
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

    // NDE 로그저장 - nde_episode_perm_tb Expired change
    app.post("/nde/refund/refundProduct", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITHOUT_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;

            //post man or client 에서 받는 파라미터
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);            // ???
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.profile_id = COMMON_UTIL.trim(req.body.pf_id);
            requestParams.timeZone = COMMON_UTIL.trim(req.body.time_zone) || "Asia/Seoul";
            var tmpamount = "";

                  MYSQL_SLP_NDE.procRefundPermition(requestParams, function (err, results) {
                      if (err) {
                      PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procRefundPermition", err);
                      return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                      }
                      if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                      PRINT_LOG.error(__filename, API_PATH, " db results is null");
                      return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                      }

                   // EBS 전달 변수
                  var exParam = {};
                  // exParam.app_id = "APP6ef74743-23e2-496c-a67d-a1010a10c016";    // --
                  exParam.enc_user_id = results[0][0].enc_user_id;     // db 조회값 // --
                  exParam.step_attend_id = results[0][0].step_attend_id; // db 조회 // --
                  exParam.refund_stat_cd = results[0][0].refund_stat_cd; // db 처리 코드
                  exParam.refund_rsn_cd = results[0][0].refund_rsn_cd; // db 처리 사유
                  exParam.refund_time = results[0][0].refund_time;     // db 처리 시간 // --
                  exParam.refund_amt = results[0][0].tmpamount;       // db 처리 가격 // --
                  exParam.refund_id = results[0][0].refund_id;        // 환불 데이터 고유 번호 ..?

                  PRINT_LOG.info(__filename, API_PATH, 'procRefundPermition exParam : ' + JSON.stringify(exParam));





                  ebsLang_check(exParam, function (resData) {
                      PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                      //PACKET.sendSuccess2(req, res, { exParam: JSON.stringify(resData) });
                      //PACKET.sendSuccess(req, res, { exParam: JSON.stringify(resData) });
                      PACKET.sendSuccess2(req, res, { exParam: exParam, resData: resData });
                  });


                  // PACKET.sendSuccess(req, res, {})
                  });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

    var ebsLang_check = function (exParam, callBack) {
        var url = "http://s-www.ebslang.co.kr";
        var path = "/refund/refundStatConn.ebs";            // 관리자 환불
        url = url + path;

        try {
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: exParam
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // PRINT_LOG.info(__filename, 'ebsLang_check', body);          // {"res":-1}
                    // 성공시 DB에 성공처리
                    PRINT_LOG.info(__filename, 'ebsLang_check', body);
                    callBack(JSON.parse(body));
                }

                PRINT_LOG.error("","",body);
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };


    //
    // 최종 환불처리
    app.post("/nde/open/refund", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        // [난수4자리][step_attend_id][refund_id][refund_stat_cd][refund_rsn_cd][refund_time][refund_amt][blueark_uid][ebs auth key][user ip address] -> enc_user_Id
        /*
         {
         "data":[
         "q1db",
         "5958592",
         "1000000007",
         "f6573a11a4a789883a6a48ca996ce9dc1ad1b5ac",
         "2",
         "EbsLang",
         "104.199.129.129"
         ],
         "res":true
         }
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

            var xa = xtt.split("|");
            if (xa.length > 0) {

                var requestParams = {};
                requestParams.req = req;
                requestParams.res = res;
                requestParams.API_PATH = API_PATH;
                requestParams.CLIENT_IP = CLIENT_IP;

                requestParams.appID = COMMON_UTIL.trim(appID);
                requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
                requestParams.refundID = COMMON_UTIL.trim(xa[2]);
                requestParams.refundStatCD = COMMON_UTIL.trim(xa[3]);
                requestParams.refundRsnCD = COMMON_UTIL.trim(xa[4]);
                requestParams.refundTime = COMMON_UTIL.trim(xa[5]);
                requestParams.refundAmt = COMMON_UTIL.trim(xa[6]);
                requestParams.bluearkUid = COMMON_UTIL.trim(xa[7]);
                // requestParams.buyIP = COMMON_UTIL.trim(xa[9]);

                MYSQL_SLP_NDE.procOpenRefundProduct(requestParams, function (err, results) {
                    if (err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procOpenBuyProduct", err);
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    }
                    if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    }
                    PACKET.sendSuccess2(req, res, { data: token });
                });

            }

        } catch (ex) {
            msg = ex;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }

    });
};
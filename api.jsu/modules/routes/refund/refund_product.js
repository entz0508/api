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
    var ebsLang_check = function (exParam, callBack) {
        // var url = "http://s-www.ebslang.co.kr";
        var path = "/refund/refundStatConn.ebs";            // 관리자 환불
        var url =  global.CONFIG.EBS_SERVICE.STAGE_URL + path;
        // url = url + path;

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

                PRINT_LOG.info("","",body);
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };

    // 최종 환불처리
    app.post("/nde/open/refund", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        // oNsFpIS1qj0w7F6KlWp+SU0IvQpUvKkyHgVNYOR+DrlocIRGnM6RN3Y+CvF8hGPE2CuM8GyYSCCvP8dC0bQNVYCS41unnEaB6ZoCHfBmbKSwWl1Y5HfEgY/5GOz4Uhw4Pl1KkOSwF+EUpLuzi+VzGafzdZv4zDY7LdEwSBpkg6U=
        var userTokenList = [];

        var xtt = null;
        var encKey = "blueark_proc_prod";
        var msg = null;

        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);

            var xa = xtt.split("|");

                var requestParams = {};
                requestParams.req = req;
                requestParams.res = res;
                requestParams.API_PATH = API_PATH;
                requestParams.CLIENT_IP = CLIENT_IP;

                // requestParams.appID = COMMON_UTIL.trim(appID);
                requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
                requestParams.refundID = COMMON_UTIL.trim(xa[2]);
                requestParams.refundStatCD = COMMON_UTIL.trim(xa[3]);
                requestParams.refundRsnCD = COMMON_UTIL.trim(xa[4]);
                requestParams.refundTime = COMMON_UTIL.trim(xa[5]);
                requestParams.refundAmt = COMMON_UTIL.trim(xa[6]);
                requestParams.bluearkUid = COMMON_UTIL.trim(xa[7]);

                // var stepAttendID = COMMON_UTIL.trim(xa[1]);

                PRINT_LOG.info("난수4자리","xa0",xa[0]);
                PRINT_LOG.info("step_attend_id","xa1",xa[1]);
                PRINT_LOG.info("refund_id","xa2",xa[2]);
                PRINT_LOG.info("refund_stat_cd","xa3",xa[3]);
                PRINT_LOG.info("refund_rsn_cd","xa4",xa[4]);
                PRINT_LOG.info("refund_time","xa5",xa[5]);
                PRINT_LOG.info("refund_amt","xa6",xa[6]);
                PRINT_LOG.info("blueark_uid","xa7",xa[7]);
                PRINT_LOG.info("ebs auth key","xa8",xa[8]);
                PRINT_LOG.info("user ip","xa8",xa[9]);

                MYSQL_SLP_NDE.procOpenRefundProduct(requestParams, function (err, results) {
                    if (err) {
                        PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procOpenRefundProduct", err);
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    }
                    if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                        PRINT_LOG.error(__filename, API_PATH, " db results is null");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {

                        if(results[0][0].RES == 0 ){
                            var obj2 = {};
                            obj2.success = true;
                            obj2.error = null;
                            obj2.data = {};
                            PRINT_LOG.info(__filename,API_PATH,JSON.stringify(obj2));
                            PACKET.sendSuccess2(req, res, {});
                        } else {
                            var obj2 = {};
                            obj2.success = false;
                            obj2.error = null;
                            obj2.data = {};
                            msg = results[0][0].MSG;
                            PACKET.sendFail2(req, res, msg, {});
                        }

                    }
                });

        } catch (ex) {
            msg = ex;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }
    });

    //환불 처리 -> DB 내 seqid 로 encuserid 조회 후 exparam 으로 ebs 송신
    app.post("/nde/to/refund", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        // oNsFpIS1qj0w7F6KlWp+SU0IvQpUvKkyHgVNYOR+DrlocIRGnM6RN3Y+CvF8hGPE2CuM8GyYSCCvP8dC0bQNVYCS41unnEaB6ZoCHfBmbKSwWl1Y5HfEgY/5GOz4Uhw4Pl1KkOSwF+EUpLuzi+VzGafzdZv4zDY7LdEwSBpkg6U=
        var userTokenList = [];

        var xtt = null;
        var encKey = "blueark_proc_prod";
        var msg = null;

        try {
            // xtt = req.headers['x-transfer-token'];
            // xtt = ENCS.decryptLang(xtt, encKey);
            //
            // var xa = xtt.split("|");

            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);

            // requestParams.appID = COMMON_UTIL.trim(appID);
            // requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
            // requestParams.refundID = COMMON_UTIL.trim(xa[2]);
            // requestParams.refundStatCD = COMMON_UTIL.trim(xa[3]);
            // requestParams.refundRsnCD = COMMON_UTIL.trim(xa[4]);
            // requestParams.refundTime = COMMON_UTIL.trim(xa[5]);
            // requestParams.refundAmt = COMMON_UTIL.trim(xa[6]);
            // requestParams.bluearkUid = COMMON_UTIL.trim(xa[7]);

            // var stepAttendID = COMMON_UTIL.trim(xa[1]);

            MYSQL_SLP_NDE.procRefundPermition(requestParams, function (err, results) {
                if (err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procOpenRefundProduct", err);
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                }
                if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var row = results[0][0];
                    var exParam = {};
                    var responseObj = {};

                    responseObj.RES = row.RES;
                    exParam.enc_user_id = row.ENC_USER_ID;
                    exParam.step_attend_id = row.step_attend_id;
                    exParam.refund_stat_cd = row.refund_status_code;
                    exParam.refund_rsn_cd= row.refund_rsn_code;
                    exParam.refund_time = row.refund_time;
                    exParam.refund_amt= row.refund_amt;
                    exParam.refund_id= row.refund_id;

                    if(Number(row.RES == 0)){
                        ebsLang_check(exParam, function (resData) {
                            PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                            PRINT_LOG.info(__filename, API_PATH, JSON.stringify(exParam));
                        });
                        PACKET.sendSuccess(req, res, {exParam: exParam});
                    } else {
                        PACKET.sendFail(req, res, {RES:row.RES});
                    }

                }
            });
        } catch (ex) {
            msg = ex;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }
    });
};
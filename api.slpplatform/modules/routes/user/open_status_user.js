/**
 * Created by kkuris on 2018-01-18.
 */
/**
 * Created by kkuris on 2018-01-17.
 */
// nodejs npm
const CRYPTO = require("crypto");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

exports.add_routes = function (app) {

    // var ebsLang_check = function (exParam, callBack) {
    //     var url = "http://s-www.ebslang.co.kr";
    //     //var path = "/app/extPdtBuySave.ebs";              // 상품구매 동기
    //     var path = "/refund/refundStatConn.ebs";            // 관리자 구매
    //     url = url + path;
    //
    //     try {
    //         var headers = {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //         var options = {
    //             url: url,
    //             method: 'POST',
    //             headers: headers,
    //             form: exParam
    //         }
    //         request(options, function (error, response, body) {
    //             if (!error && response.statusCode == 200) {
    //                 // PRINT_LOG.info(__filename, 'ebsLang_check', body);          // {"res":-1}
    //                 // 성공시 DB에 성공처리
    //                 PRINT_LOG.info(__filename, 'ebsLang_check', body);
    //                 callBack(JSON.parse(body));
    //             }
    //         })
    //     } catch (ex) {
    //         PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
    //     }
    //
    // };

    app.post("/nde/open/statususer__", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        // [난수4자리][step_attend_id][ebs auth key][user ip address] -> enc_user_Id

        /*

         {
         "data":[
         "q1db",
         "5958592",
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

                PRINT_LOG.error(__filename, API_PATH, 'TOKEN VALUES' + xtt);

                PRINT_LOG.error(__filename, API_PATH, 'TOKEN VALUES' + body);

                // requestParams.buyID = COMMON_UTIL.trim(xa[2]);
                // requestParams.bluearkUid = COMMON_UTIL.trim(xa[3]);
                // requestParams.extPdtID = COMMON_UTIL.trim(xa[4]);       // 프로필 아이디가 없으면 0으로 세팅
                // requestParams.buyIP = COMMON_UTIL.trim(xa[6]);
                //
                // MYSQL_SLP_ACCOUNT_CONN.procGetOpenUserTokenVal(requestParams, function (err, results) {
                //     if (err) {
                //         PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procOpenBuyProduct", err);
                //         return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                //     }
                //     if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                //         PRINT_LOG.error(__filename, API_PATH, " db results is null");
                //         return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                //     }
                //
                //     PACKET.sendSuccess2(req, res, { data: userTokenList });
                // });
                PACKET.sendSuccess2(req, res, {data: userTokenList});

            }


        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
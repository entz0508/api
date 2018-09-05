/**
 * Created by kkuris on 2018-01-19.
 */
// kRBVqqLp7HPA_VzvnkRHM1sNw85X-xrqiMrHz01IYykDEEzfMNEjB-5aRz01eFHa7qI_mtsjqrpDTqJFgRio2jiHPxdsRliVoiYrdDqYyGE

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

exports.add_routes = function (app) {
    // app Login(web Login ����)
    app.post("/slp.token.decrypt", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        var encKey = "blueark_proc_prod";
        try {

            var token = null;


            var xtt = COMMON_UTIL.trim(req.body.token);
            xtt = ENCS.decryptLang(xtt, encKey);

            var decryt_token = xtt;

            var xa = xtt.split("|");

            PACKET.sendSuccess(req, res, {decryptData: xa, token: decryt_token})

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
        /*
        "4i30|49746dc914f04801cbb53349c63a667788a6c3eb|291409|2|EbsLang|106.250.172.162",
        "49746dc914f04801cbb53349c63a667788a6c3eb",
        "291409",
        "2",
        "EbsLang",
        "106.250.172.162"
        */

    app.post("/slp.token.crypt", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var encKey = "blueark_proc_prod";

            // var xtt = '4i30|49746dc914f04801cbb53349c63a667788a6c3eb|291409|2|EbsLang|106.250.172.162'; //복호화 과정에서 얻었던 값 xtt 값 가지고 오세요

            // var xtt = '1234|5962722|EbsLang|123.456.789.000';
            var xtt = COMMON_UTIL.trim(req.body.values1);
            xtt = ENCS.encryptLang(xtt, encKey);
            // kRBVqqLp7HPA/VzvnkRHM1sNw85X+xrqiMrHz01IYykDEEzfMNEjB+5aRz01eFHa7qI/mtsjqrpDTqJFgRio2jiHPxdsRliVoiYrdDqYyGE= 최초 암호화 된 토큰 값
            // kRBVqqLp7HPA_VzvnkRHM1sNw85X-xrqiMrHz01IYykDEEzfMNEjB-5aRz01eFHa7qI_mtsjqrpDTqJFgRio2jiHPxdsRliVoiYrdDqYyGE= 복호화 시킨 토큰 값

            PACKET.sendSuccess(req, res, {xtt: xtt});

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
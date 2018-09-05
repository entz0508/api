/**
 * Created by kkuris on 2017-12-26.
 */

const ROUTE_MIDDLEWARE = require("../common/util/route_middleware.js");
const PACKET = require("../common/util/packet_sender.js");
const COMMON_UTIL = require("../common/util/common.js");
const ERROR_CODE_UTIL = require("../common/util/error_code_util.js");

var crypto = require('crypto');

const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {

    app.post("/nde/cryptotest", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
            // var key1 = 'blueark_proc_prod';
            // var key2 = 'EbsLang';

            // var input ='wf6y|hGf1qjrQdRvktcRvtzU8Pkd3-9NomRgaHAp5cDwFvH2lAmgw64jDA9E5Ea2OkbXQ|EbsLang|127.0.0.1';
            var API_PATH = req.route.path;
            var CLIENT_IP = COMMON_UTIL.getClientIP(req);
            try {
                var requestParams = {};
                var responseOBJ = {};

                // responseOBJ.cipheredOutput = "";

                requestParams.req = req;
                requestParams.res = res;
                requestParams.API_PATH = API_PATH;
                requestParams.CLIENT_IP = CLIENT_IP;
                requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
                requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
                requestParams.input = COMMON_UTIL.trim(req.body.input);
                requestParams.key = COMMON_UTIL.trim(req.body.key);

                // var cipher = crypto.createCipher('aes256',requestParams.key);    // Cipher 객체 생성
                // cipher.update(requestParams.input, 'utf8', 'base64');             // 인코딩 방식에 따라 암호화
                // responseOBJ.cipheredOutput = cipher.final('base64');        // 암호화된 결과 값

                var decipher = crypto.createDecipher('aes256', requestParams.key); // Decipher 객체 생성
                decipher.update(requestParams.input, 'base64', 'utf8');   // 인코딩 방식에 따라 복호화
                responseOBJ.decipheredOutput = decipher.final('utf8');       // 복호화된 결과 값

                // responseOBJ.hash = crypto.createHash('sha256').update(requestParams.input).digest('base64');

                PACKET.sendSuccess(req, res, responseOBJ);
                //console.log(cipheredOutput);
                // console.log(decipheredOutput);


                // MYSQL_SLP_NDE.procServerPing_nde(requestParams, function (err, results) {
                //     if (err) {
                //         PRINT_LOG.error(__filename, API_PATH, " MYSQL_SLP_NDE.procServerPing_nde, fail db, error");
                //         return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                //     }
                //     if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                //         PRINT_LOG.error(__filename, API_PATH, " db results is null");
                //         return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                //     }
                //
                //     if ((0 < results[0].length)) {
                //
                //         var len = results[0].length;
                //         for (var i = 0; i < len; i++) {
                //             var row = results[0][i];
                //             var responseOBJ = {};
                //             responseOBJ.MSG = row.MSG;
                //             responseOBJ.RES = row.RES;
                //         }
                //
                //         PACKET.sendSuccess(req, res, responseOBJ);
                //     }
                //
                // })

            } catch (catchErr) {
                PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
            }
        });
};


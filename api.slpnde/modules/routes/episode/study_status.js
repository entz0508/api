/**
 * Created by kkuris on 2018-01-22.
 */
var xml2js = require('xml2js');
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
        var url = "http://s-www.ebslang.co.kr";
        var path = "/app/getStuStatus.ebs";            // 관리자 구매
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
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };

    app.post("/nde/open/status", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        // [난수4자리][enc_user_id][step_attend_id][attend_stat_cd][blueark_uid][ext_pdt_id][ebs auth key][user ip address] -> enc_user_Id
        /*
        token : 5OXDuh1zTBKvVVhjcNu8i1IkQU8EJzYdFJWhKpBGBJ6cKFa+aQV1zxCnLnVXEgIXE61vK7i6ghXdXSMM2PFL49GD3CNauNsYlnEhLw7rO1BQRYaq4dVV4h4D0ka6zRB+R7m87ORfjCxlTzT+nq9V/0JzPIIaHBQHU4jgmYt22CA0ApcrNpEtOleDAY9lojwd7det1eO/3+Yx9aedk/nHbA==
         [
             "1234",                                                                //난수 4자리 0
             "XYKxmwfb2RFHjH8K1zc5zOi5gJmw26SbYXxRG0gS2Ua_xQjE8_tuVVD5Rxvm7-Ck",    //enc_user_id 1
             "5966869",                                                             //step_attend_id 2
             "20180123",                                                            //attend_stat_cd 3
             "ee7a1c29d5944dbd45eee4fd1f6f05408571ab44",                            //blueark_uid 4
             "1",                                                                   //ext_pdt_id 5
             "EbsLang",                                                             //ebs auth key 6
             "123.456.789.000"                                                      //IP 7
         ],
         */

        var xtt = null;
        var encKey = "blueark_proc_prod";


        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);

            var xa = xtt.split("|");
            if (xa.length > 0) {

                var requestParams = {};
                // var responseOBJ = {};

                requestParams.req = req;
                requestParams.res = res;
                requestParams.API_PATH = API_PATH;
                requestParams.CLIENT_IP = CLIENT_IP;
                // requestParams.encUserID = COMMON_UTIL.trim(xa[1]);
                // requestParams.stepAttendID = COMMON_UTIL.trim(xa[2]);
                // requestParams.attendStatCD = COMMON_UTIL.trim(xa[3]);
                // requestParams.bluearkUid = COMMON_UTIL.trim(xa[4]);
                // requestParams.extPdtID = COMMON_UTIL.trim(xa[5]);

                requestParams.stepAttendID = COMMON_UTIL.trim(xa[1]);
                requestParams.attendStatCD = COMMON_UTIL.trim(xa[2]);
                requestParams.bluearkUid = COMMON_UTIL.trim(xa[3]);
                requestParams.extPdtID = COMMON_UTIL.trim(xa[4]);


                PRINT_LOG.error(__filename, API_PATH, 'TOKEN VALUES' + xtt);
                PRINT_LOG.error(__filename, API_PATH, 'TOKEN VALUES' + requestParams);


                MYSQL_SLP_NDE.procCallStudyStatus(requestParams, function(err, results) {
                    if (err) {
                        PRINT_LOG.error(__filename, API_PATH, " procCallStudyStatus, Fail DB, error");
                        return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                    } else {


                        var row1 = results[0][0];

                        var exParam = {};
                        exParam.app_id = row1.app_id;
                        exParam.enc_user_id = row1.enc_user_id;
                        exParam.ext_pdt_id = row1.ext_pdt_id;
                        exParam.step_attend_id = row1.step_attend_id;

                        requestParams.stepAttendID = COMMON_UTIL.trim(req.body.step_attend_id);


                        PRINT_LOG.info(__filename, API_PATH, 'to Study Status exParam : ' + JSON.stringify(exParam));

                        ebsLang_check(exParam, function (resData) {
                            PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                            //             //PACKET.sendSuccess2(req, res, { exParam: JSON.stringify(resData) });
                            //             //PACKET.sendSuccess(req, res, { exParam: JSON.stringify(resData) });
                        });

                        // PACKET.sendSuccess(req, res, {responseObj: responseObj, exParam: exParam, app_id: row1.app_id, step_attend_id: row1.step_attend_id, ext_pdt_id: row1.ext_pdt_id, enc_user_id: row1.enc_user_id});
                        PACKET.sendSuccess(req, res, {exParam: exParam});
                    }

                });
            }

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

};


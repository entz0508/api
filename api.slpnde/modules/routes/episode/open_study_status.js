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
                requestParams.attendFrYmd = COMMON_UTIL.trim(xa[5]);
                requestParams.attendToYmd = COMMON_UTIL.trim(xa[6]);

                PRINT_LOG.info(__filename, API_PATH, 'TOKEN VALUES: ' + xtt);

                MYSQL_SLP_NDE.procOpenStudyStatus(requestParams, function (err, result) {  //상태값 저장
                    if (err) {
                        PRINT_LOG.setErrorLog("MYSQL_SLP_NDE.procOpenStudyStatus, failed db, code:" + -1, err);
                    } else {

                        var row = result[0][0];
                        var msg = null;

                        // PRINT_LOG.info(__filename,"request params : ", JSON.stringify(requestParams));

                        if(Number(row.RES == 0)){
                            PACKET.sendSuccess2(req, res, {RES: row.res});
                            PRINT_LOG.info(API_PATH,"res = 0 ",row);
                        } else {
                            msg = "DB result ; " + row.res;
                            PACKET.sendFail2(req, res, msg, {});
                            PRINT_LOG.error(API_PATH,"res != 0",row);
                        }

                    }
                });
            }

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

};


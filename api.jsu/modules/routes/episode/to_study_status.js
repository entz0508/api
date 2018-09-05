/**
 * Created by kkuris on 2018-01-30.
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
        // var url = "http://s-www.ebslang.co.kr";
        // var url = null;
        var path = "/app/getStuStatus.ebs";            // 관리자 구매
        // var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
        var url =  global.CONFIG.EBS_SERVICE.STAGE_URL + path;
        // var url =  global.CONFIG.EBS_SERVICE.SERVICE_URL + path;

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

                PRINT_LOG.info("","body : ",body);
            })
        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);
        }

    };

    app.post("/nde/to/status", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        try {
            var requestParams = {};

            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;

            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            // PRINT_LOG.info(__filename,"status.req.body",JSON.stringify(req.body));

            MYSQL_SLP_NDE.procCallStudyStatusSEQ(requestParams, function (err, result) {
                if (err) {
                    PRINT_LOG.error(__filename, API_PATH, " procCallStudyStatus, Fail DB, error");
                    return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {

                    var row = result[0][0];
                    var msg = null;
                    var exParam = {};
                    exParam.app_id = row.app_id;
                    exParam.enc_user_id = row.enc_user_id;
                    exParam.ext_pdt_id = row.ext_pdt_id;
                    exParam.step_attend_id = row.step_attend_id;

                    var reExParam = {};

                    reExParam.step_attend_id = row.step_attend_id;
                    // reExParam.attend_stat_cd = row.attend_stat_cd;

                    PRINT_LOG.info(__filename, API_PATH, 'to Study Status exParam : ' + JSON.stringify(exParam));

                    ebsLang_check(exParam, function (resData) {
                        PRINT_LOG.info(__filename, API_PATH, JSON.stringify(resData));
                        // PRINT_LOG.info(__filename, API_PATH, JSON.stringify(exParam));
                    });
                    if(Number(row.RES == 0)){
                        PACKET.sendSuccess(req, res, {});
                        PRINT_LOG.info(API_PATH,"res = 0 ",row);
                    } else {
                        msg = "DB result ; " + row.RES;
                        PACKET.sendFail2(req, res, msg, {});
                        PRINT_LOG.error(API_PATH,"res != 0",row);
                    }

                }
            });

        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
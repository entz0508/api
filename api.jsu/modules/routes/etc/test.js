/**
 * Created by kkuris on 2017-12-13.
 */

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql

exports.add_routes = function(app) {
    app.post("/jsu/route/test", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            var failResultMsg = "error!";
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;

            requestParams.testParam = COMMON_UTIL.trim(req.body.testParam);
            

            if (Number(requestParams.testParam)) {
                PACKET.sendSuccess(req, res, 'test msg', { result: requestParams.testParam }); //sendSuccess: function (req, res, msg, obj) 
            } else {
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, { result: failResultMsg}); //sendFail: function (req, res, error_code, msg, obj) -- -2
            }
            
        } catch (catchErr) {
            PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
};
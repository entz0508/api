require('date-utils'); // Date.prototype ����

// nodejs npm
const crypto = require('crypto');

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE_INFO = global.MYSQL_CONNECTOR_POOLS.SLP_NDE_INFO;
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_service.xml";

exports.add_routes = function (app) {
    
    app.post("/adb/open/user", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
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
            //PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xa.length : ' + xa.length);
            if (xa.length == 6 && xa[2] == 'EbsLang' && xa[1].length == 64) {

                // {"data":["5ho8","PqzsQf845oxExlXw1a9qdgCPJwG-ReEQ2Z1Y7GnFdIJ1xrVoUXj13L2eGBlWpScm","EbsLang","1000009","2","104.199.129.129"],"res":true}
                var tradeID = xa[3];
                var extPdtID = xa[4];

                COMMON_UTIL.isAddExtToken(MYSQL_SLP_ACCOUNT_CONN, appID, xa[1], tradeID, extPdtID, xa[5], 'ebs', function (result) {
                    //PRINT_LOG.error(__filename, API_PATH, 'isAddExtToken result : ' + result);
                    if (Number(result['RES']) === 0) {  
                        token.uId = result['ACCESS_TOKEN'];
                        userTokenList.push(token);
                        appResult = 1;
                        //PRINT_LOG.error(__filename, API_PATH, 'token.uid:' + result['ACCESS_TOKEN']);

                        PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
                    } else {
                        msg = "DB result ; " + result['RES'];
                        PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                    }
                });
            } else {
                msg = 'data error';
                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
            }
        } catch (ex) {
            PRINT_LOG.error(__filename, API_PATH, '/nde/open/user ex : ' + ex);
            msg = ex;
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }
        
    });
    
};
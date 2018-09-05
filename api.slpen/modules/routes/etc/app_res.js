// nodejs npm

// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_EN_INFO_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_EN_INFO;


function add_routes(app) {
    "use strict";

    app.post("/sen/app/res", ROUTE_MIDDLEWARE.DEFAULT, function(req, res){
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.lev = COMMON_UTIL.convertAppIDtoLevel(requestParams.appID);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);

            MYSQL_SLP_EN_INFO_CONN.procGetAppRes( requestParams, function(err, results){
                var responseObj = {};
                responseObj.bundle_base_url = "";
//                responseObj.img_server_url = "";
                responseObj.resources = [];

                var resData = {};
                resData.isSuccess = false;
                resData.msg = "";
                if(err) {
                    resData.msg = __filename + ", " + API_PATH + ", procGetAppRes, err";
                    PRINT_LOG.setErrorLog(resData.msg, err);
                } else if(COMMON_UTIL.isNull(results) || (0>=results.length) ) {
                    resData.msg = __filename + ", " + API_PATH + ", procGetAppRes, err";
                    PRINT_LOG.setErrorLog(resData.msg, err);
                } else {
                    var len = results[0].length;
                    for(var i=0; i<len; i++) {
                        var resKey = results[0][i].RES_KEY;
                        if("BUNDLE_BASE_URL" === resKey) {
                            responseObj.bundle_base_url = results[0][i].RES_VALUE;
                        } else if("IMG_SERVER_URL" === resKey) {
                            responseObj.img_server_url = results[0][i].RES_VALUE;
                        } else if( ("PRIMARY_DATA" === resKey) )  {
                            var objPri = {};
                            objPri.id = "primary_data";
                            objPri.name = results[0][i].RES_VALUE;
                            objPri.ver = results[0][i].RES_VER;
                            responseObj.resources.push(objPri);
                        } else if( ("STICKER" === resKey) )  {
                            var objSticker = {};
                            objSticker.id = "sticker";
                            objSticker.name = results[0][i].RES_VALUE;
                            objSticker.ver = results[0][i].RES_VER;
                            responseObj.resources.push(objSticker);
                        } else if( ("THUMBNAIL" === resKey) )  {
                            var objThumbnail = {};
                            objThumbnail.id = "thumbnail";
                            objThumbnail.name = results[0][i].RES_VALUE;
                            objThumbnail.ver = results[0][i].RES_VER;
                            responseObj.resources.push(objThumbnail);
                        }
                    }
                }

                PACKET.sendSuccess(req, res, responseObj);
            });
        } catch(catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;
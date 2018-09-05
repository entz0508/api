require('date-utils'); // Date.prototype 업뎃

// nodejs npm
const crypto = require('crypto');
//const util = require('util');

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

const enc = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;
const MYSQL_SLP_NDE_INFO = global.MYSQL_CONNECTOR_POOLS.SLP_NDE_INFO;

var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_service.xml";

exports.add_routes = function(app) {
	app.post("/nde/app/ver", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		// var msg = null;
		// var testvalues = 0;
        try {
            MYSQL_SLP_NDE_INFO.procGetAppVersion({
				appID: COMMON_UTIL.trim(req.body.app_id),
				os: COMMON_UTIL.trim(req.body.os),
				clientVer: COMMON_UTIL.trim(req.body.c_ver)
			}, function(err, results) {
				if (err || COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
					var errType = "";
					
					if (err) errType += "[err]";
					if (COMMON_UTIL.isNull(results)) errType += "COMMON_UTIL.isNull(results)";
					if (0 >= results.length) errType += "[0 >= results.length]";
					if (0 >= results[0].length) errType += "[0 >= results[0].length]";
					
					return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Platform " + errType });
				}
				
				request({ uri: url, method: "GET" }, function(error, response, body) {
					parser.parseString(body, function(err, result) {
						// console.log("\n## GET ## " + url);

						var key = 'ehfksmschlrhdmlrydbrdyddoq@#$395'; //replace with your key
						var iv = 'BAEisTheBestTeam'; //replace with your IV
						var cipher = crypto.createCipheriv('aes256', key, iv);
						var crypted = cipher.update(body, 'utf8', 'base64');
						crypted += cipher.final('base64');
						
						PACKET.sendSuccess(req, res, {
							latest_ver: results[0][0].VER,
							summit: "y" === results[0][0].SUMMIT ? 1 : 0,
							force_update: "y" === results[0][0].FORCE_UPDATE ? 1 : 0,
							cur_force_update: "y" === results[0][0].CUR_FORCE_UPDATE ? 1 : 0,
							update_url: results[0][0].UPDATE_URL,
							cs_email: results[0][0].CS_EMAIL,
							info: crypted,
							local_date: (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS') // TODO 지역별 시간
						});
					});
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
    });
    
};
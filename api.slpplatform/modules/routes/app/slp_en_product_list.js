// nodejs npm
const crypto = require('crypto');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;


exports.add_routes = function add_routes(app) {
	app.post("/slp.enProductList", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		var API_PATH = req.route.path;
		try {
			MYSQL_SLP_PLATFORM_CONN.procWatchdogPing(function(errPlatform, isPlatformSuccess) {
				if (errPlatform || !isPlatformSuccess) return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Platform" });
				
				MYSQL_SLP_ACCOUNT_CONN.procWatchdogPing(function(errAccount, isAccountSuccess) {
					if (errAccount || !isAccountSuccess) return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Account" });
					
					var url;
					
					if (Number(COMMON_UTIL.trim(req.body.c_ver).replace('.', '').replace('.', '').replace('.', '')) < 245) {
						url = global.CONFIG.CDN_INFO.URI + "dea/data/old/product_dea_kr.xml";
						switch (req.body.language) {
							case "kr" :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/old/product_dea_kr.xml";
								break;
							case "en" :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/old/product_dea_en.xml";
								break;
							default :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/old/product_dea_kr.xml";
								break;
						}
					} else {
						url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea_kr.xml";
						switch (req.body.language) {
							case "kr" :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea_kr.xml";
								break;
							case "en" :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea_en.xml";
								break;
							default :
								url = global.CONFIG.CDN_INFO.URI + "dea/data/product_dea_kr.xml";
								break;
						}
					}
					
					request({ uri: url, method: "GET" }, function(error, response, body) {
						parser.parseString(body, function(err, result) {
							var cipher = crypto.createCipheriv('aes256', 'ehfksmschlrhdmlrydbrdyddoq@#$395', 'BAEisTheBestTeam');
							var crypted = cipher.update(body, 'utf8', 'base64');
							crypted += cipher.final('base64');
							
							PACKET.sendSuccess(req, res, {msg : crypted});
						});
					});
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
	
	app.post("/slp.dlaProductList", ROUTE_MIDDLEWARE.NO_AUTH_APP, function(req, res) {
		try {
			MYSQL_SLP_PLATFORM_CONN.procWatchdogPing(function(errPlatform, isPlatformSuccess) {
				if (errPlatform || !isPlatformSuccess) return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Platform" });
				
				MYSQL_SLP_ACCOUNT_CONN.procWatchdogPing(function(errAccount, isAccountSuccess) {
					if (errAccount || !isAccountSuccess) return PACKET.sendJson(req, res, ERROR_CODE_UTIL.RES_FAILED_DB, { msg: "Error, DB, Account" });
					
					var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S1_product.xml";
					switch (COMMON_UTIL.trim(req.body.app_id)) {
						case "1000000003":
							url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S1_product.xml";
							break;
						case "1000000004":
							url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S2_product.xml";
							break;
						case "1000000005":
							url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_S3_product.xml";
							break;
						default :
							PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
							break;
					}
					
					request({ uri: url, method: "GET" }, function(error, response, body) {
						parser.parseString(body, function(err, result) {
							var xmlString = body.replace(/\n/g, '').replace(/\t/g, '');
							var cipher = crypto.createCipheriv('aes256', 'ehfksmschlrhdmlrydbrdyddoq@#$395', 'BAEisTheBestTeam');
							var crypted = cipher.update(xmlString, 'utf8', 'base64');
							crypted += cipher.final('base64');
							
							PACKET.sendSuccess(req, res, { msg: COMMON_UTIL.trim(req.body.c_ver) === "1.0.0" ? crypted : xmlString });
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
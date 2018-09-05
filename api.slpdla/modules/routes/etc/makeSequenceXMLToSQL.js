var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var fs = require('fs');
var request = require("request");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	app.post("/sdla/getSequenceSql", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		var XMLFILE = "";
		var LEVEL = "";
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);

			if (!requestParams.appID) PRINT_LOG.error(__filename, API_PATH, "AppID is Empty");

			switch (requestParams.appID) {
				case "1000000003":
					XMLFILE = "/data/www/SERVICE_XML/slpdla/sequenceFile/dla_lv1_sequence.xml";
					LEVEL = "1";
					break;
				case "1000000004":
					XMLFILE = "/data/www/SERVICE_XML/slpdla/sequenceFile/dla_lv2_sequence.xml";
					LEVEL = "2";
					break;
				case "1000000005":
					XMLFILE = "/data/www/SERVICE_XML/slpdla/sequenceFile/dla_lv3_sequence.xml";
					LEVEL = "3";
					break;
				default :
					PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
					break;
			}

			var xml = fs.readFileSync(XMLFILE, 'utf-8');

			var insertSQL = "INSERT INTO slp_dla_db.episode_info_tb (APP_ID, LEVEL, CATEGORY_ID, EPISODE_ID, PLAY_SEQ, ENABLE) VALUES ";

			parser.parseString(xml, function(err, result) {
				var i = 0;
				var categoryID = "";
				while (i < result.root.sequence[0].category.length) {
					categoryID = result.root.sequence[0].category[i]["$"]["id"];

					var j = 0;
					while (j < result.root.sequence[0].category[i].episodes[0].episode.length) {
						var curEpisode = result.root.sequence[0].category[i].episodes[0].episode[j];
						insertSQL += "(" + requestParams.appID + "," + LEVEL + ",'" + categoryID + "','" + curEpisode + "'," + (j + 1) + ",'y'),";
						j++;
					}
					i++;
				}

				PACKET.sendSuccess(req, res, { QUERY: insertSQL });
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});

	app.post("/sdla/getDataFromWeb", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		var LEVEL = "";
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);

			var insertSQL = "";
			var url = global.CONFIG.CDN_INFO.URI + "dla/dla_lv1_sequence.xml";
			request({ uri: url, method: "GET" }, function(error, response, body) {
				parser.parseString(body, function(err, result) {
					var i = 0;
					var categoryID = "";
					while (i < result.root.sequence[0].category.length) {
						categoryID = result.root.sequence[0].category[i]["$"]["id"];
						var j = 0;
						while (j < result.root.sequence[0].category[i].episodes[0].episode.length) {
							var curEpisode = result.root.sequence[0].category[i].episodes[0].episode[j];
							insertSQL += "(" + requestParams.appID + "," + LEVEL + ",'" + categoryID + "','" + curEpisode + "'," + (j + 1) + ",'y'),";
							j++;
						}
						i++;
					}

					PACKET.sendSuccess(req, res, { QUERY: insertSQL });
				});
			});
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
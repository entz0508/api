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
	app.post("/nde/getSequenceSql", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		var XMLFILE = "";
		// var LEVEL = "";
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);

			if (!requestParams.appID) PRINT_LOG.error(__filename, API_PATH, "AppID is Empty");

			switch (requestParams.appID) {
				case "1000000007":
					XMLFILE = "/data/www/SERVICE_XML/slpnde/sequenceFile/nde_sequence.xml";
					// LEVEL = "1";
					break;
				default :
					PRINT_LOG.error(__filename, API_PATH, "AppID is Wrong");
					break;
			}

			var xml = fs.readFileSync(XMLFILE, 'utf-8');

			var insertSQL = "INSERT INTO slp_nde_db.episode_info_tb (APP_ID, LEVEL, LESSON_ID, UNIT_ID, PLAY_SEQ, ENABLE) VALUES ";

			parser.parseString(xml, function(err, result) {
				var i = 0;
				var levelID = "";
				while (i < result.root.sequence[0].level.length) {
					levelID = result.root.sequence[0].level[i]["$"]["id"];

					var j = 0;
					var lessonID = "";
					while (j < result.root.sequence[0].level[i].lesson.length) {
						lessonID = result.root.sequence[0].level[i].lesson[j]["$"]["id"];

						var k = 0;
						while(k < result.root.sequence[0].level[i].lesson[j].unit.length){
							var curUnitID = result.root.sequence[0].level[i].lesson[j].unit[k]["$"]["id"];
							insertSQL += "(" + requestParams.appID + "," + levelID + ",'" + lessonID + "','" + curUnitID + "'," + ( k + 1 ) + ", 'y'),";
    						k++;
						}
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

	app.post("/nde/getDataFromWeb", ROUTE_MIDDLEWARE.DEFAULT, function(req, res) {
		var API_PATH = req.route.path;
		var CLIENT_IP = COMMON_UTIL.getClientIP(req);
		try {
			var requestParams = {};
			requestParams.req = req;
			requestParams.res = res;
			requestParams.API_PATH = API_PATH;
			requestParams.CLIENT_IP = CLIENT_IP;
			requestParams.appID = COMMON_UTIL.trim(req.body.app_id);

			var insertSQL = "";
			var url = global.CONFIG.CDN_INFO.DEV_CDN + "nde/data/nde_sequence.xml";

			request({ uri: url, method: "GET" }, function(error, response, body) {
                parser.parseString(body, function(err, result) {
                    var i = 0;
                    var levelID = "";
                    while (i < result.root.sequence[0].level.length) {
                        levelID = result.root.sequence[0].level[i]["$"]["id"];

                        var j = 0;
                        var lessonID = "";
                        while (j < result.root.sequence[0].level[i].lesson.length) {
                            lessonID = result.root.sequence[0].level[i].lesson[j]["$"]["id"];

                            var k = 0;
                            var curUnitID = "";
                            while (k < result.root.sequence[0].level[i].lesson[j].unit.length) {
                                curUnitID = result.root.sequence[0].level[i].lesson[j].unit[k]["$"]["id"];

                                insertSQL += "(" + requestParams.appID + "," + levelID + ",'" + lessonID + "','" + curUnitID + "'," + (k + 1) + ",'y')";
                            k++;
                            }
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
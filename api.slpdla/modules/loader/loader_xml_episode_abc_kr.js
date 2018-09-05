// checked by J
var fs = require('fs');
var parseString = require('xml2js').parseString;
const COMMON_UTIL = require("../common/util/common.js");
const PRINT_LOG = global.PRINT_LOGGER;

global.XML_EPISODE_LIST = [];
global.XML_EPISODE_MAP = new Map();

for (var lev = 1; lev < 4; lev++) {
	var xmlFileName = "./data/dla_lv" + lev + "_ep_kr.xml";
	parseString(fs.readFileSync(xmlFileName, "utf8"), function(errParse, result) {
		if (errParse) return PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);

		var len = result.root.episode.length;
		for (var i = 0; i < len; i++) {
			var obj = { EPISODE_ID: COMMON_UTIL.trim(result.root.episode[i].ep_id[0]) };
			//obj.STEP_ID = COMMON_UTIL.trim(result.root.episode[i].step_id[0]);
			//obj.ICON = COMMON_UTIL.trim(result.root.episode[i].icon[0]);
			global.XML_EPISODE_LIST.push(obj);
			global.XML_EPISODE_MAP.set(obj.EPISODE_ID, obj);
		}
	});
}
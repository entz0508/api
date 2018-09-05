// checked by J
var fs = require('fs');
var parseString = require('xml2js').parseString;
const COMMON_UTIL = require("../common/util/common.js");
const PRINT_LOG = global.PRINT_LOGGER;

global.XML_MEDAL_LIST = [];
global.XML_MEDAL_MAP = new Map();

var xmlFileName = "./data/medal_abc_kr.xml";
parseString(fs.readFileSync(xmlFileName, "utf8"), function(errParse, result) {
	if (errParse) return PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);

	var len = result.root.medal.length;
	for (var i = 0; i < len; i++) {
		var obj = {
			MEDAL_ID: Number(COMMON_UTIL.trim(result.root.medal[i].medal_id[0])),
			QUIZ_TOTAL_NUM: Number(COMMON_UTIL.trim(result.root.medal[i].quiz_total_num[0])),
			MEDAL_CATEGORY: Number(COMMON_UTIL.trim(result.root.medal[i].medal_category[0])),
			QUIZ_IDS: COMMON_UTIL.trim(result.root.medal[i].quiz_ids[0]),
			QUIZ_ID_LIST: []
		};

		var strArr = obj.QUIZ_IDS.split(","), strLen = strArr.length;
		for (var idx = 0; idx < strLen; idx++) {
			obj.QUIZ_ID_LIST.push(Number(COMMON_UTIL.trim(strArr[idx])));
		}
		global.XML_MEDAL_LIST.push(obj);
		global.XML_MEDAL_MAP.set(obj.MEDAL_ID, obj);
	}

});
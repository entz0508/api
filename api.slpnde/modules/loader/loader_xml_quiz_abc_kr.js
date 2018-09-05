// checked by J
var fs = require('fs');
var parseString = require('xml2js').parseString;
const COMMON_UTIL = require("../common/util/common.js");
const PRINT_LOG = global.PRINT_LOGGER;

global.XML_QUIZ_LIST = [];
global.XML_QUIZ_MAP = new Map();

var xmlFileName = "./data/quiz_abc_kr.xml";
parseString(fs.readFileSync(xmlFileName, "utf8"), function(errParse, result) {
	if (errParse) return PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);

	var len = result.root.quiz.length;
	for (var i = 0; i < len; i++) {
		var obj = {
			QUIZ_ID: Number(COMMON_UTIL.trim(result.root.quiz[i].quiz_id[0])),
			STEP_ID: COMMON_UTIL.trim(result.root.quiz[i].unit_id[0]),
			UNIT_ID: COMMON_UTIL.trim(result.root.quiz[i].unit_id[0]),
			MEDAL_CATEGORY: Number(COMMON_UTIL.trim(result.root.quiz[i].medal_category[0]))
		};

		global.XML_QUIZ_LIST.push(obj);
		global.XML_QUIZ_MAP.set(obj.QUIZ_ID, obj);
	}
});
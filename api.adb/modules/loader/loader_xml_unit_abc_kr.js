// checked by J
var fs = require('fs');
var parseString = require('xml2js').parseString;
const COMMON_UTIL = require("../common/util/common.js");
const PRINT_LOG = global.PRINT_LOGGER;

global.XML_UNIT_ABC_LIST = [];
global.XML_UNIT_ABC_MAP = new Map();

var xmlFileName = "./data/unit_abc_kr.xml";
parseString(fs.readFileSync(xmlFileName, "utf8"), function(errParse, result) {
	if (errParse) return PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);

	var len = result.root.step.length;
	for (var i = 0; i < len; i++) {
		var obj = {
			STEP_ID: COMMON_UTIL.trim(result.root.step[i].id[0]),
			UNIT_ID: COMMON_UTIL.trim(result.root.step[i].id[0]),
			LEVEL: Number(COMMON_UTIL.trim(result.root.step[i].level[0])),
			STEP: Number(COMMON_UTIL.trim(result.root.step[i].step[0])),
			EPISODE_IDS: COMMON_UTIL.trim(result.root.step[i].episode_ids[0]),
			EPISODE_ID_LIST: [],
			MEDAL_PHONICS: result.root.step[i].medal_phonics[0],
			MEDAL_PHONICS_LIST: [],
			MEDAL_VOCA: COMMON_UTIL.trim(result.root.step[i].medal_phonics[0]),
			MEDAL_VOCA_LIST: [],
			MEDAL_SENTENCE: COMMON_UTIL.trim(result.root.step[i].medal_sentence[0]),
			MEDAL_SENTENCE_LIST: []
		};

		var strArr = obj.EPISODE_IDS.split(","), strLen = strArr.length;
		for (var idx = 0; idx < strLen; idx++) {
			obj.EPISODE_ID_LIST.push(Number(COMMON_UTIL.trim(strArr[idx])));
		}

		if (!COMMON_UTIL.isNull(obj.MEDAL_PHONICS)) {
			var pArr = obj.MEDAL_PHONICS.split(","), pLen = pArr.length;
			for (var pI = 0; pI < pLen; pI++) {
				obj.MEDAL_PHONICS_LIST.push(Number(COMMON_UTIL.trim(pArr[pI])));
			}
		}

		if (!COMMON_UTIL.isNull(obj.MEDAL_VOCA)) {
			var vArr = obj.MEDAL_VOCA.split(","), vLen = vArr.length;
			for (var vI = 0; vI < vLen; vI++) {
				obj.MEDAL_VOCA_LIST.push(Number(COMMON_UTIL.trim(vArr[vI])));
			}
		}

		if (!COMMON_UTIL.isNull(obj.MEDAL_SENTENCE)) {
			var sArr = obj.MEDAL_SENTENCE.split(","), sLen = sArr.length;
			for (var sI = 0; sI < sLen; sI++) {
				obj.MEDAL_SENTENCE_LIST.push(Number(COMMON_UTIL.trim(sArr[sI])));
			}
		}

		global.XML_UNIT_ABC_LIST.push(obj);
		global.XML_UNIT_ABC_MAP.set(obj.STEP_ID, obj);
	}
});
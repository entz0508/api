var fs = require('fs');

const COMMON_UTIL     = require("../common/util/common.js");

const PRINT_LOG = global.PRINT_LOGGER;

global.XML_UNIT_ABC_LIST = [];
global.XML_UNIT_ABC_MAP = new Map();


var xmlFileName = "./data/unit_abc_kr.xml";
var xmlString = fs.readFileSync(xmlFileName, "utf8");

var parseString = require('xml2js').parseString;
parseString(xmlString, function (errParse, result) {
    if (errParse) {
        PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);
    } else {
        var len = result.root.step.length;
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj.STEP_ID = COMMON_UTIL.trim(result.root.step[i].id[0]);
            obj.UNIT_ID = obj.STEP_ID;
            obj.LEVEL = Number(COMMON_UTIL.trim(result.root.step[i].level[0]));
            obj.STEP = Number(COMMON_UTIL.trim(result.root.step[i].step[0]));

            obj.EPISODE_IDS = COMMON_UTIL.trim(result.root.step[i].episode_ids[0]);
            obj.EPISODE_ID_LIST = [];
            var strs = obj.EPISODE_IDS.split(",");
            var strsLen = strs.length;
            for( var idx=0; idx<strsLen; idx++) {
                obj.EPISODE_ID_LIST.push(Number(COMMON_UTIL.trim(strs[idx])));
            }

            obj.MEDAL_PHONICS = result.root.step[i].medal_phonics[0];
            obj.MEDAL_PHONICS_LIST = [];
            if( !COMMON_UTIL.isNull(obj.MEDAL_PHONICS) ) {
                var pList = obj.MEDAL_PHONICS.split(",");
                var pLen = pList.length;
                for (var pI = 0; pI < pLen; pI++) {
                    obj.MEDAL_PHONICS_LIST.push(Number(COMMON_UTIL.trim(pList[pI])));
                }
            }

            obj.MEDAL_VOCA = COMMON_UTIL.trim(result.root.step[i].medal_phonics[0]);
            obj.MEDAL_VOCA_LIST = [];
            if( !COMMON_UTIL.isNull(obj.MEDAL_VOCA) ) {
                var vList = obj.MEDAL_VOCA.split(",");
                var vLen = vList.length;
                for (var vI = 0; vI < vLen; vI++) {
                    obj.MEDAL_VOCA_LIST.push(Number(COMMON_UTIL.trim(vList[vI])));
                }
            }

            obj.MEDAL_SENTENCE = COMMON_UTIL.trim(result.root.step[i].medal_sentence[0]);
            obj.MEDAL_SENTENCE_LIST = [];
            if( !COMMON_UTIL.isNull(obj.MEDAL_SENTENCE) ) {
                var sList = obj.MEDAL_SENTENCE.split(",");
                var sLen = sList.length;
                for( var sI=0; sI<sLen; sI++) {
                    obj.MEDAL_SENTENCE_LIST.push(Number(COMMON_UTIL.trim(sList[sI])));
                }
            }

            global.XML_UNIT_ABC_LIST.push(obj);
            global.XML_UNIT_ABC_MAP.set(obj.STEP_ID, obj);
        }
    }
});

//var a = global.XML_UNIT_ABC_LIST;
//var b = a.length;
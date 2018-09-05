var fs = require('fs');

const COMMON_UTIL     = require("../common/util/common.js");

const PRINT_LOG = global.PRINT_LOGGER;

global.XML_MEDAL_LIST = [];
global.XML_MEDAL_MAP = new Map();


var xmlFileName = "./data/medal_abc_kr.xml";
var xmlString = fs.readFileSync(xmlFileName, "utf8");

var parseString = require('xml2js').parseString;
parseString(xmlString, function (errParse, result) {
    if (errParse) {
        PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);
    } else {
        var len = result.root.medal.length;
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj.MEDAL_ID = Number(COMMON_UTIL.trim(result.root.medal[i].medal_id[0]));
            obj.QUIZ_TOTAL_NUM = Number(COMMON_UTIL.trim(result.root.medal[i].quiz_total_num[0]));
            obj.MEDAL_CATEGORY = Number(COMMON_UTIL.trim(result.root.medal[i].medal_category[0]));
            obj.QUIZ_IDS = COMMON_UTIL.trim(result.root.medal[i].quiz_ids[0]);
            obj.QUIZ_ID_LIST = [];

            var strs = obj.QUIZ_IDS.split(",");
            var strsLen = strs.length;
            for( var idx=0; idx<strsLen; idx++) {
                obj.QUIZ_ID_LIST.push(Number(COMMON_UTIL.trim(strs[idx])));
            }
            global.XML_MEDAL_LIST.push(obj);
            global.XML_MEDAL_MAP.set(obj.MEDAL_ID, obj);
        }
    }
});

//var a = global.XML_MEDAL_LIST;
//var b = a.length;
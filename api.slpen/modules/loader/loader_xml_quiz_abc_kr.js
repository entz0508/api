var fs = require('fs');

const COMMON_UTIL     = require("../common/util/common.js");

const PRINT_LOG = global.PRINT_LOGGER;

global.XML_QUIZ_LIST = [];
global.XML_QUIZ_MAP = new Map();


var xmlFileName = "./data/quiz_abc_kr.xml";
var xmlString = fs.readFileSync(xmlFileName, "utf8");

var parseString = require('xml2js').parseString;
parseString(xmlString, function (errParse, result) {
    if (errParse) {
        PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);
    } else {
        var len = result.root.quiz.length;
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj.QUIZ_ID = Number(COMMON_UTIL.trim(result.root.quiz[i].quiz_id[0]));
            obj.STEP_ID = COMMON_UTIL.trim(result.root.quiz[i].unit_id[0]);
            obj.UNIT_ID = COMMON_UTIL.trim(result.root.quiz[i].unit_id[0]);
            obj.MEDAL_CATEGORY = Number(COMMON_UTIL.trim(result.root.quiz[i].medal_category[0]));
            global.XML_QUIZ_LIST.push(obj);
            global.XML_QUIZ_MAP.set(obj.QUIZ_ID, obj);
        }
    }
});

//var a = global.XML_QUIZ_LIST;
//var b = a.length;
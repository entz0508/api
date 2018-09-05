var fs = require('fs');

const COMMON_UTIL     = require("../common/util/common.js");

const PRINT_LOG = global.PRINT_LOGGER;

global.XML_EPISODE_LIST = [];
global.XML_EPISODE_MAP = new Map();

var xmlFileName = "./data/episode_abc_kr.xml";
var xmlString = fs.readFileSync(xmlFileName, "utf8");

 var parseString = require('xml2js').parseString;
parseString(xmlString, function (errParse, result) {
    if (errParse) {
        PRINT_LOG.setErrorLog(", failed parse xml, " + xmlFileName, errParse);
    } else {
        var len = result.root.episode.length;
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj.EPISODE_ID = COMMON_UTIL.trim(result.root.episode[i].episode_id[0]);
            obj.STEP_ID = COMMON_UTIL.trim(result.root.episode[i].step_id[0]);
            obj.ICON = COMMON_UTIL.trim(result.root.episode[i].icon[0]);
            global.XML_EPISODE_LIST.push(obj);
            global.XML_EPISODE_MAP.set(obj.EPISODE_ID, obj);
        }
    }
});


//var a = global.XML_EPISODE_LIST;
//var b = a.length;
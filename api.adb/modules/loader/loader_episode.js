var fs = require('fs');

var LOG_PRINT = global.PRINT_LOGGER;


global.ENGLISH_EPISODE_LIST = [];


/*
global.EPISODE_LIST = [];


for(var lev=1; lev<4; lev++) {
    var fileFullPath = "./data/episode_" + lev + "_tw_matrix.xml";

    var xmlString = fs.readFileSync(fileFullPath, "utf8");
    var parseString = require('xml2js').parseString;

    parseString(xmlString, function (errParse, result) {
        if(errParse) {
            LOG_PRINT.setErrorLog(", failed parse episode xml, fileFullPath:" + fileFullPath, errParse);
        } else {
            var len = result.data.episode.length;
            for(var i=0; i<len; i++) {
                var obj = {};
                obj.LEVEL = lev;
                obj.EPISODE_ID = result.data.episode[i].$.id;
                obj.PAID_TYPE = result.data.episode[i].$.paid_type;
                obj.PRODUCT_ID = result.data.episode[i].$.product_id;
                obj.TITLE = result.data.episode[i].title[0];
                global.EPISODE_LIST.push(obj);
            }
        }
    });
}
*/
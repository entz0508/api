const fs = require("fs");


global.GLOBAL_VARIABLE = require("./global_variable.js");
global.CONFIG = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
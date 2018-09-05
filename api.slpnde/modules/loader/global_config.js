const fs = require('fs');

global.DEV_LOCAL_SHOP = true;
global.GLOBAL_VARIABLE = require('./global_variable.js');
global.CONFIG = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));
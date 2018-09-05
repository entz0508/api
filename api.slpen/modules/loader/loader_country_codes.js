const fs = require('fs');
const path = require('path');

// config
var cunrtyCodes = fs.readFileSync("./data/country_codes.json", "utf8");
global.COUNTRY_CODES = JSON.parse(cunrtyCodes).country_codes;

const fs = require('fs');

// config
global.COUNTRY_CODES = JSON.parse(fs.readFileSync("./data/country_codes.json", "utf8")).country_codes;
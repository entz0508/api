#!/bin/sh

cd /data/www/api.slpdla/
forever restart app_slp_dla.js
cd /data/www/api.slpen/
forever restart app_slp_en.js
cd /data/www/api.slpkidswatts/
forever restart app_slp_kw.js
cd /data/www/api.slpplatform/
forever restart app_slp_platform.js
clear
forever list


#!/bin/sh

cd /data/www/api.adb/
forever stop app_adb.js
forever start app_adb.js

clear
forever list

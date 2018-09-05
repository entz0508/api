#!/bin/sh
cd /data/www/web.oauth/
forever stop app.js

cd /data/www/web.oauth/
forever start app.js

forever list

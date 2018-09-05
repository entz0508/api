#!/bin/sh

cd /data/www/api.slpnde/
forever stop app_slp_nde.js
cd /data/www/api.slpplatform/
forever stop app_slp_platform.js
cd /data/www/api.jsu/
forever stop app_.js


cd /data/www/api.slpnde/
forever start app_slp_nde.js
cd /data/www/api.slpplatform/
forever start app_slp_platform.js
#cd /data/www/api.jsu/
#forever start app_.js


cp /home/bluedora/.ssh/id_rsa /data/www/api.slpplatform/ssh
rm -f /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh
mv /data/www/api.slpplatform/ssh/id_rsa /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh

clear
forever list

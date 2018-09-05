#!/bin/sh

forever stopall

cd /data/www/api.slpdla/
forever start app_slp_dla.js
cd /data/www/api.slpen/
forever start app_slp_en.js
cd /data/www/api.slpkidswatts/
forever start app_slp_kw.js
cd /data/www/api.slpplatform/
forever start app_slp_platform.js


cp /home/bluedora/.ssh/id_rsa /data/www/api.slpplatform/ssh
rm -f /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh
mv /data/www/api.slpplatform/ssh/id_rsa /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh

clear
forever list


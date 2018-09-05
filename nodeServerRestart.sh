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
<<<<<<< HEAD
cd /data/www/api.slpnde/
forever start app_slp_nde.js

cd /data/www/web.slpplatform/doc.doralab.co.kr/
forever start doc.js

cd /data/www/web.oauth/
forever start app.js

cd /data/www/api.adb/
forever start app_adb.js

#cd /data/www/api.jsu/
#forever start app_jsu.js
=======

>>>>>>> d0e9e72c626f291b023f672593ee97d28645a0c8

cp /home/bluedora/.ssh/id_rsa /data/www/api.slpplatform/ssh
rm -f /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh
mv /data/www/api.slpplatform/ssh/id_rsa /data/www/api.slpplatform/ssh/rsa-key-slp-dla-photo-upload-dev.openssh

clear
forever list


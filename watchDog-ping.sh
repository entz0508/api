#!/bin/sh

LOG_FILE="/data/www/cronLog/log"
#CONTENT=`curl -d "" http://52.193.70.111/slp.platform.ping`
CONTENT=`curl -d "" http://api.doralab.co.kr/slp.platform.ping`


if [ "$CONTENT" !=  '{"res":0}' ]
then 
	echo "== $(date '+%Y-%m-%d %H:%M:%S')  SERVER DIED =========================================" >> $LOG_FILE
	echo "$CONTENT" >> $LOG_FILE
	## EMAIL SEND ##
	echo `/usr/local/bin/node /data/www/api.slpplatform/emailAlram_ping.js` >> $LOG_FILE
	echo "== $(date '+%Y-%m-%d %H:%M:%S')  SERVER DIED =========================================" >> $LOG_FILE
fi


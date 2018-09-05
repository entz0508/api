#!/bin/sh
LOG_FILE="/data/www/cronLog/log-self"

#####################  WEB SERVER ######################
PGM_NAME=nginx
DATE=`date +%Y%m%d-%H%M%S`

Cnt=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|wc -l`
PROCESS=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|awk '{print $2}'`

if [ $Cnt \< 2 ]
then
        echo "== $(date '+%Y-%m-%d %H:%M:%S') WEB SERVER-NGINX PROCESS LESS THEN 2" >> $LOG_FILE
	/usr/local/bin/node /data/www/api.slpplatform/emailAlram_nginx.js
fi
#####################  WEB SERVER  #######################


#####################  MYSQL  #######################
PGM_NAME=mysql
DATE=`date +%Y%m%d-%H%M%S`

Cnt=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|wc -l`
PROCESS=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|awk '{print $2}'`

if [ $Cnt \< 1 ]
then
        echo "== $(date '+%Y-%m-%d %H:%M:%S') MYSQL DATABASE SERVER PROCESS LESS THEN 1" >> $LOG_FILE
	/usr/local/bin/node /data/www/api.slpplatform/emailAlram_mysql.js
fi
#####################  MYSQL  #######################


#####################  NODE.JS  #######################
PGM_NAME=forever
DATE=`date +%Y%m%d-%H%M%S`

Cnt=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|wc -l`
PROCESS=`ps -ef|grep $PGM_NAME|grep -v grep|grep -v vi|awk '{print $2}'`

if [ $Cnt \< 4 ]
then
	/usr/local/bin/node /data/www/api.slpplatform/emailAlram_node.js
	echo "== $(date '+%Y-%m-%d %H:%M:%S') NODE SERVER PROCESS LESS THEN 4" >> $LOG_FILE
fi
#####################  NODE.JS  #######################


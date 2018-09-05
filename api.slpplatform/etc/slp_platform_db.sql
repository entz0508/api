/*
SQLyog Community v12.12 (64 bit)
MySQL - 5.6.19-log : Database - slp_platform_db
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`slp_platform_db` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `slp_platform_db`;

/*Table structure for table `app_auth_token_tb` */

DROP TABLE IF EXISTS `app_auth_token_tb`;

CREATE TABLE `app_auth_token_tb` (
  `APP_ID` bigint(20) NOT NULL,
  `AUTH_TOKEN` varchar(45) NOT NULL,
  `REG_DATETIME` datetime NOT NULL,
  PRIMARY KEY (`APP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `app_auth_token_tb` */

/*Table structure for table `apps_tb` */

DROP TABLE IF EXISTS `apps_tb`;

CREATE TABLE `apps_tb` (
  `APP_ID` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'APP 고유번호\n',
  `DEVELOPER_ID` int(11) NOT NULL COMMENT '개발자 고유 번호\n',
  `API_KEY` varchar(32) NOT NULL COMMENT 'API KEY\n외부에서 API 인증시 사용할 APP API 고유 Key\n\n',
  `PACAKGE_NAME` varchar(128) NOT NULL COMMENT 'package 이름\n',
  `APP_NAME` varchar(64) NOT NULL COMMENT 'APP 이름\n',
  `ICON_URL` varchar(128) NOT NULL,
  `STATUS` tinyint(4) NOT NULL COMMENT '0 : 비활성 상태\n1 : 활성 상태\n',
  `CACHE_IDX` tinyint(4) NOT NULL,
  `REG_DATETIME` datetime NOT NULL COMMENT '등록일',
  PRIMARY KEY (`APP_ID`),
  UNIQUE KEY `APP_ID_UNIQUE` (`APP_ID`),
  UNIQUE KEY `API_KEY_UNIQUE` (`API_KEY`)
) ENGINE=InnoDB AUTO_INCREMENT=1000000007 DEFAULT CHARSET=utf8;

/*Data for the table `apps_tb` */

insert  into `apps_tb`(`APP_ID`,`DEVELOPER_ID`,`API_KEY`,`PACAKGE_NAME`,`APP_NAME`,`ICON_URL`,`STATUS`,`CACHE_IDX`,`REG_DATETIME`) values (1000000000,3,'1000000000','SLP Kidswatts','SLP Kidswatts','',0,0,'2015-03-05 15:48:01'),(1000000001,3,'1000000001','Dora 영어','Dora 영어','',0,0,'2015-04-27 16:23:21'),(1000000002,3,'1000000002','Dora 전화','Dora 전화','',0,0,'2015-04-27 16:23:21'),(1000000003,3,'1000000003','Dora lv1','Dora lv1','',0,0,'2015-04-27 16:23:21'),(1000000004,3,'1000000004','Dora lv2','Dora lv2','',0,0,'2015-04-27 16:23:21'),(1000000005,3,'1000000005','Dora lv3','Dora lv3','',0,0,'2015-04-27 16:23:21'),(1000000006,3,'1000000006','Dora lv4','Dora lv4','',0,0,'2015-04-27 16:23:21');

/*Table structure for table `developer_tb` */

DROP TABLE IF EXISTS `developer_tb`;

CREATE TABLE `developer_tb` (
  `DEVELOPER_ID` int(11) NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(128) NOT NULL,
  `PWD` varchar(128) NOT NULL,
  `COMPANAY_NAME` varchar(128) NOT NULL,
  `REG_DATETIME` datetime NOT NULL,
  `AUTH_TOKEN` varchar(40) NOT NULL,
  `AUTH_IP` varchar(40) NOT NULL,
  `AUTH_DATETIME` datetime NOT NULL,
  PRIMARY KEY (`DEVELOPER_ID`),
  UNIQUE KEY `U_EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

/*Data for the table `developer_tb` */

insert  into `developer_tb`(`DEVELOPER_ID`,`EMAIL`,`PWD`,`COMPANAY_NAME`,`REG_DATETIME`,`AUTH_TOKEN`,`AUTH_IP`,`AUTH_DATETIME`) values (2,'asdasd','asdasd','aaa','2015-03-04 16:29:24','','','0000-00-00 00:00:00'),(3,'heesung@blueark.com','A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=','blueark','2015-03-04 16:29:31','','','0000-00-00 00:00:00'),(4,'heesung1@blueark.com','A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=','blueark','2015-03-04 16:32:26','','','0000-00-00 00:00:00'),(5,'heesung2@blueark.com','A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=','blueark','2015-03-04 16:32:43','','','0000-00-00 00:00:00'),(6,'heesung3@blueark.com','A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=','blueark','2015-03-04 16:33:49','','','0000-00-00 00:00:00'),(7,'heesung4@blueark.com','1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==','blueark','2015-03-04 16:38:21','','','0000-00-00 00:00:00'),(8,'heesung5@blueark.com','1ARVn2Auq2/WAqx2gNrL+q3RNjAzXpUfCXrzkA6d4Xa22yhRLy4AC50E+6UTPoscbo31nbOoq51gvkuXzJ6B2w==','blueark','2015-03-04 16:38:47','','','0000-00-00 00:00:00');

/*Table structure for table `error_code_info_tb` */

DROP TABLE IF EXISTS `error_code_info_tb`;

CREATE TABLE `error_code_info_tb` (
  `CODE` int(11) NOT NULL,
  `MSG` varchar(100) NOT NULL,
  PRIMARY KEY (`CODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `error_code_info_tb` */

insert  into `error_code_info_tb`(`CODE`,`MSG`) values (100,'이미 존재하는 개발자 이메일'),(101,'개발자 계정 생성 실패');

/* Function  structure for function  `fnGetErrorMessage` */

/*!50003 DROP FUNCTION IF EXISTS `fnGetErrorMessage` */;
DELIMITER $$

/*!50003 CREATE FUNCTION `fnGetErrorMessage`(errorCode int) RETURNS varchar(100) CHARSET utf8
BEGIN
		
		DECLARE errorMSG varchar(100);	
		
		SELECT `MSG` INTO errorMSG FROM `error_code_info_tb` WHERE `CODE`=errorCode LIMIT 1;
		
		IF ( errorMSG is null) OR (0>=LENGTH(errorMSG)) THEN
			SET errorMSG = CONCAT('unknown error, code:', errorCode);
		END IF;
		
		return errorMSG;
		
    END */$$
DELIMITER ;

/* Procedure structure for procedure `spAuthApp` */

/*!50003 DROP PROCEDURE IF EXISTS  `spAuthApp` */;

DELIMITER $$

/*!50003 CREATE PROCEDURE `spAuthApp`( appID VARCHAR(20), apiKey varchar(20), clientIP VARCHAR(15) )
BEGIN
		
		DECLARE resCode INT;
		DECLARE errorCode INT;
		DECLARE errorMSG VARCHAR(100);
		
		DECLARE appUID INT;
		DECLARE appName varchar(128);
		DECLARE iconURL VARCHAR(256);
		
		SET resCode = 0;
		SET errorCode = 0;
		SET errorMSG = "";
		
		SELECT `APP_ID`, `APP_NAME`, `ICON_URL` INTO appUID, appName, iconURL FROM `apps_tb` WHERE `APP_ID`=appID LIMIT 1;
		
		IF (appUID is null) OR (0 >= appUID)  THEN
			SET appUID = 0;
			SET appName = '';
			SET iconURL = '';
		END IF;
		
		SELECT 	resCode AS `RES`, appUID AS `APP_ID`, appName AS `APP_NAME`, iconURL AS `ICON_URL`;
		
    END */$$
DELIMITER ;

/* Procedure structure for procedure `spAuthAppID` */

/*!50003 DROP PROCEDURE IF EXISTS  `spAuthAppID` */;

DELIMITER $$

/*!50003 CREATE PROCEDURE `spAuthAppID`( appID BIGINT, authToken VARCHAR(63), clienIP VARCHAR(15) )
BEGIN
		
		DECLARE resCode INT;
		DECLARE errorCode INT;
		DECLARE errorMSG VARCHAR(100);
		
		DECLARE appCount INT;
		DECLARE isAuth INT;
		
		SET resCode = 0;
		SET errorCode = 0;
		SET errorMSG = "";
		
		SELECT COUNT(`APP_ID`) INTO appCount FROM `apps_tb` WHERE `APP_ID`=appID LIMIT 1;
		
		IF (appCount is null) OR (0 >= appCount)  THEN
			SET isAuth = 0;
		ELSE
			SET isAuth = 1;
		END IF;
		
		SELECT resCode AS `RES`, isAuth AS `IS_AUTH`;
		
    END */$$
DELIMITER ;

/* Procedure structure for procedure `spCreateDeveloperAccount` */

/*!50003 DROP PROCEDURE IF EXISTS  `spCreateDeveloperAccount` */;

DELIMITER $$

/*!50003 CREATE PROCEDURE `spCreateDeveloperAccount`(paramEmail VARCHAR(128), paramPWD VARCHAR(128), paramCompanyName VARCHAR(128) )
BEGIN
    
		DECLARE resCode INT;
		DECLARE errorCode INT;
		DECLARE errorMSG VARCHAR(100);
		
		DECLARE accountCount INT;		
		DECLARE developerID INT;
		
		SELECT COUNT(`DEVELOPER_ID`) INTO accountCount FROM `developer_tb` WHERE `EMAIL`=paramEmail LIMIT 1;
		
		SET resCode = 0;
		IF ( accountCount is null ) OR (1 <= accountCount) THEN
			set resCode = -1;
			SET errorCode = 100;
			SET errorMSG = fnGetErrorMessage(errorCode);
		END IF;
		
		if (0 = resCode) THEN
			INSERT INTO `developer_tb`(`EMAIL`,`PWD`,`COMPANAY_NAME`,`REG_DATETIME`,`AUTH_TOKEN`,`AUTH_IP`,`AUTH_DATETIME`) VALUES(paramEmail, paramPWD, paramCompanyName, NOW(), '', '', NOW());
			SET developerID = LAST_INSERT_ID();
			IF (developerID is null) OR (0 >= developerID) THEN
				SET resCode = -1;
				SET errorCode = 101;
				SET errorMSG = fnGetErrorMessage(errorCode);
			END IF;
		END IF;
		
		IF (0 = resCode) THEN
			SELECT resCode AS `RES`, dp.`DEVELOPER_ID`, dp.`EMAIL`, dp.`COMPANAY_NAME`, DATE_FORMAT(dp.`REG_DATETIME`, '%Y-%m-%d %H:%i:%s') AS `REG_DATETIME` 
			FROM `developer_tb` as dp WHERE dp.`DEVELOPER_ID`=developerID AND dp.`EMAIL`=paramEmail AND dp.`PWD`=paramPWD LIMIT 1;
		ELSE
			SELECT resCode AS `RES`, errorCode as `ERR_CODE`, errorMSG as `MSG`;
		END IF;
    END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

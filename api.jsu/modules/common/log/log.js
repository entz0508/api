// log 관련 세팅
var rootDir = "api.slpnde";
var log4js = require('log4js');

function Logger() {}

Logger.prototype.logger = null;

Logger.prototype.log_init = function(appender) {
	log4js.configure({ appenders: appender });
	this.logger = log4js.getLogger(global.CONFIG.LOG_INFO.CATEGORY);
	this.logger.setLevel(global.CONFIG.LOG_INFO.LOGGER_LEVEL);
};

Logger.prototype.setErrorLog = function(title, err) {
	this.logger.error('\n============================ ERROR LOG START ==================================');
	this.logger.error('[' + title + '] error');
	this.logger.error('--------------------------------------------------------------');
	this.logger.error('[Stack]' + err.stack);
	this.logger.error('[Arguments]' + err.arguments);
	this.logger.error('[Type]' + err.type);
	this.logger.error('[Message]' + err.message);
	this.logger.error('============================ ERROR LOG END   ==================================\n');
};

Logger.prototype.error = function error(fileName, apiPath, message) {
	this.logger.error(process.pid + " [" + (convertFilename(fileName)) + "] " + (!message ? apiPath : apiPath + " - " + message));
};

Logger.prototype.info = function info(fileName, apiPath, message) {
	this.logger.info(process.pid + " [" + (convertFilename(fileName)) + "] " + (!message ? apiPath : apiPath + " - " + message));
};

function convertFilename(fileName) {
	var index = fileName.indexOf(rootDir);
	if (index > -1) return fileName.slice(index + rootDir.length);
	return fileName;
}

Logger.prototype.debug = function debug(fileName, apiPath, message) {
	this.logger.info(apiPath + ", " + "------------------------- DEBUG -----------------------------" + " \t\t [" + fileName + "] ");
	this.logger.info(":::\t\t" + message + "\t\t:::");
	this.logger.info(apiPath + ", " + "------------------------- DEBUG -----------------------------" + " \t\t [" + fileName + "] ");
};

module.exports = Logger;
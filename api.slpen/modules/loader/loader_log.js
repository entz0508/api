var Log = require('../common/log/log.js');
global.PRINT_LOGGER = new Log();
global.PRINT_LOGGER.log_init([
	{ type: 'console' },
	{
		type: 'dateFile',
		filename: global.CONFIG.LOG_INFO.FILE_PATH,
		pattern: '.yyyy-MM-dd',
		category: global.CONFIG.LOG_INFO.CATEGORY
	}
]);
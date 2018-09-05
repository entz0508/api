/* global process, obj, pp */

// common
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

exports.add_routes = function(app) {
	app.post('/slp.listaction', function(req, res) {
		var API_PATH = req.route.path;
		try {
			var authPasswd = global.CONFIG.SERVER_INFO.PASSWORD; //global 변수로 passwd 저장 하여 사용.

			if (authPasswd !== COMMON_UTIL.trim(req.body.passwd)) {
				PRINT_LOG.info("", "", "Fail!");
				return PACKET.sendFail(req, res, { result: "Fail" });
			}
			PRINT_LOG.info("", "", "Success!");
			PACKET.sendSuccess(req, res, { result: "Success" });
		} catch (catchErr) {
			PRINT_LOG.setErrorLog("[" + API_PATH + "] error, [" + __filename + "]", catchErr);
			PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
		}
	});
};
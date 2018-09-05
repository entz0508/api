module.exports = {
	sendSuccess: function(req, res, obj) {
		obj.res = 0;
		res.send(JSON.stringify(obj));
	},
	sendFail: function(req, res, error_code) {
		res.send(JSON.stringify({ res: error_code }));
	},
	sendJson: function(req, res, resultCode, obj) {
		obj.res = resultCode;
		res.send(JSON.stringify(obj));
	}
};
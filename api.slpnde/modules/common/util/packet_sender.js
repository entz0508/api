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
    },
    sendSuccess2: function (req, res, obj) {
        var obj2 = {};
        obj2.success = true;
        obj2.error = null;
        obj2.data = obj;
        res.send(JSON.stringify(obj2));
    },
    sendFail2: function (req, res, msg, obj) {
        var obj2 = {};
        obj2.success = false;
        obj2.error = msg;
        obj2.data = obj;
        res.send(JSON.stringify(obj2));
    }
};
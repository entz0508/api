module.exports = {
	sendSuccess: function (req, res, msg, obj) {
        var result = {};
        result.res = 0;
        result.msg = msg;
        result.data = obj
        res.send(JSON.stringify(result));
    },
    sendFail: function (req, res, error_code, msg, obj) {
        var result = {};
        result.res = error_code;
        result.msg = msg;
        result.data = obj
        res.send(JSON.stringify(result));
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
    },

    sendJson: function (req, res, resultCode, obj) {
        obj.res = resultCode;
        res.send(JSON.stringify(obj));
    }
};
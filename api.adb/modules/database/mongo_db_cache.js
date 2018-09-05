require('date-utils');
var url = require('url');

const mongoDBConnectionString = global.CONFIG.MONGODB_CACHE.CONNECT_STRING;
var MongoClient = require('mongodb').MongoClient;
var currentDB;

const MONGO_COLLECTION_DEVICE_TOKEN_IOS = "device_token_ios";
const MONGO_COLLECTION_DEVICE_TOKEN_ANDROID = "device_token_android";

const COMMON_UTIL = require("../common/util/common.js");
const PRINT_LOG = global.PRINT_LOGGER;

function isNULL(value) {
	"use strict";
	return ("undefined" === typeof value) || (null === value) || ("" === value);
}

function mongoDBconnect(callback) {
	"use strict";
	if (isNULL(currentDB)) {
		var url = decodeURIComponent(mongoDBConnectionString);
		MongoClient.connect(url, function(err, db) {
			if (err) return callback(err);
			
			currentDB = db;
			callback(null, db);
		});
	} else {
		callback(null, currentDB);
	}
}

module.exports = {
	regDeviceToken: function(requestParams) {
		"use strict";
		
		var dt = new Date(requestParams.curUnixtimeStamp * 1000);
		
		var document = {
			_id: requestParams.deviceToken,
			device_token: requestParams.deviceToken,
			account_id: Number(requestParams.accountID),
			reg_datetime: COMMON_UTIL.convertDateToDateString(dt),
			reg_datetime_ts: Number(requestParams.curUnixtimeStamp)
		};
		
		mongoDBconnect(function(err, db) {
			if (err) {
				PRINT_LOG.error(__filename, "mongodb.insertAccountInfo");
				PRINT_LOG.setErrorLog('mongodb.insertAccountInfo', err);
			} else {
				var collection;
				if ("android" === requestParams.os) collection = db.collection(MONGO_COLLECTION_DEVICE_TOKEN_ANDROID);
				if ("ios" === requestParams.os) collection = db.collection(MONGO_COLLECTION_DEVICE_TOKEN_IOS);
				
				collection.save(document, function(updateErr, result) {
					if (updateErr) {
						PRINT_LOG.error(__filename, "mongodb_cache.regDeviceToken, ");
						PRINT_LOG.setErrorLog("mongodb_cache.regDeviceToken, collection.update", updateErr);
					}
					console.log(result);
				});
			}
		});
	}
};
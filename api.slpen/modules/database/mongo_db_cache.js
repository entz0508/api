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
	return ("undefined" === typeof value) || (null === value) || ("" === value);
}

module.exports = {
	regDeviceToken: function(requesParams) {
		(function(callback) {
			if (isNULL(currentDB)) {
				MongoClient.connect(decodeURIComponent(mongoDBConnectionString), function(err, db) {
					if (err) return callback(err);
					currentDB = db;
					callback(null, db);
				});
			} else {
				callback(null, currentDB);
			}
		})(function(err, db) {
			if (err) {
				PRINT_LOG.error(__filename, "mongodb.insertAccountInfo");
				PRINT_LOG.setErrorLog('mongodb.insertAccountInfo', err);
			} else {
				var collection;
				if ("android" === requesParams.os) {
					collection = db.collection(MONGO_COLLECTION_DEVICE_TOKEN_ANDROID);
				} else if ("ios" === requesParams.os) {
					collection = db.collection(MONGO_COLLECTION_DEVICE_TOKEN_IOS);
				}
				
				collection.save({
					_id: requesParams.deviceToken,
					device_token: requesParams.deviceToken,
					account_id: Number(requesParams.accountID),
					reg_datetime: COMMON_UTIL.convertDateToDateString(new Date(requesParams.curUnixtimeStamp * 1000)),
					reg_datetime_ts: Number(requesParams.curUnixtimeStamp)
				}, function(updateErr, result) {
					if (updateErr) {
						PRINT_LOG.error(__filename, "mongodb_cache.regDeviceToken, ");
						PRINT_LOG.setErrorLog("mongodb_cache.regDeviceToken, collection.update", updateErr);
					}
				});
			}
		});
	}
};
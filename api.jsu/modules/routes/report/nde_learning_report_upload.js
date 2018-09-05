// nodejs npm
const FS = require('fs');
//const LWIP = require("lwip");

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_KW_ACTION_LOG_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_KW_ACTION_LOG;
//const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;
//const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

const IMAGE_DEFAULT_SIZE_LIMIT = 1024;
const IMAGE_THUMBNAIL_SIZE_MAX = 350;

const IMAGE_TYPE_DEFAULT = 0;
const IMAGE_TYPE_THUMBNAIL = 1;

function add_routes(app) {
    "use strict";
    
    var sendFile = function (localTempPath, localTempFileFullPath, defaultFileName, targetPath, callBack) {

        var resData = {};
        resData.isSuccess = false;
        resData.localTempPath = localTempPath;
        resData.localTempFileFullPath = localTempFileFullPath;
        resData.defaultFileName = defaultFileName;
        resData.destPath = targetPath;

        var srcDefaultImgFullPath = localTempPath + defaultFileName;
        var destDefaultImgFullPath = targetPath + "/" + defaultFileName;

        sendsftp(srcDefaultImgFullPath, destDefaultImgFullPath, function (resDefaultImage) {

            //PRINT_LOG.error(__filename, "", "sendsftp >> " + resDefaultImage.isSuccess);
            if (!resDefaultImage.isSuccess) {
                resData.msg = " Failed : send Default Image, " + srcDefaultImgFullPath + " to " + destDefaultImgFullPath;
                resData.err = resDefaultImage.err;
                callBack(resData);
            } else {
                resData.isSuccess = true;
                callBack(resData);
            }
        });
    };

    var sendsftp = function (srcFileFullPath, descFileFullPath, callBack) {

        var Client = require('ssh2').Client;

        var conn = new Client();
        conn.on('ready', function () {
            conn.sftp(function (err1, sftp) {
                if (err1) {
                    PRINT_LOG.setErrorLog("failed, connect sftp ", err1);
                    var resData = {};
                    resData.isSuccess = false;
                    resData.msg = "failed, connect sftp";
                    resData.err = err1;
                    callBack(resData);
                    conn.end();
                } else {
                    var resData = {};
                    resData.isSuccess = false;
                    resData.msg = "";
                    resData.err = null;

                    var readStream = FS.createReadStream(srcFileFullPath);
                    var writeStream = sftp.createWriteStream(descFileFullPath);

                    writeStream.on("end", function () {
                        conn.end();
                    });
                    writeStream.on("close", function () {
                        if (resData.err) {
                            resData.msg = resData.msg + ", " + "send failed file transferred, close, " + srcFileFullPath + " to " + descFileFullPath;
                            PRINT_LOG.error(__filename, "", resData.msg);
                        } else {
                            resData.isSuccess = true;
                        }
                        callBack(resData);
                        conn.end();
                        sftp.end();
                    });
                    writeStream.on("error", function (writeErr) {
                        if (writeErr) {
                            resData.err = writeErr;
                            resData.msg = "failed, photo file send";
                            PRINT_LOG.setErrorLog(resData.msg, writeErr);
                        }
                    });
                    readStream.pipe(writeStream);
                }
            });
        });

        conn.on("error", function (err) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = err;
            resData.msg = "failed, connect ssh client";
            PRINT_LOG.setErrorLog(resData.msg, err);
            callBack(resData);
        });

        conn.connect({
            host: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.USERNAME,
            privateKey: require('fs').readFileSync(global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PRIVATE_KEY)
        });
    };

    // checkImageServerPath -> existsImageServerPath
    var existsImageServerPath = function (targetPath, callBack) {
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PRIVATE_KEY, "utf-8");
        var Client = require('ssh2').Client;

        var conn = new Client();
        conn.on("ready", function () {
            conn.sftp(function (err1, sftp) {
                var resData = {};
                resData.isSuccess = false;
                resData.err = null;
                resData.targetPath = targetPath;
                resData.isExists = false;
                if (err1) {
                    PRINT_LOG.setErrorLog("adas", err1);
                    callBack(resData);
                } else {
                    sftp.readdir(targetPath, function (err, list) {
                        resData.isSuccess = true;
                        if (err) {
                            resData.err = err;
                        } else {
                            resData.isExists = true;
                            //console.dir(list);
                        }
                        conn.end();
                        sftp.end();
                        callBack(resData);
                    });
                }
            });
        });

        conn.on('error', function (err) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = err;
            resData.targetPath = targetPath;
            resData.isMakeDir = false;
            resData.msg = "failed, connect ssh client";
            PRINT_LOG.setErrorLog(resData.msg, err);
            callBack(resData);
        });

        conn.connect({
            host: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.USERNAME,
            privateKey: privateKeyString
        });
    };
    
    var makeDirImageServerPath = function (targetPath, callBack) {
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PRIVATE_KEY, "utf-8");
        var Client = require('ssh2').Client;
        //PRINT_LOG.error(__filename, "", "ADDR : " + global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.HOST);

        var conn = new Client();
        conn.on("ready", function () {
            conn.exec("mkdir " + targetPath, function (err, stream) {
                var resData = {};
                resData.isSuccess = false;
                resData.err = null;
                resData.targetPath = targetPath;
                resData.isMakeDir = false;
                if (err) {
                    PRINT_LOG.setErrorLog("makeDirImageServerPath", err);
                    resData.err = err;
                    callBack(resData);
                } else {
                    stream.on("close", function (code, signal) {
                        //console.log("Stream :: close :: code: " + code + ", signal: " + signal);
                        if (!COMMON_UTIL.isNull(code) && !isNaN(code) && (0 === Number(code))) {
                            resData.isSuccess = true;
                            resData.isMakeDir = true;
                        }
                        conn.end();
                        callBack(resData);
                    });
                    stream.on('data', function (data) {
                        //console.log("STDOUT: " + data);
                    });
                    stream.stderr.on('data', function (data) {
                        console.log("STDERR: " + data);
                    });
                }

            });
        });

        conn.on('error', function (err) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = err;
            resData.targetPath = targetPath;
            resData.isMakeDir = false;
            resData.msg = "failed, connect ssh client";
            PRINT_LOG.setErrorLog(resData.msg, err);
            callBack(resData);
        });

        conn.connect({
            host: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.USERNAME,
            privateKey: privateKeyString
        });
    };

    var checkImageServerPath = function (targetPath, callBack) {
        existsImageServerPath(targetPath, function (resDataExists) {
            if (!resDataExists.isSuccess) {
                callBack(resDataExists);
            } else {
                if (resDataExists.isExists) {
                    callBack(resDataExists);
                } else {
                    makeDirImageServerPath(targetPath, function (resDataMake) {
                        if (!resDataMake.isSuccess) {
                            callBack(resDataMake);
                        } else {
                            if (!resDataMake.isMakeDir) {
                                resDataMake.isSuccess = false;
                                resDataMake.msg = "failed, mkdir " + targetPath;
                                callBack(resDataMake);
                            } else {
                                existsImageServerPath(targetPath, function (resDataExistsRetry) {
                                    if (!resDataExistsRetry.isSuccess) {
                                        callBack(resDataExistsRetry);
                                    } else {
                                        if (resDataExistsRetry.isExists) {
                                            resDataExistsRetry.isSuccess = true;
                                            callBack(resDataExistsRetry);
                                        } else {
                                            resDataExistsRetry.isSuccess = false;
                                            resDataExistsRetry.msg = "not found dir,  " + targetPath;
                                            callBack(resDataExistsRetry);
                                        }
                                    }

                                });
                            }
                        }
                    });
                }
            }
        });

    };

    var checkFileServerPathAll = function (requestParams, localTempPath, localTempFileFullPath, defaultFileName, callBack) {
        var path = global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.FILE_PATH_BEGIN + "/" + global.CONFIG.SERVER_INFO.RECORD.FILE_SERVER_REAL.FILE_PATH_END;
        checkImageServerPath(path + requestParams.accountID, function (resDataA) {

            if (!resDataA.isSuccess) {
                resDataA.localTempPath = localTempPath;
                resDataA.localTempFileFullPath = localTempFileFullPath;
                resDataA.defaultFileName = defaultFileName;
                callBack(resDataA);
            } else {
                checkImageServerPath(path + requestParams.accountID + "/" + requestParams.profileID, function (resDataB) {
                    resDataB.localTempPath = localTempPath;
                    resDataB.localTempFileFullPath = localTempFileFullPath;
                    resDataB.defaultFileName = defaultFileName;
                    callBack(resDataB);
                });
            }
        });
    };

    var readUploadFile = function (requestParams, callBack) {
        var uploadFilePath = requestParams.files.uploadfile.path;
        //var fileExt = uploadFilePath.substring(uploadFilePath.lastIndexOf(".") + 1);
        //var reg = /gif|jpg|jpeg|png|dat|mp4|/i;

        /*
        if (!reg.test(fileExt)) {
            var resData = {};
            resData.isSuccess = false;
            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UNKNOWN_FILE_TYPE;
            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UNKNOWN_FILE_TYPE + "error params, unknown file type";
            resData.requestParams = requestParams;
            callBack(resData);
        } else {
        */

            //if ("dat" === fileExt) {
            //    fileExt = "jpg";
            //}

            //var formatType = "." + fileExt;

            FS.readFile(uploadFilePath, function (error, data) {
                if (error) {
                    var resData = {};
                    resData.isSuccess = false;
                    resData.err = error;
                    resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_READ;
                    resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_READ + "error file read";
                    resData.localTempFileFullPath = null;
                    callBack(resData);
                } else {
                    var randomNumber = Math.floor((Math.random() * 1000) + 1);

                    //var fileNameWithoutFileType = "a" + requestParams.appID + "_" + requestParams.accountID + "_" + requestParams.profileID + "_" + COMMON_UTIL.getUnixTimestamp() + "_" + randomNumber;
                    //var fileName = fileNameWithoutFileType + formatType;
                    var fileName = requestParams.recordFileName;        //requestParams.files.uploadfile.originalFilename;
                    var localTempFileFullPath = global.CONFIG.SERVER_INFO.RECORD.LOCAL_TEMP_PATH + fileName;       // temp폴더 저장 파일명

                    FS.writeFile(localTempFileFullPath, data, function (error) {
                        var resData = {};
                        resData.isSuccess = false;
                        resData.err = null;
                        resData.fileName = fileName;
                        //resData.fileNameWithoutFileType = fileNameWithoutFileType;
                        resData.localTempPath = global.CONFIG.SERVER_INFO.RECORD.LOCAL_TEMP_PATH;
                        resData.localTempFileFullPath = localTempFileFullPath;
                        resData.requestParams = requestParams;
                        resData.contentType = requestParams.files.uploadfile.type;
                        if (error) {
                            resData.isSuccess = false;
                            resData.err = error;
                            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP;
                            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP + "error, write to local temp path, " + localTempFileFullPath;
                        } else {
                            resData.isSuccess = true;
                        }
                        callBack(resData);
                    });
                }
            });
        //}
    };
    

    // uploadFile -> updateDB
    var updateDB = function (requestParams, serverIdx, localTempPath, localTempFileFullPath, defaultFileName, callBack) {

        var resData = {};
        resData.isSuccess = false;
        resData.err = null;
        resData.msg = "unknow error";
        resData.res = -1;
        resData.localTempPath = localTempPath;
        resData.localTempFileFullPath = localTempFileFullPath;
        resData.defaultFileName = defaultFileName;
        resData.serverIdx = serverIdx;
        
        MYSQL_SLP_KW_ACTION_LOG_CONN.procAddRecord_nde(requestParams, serverIdx, defaultFileName, function (err, results) {
            if (err) {
                resData.msg = "Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procAddRecord_nde";
                PRINT_LOG.setErrorLog(resData.msg, err);

            } else if (COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
                resData.msg = "MYSQL_SLP_KW_ACTION_LOG_CONN.procAddRecord_nde, db results is null";
                PRINT_LOG.error(__filename, "", resData.msg);

            } else {
                var retV = COMMON_UTIL.getMysqlRES(results);
                resData.res = retV.res;
                if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
                    resData.msg = retV.msg;
                    PRINT_LOG.error(__filename, "", resData.msg);
                } else {
                    resData.isSuccess = true;
                }
            }
            callBack(resData);
        });
    };


    // /slp.user.account.profile.img.upload -> uploadFile
    var uploadFile = function (requestParams, callBack) {

        requestParams.files = requestParams.req.files;

        //PRINT_LOG.error(__filename, "", "requestParams.files.uploadfile >> " + requestParams.files);
        //PRINT_LOG.error(__filename, "", "requestParams.files.uploadfile.path >> " + requestParams.files.uploadfile.path);
        
        if (COMMON_UTIL.isNull(requestParams.files) || COMMON_UTIL.isNull(requestParams.files.uploadfile) || COMMON_UTIL.isNull(requestParams.files.uploadfile.path)) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = null;
            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES;
            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES + "error params, files";
            resData.localTempFileFullPath = null;
            callBack(resData);
        } else {
            //PRINT_LOG.error(__filename, "", "originalFilename >> " + requestParams.files.uploadfile.originalFilename);
            //PRINT_LOG.error(__filename, "", "requestParams.files >> " + JSON.stringify(requestParams.files));
            readUploadFile(requestParams, function (resData) {

                if (!resData.isSuccess) {
                    callBack(resData);
                } else {
                    requestParams.localTempPath = resData.localTempPath;                        // "/data/temp_photo/"
                    requestParams.localTempFileFullPath = resData.localTempFileFullPath;        // "/data/temp_photo/tmp_a1000000007_100029182_159037_1512521862_120.PNG"

                    //PRINT_LOG.error(__filename, "", "localTempFileFullPath >> " + resData.localTempFileFullPath);

                    requestParams.fileNameWithoutFileType = resData.fileNameWithoutFileType;    // "a1000000007_100029182_159037_1512521862_120"
                    requestParams.defaultFileName = resData.fileName;
                    requestParams.contentType = resData.contentType;
                    //requestParams.contentType = "ssss";
                    //PRINT_LOG.error(__filename, "", "contentType >> " + resData.contentType);

                    checkFileServerPathAll(requestParams, requestParams.localTempPath, requestParams.localTempFileFullPath,
                        requestParams.defaultFileName, function (resDest) {
                            if (!resDest.isSuccess) {
                                callBack(resDest);
                            } else {
                                sendFile(resDest.localTempPath, resDest.localTempFileFullPath,
                                    resDest.defaultFileName,
                                    resDest.targetPath, function (resDataSend) {
                                        if (!resDataSend.isSuccess) {
                                            callBack(resDataSend);
                                        } else {
                                            var localTempPath = resDataSend.localTempPath;
                                            var localTempFileFullPath = resDataSend.localTempFileFullPath;
                                            var defaultFileName = resDataSend.defaultFileName;          // resData.fileName
                                            var serverIdx = 0;

                                            updateDB(requestParams, serverIdx, localTempPath, localTempFileFullPath, defaultFileName, function (resDB) {
                                                callBack(resDB);
                                            });
                                        }
                                    });
                            }
                        });
                    
                }
            });
        }
    };

    app.post("/nde/report/learning/upload", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};
            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;

            requestParams.countryCode = COMMON_UTIL.trim(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.appToken = COMMON_UTIL.trim(req.body.app_token);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);

            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);

            requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            requestParams.levelID = COMMON_UTIL.trim(req.body.level_id);
            requestParams.lessonID = COMMON_UTIL.trim(req.body.lesson_id);
            requestParams.unitID = COMMON_UTIL.trim(req.body.unit_id);
            requestParams.recordText = COMMON_UTIL.trim(req.body.record_text);
            requestParams.nativeFileName = COMMON_UTIL.trim(req.body.native_file_name);
            requestParams.recordFileName = COMMON_UTIL.trim(req.body.record_file_name);
            
            requestParams.curUnixtime = COMMON_UTIL.getUnixTimestamp();

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) ||
                !COMMON_UTIL.isValidProfileID(requestParams.profileID)) {
                PRINT_LOG.error(__filename, API_PATH, " error, params, accountID:" + requestParams.accountID + ", profileID:" + requestParams.profileID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                return;
            }

            // 이미지 서버를 구글 스토리지로 변경하기 전까지 무조건 성공으로 보냄
            //var responseObj = {};
            //PACKET.sendSuccess(req, res, responseObj);
            //return;

            uploadFile(requestParams, function (resData) {
                if (resData.isSuccess) {
                    var responseObj = {};
                    resData.serverIdx = 0;

                    var path = COMMON_UTIL.getFilePath(resData.serverIdx) + requestParams.accountID + "/" + requestParams.profileID + "/";
                    responseObj.pf_id = requestParams.profileID;
                    responseObj.file_url = path + resData.defaultFileName;
                    //responseObj.img_th_url = path + resData.imageThumbnailFileName;
                    PACKET.sendSuccess(req, res, responseObj);
                } else {
                    PRINT_LOG.error(__filename, API_PATH, resData.msg);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
                }

                if (!COMMON_UTIL.isNull(resData.localTempFileFullPath)) {
                    FS.unlink(resData.localTempFileFullPath, function (err) {
                        if (err) {
                            PRINT_LOG.setErrorLog(__filename + API_PATH, err);
                        }
                    });
                }
                
            });
        } catch (catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });

    app.post("/nde/report/learning/recordList", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT_WITH_PROFILE, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var requestParams = {};

            var responseOBJ = {};
            responseOBJ.record_list = [];

            requestParams.req = req;
            requestParams.res = res;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.countryCode = COMMON_UTIL.trimCountry(req.body.country);
            requestParams.appID = COMMON_UTIL.trim(req.body.app_id);
            requestParams.os = COMMON_UTIL.trim(req.body.os);
            requestParams.clientUID = COMMON_UTIL.trim(req.body.client_uid);
            requestParams.clientVer = COMMON_UTIL.trim(req.body.c_ver);
            requestParams.accountID = COMMON_UTIL.trim(req.body.account_id);
            requestParams.accessToken = COMMON_UTIL.trim(req.body.access_token);
            requestParams.profileID = COMMON_UTIL.trim(req.body.pf_id);
            //requestParams.seqID = COMMON_UTIL.trim(req.body.seq_id);
            //requestParams.levelID = COMMON_UTIL.trim(req.body.level_id);
            requestParams.lang = "KO";

            if (!COMMON_UTIL.isValidAccountID(requestParams.accountID)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            if (!COMMON_UTIL.isValidAccessToken(requestParams.accessToken)) {
                requestParams.accountID = 0;
                requestParams.accessToken = "";
            }

            MYSQL_SLP_KW_ACTION_LOG_CONN.procrecordList_nde(requestParams, function (err, results) {
                if (err) {
                    PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_KW_ACTION_LOG_CONN.procrecordList_nde", err);
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                    PRINT_LOG.error(__filename, API_PATH, " db results is null");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                } else {
                    var record_list = [];

                    var recordInfo = {};
                    recordInfo.APP_ID = Number(requestParams.appID);
                    recordInfo.ACCOUNT_ID = Number(requestParams.accountID);
                    recordInfo.PROFILE_ID = Number(requestParams.profileID);
                    recordInfo.FILE_COUNT = Number(results[0].length);
                    recordInfo.SEQ_LIST = [];

                    var path = COMMON_UTIL.getFilePath(0) + requestParams.accountID + "/" + requestParams.profileID + "/";

                    var lastSEQ = {};
                    lastSEQ.SEQ_ID = 0;
                    lastSEQ.LEVEL_LIST = [];

                    var lastLevel = {};
                    lastLevel.LEVEL_ID = 0;
                    lastLevel.FILE_LIST = [];

                    var lastLesson = {};
                    lastLesson.LESSON_ID = "none";
                    lastLesson.RECORD_TEXT = "none";
                    lastLesson.NATIVE_FILE_NAME = "none";
                    lastLesson.RECORD_FILE_NAME = "none";
                    lastLesson.REG_DATETIME = "none";

                    for (var i = 0, len = results[0].length; i < len; i++) {
                        var result = results[0][i];
                        if (lastSEQ.SEQ_ID <= 0) {
                            lastSEQ.SEQ_ID = result.SEQ_ID;
                            lastLevel.LEVEL_ID = result.LEVEL_ID;
                        }
                        
                        if (result.SEQ_ID == lastSEQ.SEQ_ID) {
                            if (result.LEVEL_ID != lastLevel.LEVEL_ID) {
                                lastSEQ.LEVEL_LIST.push(lastLevel);
                                lastLevel = {};
                                lastLevel.LEVEL_ID = result.LEVEL_ID;
                            }
                        } else {
                            lastSEQ.LEVEL_LIST.push(lastLevel);
                            recordInfo.SEQ_LIST.push(lastSEQ);

                            lastSEQ = {};
                            lastSEQ.SEQ_ID = result.SEQ_ID;
                            lastSEQ.LEVEL_LIST = [];
                            lastLevel = {};
                            lastLevel.LEVEL_ID = result.LEVEL_ID;
                        }
                        
                        if (!lastLevel.FILE_LIST) lastLevel.FILE_LIST = [];
                        
                        lastLevel.FILE_LIST.push({
                            LESSON_ID: result.LESSON_ID,
                            UNIT_ID: result.UNIT_ID,
                            RECORD_TEXT: result.RECORD_TEXT,
                            NATIVE_FILE_NAME: result.NATIVE_FILE_NAME,
                            RECORD_FILE_NAME: path + result.RECORD_FILE_NAME,
                            REG_DATETIME: result.REG_DATETIME
                        });

                        if (i == (results[0].length - 1)) {
                            lastSEQ.LEVEL_LIST.push(lastLevel);
                            recordInfo.SEQ_LIST.push(lastSEQ);
                        }
                    }
                    record_list.push(recordInfo);
                    PACKET.sendSuccess(req, res, { record_list: record_list });
                }
            });

        } catch (catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;

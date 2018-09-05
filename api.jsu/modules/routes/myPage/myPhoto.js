/**
 * Created by kkuris on 2018-03-29.
 */
require('date-utils'); // Date.prototype ����
require('circular-json');

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");

const FS = require('fs');
const CircularJSON = require('circular-json');

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_ADB_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.ADB_ACCOUNT;

const IMAGE_DEFAULT_SIZE_LIMIT = 1024;
const IMAGE_THUMBNAIL_SIZE_MAX = 350;
const IMAGE_TYPE_DEFAULT = 0;
const IMAGE_TYPE_THUMBNAIL = 1;
const path = require('path');

exports.add_routes = function (app) {
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
            host: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.USERNAME,
            privateKey: require('fs').readFileSync(global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PRIVATE_KEY)
        });
    };

    // checkImageServerPath -> existsImageServerPath
    var existsImageServerPath = function (targetPath, callBack) {
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PRIVATE_KEY, "utf-8");
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
            host: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.USERNAME,
            privateKey: privateKeyString
        });
    };

    var makeDirImageServerPath = function (targetPath, callBack) {
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PRIVATE_KEY, "utf-8");
        var Client = require('ssh2').Client;
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
            host: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST,
            port: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PORT,
            username: global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.USERNAME,
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
        /*
         "PHOTO_PATH_BEGIN": "/data/www/images/slp/profile",
         "PHOTO_PATH_END": "photos/"
         */
        var path = global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_BEGIN + "/" + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_END;
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

    //var checkFilePath = function (accountID, callBack) {
    //    var localPath1 = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH + (requestParams.isAccountID % 10);
    //    var localPath2 = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH + (requestParams.isAccountID % 10) + "/" + (requestParams.isAccountID % 100);
    //    var localPath3 = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH + (requestParams.isAccountID % 10) + "/" + (requestParams.isAccountID % 100) + "/" + requestParams.isAccountID;
    //    if (!FS.existsSync(localFullPath)) {
    //        FS.mkdirSync(localFullPath);
    //    }
    //
    //    var checkPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH + (accountID % 10);
    //    if (!FS.existsSync(localFullPath)) {
    //        FS.mkdirSync(localFullPath);
    //    }
    //
    //}

    var makeDirSync = function (location, callBack) {
        var normalizedPath = path.normalize(location);
        var parsedPathObj = path.parse(normalizedPath);
        var curDir = parsedPathObj.root;
        var folders = parsedPathObj.dir.split(path.sep);
        folders.push(parsedPathObj.base);
        for (var part of folders) {
            curDir = path.join(curDir, part);
            if (!FS.existsSync(curDir)) {
                FS.mkdirSync(curDir);
            }
        }
        callBack(FS.existsSync(location));
    };

    var readUploadFile = function (requestParams, callBack) {
        var uploadFilePath = requestParams.files.uploadfile.path;
        var fileExt = uploadFilePath.substring(uploadFilePath.lastIndexOf(".") + 1);
        var reg = /gif|jpg|jpeg|png|/i;

        if (!reg.test(fileExt)) {
            var resData = {};
            resData.isSuccess = false;
            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UNKNOWN_FILE_TYPE;
            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UNKNOWN_FILE_TYPE + "error params, unknown file type";
            resData.requestParams = requestParams;
            callBack(resData);
        } else {
            if ("dat" === fileExt) {
                fileExt = "jpg";
            }
            var formatType = "." + fileExt;

            //PRINT_LOG.info(__filename, "readUploadFile", " fileExt : " + fileExt);
            //PRINT_LOG.info(__filename, "readUploadFile", " padStart : " + "125".padStart(8, "0"));

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
                    //var randomNumber = Math.floor((Math.random() * 1000) + 1);
                    //var fileNameWithoutFileType = "a" + requestParams.isAccountID + "_" + COMMON_UTIL.getUnixTimestamp() + "_" + randomNumber;
                    //var fileName = requestParams.PHOTOFileName;        //requestParams.files.uploadfile.originalFilename;

                    var fileNameWithoutFileType = "profile" + "_" + requestParams.isAccountID;
                    var fileName = fileNameWithoutFileType + formatType;
                    //var localTempFileFullPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_TEMP_PATH + fileName;       // temp폴더 저장 파일명
                    //var localTempFileFullPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_TEMP_PATH + (requestParams.isAccountID%100) + "/" + fileName;       // temp폴더 저장 파일명

                    var localFullPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH + ('' + requestParams.isAccountID).slice(-2) + "/" + ('' + requestParams.isAccountID).slice(-4) + "/" + requestParams.isAccountID;
                    var localFileFullPath = localFullPath + "/" + fileName;
                    //var zerofilled = ('' + 5).slice(-4);
                    //PRINT_LOG.info(__filename, "makeDirSync", " zerofilled : " + zerofilled);

                    makeDirSync(localFullPath, function (resData) {
                        if (resData == true) {
                            FS.writeFile(localFileFullPath, data, function (error) {
                                var resData = {};
                                resData.isSuccess = false;
                                resData.err = null;
                                resData.fileName = fileName;
                                //resData.fileNameWithoutFileType = fileNameWithoutFileType;
                                //resData.localTempPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_TEMP_PATH;
                                //resData.localTempFileFullPath = localTempFileFullPath;
                                resData.localFilePath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH;
                                resData.localFileFullPath = localFileFullPath;
                                resData.requestParams = requestParams;
                                resData.contentType = requestParams.files.uploadfile.type;

                                //PRINT_LOG.info(__filename, "FS.readFile", " resData : " + CircularJSON.stringify(resData));
                                if (error) {
                                    PRINT_LOG.info(__filename, "makeDirSync", " resData : " + JSON.stringify(resData));
                                    resData.isSuccess = false;
                                    resData.err = error;
                                    resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP;
                                    resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP + "error, write to local temp path, " + localFileFullPath;
                                    //resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP + "error, write to local temp path, " + localTempFileFullPath;
                                } else {
                                    resData.isSuccess = true;
                                }
                                callBack(resData);
                            });
                        } else {
                            PRINT_LOG.info(__filename, "makeDirSync", " resData : " + JSON.stringify(resData));

                            var resData = {};
                            resData.isSuccess = false;
                            resData.err = -2;
                            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_WRITE_TO_TEMP + "error, write to local temp path, " + localFileFullPath;
                            callBack(resData);
                        }
                    });

                }
            });
        }
    };


    // uploadFile -> updateDB
    var updateDB = function (accountID, defaultFileName, callBack) {

        var resData = {};
        resData.isSuccess = false;
        resData.err = null;
        resData.msg = "unknow error";
        resData.res = -1;
        //resData.localTempPath = localTempPath;
        //resData.localTempFileFullPath = localTempFileFullPath;
        resData.defaultFileName = defaultFileName;
        //resData.serverIdx = serverIdx;

        MYSQL_ADB_ACCOUNT_CONN.procUserphotoChange({
            accountID: accountID,
            imageName: defaultFileName
        }, function (err, results) {
            PRINT_LOG.info(__filename, "updateDB", " procUserphotoChange results : " + JSON.stringify(results));

            if (err) {
                resData.msg = "Failed, MYSQL_ADB_ACCOUNT_CONN.procUserphotoChange";
                PRINT_LOG.setErrorLog(resData.msg, err);

            } else if (COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
                resData.msg = "MYSQL_ADB_ACCOUNT_CONN.procUserphotoChange, db results is null";
                PRINT_LOG.error(__filename, "", resData.msg);

            } else {

                var row = results[0][0];

                if (row.RES == "0") {
                    resData.isSuccess = true;
                    resData.msg = row.MSG;;
                    resData.res = 0;


                    var responseObj = {};
                    responseObj.MSG = row.MSG;
                    responseObj.PHOTONAME = row.PHOTONAME;
                    //PACKET.sendSuccess(req, res, "업데이트 성공", responseObj);
                } else {
                    //PACKET.sendFail(req, res, row.RES, row.MSG, {});
                    resData.msg = row.MSG;;
                    resData.res = row.RES;
                }

                /*
                 var retV = COMMON_UTIL.getMysqlRES(results);
                 resData.res = retV.res;
                 if (ERROR_CODE_UTIL.RES_SUCCESS !== retV.res) {
                 resData.msg = retV.msg;
                 PRINT_LOG.error(__filename, "", resData.msg);
                 } else {
                 resData.isSuccess = true;
                 }
                 */
            }
            callBack(resData);
        });
    };

    /*
     /slp.user.account.profile.img.upload -> uploadFile
     uploadFile({
     accountID: accountID,
     files: req.body.files
     */
    var uploadFile = function (requestParams, callBack) {
        if (COMMON_UTIL.isNull(requestParams.files) || COMMON_UTIL.isNull(requestParams.files.uploadfile) || COMMON_UTIL.isNull(requestParams.files.uploadfile.path)) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = null;
            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES;
            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES + " error params, files";
            resData.localTempFileFullPath = null;
            callBack(resData);
        } else {
            PRINT_LOG.info(__filename, "uploadFile", "requestParams : " + JSON.stringify(requestParams));

            readUploadFile(requestParams, function (resData) {
                if (!resData.isSuccess) {
                    PRINT_LOG.error(__filename, "readUploadFile", "resData:" + JSON.stringify(resData));
                    callBack(resData);
                } else {
                    //requestParams.localTempPath = resData.localTempPath;                        // "/data/temp_photo/"
                    //requestParams.localTempFileFullPath = resData.localTempFileFullPath;        // "/data/temp_photo/tmp_a1000000007_100029182_159037_1512521862_120.PNG"

                    requestParams.localFilePath = resData.localFilePath;                        // "/data/temp_photo/"
                    requestParams.localFileFullPath = resData.localFileFullPath;        // "/data/temp_photo/tmp_a1000000007_100029182_159037_1512521862_120.PNG"
                    requestParams.fileNameWithoutFileType = resData.fileNameWithoutFileType;    // "a1000000007_100029182_159037_1512521862_120"
                    requestParams.defaultFileName = resData.fileName;
                    requestParams.contentType = resData.contentType;

                    //PRINT_LOG.error(__filename, "readUploadFile", "requestParams : " + JSON.stringify(requestParams));
                    //PRINT_LOG.error(__filename, "readUploadFile", "defaultFileName:" + resData.fileName);

                    updateDB(resData.requestParams.isAccountID, resData.fileName, function (resDB) {
                        callBack(resDB);
                    });

                    /*
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
                     */

                }
            });
        }
    };

    app.post("/adb/mypage/photo", ROUTE_MIDDLEWARE.LOGGED_IN_ACCOUNT, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        try {
            var accountID = (req.body.isAccountID) ? req.body.isAccountID : 0;

            PRINT_LOG.info(__filename, "uploadFile", "files : " + JSON.stringify(req.files));
            PRINT_LOG.info(__filename, "uploadFile", "body : " + JSON.stringify(req.body));

            var requestParams = {};

            requestParams = req.body;
            requestParams.API_PATH = API_PATH;
            requestParams.CLIENT_IP = CLIENT_IP;
            requestParams.curUnixtime = COMMON_UTIL.getUnixTimestamp();
            requestParams.files = req.files;

            //if (!COMMON_UTIL.isValidAccountID(requestParams.accountID) ||
            //    !COMMON_UTIL.isValidProfileID(requestParams.profileID)) {
            //    PRINT_LOG.error(__filename, API_PATH, " error, params, accountID:" + requestParams.accountID + ", profileID:" + requestParams.profileID);
            //    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
            //    return;
            //}

            // 이미지 서버를 구글 스토리지로 변경하기 전까지 무조건 성공으로 보냄
            //var responseObj = {};
            //PACKET.sendSuccess(req, res, responseObj);
            //return;

            uploadFile(requestParams, function (resData) {
                //resData.localFilePath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_FILE_PATH;
                //resData.localFileFullPath = localFileFullPath;

                if (resData.isSuccess) {
                    var responseObj = {};
                    var image_path = COMMON_UTIL.getFileUrlPath(accountID, resData.defaultFileName);
                    //responseObj.file_url = path + resData.defaultFileName;
                    //responseObj.img_th_url = path + resData.imageThumbnailFileName;
                    var msg = "등록되었습니다.";
                    PACKET.sendSuccess(req, res, msg, { myphoto_url: image_path });
                } else {
                    PRINT_LOG.info(__filename, API_PATH, "uploadFile resData : " + JSON.stringify(resData));
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
                }

                /*
                 if (!COMMON_UTIL.isNull(resData.localFileFullPath)) {
                 FS.unlink(resData.localTempFileFullPath, function (err) {
                 if (err) {
                 PRINT_LOG.setErrorLog(__filename + API_PATH, err);
                 }
                 });
                 }
                 */

            });
        } catch (catchErr) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN, "errorInfo : " + catchErr, {});
        }
    });


};
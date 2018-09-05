// nodejs npm
const FS = require('fs');
const LWIP = require("lwip");

// common
const ROUTE_MIDDLEWARE   = require("../../common/util/route_middleware.js");
const PACKET     = require("../../common/util/packet_sender.js");
const COMMON_UTIL     = require("../../common/util/common.js");
const ERROR_CODE_UTIL     = require("../../common/util/error_code_util.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_PLATFORM_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_PLATFORM;
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

const IMAGE_DEFAULT_SIZE_LIMIT = 1024;
const IMAGE_THUMBNAIL_SIZE_MAX = 350;

const IMAGE_TYPE_DEFAULT = 0;
const IMAGE_TYPE_THUMBNAIL = 1;

function add_routes(app) {
    "use strict";



    var sendImage = function(localTempPath, localTempFileFullPath, imageDefaultFileName, imageThumbnailFileName, targetPath, callBack) {

        var resData = {};
        resData.isSuccess = false;
        resData.localTempPath = localTempPath;
        resData.localTempFileFullPath = localTempFileFullPath;
        resData.imageDefaultFileName = imageDefaultFileName;
        resData.imageThumbnailFileName = imageThumbnailFileName;
        resData.destPath = targetPath;

        var srcDefaultImgFullPath = localTempPath + imageDefaultFileName;
        var destDefaultImgFullPath = targetPath + "/" + imageDefaultFileName;

        sendsftp( srcDefaultImgFullPath, destDefaultImgFullPath, function(resDefaultImage){
            if(!resDefaultImage.isSuccess) {
                resData.msg = " Failed : send Default Image, " + srcDefaultImgFullPath + " to " + destDefaultImgFullPath;
                resData.err = resDefaultImage.err;
                callBack(resData);
            } else {
                var srcThumbnailFullPath = localTempPath + imageThumbnailFileName;
                var destThumbnailFullPath = targetPath + "/" + imageThumbnailFileName;
                sendsftp( srcThumbnailFullPath, destThumbnailFullPath, function(resThumbnailImage){
                    if(!resThumbnailImage.isSuccess) {
                        resData.err = resThumbnailImage.err;
                        resData.msg = " Failed : send Thumbnail Image, " + srcThumbnailFullPath + " to " + destThumbnailFullPath;
                    } else {
                        resData.isSuccess = true;
                    }
                    callBack(resData);
                });
            }
        });
    };

    var sendsftp = function(srcFileFullPath, descFileFullPath, callBack ) {

        var Client = require('ssh2').Client;

        var conn = new Client();
        conn.on('ready', function() {
            conn.sftp(function(err1, sftp) {
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

                    var readStream = FS.createReadStream( srcFileFullPath );
                    var writeStream =  sftp.createWriteStream(descFileFullPath);

                    writeStream.on("end", function () {
                        conn.end();
                    });
                    writeStream.on( "close",  function () {
                        if(resData.err) {
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
                        if(writeErr) {
                            resData.err = writeErr;
                            resData.msg = "failed, photo file send";
                            PRINT_LOG.setErrorLog(resData.msg, writeErr);

                        }
                    });
                    readStream.pipe( writeStream );
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

    var existsImageServerPath = function(targetPath, callBack) {
        // �̹��� ������ ������ ������ �ִ��� Ȯ��
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PRIVATE_KEY, "utf-8");
        var Client = require('ssh2').Client;

        var conn = new Client();
        conn.on("ready", function() {
            conn.sftp(function(err1, sftp) {
                var resData = {};
                resData.isSuccess = false;
                resData.err = null;
                resData.targetPath = targetPath;
                resData.isExists = false;
                if (err1) {
                    PRINT_LOG.setErrorLog("adas", err1);
                    callBack(resData);
                } else {
                    sftp.readdir(targetPath, function(err, list) {
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

    var makeDirImageServerPath = function(targetPath, callBack) {
        var privateKeyString = FS.readFileSync(global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PRIVATE_KEY, "utf-8");
        var Client = require('ssh2').Client;
        
        
        PRINT_LOG.error(__filename, "", "ADDR : " + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST);
        
        
        var conn = new Client();
        conn.on("ready", function() {
            conn.exec("mkdir " + targetPath, function(err, stream) {
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
                    stream.on("close", function(code, signal) {
                        //console.log("Stream :: close :: code: " + code + ", signal: " + signal);
                        if( !COMMON_UTIL.isNull(code) && !isNaN(code) && (0===Number(code))) {
                            resData.isSuccess = true;
                            resData.isMakeDir = true;
                        }
                        conn.end();
                        callBack(resData);
                    });
                    stream.on('data', function(data) {
                        //console.log("STDOUT: " + data);
                    });
                    stream.stderr.on('data', function(data) {
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

    var checkImageServerPath = function(targetPath, callBack) {
        existsImageServerPath(targetPath, function(resDataExists){
            if( !resDataExists.isSuccess ) {
                callBack(resDataExists);
            } else {
                if(resDataExists.isExists) {
                    callBack(resDataExists);
                } else {
                    makeDirImageServerPath(targetPath, function(resDataMake) {
                        if( !resDataMake.isSuccess ) {
                            callBack(resDataMake);
                        } else {
                            if(!resDataMake.isMakeDir) {
                                resDataMake.isSuccess = false;
                                resDataMake.msg = "failed, mkdir " + targetPath;
                                callBack(resDataMake);
                            } else {
                                existsImageServerPath(targetPath, function(resDataExistsRetry){
                                    if( !resDataExistsRetry.isSuccess ) {
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

    var checkImageServerPathAll = function(requestParams, localTempPath, localTempFileFullPath, imageDefaultFileName, imageThumbnailFileName, callBack) {
        var path = global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_BEGIN + "/" + global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PHOTO_PATH_END;
        checkImageServerPath(path + requestParams.accountID, function(resDataA){
            if(!resDataA.isSuccess) {
                resDataA.localTempPath = localTempPath;
                resDataA.localTempFileFullPath = localTempFileFullPath;
                resDataA.imageDefaultFileName  = imageDefaultFileName;
                resDataA.imageThumbnailFileName  = imageThumbnailFileName;
                callBack(resDataA);
            } else {
                checkImageServerPath(path + requestParams.accountID + "/" + requestParams.profileID, function(resDataB) {
                    resDataB.localTempPath = localTempPath;
                    resDataB.localTempFileFullPath = localTempFileFullPath;
                    resDataB.imageDefaultFileName  = imageDefaultFileName;
                    resDataB.imageThumbnailFileName  = imageThumbnailFileName;
                    callBack(resDataB);
                });
            }
        });
    };

    var readUploadFile = function(requestParams, callBack) {
        var uploadFilePath = requestParams.files.uploadfile.path;
        var fileExt = uploadFilePath.substring(uploadFilePath.lastIndexOf(".") + 1);

        var reg = /gif|jpg|jpeg|png|dat/i;

        if(!reg.test(fileExt)) {
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

                    var fileNameWithoutFileType = "a" + requestParams.appID + "_" + requestParams.accountID + "_" + requestParams.profileID + "_" + COMMON_UTIL.getUnixTimestamp() + "_" + randomNumber;
                    var fileName = fileNameWithoutFileType + formatType;
                    var localTempFileFullPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_TEMP_PATH + "tmp_" + fileName;

                    FS.writeFile(localTempFileFullPath, data, function (error) {
                        var resData = {};
                        resData.isSuccess = false;
                        resData.err = null;
                        resData.fileName = fileName;
                        resData.fileNameWithoutFileType = fileNameWithoutFileType;
                        resData.localTempPath = global.CONFIG.SERVER_INFO.PHOTO.LOCAL_TEMP_PATH;
                        resData.localTempFileFullPath = localTempFileFullPath;
                        resData.requestParams = requestParams;
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
        }
    };


    var imageResizeStore = function(localTempPath, localTempFileFullPath, fileNameWithoutFileType, callBack) {
        imageResize(localTempPath, localTempFileFullPath, fileNameWithoutFileType, IMAGE_TYPE_DEFAULT, function(resDataResize){
            if(!resDataResize.isSuccess) {
                callBack(resDataResize);
            } else {
                imageResize(localTempPath, localTempFileFullPath, fileNameWithoutFileType, IMAGE_TYPE_THUMBNAIL, function(resDataResizeTh) {
                    resDataResizeTh.localTempPath = localTempPath;
                    resDataResizeTh.localTempFileFullPath = localTempFileFullPath;
                    resDataResizeTh.fileNameWithoutFileType = fileNameWithoutFileType;
                    callBack(resDataResizeTh);
                });
            }
        });
    };

    var imageResize = function(localTempPath, localTempFileFullPath, fileNameWithoutFileType, type, callBack) {
        var resData = {};
        resData.isSuccess =false;
        resData.err ="";
        resData.msg = "";
        resData.imageType = type;
        resData.resizeFileFullPath = "";
        resData.imageDefaultFileName = "";
        resData.imageThumbnailFileName = "";

        LWIP.open(localTempFileFullPath, function(err, image){
            if(err) {
                resData.err = err;
                callBack(resData);
            } else {
                var width = image.width();
                var height = image.height();

                var resizeWidth;
                var resizeHeight;
                var scale;

                var limitSize = 0;
                resData.imageDefaultFileName = fileNameWithoutFileType + ".jpg";
                resData.imageThumbnailFileName = fileNameWithoutFileType + "_th" + ".jpg";
                if (IMAGE_TYPE_DEFAULT === type) {
                    resData.resizeFileFullPath = localTempPath + resData.imageDefaultFileName;
                    limitSize = IMAGE_DEFAULT_SIZE_LIMIT;
                } else if (IMAGE_TYPE_THUMBNAIL === type) {
                    resData.resizeFileFullPath = localTempPath + resData.imageThumbnailFileName;
                    limitSize = IMAGE_THUMBNAIL_SIZE_MAX;
                } else {
                    limitSize = 0;
                    resData.resizeFileName = null;
                }

                if(0 >= limitSize) {
                    callBack(resData);
                } else {
                    if ((limitSize < width) || (limitSize < height)) {

                        if (width < height) {
                            scale = height / limitSize;
                            resizeWidth = parseInt(width / scale);
                            resizeHeight = parseInt(height / scale);
                        } else {
                            scale = width / limitSize;
                            resizeWidth = parseInt(width / scale);
                            resizeHeight = parseInt(height / scale);
                        }
                    } else {
                        resizeWidth = width;
                        resizeHeight = height;
                    }

                    var inter = "lanczos";
                    image.resize(resizeWidth, resizeHeight, inter, function(errResize, imageResize) {
                        if (errResize) {
                            resData.err = errResize;
                            callBack(resData);
                        } else {
                            imageResize.writeFile(resData.resizeFileFullPath, function (errImg, img) {
                                if (errImg) {
                                    resData.err = errImg;
                                } else {
                                    resData.isSuccess = true;
                                }
                                callBack(resData);
                            });
                        }
                    });
                }
            }
        });
    };

    var updateDB = function(requestParams, serverIdx, localTempPath, localTempFileFullPath, imageDefaultFileName, imageThumbnailFileName, callBack) {
        var resData = {};
        resData.isSuccess = false;
        resData.err = null;
        resData.msg = "unknow error";
        resData.res = -1;
        resData.localTempPath = localTempPath;
        resData.localTempFileFullPath = localTempFileFullPath;
        resData.imageDefaultFileName = imageDefaultFileName;
        resData.imageThumbnailFileName = imageThumbnailFileName;
        resData.serverIdx = serverIdx;

        MYSQL_SLP_ACCOUNT_CONN.procUpdateProfileIMG(requestParams, serverIdx, imageDefaultFileName, imageThumbnailFileName, function(err, results) {
            if (err) {
                resData.msg = "Failed, MYSQL_SLP_ACCOUNT_CONN.procAddPhoto";
                PRINT_LOG.setErrorLog(resData.msg, err);
            } else if (COMMON_UTIL.isNull(results) || (0 >= results.length) || (0 >= results[0].length)) {
                resData.msg = "MYSQL_SLP_ACCOUNT_CONN.procAddPhoto, db results is null";
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



    var uploadImage = function(requestParams, callBack) {

        requestParams.files = requestParams.req.files;
        if( COMMON_UTIL.isNull(requestParams.files) || COMMON_UTIL.isNull(requestParams.files.uploadfile) || COMMON_UTIL.isNull(requestParams.files.uploadfile.path)) {
            var resData = {};
            resData.isSuccess = false;
            resData.err = null;
            resData.res = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES;
            resData.msg = ERROR_CODE_UTIL.RES_ERROR_PHOTO_UPLOAD_PARAMS_FILES + "error params, files";
            resData.localTempFileFullPath = null;
            callBack(resData);
        } else {
            readUploadFile(requestParams, function(resData){
                if(!resData.isSuccess) {
                    callBack(resData);
                } else {
                    requestParams.localTempPath = resData.localTempPath;
                    requestParams.localTempFileFullPath = resData.localTempFileFullPath;
                    requestParams.fileNameWithoutFileType = resData.fileNameWithoutFileType;
                    imageResizeStore(resData.localTempPath, resData.localTempFileFullPath, resData.fileNameWithoutFileType, function(resResize){
                        if(!resResize.isSuccess) {
                            callBack(resResize);
                        } else {
                            checkImageServerPathAll(requestParams, resResize.localTempPath, resResize.localTempFileFullPath,
                                resResize.imageDefaultFileName, resResize.imageThumbnailFileName, function (resDest) {
                                    if (!resDest.isSuccess) {
                                        callBack(resDest);
                                    } else {
                                        sendImage( resDest.localTempPath, resDest.localTempFileFullPath,
                                            resDest.imageDefaultFileName, resDest.imageThumbnailFileName,
                                            resDest.targetPath, function (resDataSend) {
                                                if (!resDataSend.isSuccess) {
                                                    callBack(resDataSend);
                                                } else {
                                                    var localTempPath = resDataSend.localTempPath;
                                                    var localTempFileFullPath = resDataSend.localTempFileFullPath;
                                                    var imageDefaultFileName = resDataSend.imageDefaultFileName;
                                                    var imageThumbnailFileName = resDataSend.imageThumbnailFileName;
                                                    var serverIdx = 0;
                                                    updateDB(requestParams, serverIdx, localTempPath, localTempFileFullPath, imageDefaultFileName, imageThumbnailFileName,  function(resDB){
                                                        callBack(resDB);
                                                    });
                                                }
                                            });
                                    }
                                });
                        }
                    });

                }
            });
        }
    };


    app.post("/slp.user.account.profile.img.upload", ROUTE_MIDDLEWARE.AUTH_APP_LOGIN_ACCOUNT_WITH_PROFILE, function(req, res) {
        //PRINT_LOG.info("","",global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.HOST);
		//PRINT_LOG.info("","",global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.PORT);
		//PRINT_LOG.info("","",global.CONFIG.SERVER_INFO.PHOTO.IMG_SERVER_REAL.USERNAME);

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
            requestParams.curUnixtime = COMMON_UTIL.getUnixTimestamp();

            if ( !COMMON_UTIL.isValidAccountID(requestParams.accountID) ||
                !COMMON_UTIL.isValidProfileID(requestParams.profileID) ) {
                PRINT_LOG.error(__filename, API_PATH, " error, params, accountID:" + requestParams.accountID + ", profileID:" + requestParams.profileID);
                PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                return;
            }
			
			// 이미지 서버를 구글 스토리지로 변경하기 전까지 무조건 성공으로 보냄
			//var responseObj = {};
			//PACKET.sendSuccess(req, res, responseObj);
			//return;
			
            uploadImage(requestParams, function (resData) {
                if (resData.isSuccess) {
                    var responseObj = {};
                    var path = COMMON_UTIL.getPhotosPath(resData.serverIdx) + requestParams.accountID + "/" + requestParams.profileID + "/";
                    responseObj.pf_id = requestParams.profileID;
                    responseObj.img_url = path + resData.imageDefaultFileName;
                    responseObj.img_th_url = path + resData.imageThumbnailFileName;
					//PRINT_LOG.info("","",responseObj.pf_id);
					//PRINT_LOG.info("","",responseObj.img_url);
					//PRINT_LOG.info("","",responseObj.img_th_url);
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

                if (!COMMON_UTIL.isNull(resData.localTempPath) && !COMMON_UTIL.isNull(resData.imageDefaultFileName)) {
                    var delImageDefaultFileName = resData.localTempPath + resData.imageDefaultFileName;
                    FS.unlink(delImageDefaultFileName, function (err) {
                        if (err) {
                            PRINT_LOG.setErrorLog(__filename + API_PATH, err);
                        }
                    });
                }

                if (!COMMON_UTIL.isNull(resData.localTempPath) && !COMMON_UTIL.isNull(resData.imageThumbnailFileName)) {
                    var delImageThumbnailFileName = resData.localTempPath + resData.imageThumbnailFileName;
                    FS.unlink(delImageThumbnailFileName, function (err) {
                        if (err) {
                            PRINT_LOG.setErrorLog(__filename + API_PATH, err);
                        }
                    });
                }
            });
        } catch( catchErr ) {
            var msg = "[" + API_PATH + "] error, [" + __filename + "]";
            PRINT_LOG.setErrorLog(msg, catchErr);
            PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_UNKNOWN);
        }
    });
}

exports.add_routes = add_routes;

require('date-utils'); // Date.prototype ����

// nodejs npm
const crypto = require('crypto');

// common
const ROUTE_MIDDLEWARE = require("../../common/util/route_middleware.js");
const PACKET = require("../../common/util/packet_sender.js");
const COMMON_UTIL = require("../../common/util/common.js");
const ERROR_CODE_UTIL = require("../../common/util/error_code_util.js");
const ENCS = require("../../common/util/aes_crypto.js");

// log
const PRINT_LOG = global.PRINT_LOGGER;

// mysql
const MYSQL_SLP_NDE_INFO = global.MYSQL_CONNECTOR_POOLS.SLP_NDE_INFO;
const MYSQL_SLP_ACCOUNT_CONN = global.MYSQL_CONNECTOR_POOLS.SLP_ACCOUNT;

var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require("request");
var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_service.xml";

exports.add_routes = function (app) {

    // ex user token create
    app.post("/nde/open/user", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
        // app_id : 'APP6ef74743-23e2-496c-a67d-a1010a10c016'
        // ebs auth key : 'EbsLang'' 
        // encode key : 'blueark_proc_prod' 
        // [random4][enc_user_Id][ebs auth key][user ip address] -> enc_user_Id 
        // enc_user_Id, ext_pdt_id, trade_id 
        
        var userTokenList = [];
        var token = {};
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var appID = 1000000007;
        var msg = null;
        var appResult = 0;
        
        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);
            
            var xa = xtt.split("|");        ////  && xa[1].length == 64
            if (xa.length == 6 && xa[2] == 'EbsLang') {

                // {"data":["5ho8","PqzsQf845oxExlXw1a9qdgCPJwG-ReEQ2Z1Y7GnFdIJ1xrVoUXj13L2eGBlWpScm","EbsLang","1000009","2","104.199.129.129"],"res":true}
                
                var encUserID = xa[1];
                var tradeID = xa[3];
                var extPdtID = xa[4];
                var UserIP = xa[5];
                var accountPWD = crypto.createHash("sha512").update(encUserID).digest("base64");
                var clientUID = "3244d9d960be83da43adf1679bfa4fb08f479999";
                
                COMMON_UTIL.isAddExtUser(MYSQL_SLP_ACCOUNT_CONN, appID, clientUID, encUserID, accountPWD, UserIP, 'ebs', function (result) {
                    PRINT_LOG.info(__filename, API_PATH, 'isAddExtUser :' + JSON.stringify(result));
                    if (Number(result['RES']) === 0) {
                        COMMON_UTIL.isAddExtToken(MYSQL_SLP_ACCOUNT_CONN, appID, encUserID, tradeID, extPdtID, UserIP, 'ebs', function (result) {
                            PRINT_LOG.info(__filename, API_PATH, 'isAddExtToken :' + JSON.stringify(result));
                            if (Number(result['RES']) === 0) {
                                token.uId = result['ACCESS_TOKEN'];
                                userTokenList.push(token);
                                appResult = 1;
                                PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
                            } else {
                                msg = "DB result ; " + result['RES'];
                                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                            }
                        });

                    } else {
                        msg = "DB result ; " + result['RES'];
                        PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                    }
                });
            } else {
                msg = 'data error';
                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
            }
        } catch (ex) {
            PRINT_LOG.error(__filename, API_PATH, '/nde/open/user ex : ' + ex);
            msg = ex;
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }
        
    });


    // �����?���� ��ū�߱� - 100% - �����׽�Ʈ��
    app.post("/nde/open/bodyuser", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
        var userTokenList = [];
        var token = {};
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var appID = 1000000007;
        var msg = null;
        var appResult = 0;

        try {
            xtt = req.body.token;
            //PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xtt : ' + xtt);
            xtt = ENCS.decryptLang(xtt, encKey);
            //PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xtt : ' + xtt);
            var xa = xtt.split("|");
            // PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xa.length : ' + xa.length);
            //PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xa[2] : ' + xa[2]);
            //PRINT_LOG.error(__filename, API_PATH, '/nde/open/user xa[1].length : ' + xa[1].length);

            if (xa.length == 6 && xa[2] == 'EbsLang') {     //  && xa[1].length == 64
                var tradeID = xa[3];
                var extPdtID = xa[4];

                COMMON_UTIL.isAddExtToken(MYSQL_SLP_ACCOUNT_CONN, appID, xa[1], tradeID, extPdtID, xa[5], 'ebs', function (result) {
                    //PRINT_LOG.error(__filename, API_PATH, 'isAddExtToken result : ' + result);
                    if (Number(result['RES']) === 0) {
                        token.uId = result['ACCESS_TOKEN'];
                        userTokenList.push(token);
                        appResult = 1;

                        PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
                    } else {
                        msg = "DB result ; " + result['RES'];
                        PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                    }
                });


            } else if (xa.length == 4 && xa[2] == 'EbsLang') {      //  && xa[1].length == 64
                var tradeID = 0;
                var extPdtID = 0;
                var clientIP = "";

                COMMON_UTIL.isAddExtToken(MYSQL_SLP_ACCOUNT_CONN, appID, xa[1], tradeID, extPdtID, clientIP, 'ebs', function (result) {
                    //PRINT_LOG.error(__filename, API_PATH, 'isAddExtToken result : ' + result);
                    if (Number(result['RES']) === 0) {
                        //token.uId = result['ACCESS_TOKEN'];
                        //userTokenList.push(token);
                        appResult = 1;

                        //PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
                        PACKET.sendSuccess2(req, res, { uId: result['ACCESS_TOKEN'] });
                    } else {
                        msg = "DB result ; " + result['RES'];
                        PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                    }
                });

            } else {
                msg = 'data error';
                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
            }
        } catch (ex) {
            PRINT_LOG.error(__filename, API_PATH, '/nde/open/bodyuser ex : ' + ex);
            msg = ex;
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }

    });

    // dec api
    app.post("/nde/open/dec", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var resultCode = null;
        var obj = {};
        var arr = {};
        var last = null;
        try {
            xtt = req.body.token;
            resultCode = ENCS.decryptLang(xtt, encKey);
            if (resultCode.indexOf('|') >= 0) {
                var arr = resultCode.split('|');
                for (var i = 0; i < arr.length; i++) {
                    arr["data"+i] = arr[i];
                }
            }
            obj.data = arr;
            resultCode = true;
        } catch (ex) {
            resultCode = false;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
        }
        PACKET.sendJson(req, res, resultCode, obj);
    });

    // enc api
    app.post("/nde/open/enc", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var resultCode = null;
        var obj = {};
        var last = null;
        try {
            xtt = req.body.token;
            resultCode = ENCS.encryptLang(xtt, encKey);
            obj.data = resultCode;
            resultCode = true;
        } catch (ex) {
            resultCode = false;
            PRINT_LOG.error(__filename, API_PATH, 'ex:' + ex);
        }
        PACKET.sendJson(req, res, resultCode, obj);
    });

    // ���������?��ūüũ - 10%
    app.post("/nde/open/usercheck", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        // app_id : 'APP6ef74743-23e2-496c-a67d-a1010a10c016'
        // ebs auth key : 'EbsLang'' 
        // encode key : 'blueark_proc_prod' 
        // [����4�ڸ�][enc_user_Id][ebs auth key][user ip address] -> enc_user_Id 

        var userTokenList = [];
        var token = {};
        var xtt = null;
        var encKey = "blueark_proc_prod";
        var appID = 1000000007;
        var msg = null;
        var appResult = 0;

        try {
            xtt = req.headers['x-transfer-token'];
            xtt = ENCS.decryptLang(xtt, encKey);

            var xa = xtt.split("|");
            if (xa.length == 4 && xa[2] == 'EbsLang') {         //  && xa[1].length == 64
                COMMON_UTIL.isAddExtToken(MYSQL_SLP_ACCOUNT_CONN, appID, xa[1], xa[3], 'ebs', function (result) {
                    if (Number(result['RES']) === 0) {
                        token.uid = result['ACCESS_TOKEN'];
                        userTokenList.push(token);
                        appResult = 1;
                        PRINT_LOG.error(__filename, API_PATH, 'token.uid:' + result['ACCESS_TOKEN']);

                        PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
                    } else {
                        msg = "DB result ; " + result['RES'];
                        PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
                    }
                });
            } else {
                msg = 'data error';
                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
            }
        } catch (ex) {
            msg = ex;
            PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
        }

    });



    // EBSLang TEST
    app.post("/nde/open/check", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        var msg = null;
        var userTokenList = [];

        /* t1 ****************/
        /*
        var encuser = "13EECEB0B146F2938F14B8F4FA2DD3051C81C96B5A631CCF321FD6445E16779D3B7036428FE19A5D1DB4512B525912F4A5E5FB785AF65CE25C6A6B64A1EC460O";
        var encKey = "blueark_proc_prod";
        var ebs_encKey = "EbsLang";
        var text = "wf6y|" + encuser + "|" + ebs_encKey + "|127.0.0.1";           //|�̺񿡽�";
        
        var encText = ENCS.encryptLang(text, encKey);

        PACKET.sendSuccess(req, res, {
            API_PATH: API_PATH,
            CLIENT_IP: CLIENT_IP,
            encuser: encuser,
            oritext: text,
            encText: encText,
            decText: ENCS.decryptLang(encText, encKey),
            local_date: (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS') // TODO ������ �ð�
        });
        */
        /* t1 ****************/


        /* t2 ****************/
        /*
        ��ǰ xml �ε�
        DBó��
        EBSLang ȣ��
        ���н� �ѹ�ó��
        */

        //var encuser = "13EECEB0B146F2938F14B8F4FA2DD3051C81C96B5A631CCF321FD6445E16779D3B7036428FE19A5D1DB4512B525912F4A5E5FB785AF65CE25C6A6B64A1EC460O";
        //var encKey = "blueark_proc_prod";
        //var ebs_encKey = "EbsLang";
        //var text = "wf6y|" + encuser + "|" + ebs_encKey + "|127.0.0.1";           //|�̺񿡽�";
        //var encText = ENCS.encryptLang(text, encKey);
        //var decText = ENCS.decryptLang(encText, encKey);


        //var url = global.CONFIG.CDN_INFO.URI + "dla/data/dla_quest.xml";
        //var isMatch = false;
        //url = global.CONFIG.CDN_INFO.REAL_CDN + "nde1/data/nde_product.xml"; //nde ftp url
        //if (requestParams.isTest == "true") url = global.CONFIG.CDN_INFO.DEV_CDN + "nde/data/nde_product.xml";
        
        

        //PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });

        var requestParams = {};
        requestParams.req = req;
        requestParams.res = res;

        ebsLang_check(requestParams, function (resData) {
            if (resData.isSuccess) {
                PRINT_LOG.info(__filename, API_PATH, resData.isSuccess);
                PACKET.sendSuccess2(req, res, { userTokenList: userTokenList });
            } else {
                PACKET.sendFail2(req, res, msg, { userTokenList: userTokenList });
            }
        });
    });


    // ���� EBS ���?���� - EBSLang �� Data ����������
    app.post("/nde/open/ebs", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        PRINT_LOG.error(__filename, "ebs", "req : " + JSON.stringify(req.body));
        PRINT_LOG.error(__filename, "ebs", "req.app_id : " + req.body.app_id);
        PRINT_LOG.error(__filename, "ebs", "req.enc_user_id : " + req.body.enc_user_id);
        PRINT_LOG.error(__filename, "ebs", "req.store : " + req.body.store);
        PRINT_LOG.error(__filename, "ebs", "req.ext_pdt_id : " + req.body.ext_pdt_id);
        PRINT_LOG.error(__filename, "ebs", "req.buy_ymd : " + req.body.buy_ymd);
        PRINT_LOG.error(__filename, "ebs", "req.buy_time : " + req.body.buy_time);

        
        var resData = {};
        resData.isSuccess = true;
        resData.err = null;
        resData.msg = "success";
        resData.res = 1;

        PACKET.sendSuccess2(req, res, resData);
    });


    var ebsLang_check = function (requestParams, callBack) {

        var resData = {};
        resData.isSuccess = true;
        resData.err = null;
        resData.msg = "unknow error";
        resData.res = -1;
        PRINT_LOG.info(__filename, "ebsLang_check", true);


        // http://s-www.ebslang.co.kr/app/extPdtBuySave.ebs
        //var path = "/app/extPdtBuySave.ebs";            // ��ǰ���� ����
        //var url = "http://s-www.ebslang.co.kr";
        // var path = "/app/extPdtFreeBuySave.ebs";     // ������ ��ǰ���� ����
        // url = url + path;      // �׽�Ʈ ����

        var encuser = "13EECEB0B146F2938F14B8F4FA2DD3051C81C96B5A631CCF321FD6445E16779D3B7036428FE19A5D1DB4512B525912F4A5E5FB785AF65CE25C6A6B64A1EC460O";

        var url = "http://localhost/nde/open/ebs";

        var responseJson = {};
        var param = {};
        param.app_id = "APP6ef74743-23e2-496c-a67d-a1010a10c016";
        param.enc_user_id = encuser;
        param.store = "google";         // google or ios
        param.ext_pdt_id = 0;
        param.buy_ymd = "20180105";             // db ó����¥
        param.buy_time = "191014";              // db ó���ð�

        // url = "http://104.199.129.129/nde/app/reqcheck";
        url = "http://104.199.129.129/nde/open/ebs";
        try {
            var headers = {
                // 'User-Agent': 'Super Agent/0.0.1',
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            // ��û ���� ����
            var options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: param
                // form: { 'app_id': 'APP6ef74743-23e2-496c-a67d-a1010a10c016', 'key2': 'yyy' }
            }

            // ��û ���� �������� body
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    PRINT_LOG.info(__filename, 'ebsLang_check', body);
                    callBack(resData);
                }
            })

        } catch (ex) {
            PRINT_LOG.error(__filename, "ebsLang_check", 'ex : ' + ex);

        }

        /*
        app_id	EBS APP�ĺ� ����ID	String		APP6ef74743- 23e2 - 496c- a67d - a1010a10c016
        enc_user_id 	ȸ�� ���̵� 	String		ȸ���ĺ��� ������ ����ȭ �� ID 
        store	����ó ����	String		google OR ios ���� ���� ����
        ext_pdt_id	�ܺλ�ǰ ��ȣ	int		���� ���޵帰 �����Ϳ� �ٸ� (÷������ ����)
        buy_ymd	���� ��¥	String	8	NDE �� ���� ��¥ (ex: 20170310)
        buy_time	���� �ð�	String	6	NDE �� ���� �ð� (ex: 191014)
        */

        /*
            parser.parseString(body, function (err, result) {
                var i = 0;
                while (i < result.root.products[0].product.length) {
                    var curProduct = result.root.products[0].product[i];

                    if (curProduct.use == "true" && curProduct.id == requestParams.productID) {
                        isMatch = true;
                        requestParams.title = curProduct.title;
                        requestParams.point = curProduct.point;
                        requestParams.period = curProduct.period;
                        requestParams.periodType = curProduct.period_type;
                        requestParams.usingUnit = curProduct.using_unit;
                        requestParams.lessonIDs = curProduct.lesson_id;
                        requestParams.episodeIDs = curProduct.episode_id;
                    }
                    i++;
                }

                if (!(requestParams.usingUnit == "lesson_id" || requestParams.usingUnit == "episode_id")) {
                    PRINT_LOG.error(__filename, API_PATH, " using_unit is invalid");
                }

                // �Ķ����?���δ�Ʈ ���̵��?��Ī���� ���� ���?-1 ����
                if (!isMatch) {
                    PRINT_LOG.error(__filename, API_PATH, " unmatch product id");
                    PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_ERROR_PARAMETER);
                }

                // uning_unit �� ���� ������ �����Ͽ� goodsIDs �� ����
                if (requestParams.usingUnit == "lesson_id") {
                    requestParams.goodsIDs = requestParams.lessonIDs;
                }
                if (requestParams.usingUnit == "episode_id") {
                    requestParams.goodsIDs = requestParams.episodeIDs;
                }

                requestParams.goodsCount = String(requestParams.goodsIDs).split(",").length;

                if (isMatch) {
                    MYSQL_SLP_NDE.procBuyProduct(requestParams, function (err, results) {
                        if (err) {
                            PRINT_LOG.setErrorLog("Failed, MYSQL_SLP_NDE.procBuyProduct", err);
                            return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                        }
                        if (COMMON_UTIL.isNull(results) || (0 >= results.length)) {
                            PRINT_LOG.error(__filename, API_PATH, " db results is null");
                            return PACKET.sendFail(req, res, ERROR_CODE_UTIL.RES_FAILED_DB);
                        }

                        PACKET.sendSuccess(req, res, {
                            ACCOUNT_ID: requestParams.accountID, CODE: results[0][0].CODE, MSG: results[0][0].MSG
                        });
                    });

                    // EBSLang ����ȭ ȣ��, step_attend_id ����
                }
            });
            */

        
    };




    // TEST
    app.post("/nde/app/reqcheck", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);

        PRINT_LOG.info(__filename, "req", req);

        //PRINT_LOG.info(__filename, "req", req.body);
        PACKET.sendFail2(req, res, "", { userTokenList: API_PATH });
    });
    




    // TEST
    app.post("/nde/app/check", ROUTE_MIDDLEWARE.NO_AUTH_APP, function (req, res) {
        var API_PATH = req.route.path;
        var CLIENT_IP = COMMON_UTIL.getClientIP(req);
        
        //var x = { "name": "name1" };
        //PRINT_LOG.info(__filename, "", "x : " + JSON.stringify(x));

        //PRINT_LOG.info(__filename, "", "req.headers : " + require('util').inspect(req.headers, false, null));
        //PRINT_LOG.info(__filename, "", "req.headers.x-transfer-token : " + req.headers['x-transfer-token']);


        //var buf = new Buffer("abcd 1234 �ѱ�", "utf8");

        var encuser = "13EECEB0B146F2938F14B8F4FA2DD3051C81C96B5A631CCF321FD6445E16779D3B7036428FE19A5D1DB4512B525912F4A5E5FB785AF65CE25C6A6B64A1EC460O";
        var encKey = "blueark_proc_prod";
        var ebs_encKey = "EbsLang";
        var text = "wf6y|" + encuser + "|" + ebs_encKey +"|127.0.0.1";           //|�̺񿡽�";

        //var encValue = "Nr5vb72Hv-3wHjKPd6z36fiWt-J6Olahj4habe-f10m7KBOMQtN1Iy_WSQ1z_ezR63bZTeoQmbRCcIrEuipaNlpYbgG8ax7qLokmfIzzhiH5pe-O1qraPMgB9DMg1DV_";
        

        //text2 = new Buffer(text).toString('base64')

        //const cipher = crypto.createCipher('aes-256-cbc', encKey);
        //var result = cipher.update(text, 'utf8', 'base64');             // 'HbMtmFdroLU0arLpMflQ'
        //result += cipher.final('base64');                               // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='
        //
        //const decipher = crypto.createDecipher('aes-256-cbc', encKey);
        //var result2 = decipher.update(result, 'base64', 'utf8');        // ��ȣȭ�ҹ� (base64, utf8�� ���� cipher�� �ݴ� �����Դϴ�.)
        //result2 += decipher.final('utf8');                              // ��ȣȭ�ҹ��� (���⵵ base64���?utf8)
        //result2 = new Buffer(result2, 'base64').toString('ascii');

        var encText = ENCS.encryptLang(text, encKey);

        PACKET.sendSuccess(req, res, {
            API_PATH: API_PATH,
            CLIENT_IP: CLIENT_IP,
            // undefined: buf.toString(undefined),
            // utf8: buf.toString('utf8', 10, 16),
            // text: text,
            // result: result,
            // result2: result2,
            // encValue: encValue,

            encText: encText,
            oritext: text,
            decText: ENCS.decryptLang(encText, encKey),
            local_date: (new Date()).toFormat('YYYY-MM-DD HH24:MI:SS') // TODO ������ �ð�
        });

    });
};
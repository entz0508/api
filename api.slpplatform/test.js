// nodejs npm
const crypto = require("crypto");

// common
//const ROUTE_MIDDLEWARE = require("./modules/common/util/route_middleware.js");
const PACKET = require("./modules/common/util/packet_sender.js");
const COMMON_UTIL = require("./modules/common/util/common.js");
const ERROR_CODE_UTIL = require("./modules/common/util/error_code_util.js");
const NODE_MAILER = require('./modules/common/mail/node_mailer.js');

// log
const PRINT_LOG = global.PRINT_LOGGER;

const encs = require("./modules/common/util/aes_crypto.js");

//var accountPWD = CRYPTO.createHash("sha512").update("12345").digest("base64");
//var responseObj = {};
//responseObj.password = accountPWD;
//console.log('accountPWD : ' + accountPWD);


function getBytes(str) {
    var bytes = [], char;
    str = encodeURI(str);

    while (str.length) {
        char = str.slice(0, 1);
        str = str.slice(1);

        if ('%' !== char) {
            bytes.push(char.charCodeAt(0));
        } else {
            char = str.slice(0, 2);
            str = str.slice(2);

            bytes.push(parseInt(char, 16));
        }
    }
    return bytes;
};

var encrypts = function (data, key, ivkey) {
    var iv = new Buffer(ivkey);
    var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
    var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

var decrypts = function (data, key, ivkey) {
    var iv = new Buffer(ivkey);
    var encodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
    var cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
};

//var crypto = require('crypto');


// salt 키
/*
crypto.randomBytes(64, (err, buf) => {
    crypto.pbkdf2('비밀번호', buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
        console.log("salt key example " + key.toString('base64')); // 'dWhPkH6c4X1Y71A/DrAHhML3DyKQdEkUOIaSmYCI7xZkD5bLZhPF0dOSs2YZA/Y4B8XNfWd3DHIqR5234RtHzw=='
    });
});
*/

// [난수4자리][enc_user_Id][ebs auth key][user ip address]
// wf6y | hGf1qjrQdRvktcRvtzU8Pkd3-9NomRgaHAp5cDwFvH2lAmgw64jDA9E5Ea2OkbXQ | EbsLang | 127.0.0.1


var text = "wf6y|13EECEB0B146F2938F14B8F4FA2DD3051C81C96B5A631CCF321FD6445E16779D3B7036428FE19A5D1DB4512B525912F4A5E5FB785AF65CE25C6A6B64A1EC460O|EbsLang|127.0.0.1";



var encKey = "blueark_proc_prod";
var encValue = "oJuOp-gJvJyTs85q2LRybkMdmGAcExIE03ix1a2R4kJ9bicnOWHEqdzSvgFBb6NLkyMBImlXxXGjctOGDb2Q-DtNw1G5iBz0P9Oan8VeKguHMgiVew_s8SFR7TZnFTlx";

var ebs_authKey = "EbsLange";       // length 16

// EBS 구매처리 후 전송값 :  [난수4자리][step_attend_id][buy_id][blueark_uid][ext_pdt_id][ebs auth key][user ip address]
//var btext = bytes(text).decode('utf-8');

//var bytes = getBytes(text);
//var buff = new Buffer(bytes);
//console.log(buff.toString('utf8'));

//var enc_encryptLang = encs.encryptLang(text, encKey);
//
//console.log('\nenc : ' + enc_encryptLang);
console.log('\ndec >>> ' + encs.decryptLang(encValue, encKey));

//

//dec: 4h1e|hGf1qjrQdRvktcRvtzU8Pkd3-9NomRgaHAp5cDwFvH2lAmgw64jDA9E5Ea2OkbXQ | EbsLang | 110.15.106.198

var resData = {};
resData.isSuccess = false;
resData.err = 1234;
resData.targetPath = "ABC";
resData.isMakeDir = true;

var resjson = JSON.stringify(resData);
console.log('\n\nstringify : ' + encs.encryptLang(resjson, encKey));
console.log('\nstringify : ' + resjson);
console.log('\nstringifys2 : ' + JSON.parse(resjson)['targetPath']);

var str = "1234|f3qf2343434f34f54f5425f45g324g234grrt2435t5|EbsLang|127.0.0.1";
str = encs.encryptLang(str, encKey);
//var str2 = "asdccd|dfeeef";
console.log('\nstr_enc : '+str);

//token.uid = req.headers['x-transfer-token'];
if (str) {
    //str.indexOf("|")
    str = encs.decryptLang(str, encKey)
    console.log('\nstr_dec : ' + str);

    if (str.indexOf("|") >= 0) {
        var xa = str.split("|");
        console.log('\nxa length : ' + xa.length);

        if (xa.length === 4 && xa[2] == 'EbsLang') {
            console.log('\nxa uid : ' + xa[1]);
            console.log('\nxa ebs auth key : ' + xa[2]);
            console.log('\nxa uid : ' + encs.encryptLang(str, 'blueArkGroBal'));
        }
        console.log('\npass : ' + crypto.createHash("sha512").update("1234567").digest("base64"));
        console.log('\nencryptLang : ' + encs.encryptLang('b7ab36c4474fdc3182886ab752255f72cb39f991', encKey));

        
    } else {
        //userTokenList.push(token);
    }

}


/*
var decipher2 = crypto.createDecipher('aes-128-ecb', encKey);
try {
    console.log('decipher2 : ' + decipher2.update(encValue, 'base64', 'utf8') + decipher2.final('utf8'));
} catch (ex) {
    console.log('decipher2 err: ' + ex);
}
*/

/*
var cipher2 = crypto.createCipher('aes-128-ecb', encKey);
console.log('cipher2 : ' + cipher2.update(text, 'utf8', 'base64') + cipher2.final('base64'));
*/

/*
var decipher = crypto.createDecipher('aes-128-ecb', encKey);
console.log('encKey : ' + encKey);
console.log('decipher : ' + decipher);

chunks = []
chunks.push(decipher.update(new Buffer(encValue, "base64").toString("binary")));

chunks.push(decipher.final('binary'));
var txt = chunks.join("");
txt = new Buffer(txt, "binary").toString("utf-8");

console.log('text : ' + txt);
*/

/*
var _txt = encrypts(text, encKey, '0000000000000001');

console.log('text : ' + text);
console.log('encKey : ' + encKey);
console.log('encrypts : ' + _txt)
console.log('decrypts : ' + decrypts(_txt, encKey, '0000000000000001'))

var resData = {};
resData.isSuccess = false;
resData.err = 1234;
resData.targetPath = "ABC";
resData.isMakeDir = true;

var resjson = encrypts(JSON.stringify(resData), encKey, '0000000000000001');
console.log('stringify : ' + resjson);
var decjson = decrypts(resjson, encKey, '0000000000000001');
console.log('stringifys : ' + decjson);
console.log('stringifys2 : ' + JSON.parse(decjson)['targetPath']);
*/

/*
var key = 'ehfksmschlrhdmlrydbrdyddoq@#$395'; //replace with your key
var iv = 'BAEisTheBestTeam'; //replace with your IV
var cipher = crypto.createCipheriv('aes256', key, iv);
var crypted = cipher.update(text, 'utf8', 'base64');
crypted += cipher.final('base64');

console.log('key length : ' + key.length);      // 32
console.log('iv length : ' + iv.length);        // 16
console.log('crypted : ' + crypted);
*/

//var accountPWD = CRYPTO.createHash("sha512").update("12345").digest("base64");

/*
//var crypto = require('crypto');
var iv = new Buffer('0000000000000000');
// reference to converting between buffers http://nodejs.org/api/buffer.html#buffer_new_buffer_str_encoding
// reference node crypto api http://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv
// reference to ECB vs CBC cipher methods http://crypto.stackexchange.com/questions/225/should-i-use-ecb-or-cbc-encryption-mode-for-my-block-cipher

var encrypt = function (data, key) {
    var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
    var cipher = crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

var decrypt = function (data, key) {
    var encodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
    var cipher = crypto.createDecipheriv('aes-256-cbc', encodeKey, iv);
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
};

var decrypt128 = function (data, key) {
    var encodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
    var cipher = crypto.createDecipheriv('aes-128-cbc', new Buffer(key, 'hex'), new Buffer(iv));
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
};

var data = 'Here is my string'
var key = '1234567891123456';
var cipher = encrypt(data, key);
var decipher = decrypt(cipher, key);
console.log('cipher : '+cipher);
console.log('decipher : ' +decipher);
// the string below was generated from the "main" in the java side
console.log(decrypt("79D78BEFC06827B118A2ABC6BD9D544E83F92930144432F22A6909EF18E0FDD1", key));
console.log(decrypt128("3EB7CF373E108ACA93E85D170C000938A6B3DCCED53A4BFC0F5A18B7DDC02499", "d7900701209d3fbac4e214dfeb5f230f"));

var cipher2 = encrypt(text, encKey);
var decipher2 = decrypt(cipher2, encKey);
console.log('cipher2 : ' + cipher2);
console.log('decipher2 : ' + decipher2);
*/


/*
function encrypt(text, key) {
    // 알고리즘과 암호화 key 값으로 셋팅된 클래스를 뱉는다
    var cipher = crypto.createCipher('aes-256-cbc', key);

    // 컨텐츠를 뱉고
    var encipheredContent = cipher.update(text, 'utf8', 'hex');
    //var encipheredContent = cipher.update(new Buffer(text).toString('utf8'), 'utf8', 'hex');

    // 최종 아웃풋을 hex 형태로 뱉게 한다
    encipheredContent += cipher.final('hex');

    return encipheredContent;
}

// 암호화나 복호화나 자세히 보면 비슷함
function decrypt(text, key) {

    var decipher = crypto.createDecipher('aes-256-cbc', key);

    var decipheredPlaintext = decipher.update(text, 'hex', 'utf8');

    decipheredPlaintext += decipher.final('utf8');

    return decipheredPlaintext;
}
*/

/*
var key = "tHis_iS_privaTe_kEy";
var text = "우리는 민족중흥의 역사적 사명을 띄고 이땅에 태어 났다. 조상에 빛난 얼을 오늘에 되살려 안으로 자주독립 자세를 확립하고 밖으로 인류공영에 이바지할 때다.";
var hw = encrypt(text, key);
console.log("################### 인코딩 ##################");
console.log(hw);

console.log("################### 디코딩 ##################");
console.log(decrypt(hw, key));
*/



/*
// utf8로 인코딩 
var buf = new Buffer("abcd 1234 한글", "utf8");

console.log('result : ' + buf.toString('utf-8'));
// 버퍼 인코딩
//"ascii", "utf8", "utf16le", "ucs2", "base64", "hex".
console.log('ascii =====> ' + buf.toString('ascii'));
console.log('utf16le =====> ' + buf.toString('utf16le'));
console.log('ucs2 =====> ' + buf.toString('ucs2'));
console.log('base64 =====> ' + buf.toString('base64'));
console.log('hex =====> ' + buf.toString('hex'));

// 버퍼 생성시 utf8로 인코딩 됨.
console.log('undefined =====> ' + buf.toString(undefined));
console.log('utf8 =====> ' + buf.toString('utf8', 10, 16));
*/

//var json = buf.toJSON(buf);
//console.log(json);


//var bytes = getBytes(text);
/*
var bytes = new Buffer(text).toString('utf8')
var thedigest = crypto.createHash("md5").update(new Buffer(encKey).toString('utf8'));
//var thedigest = crypto.createHash("md5").update(getBytes(encKey));

console.log('bytes : ' + bytes);
console.log('thedigest : ' + thedigest);
*/

//var bytes = getBytes(text);
//console.log('bytes : ' + bytes);

//xt2 = new Buffer(text).toString('base64')

/*
const cipher = crypto.createCipher('aes-256-cbc', encKey);
var result = cipher.update(text, 'utf8', 'base64');             // 'HbMtmFdroLU0arLpMflQ'
result += cipher.final('base64');                               // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='

const decipher = crypto.createDecipher('aes-256-cbc', encKey);
var result2 = decipher.update(result, 'base64', 'utf8');        // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
result2 += decipher.final('utf8');                              // 암호화할문장 (여기도 base64대신 utf8)

console.log('result : ' + result);
console.log('result2 : ' + result2);
*/

//console.log('bytes : ' + bytes);
//console.log('bytes2 : ' + new Buffer(text).toString('utf8'));

/*
var crypto = require("crypto"),
    iv = new Buffer(''),
    key = new Buffer(getBytes(encKey), 'hex'),
    decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);

var decipheredPlaintext = decipher.update(encValue, 'base64', 'utf-8');
decipheredPlaintext += decipher.final('utf-8');
*/
//console.log('decipheredPlaintext : ' + decipheredPlaintext);


/*
var cipher = crypto.createCipher('aes-128-ecb', encKey)
var crypted = cipher.update(text, 'utf-8', 'hex')
crypted += cipher.final('hex')
console.log('crypted : ' + crypted);

//console.warn("\\npart 5 : " + bytes);
*/

/*
console.warn("\\npart 3");

var text_bytes = bytes(text).decode('utf-8');
console.warn("text_bytes : " + text_bytes);

var enc = crypto.createHash("sha256").update(text).digest("base64");
console.log('enc : ' + enc);
console.log('enc2 : ' + crypto.createHash("md5").update(text).digest("base64"));
console.log('encValue : ' + encValue);
*/


/*
console.warn("\\npart 4");

//const secret = 'abcdefg';
const hash = crypto.createHmac('sha256', encKey)
    .update(text)
    .digest('base64');
console.log('hash : ' + hash);

console.log(new Buffer('645553dd'));
*/


//var decipher = crypto.createDecipher('aes-128-ecb', encKey);
//chunks = []
//chunks.push(decipher.update(new Buffer(encValue, "base64").toString("binary")));
//chunks.push(decipher.final('binary'));
//var txt = chunks.join(ebs_encKey);
//txt = new Buffer(txt, "binary").toString("utf-8");


/*
console.warn("part 1");

var AESCrypt = {};
AESCrypt.decrypt = function (cryptkey, iv, encryptdata) {
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        decipher.update(encryptdata),
        decipher.final()
    ]);
}

AESCrypt.encrypt = function (cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        encipher.update(cleardata),
        encipher.final()
    ]);
}

var cryptkey = crypto.createHash('sha256').update('Nixnogen').digest(),
    iv = new Buffer(encKey),
    buf = new Buffer(text), // 32 chars
    enc = AESCrypt.encrypt(cryptkey, iv, buf);

var dec = AESCrypt.decrypt(cryptkey, iv, enc);

console.warn("encrypt length: ", enc.length);
console.warn("encrypt in Base64:", enc.toString('base64'));
console.warn("decrypt all: " + dec.toString('utf8'));
*/

/*
console.warn("\\npart 2");

var config = {
    cryptkey: crypto.createHash('sha256').update('Nixnogen').digest(),
    iv: encKey          // "a2xhcgAAAAAAAAAA"
};

function encryptText(text) {
    console.log(config.cryptkey);

    var cipher = crypto.createCipheriv('aes-256-cbc', config.cryptkey, config.iv);
    var crypted = cipher.update(text, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
}

function decryptText(text) {
    console.log(config.cryptkey);
    if (text === null || typeof text === 'undefined' || text === '') { return text; };
    text = new Buffer(text, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-256-cbc', config.cryptkey, config.iv);
    var dec = decipher.update(text, 'binary', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

console.warn("encryptText : ", encryptText(text));
*/

/*
console.warn("\\npart 2");

var decipher = crypto.createDecipher('aes-128-ecb', encKey);
chunks = [];
chunks.push(decipher.update(new Buffer(text, "base64").toString("binary")));
chunks.push(decipher.final('binary'));
var txt = chunks.join("");
txt = new Buffer(txt, "binary").toString("utf-8");

console.log('txt : ' + txt);
//var buff = new Buffer(text);
//console.log('utf8 : ' + buff.toString('utf8'));
var buff = new Buffer(text).toString('utf8');
console.log('utf8 : ' + buff);
var encKeyStr = crypto.createHash("md5").update(new Buffer(encKey).toString('utf8'));
//var encKeyStr = crypto.createHash("md5").update(encKey).digest("base64");
console.log('encKeyStr : ' + encKeyStr);
*/



//PACKET.sendSuccess(req, res, responseObj);

/*
function add_routes(app) {
    "use strict";

    app.post("/", function (req, res) {
        
        var accountPWD = crypto.createHash("sha512").update("12345").digest("base64");

        var responseObj = {};
        responseObj.password = accountPWD;
        PRINT_LOG.debug(accountPWD)

        console.log('accountPWD : ' + accountPWD);
        PACKET.sendSuccess(req, res, responseObj);


    });
}

exports.add_routes = add_routes;
*/
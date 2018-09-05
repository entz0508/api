
const CRYPTO = require('crypto');				// Crypt library
const CRYPT_KEY = CRYPTO.createHash('sha256').update('ca3759f202fa70fc71565a30e109b4ffbe216cc8121e67c26c534376aa7e1d04').digest();
const IV = new Buffer('a2xhcgAAAAAAAAAA');

var AESCrypt = {};
AESCrypt.decrypt = function(cryptkey, iv, encryptdata) {
    "use strict";
    var decipher = CRYPTO.createDecipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        decipher.update(encryptdata),
        decipher.final()
    ]);
};

AESCrypt.encrypt = function(cryptkey, iv, cleardata) {
    "use strict";
    var encipher = CRYPTO.createCipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        encipher.update(cleardata),
        encipher.final()
    ]);
};

var AESEncrypt = function(plainText) {
    "use strict";
    var buf = new Buffer(plainText);
    return AESCrypt.encrypt(CRYPT_KEY, IV, buf);
};

var AESDecrypt = function(encryptString) {
    "use strict";
    var dec = AESCrypt.decrypt(CRYPT_KEY, IV, new Buffer(encryptString, "base64") );
    return dec.toString('utf8');
};

// EBSLang enc
var encryptLang = function (data, key) {
    var cipher = CRYPTO.createCipher('aes-128-ecb', key);
    try {
        return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
    } catch (ex) {
        return "";
    }
};

// EBSLang  dec
var decryptLang = function (data, key) {
    var decipher = CRYPTO.createDecipher('aes-128-ecb', key);
    try {
        return decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
    } catch (ex) {
        return "";
    }
};

module.exports = {
    AESEncrypt			: AESEncrypt,
    AESDecrypt          : AESDecrypt,
    encryptLang         : encryptLang,
    decryptLang         : decryptLang
};

const NODE_MAILER = require('./modules/common/mail/node_mailer.js');

var sendMailWarnningAlram = function( toEmailAddr , lang ) {
        var mail = new NODE_MAILER();
        mail.init();
        
        var fs = require('fs');
        var serverFileName = "/etc/hostname";
        var serverName = fs.readFileSync(serverFileName, "utf8"); 
        
        var subject = "[WARNNING] WRONG HTTP REQUEST or DB FAULT ";

        var to = toEmailAddr;
        var html = "잘못된 HTTP REQUEST 이거나 데이터베이스 오류입니다. <BR>http://api.doralab.co.kr/slp.platform.ping 으로 확인하세요<BR> 류정현 0 1 0 - 4 8 7 2 - 5 8 0 6 으로 연락주세요.";

        mail.send(to, subject, html, lang, function(error, success){
            if(error) {
//                PRINT_LOG.setErrorLog( "[" + __filename + "] send Mail ForgotPassword, Failed ", error );
            }
        });
};

//var mailList = "nnnok1@lycos.co.kr"
var mailList = "nnnok1@lycos.co.kr, bae_dev@blueark.com, nnnok1@naver.com,erogramer@gmail.com"

sendMailWarnningAlram(mailList, "system");




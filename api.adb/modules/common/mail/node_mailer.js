var nodemailer = require('nodemailer');				// mailer
var smtpTransport = require('nodemailer-smtp-transport');

function NodeMailer(){
    "use strict";
    this.sender = global.CONFIG.MAILER_INFO.SENDER_MAIL;
    this.transport = null;
}

NodeMailer.prototype.init = function(){
    "use strict";
    // create reusable transport method (opens pool of SMTP connections)
    var options ={};
    options.host = 'smtp.gmail.com';
    options.port = 587;
    options.secure = false;
    options.auth = { user: global.CONFIG.MAILER_INFO.GMAIL_ID, pass: global.CONFIG.MAILER_INFO.GMAIL_PASS };

    this.transport = nodemailer.createTransport(smtpTransport(options));
};

NodeMailer.prototype.send = function( toEmail, subject, _html, country, callBack){
    "use strict";
    
    var mailOptions = {
        from: this.sender,
        to: toEmail,
        subject: subject,
        html: _html
    };
    
    this.transport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        callBack(error, response);
    });
};
 
NodeMailer.prototype.makepw = function(length, special){
    "use strict";
    var iteration = 0;
    var password = "";
    var randomNumber;
    if(special === undefined){
        special = false;
    }
    while(iteration < length){
        randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
        if(!special){
            if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
            if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
            if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
            if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
        }
        iteration++;
        password += String.fromCharCode(randomNumber);
    }
    return password;
};

module.exports = NodeMailer;

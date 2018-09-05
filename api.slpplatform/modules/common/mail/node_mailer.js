var nodemailer = require('nodemailer');				// mailer
var smtpTransport = require('nodemailer-smtp-transport');

function NodeMailer(){
    "use strict";
    this.sender = "Dora’s Learning Adventure Team <no-reply@blueark.com>";
    this.transport = null;
}

NodeMailer.prototype.init = function(){
    "use strict";
    // create reusable transport method (opens pool of SMTP connections)
    var options ={};
    options.host = "smtp.gmail.com";
    options.port = 587;
    options.secure = false;
    options.auth = { user:"no-reply@blueark.com", pass: "ehfk@#$395" };

    this.transport = nodemailer.createTransport(smtpTransport(options));
};


NodeMailer.prototype.send = function( toEmail, subject, _html, country, callBack){
    "use strict";
    this.sender = "Dora’s Learning Adventure Team <no-reply@blueark.com>";

    /*if(country == "") {
        this.sender = '도라의 러닝 어드벤처 no-reply@blueark.com';
    } else {
        this.sender = 'Dora’s Learning Adventure no-reply@blueark.com';
    } */
    
    //(country == "system") {
    //  this.sender = "서버팀 <nnnok1@blueark.com>";
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: this.sender, // sender address
        to: toEmail,
        subject: subject,
//		text: "Hello world", // plaintext body
        html: _html
    };

    // send mail with defined transport object
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

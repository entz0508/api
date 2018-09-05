/**
 * Created by kkuris on 2017-12-29.
 */

var puts = require('sys').puts;

// common
const PACKET = require("../../common/util/packet_sender.js");

// function ping(str) {
//     setInterval(function () {
//         str = "ping";
//     },5000);
//
//     return str;
// }
var valString;

function resetVal(){
    valString = "";
    return valString;
}

function intervalFunc(){
    valString = "PING";
    // next();
    // resetVal();
    return valString;
}

setInterval(intervalFunc, 5000);

exports.add_routes = function(app) {
    app.post("/slp.check.server.status", function (req, res) {
        intervalFunc();

        if(valString == "PING"){
            console.log(valString);
            PACKET.sendSuccess(req, res, {Success: "OK"});
            resetVal();
        } else {
            console.log(valString);
            PACKET.sendSuccess(req, res, {Fail: "BAD"});
            resetVal();
        }


    });
};



/**
 * Created by kkuris on 2018-03-19.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


exports.add_routes = function (app) {

    app.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });

    http.listen(4400, function () {
        console.log('listening on *:4400');
    });

    var userList = [];

    io.on('connection', function(socket){
        var joinedUser = false;
        var nickName;

        // 유저 입장
        socket.on('join', function(data){
            if (joinedUser) { // 이미 입장 했다면 중단
                return false;
            }

            nickName = data;
            userList.push(nickName);
            socket.broadcast.emit('join', {
                nickName: nickName,
                userList: userList
            });

            socket.emit('welcome', {
                nickName: nickName,
                userList: userList
            });

            joinedUser = true;
        });


        // 메시지 전달
        socket.on('msg', function(data){
            console.log('msg: ' + data);
            io.emit('msg', {
                nickName: nickName,
                msg: data
            });
        });


        // 접속 종료
        socket.on('disconnect', function () {
            // 입장하지 않았다면 중단
            if (!joinedUser) {
                console.log('--- not joinedUser left');
                return false;
            }

            // 접속자목록에서 제거
            var i = userList.indexOf(nickName);
            userList.splice(i,1);

            socket.broadcast.emit('left', {
                nickName: nickName,
                userList: userList
            });
        });
    });

};



// asdfasdfasdf
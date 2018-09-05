var express = require('express');
var app = express();
var fs = require('fs');

app.enable('trust proxy');
var user = new Object();
var index = 0;
user.index1 = 0;
app.locals.pretty = true;

var favicon = require('serve-favicon'); //favicon ico 
app.use (favicon(__dirname + '/public/favicon.ico')); 

app.set('views', './views_file');
app.set('view engine', 'jade');

const game_1st = [5,21,27,34,44,45]; //minigame 에서 사용될 1등 당첨 번호
var extraNum = new Array(6); //minigame 새로고침 시 random_Game 함수에서 받아오는 로또번호 저장할 클론 배열
var fee = 0; //누적 당첨금 변수
var tmpfee = fee;

var matchCount1 = 0 //1등부터 꽝까지 카운트 변수
	, matchCount2 = 0
	, matchCount3 = 0
	, matchCount4 = 0
	, matchCount5 = 0
	, matchCount6 = 0
	, matchCountF = 0
	, totalCount = 0; //새로고침 횟수 카운트


//require("./pratice/function/autogame.js").add_routes(app);

//테스트 페이지
app.get('/game.testpage1', function(req, res){
	fs.readFile('testpage.html', function(err, data){
		if(err){
			console.log("err");
		}else{
			res.writeHead(200, {'Content-Type': 'text/html' });
			res.end(data);
		}
	});
});

//유저 접속 카운트
function user_Connected(){    //user 접속 카운트 함수
	if(app.get('/game.page',function(){})){
			index++;
			console.log("-----------------------지금까지 " + index + "번 refresh 함----------------------------");
			var obj = index;
	}
	return obj;
}

//메인 페이지 view gamehome.jade
app.get('/game.home', function (req, res){ 
	try{
		res.render('gamehome', user_Connected());
	}catch(catchErr){
		console.log("page error");
		res.send(document.write("Error!!!"));
	}
});

function sortNumber(a, b){ //sortNumber 함수
	return a - b;
}

//random번호 추출 함수
function random_Game(){ //random game 함수
	"use strict";
        var lotto = new Array(6);  // 6개의 로또 번호를 저장할 배열
        var count = 0; // 추첨된 로또번호의 갯수
        var mFlag = true; // 번호중복 방지용 변수
		var result; //결과값 리턴 변수
		
        while(count < 6){ // 6개의 로또번호를 얻을때까지 반복
           var number; // 랜덤번호 추출
		   
           number = parseInt(Math.random()*45)+1;
           for(var i=0; i<count; i++){ // 중복확인
			  if(lotto[i] == number){
				  mFlag = false;
			  } 
		   }
           if(mFlag){ // 중복된 번호가 아니면 로또 번호배열에 추가
                lotto[count] = number;
                count++;
           }
           mFlag = true;
		   
       } 
	   lotto.sort(sortNumber);  //버블소팅 , sort 함수 내 sortNumber 함수를 인자 값으로 받음. callback 함수
	result = lotto.toString();
	extraNum = lotto.slice();
	
	return result;
}

//누적당첨금 함수
function prizeMoney(){	 //누적당첨금 함수
	if(app.get('/game.minigame',function(){})){ //콜백 minigame 접속 시 체크
		totalCount++;
		console.log("refresh-------"+totalCount);
		return fee;
	}
}


//app.get('/game.list', function(req, res){
//	res.render('new2');
//});

//1Lotto
app.get('/game.page', function(req, res){
	try{
		res.send("<h1> Game Number: <BR>1게임 "+random_Game() +"<BR>count : "+user_Connected()+"</h1>");
	}catch(catchErr){
		console.log("=============================================page error");
	}
});
//2Lotto
app.get('/game.page1', function(req, res){
	try{
		res.send("<h1> Game Number: <BR>1게임 "+random_Game() + "<BR>2게임 "+random_Game()+"<BR>count : "+user_Connected()+"</h1>");
	}catch(catchErr){
		console.log("=============================================page error");
	}
});
//3Lotto
app.get('/game.page2', function(req, res){
	try{
		res.send("<h1> Game Number: <BR>1게임 "+random_Game() + "<BR>2게임 "+random_Game()+ "<BR>3게임 "+random_Game() +"<BR>count : "+user_Connected()+"</h1>");
	}catch(catchErr){
		console.log("=============================================page error");
	}
});
//4Lotto
app.get('/game.page3', function(req, res){
	try{
		res.send("<h1> Game Number: <BR>1게임 "+random_Game() + "<BR>2게임 "+random_Game()+ "<BR>3게임 "+random_Game() + "<BR>4게임 "+random_Game() + "<BR>count : "+user_Connected() + "</h1>");
	}catch(catchErr){
		console.log("=============================================page error");
	}
});
//5Lotto
app.get('/game.page4', function(req, res){
	try{
		res.send("<h1> Game Number: <BR>1게임 "+random_Game() + "<BR>2게임 "+random_Game()+ "<BR>3게임 "+random_Game() + "<BR>4게임 "+random_Game() + "<BR>5게임 "+random_Game() + "<BR>count : "+user_Connected()+"</h1>");
	}catch(catchErr){
		console.log("=============================================page error");
	}
});


//minigame
app.get('/game.minigame', function(req, res){
	try{
		function extra_Game(){
	var matchCount = 0; //배열 내 맞은 번호 카운트 변수
	
	var	str1 = "1개 맞았음 그래도 뭐 없음ㅋ밑에 당첨금이나 올려주셈ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ";
	var str2 = "2개 맞았음 그래도 뭐 없음ㅋ 밑에 당첨금이나 올려주셈ㅋㅋㅋㅋㅋㅋㅋㅋㅋ";
	var	str3 = "3개 맞았음 4등됨 너님 5천원 ㅊㅋ 본전 치기 함";
	var str4 = "4개 맞았음 3등됨 너님 5만원 ㅊㅋ 올ㅋ 금액이 좀 커짐?ㅋ";
	var	str5 = "5개 맞았음 올ㅋ 너님 2등 임 120만원 ㅊㅋㅊㅋ 이건 그냥 내가 정한거임ㅋㅋㅋ";
	var	str6 = "와 오마이갓 님 1등임 100억임 100억!!!! 강남에 땅 사자 꽃길만 걷자!!! 새로고침 하기전에 캡쳐해서 이나니한테 보여주셈!! 맛난거 사줄테니까";
	var fail = "그냥 맞은게 없음 그 종이 찢어버리셈ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ";
	
	random_Game();
	
	for(var i = 0; i < game_1st.length; i++){
		for(var j = 0; j < game_1st.length; j++){
			if(extraNum[i] == game_1st[j]){
				matchCount++;	
			}
		}
	}
	console.log("-----------------------------------맞은숫자갯수 : "+matchCount);

	if(matchCount == 1){
		fee += 1000;
		console.log("===================돈"+fee);
		matchCount1++;
		
		
		return str1;
	}else if(matchCount == 2){
		fee += 1000;
		console.log("===================돈"+fee);
		matchCount2++;
		
		
		return str2;
	}else if(matchCount == 3){
		fee += 1000;
		fee = fee - 5000;
		console.log("===================돈"+fee);
		matchCount3++;
		
		return str3;
	}else if(matchCount == 4){
		fee += 1000;
		fee = fee - 50000;
		console.log("===================돈"+fee);
		matchCount4++;
		
		return str4;
	}else if(matchCount == 5){
		fee += 1000;
		fee = fee - 1200000;
		console.log("===================돈"+fee);
		matchCount5++;
		
		return str5;
	}else if(matchCount == 6){	
		fee += 1000;
		fee = fee - 1000000000;
		console.log("===================돈"+fee);
		matchCount6++;
		
		return str6;
	}else{
		fee += 1000;
		console.log("===================돈"+fee);
		matchCountF++;
		
		return fail;
	}
	
	}
	res.send("<h1>"+extra_Game()+"<BR><BR> 뽑은 숫자 : "+extraNum.toString()+"<BR> 1등 번호 : "+game_1st.toString()+"<BR><BR>누적 당첨금 :"+prizeMoney()+"<BR><BR><BR>0개 : "+matchCountF+"회<BR> 1개 : "+matchCount1+"회<BR> 2개 : "+matchCount2+"회<BR> 3개(4등) : "+matchCount3+"회<BR> 4개(3등) : "+matchCount4+"회<BR> 5개(2등) : "+matchCount5+"회<BR> 6개(1등) : "+matchCount6+"회</h1>");
}catch(catchErr){
	console.log("=============================================page error")
}
});


app.listen(16001, function () {
  console.log('16001포트 열림, 서버시작!!!');
});

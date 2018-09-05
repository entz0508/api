<?
header('Content-Type: application/json; charset=utf-8');

//session_start();
//if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
//	echo "<meta http-equiv='refresh' content='0;url=index.html'>";
//	exit;
//}

require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");

//include $_SERVER['DOCUMENT_ROOT']."/inc/lib.php";

//if(!isset($_POST['roundID']) || !isset($_POST['roundValue'])) exit;
//$roundID = $_POST['roundID'];
//$roundValue = $_POST['roundValue'];
//if(!is_numeric($roundID) || !is_numeric($roundValue)) exit;
//
//header('Content-Type: application/json; charset=utf-8');
//require_once("./inc/dbcon.php");
//$sql = 'call GAME_MODIFY_VALUE_Roulette('.$roundID.','.$roundValue.')';
//$result = $db->query($sql);
//$row = $result->fetch_assoc();
//$arr = array ('Result'=>$row['Result'],'ResultMsg'=>$row['ResultMsg']);
//echo json_encode($arr,JSON_UNESCAPED_UNICODE);


########  File upload Function ##############################################################
### $file_name = func_fileup($tmpfile,$exHH,$exname,$upload_dir);
### $userfile_url= func_fileup("$p_title_bar" ,"title_bar", "$p_title_bar_name" , $DOCUMENT_ROOT."/upfile/title"); 
###################################################################################

function func_fileup($tmpfile,$exHH,$exname,$upload_dir){
	$extail = strtolower(substr(strrchr($exname, "."), 1)); //.Àž·Î ±žºÐÇØŒ­ ±âÁØÀž·Î ž¶Áöž· °Å žÕ°¡ ¿¹žŠµéžé gif//ŒÒ¹®ÀÚ·Î ÀüÈ¯[strtolower()]ÇØŒ­
	if (eregi($extail, "html|php3|shtml|php|phtml|ztx|dot|js|htm|inc|asp|aspx|cgi|pl")) {
		$extail .= ".txt";
	}

	$i=1;
	$exhead = $exHH."00";
	$exfilename = $exhead.$i.".".$extail;

	if(!is_dir("$upload_dir")) { 
		@mkdir("$upload_dir",0777);
		@chmod("$upload_dir",0777);
	}

	while (file_exists("$upload_dir/$exfilename")){
			$i++;
			$exfilename = $exhead.$i.".".$extail;
	}
	copy($tmpfile,"$upload_dir/$exfilename");
	@unlink($tmpfile);
	return $exfilename;
}

function func_fileup_format_check($exname){
	$extail = strtolower(substr(strrchr($exname, "."), 1)); 
	if (!eregi($extail, "gif|jpeg|bmp|jpg")) {
		$msg = "$exname ......"; 
		//msgerror($msg,1);
		//exit;
		return $msg;
	}else{
		return "ok";
	}
}

function msgerror($msg,$i){
	switch ($i) {
		case "1" : $fnc="history.go(-1);"; break;
		case "2" : $fnc="window.close();"; break;
		case "3" : $fnc="document.location.href='/';"; break;
	}
	echo "<script language=javascript>
	window.alert('$msg');
	$fnc
	</script>";
	exit;
}


//$bannerType = 1;			// 1:topBanner, 2:bottomBanner
//$now =  date("Y.m.d H:i:s");
//$p_title=tag_del($p_title);
//$result = array();
//$result["result"] = true;
//$groupData = array();
//$groupData["title"] = $_POST['title'];
//$groupData["linkurl"] = $_POST['linkurl'];

$bannerID = (!isset($_POST['bannerID'])) ? 0:$_POST['bannerID'];
$bannerFile = (!isset($_POST['bannerFile'])) ? null:$_POST['bannerFile'];
$bannerType = (!isset($_POST['bannerType'])) ? 0:$_POST['bannerType'];

if(strpos($_POST['reservation'], "-") != false){
	$reservation = split('-', $_POST['reservation']);							// 02\/08\/2018 - 02\/08\/2019
	//$groupData["reservation"] = $_POST['reservation'];
	//$groupData["reservationFrom"] = date("Y-m-d",strtotime($reservation[0]));
	//$groupData["reservationTo"] = date("Y-m-d",strtotime($reservation[1]));
	$fromDatetime = date("Y-m-d",strtotime($reservation[0]));
	$toDatetime = date("Y-m-d",strtotime($reservation[1]));
}

$sortID = $_POST['sortid'];
if(!isset($_POST['displayid'])){
	$displayid = 0;
}else{
	$displayid = ($_POST['displayid'] == "on")? 1:0;
}

$tmpname = $_FILES['bannerimage']['tmp_name'];
if (is_uploaded_file($tmpname)){	#파일 용량 체크함수 호출 #파일 업로드 함수 호출
	$uploadPath = $_SERVER['DOCUMENT_ROOT']."/upfile/banner";	

	IF($bannerFile != ""){
		$dropFile = $uploadPath ."/". $bannerFile;
		@unlink($dropFile);
	}

	$filecount = count($_FILES['bannerimage']['name']);
	$file_format_check = func_fileup_format_check($_FILES['bannerimage']['name']);
	if($filecount>0 && $file_format_check == true) {
		$orgfilename = $_FILES['bannerimage']['name'];		// "23279552_1629395053747301_6466751735816781824_n.jpg"
		//$u_file_size = $_FILES['bannerimage']['size'];	// 22448
		//$u_file_type = $_FILES['bannerimage']['type'];	// "image/jpeg"
		if($bannerType == 1)
			$bannerUrl = func_fileup($tmpname ,"top_banner".time()."_", $orgfilename , $uploadPath); 
		else
			$bannerUrl = func_fileup($tmpname ,"bottom_banner".time()."_", $orgfilename , $uploadPath);
			 

		$groupData["userfile_url"] = $bannerUrl;		// "top_banner0096.jpg"
	}else{
		@unlink($tmpfile);
	}
}else{
	$bannerUrl = null;
}

if($bannerID > 0){
	// CALL `ADB`.`spBannerMod`(<{bannerID int}>, <{bannerType int}>, <{bannerTitle varchar(100)}>, <{imageUrl varchar(45)}>, <{bannerLink varchar(300)}>, <{fromDatetime datetime}>, <{toDatetime datetime}>, <{sortID tinyint}>, <{displayType tinyint}>);
	$sql = 'call spBannerMod('.$bannerID.','.$bannerType.',"'.$_POST['title'].'","'.$bannerUrl.'","'.$_POST["linkurl"].'","'.$fromDatetime.'","'.$toDatetime.'",'.$sortID.','.$displayid.')';
}else{
	$sql = 'call spBannerReg('.$bannerType.',"'.$_POST['title'].'","'.$bannerUrl.'","'.$_POST["linkurl"].'","'.$fromDatetime.'","'.$toDatetime.'",'.$sortID.','.$displayid.')';
}

$result = $db->query($sql);
$row = $result->fetch_assoc();
$result = array ('Result'=>$row['RES'],'ResultMsg'=>$row['MSG']);
$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
echo  urldecode($output);
?>
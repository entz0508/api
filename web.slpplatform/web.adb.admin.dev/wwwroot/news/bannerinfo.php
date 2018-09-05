<?
    header('Content-Type: application/json; charset=utf-8');
//    $groupData = array();
    
//session_start();
//if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
//	echo "<meta http-equiv='refresh' content='0;url=index.html'>";
//	exit;
//}

require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");

// include $DOCUMENT_ROOT."/inc/dbcon.php";
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

/*
$bannerType = 1;			// 1:topBanner, 2:bottomBanner
//$now =  date("Y.m.d H:i:s");
//$p_title=tag_del($p_title);
//$result = array();
//$result["result"] = true;
//$groupData = array();
//$groupData["title"] = $_POST['title'];
//$groupData["linkurl"] = $_POST['linkurl'];

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
	$filecount = count($_FILES['bannerimage']['name']);
	$file_format_check = func_fileup_format_check($_FILES['bannerimage']['name']);
	if($filecount>0 && $file_format_check == true) {
		$orgfilename = $_FILES['bannerimage']['name'];		// "23279552_1629395053747301_6466751735816781824_n.jpg"
		//$u_file_size = $_FILES['bannerimage']['size'];	// 22448
		//$u_file_type = $_FILES['bannerimage']['type'];	// "image/jpeg"
		$uploadPath = $_SERVER['DOCUMENT_ROOT']."/upfile/banner";	
		$bannerUrl = func_fileup($tmpname ,"top_banner", $orgfilename , $uploadPath); 
		$groupData["userfile_url"] = $bannerUrl;		// "top_banner0096.jpg"
	}else{
		@unlink($tmpfile);
	}
}

*/

// CALL `ADB`.`spBannerReg`(<{bannerType int}>, <{bannerTitle varchar(100)}>, <{imageUrl varchar(45)}>, <{bannerLink varchar(300)}>, <{fromDatetime datetime}>, <{toDatetime datetime}>
// , <{sortID tinyint}>, <{displayType tinyint}>);
//$sql = 'call spBannerReg('.$roundID.','.$roundValue.')';

if(!isset($_POST['bannerid'])){
	$bannerid = 0;
}else{
	$bannerid = $_POST['bannerid'];
}

$sql = "SELECT BANNER_ID, BANNER_TITLE,
				IMAGE_URL,
				BANNER_LINK,
				CONCAT(DATE_FORMAT(FROM_DATETIME, '%m/%d/%Y'),' - ',DATE_FORMAT(TO_DATETIME, '%m/%d/%Y')) as `RES_DATETIME`,
				SORT_ID,
				DISPLAY_TYPE
			FROM ADB.banner_tb
			WHERE BANNER_TYPE = 1 and BANNER_ID = ".$bannerid;
//echo "<br/>".$sql;
$result = $db->query($sql);
$row = $result->fetch_assoc();
//$result = array ('Result'=>$row['RES'],'ResultMsg'=>$row['MSG']);
$result = array();
$contents = array();

if($row['BANNER_ID'] != null){
	$result["result"] = true;
	$contents["BANNER_TITLE"] = $row['BANNER_TITLE'];
	$contents["IMAGE_URL"] = $row['IMAGE_URL'];
	$contents["BANNER_LINK"] = $row['BANNER_LINK'];
	$contents["resDatetime"] = $row['RES_DATETIME'];
	$contents["SORT_ID"] = $row['SORT_ID'];
	$contents["DISPLAY_TYPE"] = $row['DISPLAY_TYPE'];
	$result["Data"] = $contents;
}else{
	$result["result"] = false;
	$result["Data"] = $contents;
}
// JSON Array가 포함된 Object를 문자열로 변환
//$result["Data"] = $groupData;
$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
echo  urldecode($output);
 
//echo json_encode($result,JSON_UNESCAPED_UNICODE);
?>
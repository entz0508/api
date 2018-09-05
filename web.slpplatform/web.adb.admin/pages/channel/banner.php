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
	$extail = strtolower(substr(strrchr($exname, "."), 1));
	//if (eregi($extail, "html|php3|shtml|php|phtml|ztx|dot|js|htm|inc|asp|aspx|cgi|pl")) {
	if (preg_match("/(htm[l]?|php3|shtml|php|phtml|ztx|dot|js|inc|asp|aspx|cgi|pl|sh)/i",$extail)) {
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
	//if (!eregi($extail, "gif|jpeg|bmp|jpg")) {
	if (!preg_match("/(gif|jp[e]?g|bmp)/i",$extail)) {
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

$bannerID = (!isset($_POST['bannerID'])) ? 0:$_POST['bannerID'];
$bannerFile = (!isset($_POST['bannerFile'])) ? null:$_POST['bannerFile'];
$bannerType = (!isset($_POST['bannerType'])) ? 0:$_POST['bannerType'];

if(strpos($_POST['reservationtime'], "-") != false){
	//$reservation = split('-', $_POST['reservationtime']);
	$reservation = explode('-', $_POST['reservationtime']);
	$fromDatetime = trim($reservation[0]);
	$toDatetime = trim($reservation[1]);

}

$sortID = $_POST['sortid'];
if(!isset($_POST['displayid'])){
	$displayid = 0;
}else{
	$displayid = ($_POST['displayid'] == "on")? 1:0;
}

$tmpname = $_FILES['bannerimage']['tmp_name'];
if (is_uploaded_file($tmpname)){
	$uploadPath = $_SERVER['DOCUMENT_ROOT']."/upfile/banner";	

	IF($bannerFile != ""){
		$dropFile = $uploadPath ."/". $bannerFile;
		@unlink($dropFile);
	}

	$filecount = count($_FILES['bannerimage']['name']);
	$file_format_check = func_fileup_format_check($_FILES['bannerimage']['name']);
	if($filecount>0 && $file_format_check == true) {
		$orgfilename = $_FILES['bannerimage']['name'];
		//$u_file_size = $_FILES['bannerimage']['size'];	// 22448
		//$u_file_type = $_FILES['bannerimage']['type'];	// "image/jpeg"

		if($bannerType == 1)
			$bannerUrl = func_fileup($tmpname ,"top_banner".time()."_", $orgfilename , $uploadPath); 
		else
			$bannerUrl = func_fileup($tmpname ,"bottom_banner".time()."_", $orgfilename , $uploadPath);
			 
		$groupData["userfile_url"] = $bannerUrl;
	}else{
		@unlink($tmpfile);
	}
}else{
	$bannerUrl = null;
}

if($bannerID > 0){
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
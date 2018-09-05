<?
header('Content-Type: application/json; charset=utf-8');

//session_start();
//if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
//	echo "<meta http-equiv='refresh' content='0;url=index.html'>";
//	exit;
//}

require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
//include $_SERVER['DOCUMENT_ROOT']."/inc/lib.php";

$bannerID = (!isset($_POST['bannerID'])) ? 0:$_POST['bannerID'];
$bannerFile = (!isset($_POST['bannerFile'])) ? "":$_POST['bannerFile'];

if($bannerID > 0){
	if($bannerFile != ""){
		$uploadPath = $_SERVER['DOCUMENT_ROOT']."/upfile/banner/".$bannerFile;	
		@unlink($uploadPath);
	}
	$sql = 'call spBannerDrop('.$bannerID.')';
}

$result = $db->query($sql);
$row = $result->fetch_assoc();
$result = array ('Result'=>$row['RES'],'ResultMsg'=>$row['MSG']);
$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
echo  urldecode($output);
?>
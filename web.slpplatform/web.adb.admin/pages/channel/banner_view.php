<?
header('Content-Type: application/json; charset=utf-8');

//session_start();
//if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
//	echo "<meta http-equiv='refresh' content='0;url=index.html'>";
//	exit;
//}

require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
//include $_SERVER['DOCUMENT_ROOT']."/inc/lib.php";

$bannerType = 1;			// 1:topBanner, 2:bottomBanner
//$now =  date("Y.m.d H:i:s");
$bannerID = (!isset($_POST['bannerID'])) ? 0:$_POST['bannerID'];
$sortVal = (!isset($_POST['sortid'])) ? 0:$_POST['sortid'];
$displayVal = $_POST['isDisplay'];

if($sortVal > 0){
	$sql = 'call spBannerViewMod('.$bannerID.','.$sortVal.',0)';
	
}else{
	$displayVal = ($displayVal == "true") ? 1 : 0;
	$sql = 'call spBannerViewMod('.$bannerID.',0,'.$displayVal.')';
}

$result = $db->query($sql);
$row = $result->fetch_assoc();
$result = array ('Result'=>$row['RES'],'ResultMsg'=>$row['MSG'],'DisplayVal'=>$displayVal);
$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
echo  urldecode($output);
?>
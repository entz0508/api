<?
header('Content-Type: application/json; charset=utf-8');
require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");

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

$userPass = (!isset($_POST['pass'])) ? 0:$_POST['pass'];
$userPass2 = (!isset($_POST['pass2'])) ? 1:$_POST['pass2'];
$tokenVal = (!isset($_POST['token'])) ? "":$_POST['token'];

if($userPass == $userPass2){
	$sql = "call sppassChange('$tokenVal','$userPass')";
	$result = $db->query($sql);
	$row = $result->fetch_assoc();

	$result = array ('Result'=>$row['RES'],'ResultMsg'=>$row['MSG']);
	$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
	echo  urldecode($output);

}else{
	$result = array ('Result'=>'9999','ResultMsg'=>'.입력된 비밀번호가 동일하지 않습니다.');
	$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
	echo  urldecode($output);

}
?>
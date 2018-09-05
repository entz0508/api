<?
	//$referer = parse_url($_SERVER['HTTP_REFERER']);
	//$sip = $referer[host];				// 104.199.129.129
	//$cip = $_SERVER["REMOTE_ADDR"];		// 59.10.150.7

	//$database_url = "104.199.129.129:16612";
	//$database_name = "slp_account_db";
	//$database_id = "root";
	//$database_pw = "bluearkedu01";

	$database_url = "104.199.192.78:16612";
	$database_name = "slp_account_db";
	$database_id = "splaccountdev";
	$database_pw = "qmffndkzm!!!!";

	$db = mysqli_connect($database_url,$database_id,$database_pw) or die("DB가 열리지 않았습니다.");
	mysqli_select_db($db, $database_name);

	if(!$db) {
		echo mysql_errno().":";
		echo mysql_error()."<br>";
	}
?>

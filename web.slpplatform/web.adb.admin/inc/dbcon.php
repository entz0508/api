<?
	//$referer = parse_url($_SERVER['HTTP_REFERER']);
	//$sip = $referer[host];				// 104.199.129.129
	//$cip = $_SERVER["REMOTE_ADDR"];		// 59.10.150.7
	//echo "<br/>>>".$_SERVER['HTTP_REFERER'];
	//echo "<br/>>>".parse_url($_SERVER['HTTP_REFERER']);

	//if($sip = "104.199.129.129"){			// DEV
	$database_url = "localhost:16612";
	$database_name = "ADB";
	$database_id = "slpadbdev";
	$database_pw = "qmffndkzm!!!!";
	//}else{
	//	$database_url = "104.199.129.129:16612";
	//	$database_name = "slp_account_db";
	//	$database_id = "root";
	//	$database_pw = "bluearkedu01";
	//}

	
	

	$db = mysqli_connect($database_url,$database_id,$database_pw) or die("DB error");
	mysqli_select_db($db, $database_name);
		
	if(!$db) {
		echo mysql_errno().":";
		echo mysql_error()."<br>";
	}
?>

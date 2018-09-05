<?
	$cip = $_SERVER["REMOTE_ADDR"];
	if($cip == "106.250.172.162" || $cip == "118.220.142.116" || $cip == "106.254.251.10"){
		if(!isset($_POST['user_login']) || !isset($_POST['user_pass'])) exit;

		$user_login = $_POST['user_login'];
		$user_pass = $_POST['user_pass'];
		$members = array('adb@admin'=>array('pw'=>'!@#$dpdlelql', 'name'=>'ADB관리자'));

		if(!isset($members[$user_login])) {
				echo "<script>alert('아이디 또는 패스워드가 잘못되었습니다.');history.back();</script>";
				exit;
		}
		if($members[$user_login]['pw'] != $user_pass) {
				echo "<script>alert('아이디 또는 패스워드가 잘못되었습니다.');history.back();</script>";
				exit;
		}
		session_start();
		$_SESSION['user_login'] = $user_login;
		$_SESSION['user_name'] = $members[$user_login]['name'];
		?>
		<meta http-equiv='refresh' content='0;url=index.html'>
		<?
	}else{
		die("Connect error");

	}
?>
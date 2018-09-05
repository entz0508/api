<?
	$cip = $_SERVER["REMOTE_ADDR"];

	// 175.197.149.204	영애님자택 20180809
	if($cip == "106.250.172.162" || $cip == "118.220.142.116" || $cip == "175.197.149.204"){
		if(!isset($_POST['user_login']) || !isset($_POST['user_pass'])) exit;

		$user_login = $_POST['user_login'];
		$user_pass = $_POST['user_pass'];
		$members = array('doradora'=>array('pw'=>'!@#$ehfk', 'name'=>'관리자'));

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
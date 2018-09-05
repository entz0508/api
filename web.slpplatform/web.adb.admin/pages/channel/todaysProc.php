<?
header('Content-Type: application/json; charset=utf-8');
require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");

function func_fileup_format_check($exname){
	$extail = strtolower(substr(strrchr($exname, "."), 1)); 
	//if (!eregi($extail, "csv")) {
	if (!preg_match("/(csv)/i",$extail)) {
		$msg = "$exname ......"; 
		return $msg;
	}else{
		return "ok";
	}
}

$res = 0;
$resMsg = "";

$tmpname = $_FILES['todaysFile']['tmp_name'];

if (is_uploaded_file($tmpname)){
	$uploadPath = $_SERVER['DOCUMENT_ROOT']."/upfile/banner";	

	$filecount = count($_FILES['todaysFile']['name']);
	$file_format_check = func_fileup_format_check($_FILES['todaysFile']['name']);
	if($filecount>0 && $file_format_check == true) {
		$orgfilename = $_FILES['todaysFile']['name'];

		$csv = array_map('str_getcsv', file($tmpname));
		$sql = null;

		foreach ($csv as &$value) { 
			if(is_numeric($value[1])){
				$dt = (int)str_replace(".","",$value[0]) ;
				echo $dt."/".$value[0]."/".$value[1]."/".$value[2]."/".$value[3]."/".$value[4 ]."\n";

				$sql = "call spTodaysReg($dt,'$value[0]',$value[1],$value[2],$value[3],$value[4]);";
				$db->query($sql);
			}
		} 

		@unlink($tmpfile);

	}else{
		@unlink($tmpfile);

	}
}else{
	$bannerUrl = null;
}

$result = array ('Result'=>$res,'ResultMsg'=>$resMsg);
$output =  json_encode($result,JSON_UNESCAPED_UNICODE);
echo  urldecode($output);
?>
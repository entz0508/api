<? 
/**
 * JSON beautifier
 * @param string    The original JSON string
 * @param   string  Return string
 * @param string    Tab string
 * @return string
 */ 
function pretty_json($json) {
    //$json_length = strlen($json);
    if(jsonStr($json) == "null"){
        if(jsonStr($json."\"}") == "null")
            return $json;
        else 
            return jsonStr($json."\"}");
    }else{
        return jsonStr($json);
    }
}   

function jsonStr($str){
    return json_encode(json_decode($str), JSON_PRETTY_PRINT);
}

########¿¡·¯žÞŒŒÁö ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "œÅÃ»Œö·®ÀÌ ŸøœÀŽÏŽÙ.\\n\\nÀç ÀÛŒºÇØ ÁÖœÃ±â ¹Ù¶øŽÏŽÙ.\\n"; msgerror($msg,$i);                             ###
###################################################################################
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

########alert ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "œÅÃ»Œö·®ÀÌ ŸøœÀŽÏŽÙ.\\n\\nÀç ÀÛŒºÇØ ÁÖœÃ±â ¹Ù¶øŽÏŽÙ.\\n"; msgalert($msg);                             ###
###################################################################################
function msgalert($msg){
echo "<script language=javascript>
window.alert('$msg');
</script>";
}


########žÞŒŒÁöÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "°üž®ÀÚ·Î ·Î±×ÀÎÀ» ÇÏ¿ŽœÀŽÏŽÙ."; msggoto($msg,"./admin.html");                             ###
###################################################################################
function msggoto($msg,$i){
$fnc="document.location.href='$i';";
echo "<script language=javascript>
window.alert('$msg');
$fnc
</script>";
exit;
}

########žÞŒŒÁöÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "°üž®ÀÚ·Î ·Î±×ÀÎÀ» ÇÏ¿ŽœÀŽÏŽÙ."; msgtopgoto($msg,"./admin.html");                             ###
###################################################################################
function msgtopgoto($msg,$i){
    $fnc="top.window.document.location.href='$i';";
    echo "<script language=javascript>
        window.alert('$msg');
    $fnc
    </script>";
    exit;
}

########ÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) goto("./admin.html");                             ###
###################################################################################
function gotoPage($i){
    $fnc = "window.document.location.href=\'$i\';";
    echo "<script language=javascript>
    $fnc
    </script>";
    exit;
}

########žÞŒŒÁö ž®·Îµå ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "°üž®ÀÚ·Î ·Î±×ÀÎÀ» ÇÏ¿ŽœÀŽÏŽÙ."; msgreload($msg);                             ###
###################################################################################
function msgreload($msg){
echo "<script language=javascript>
opener.location.reload(true);
window.alert('$msg');
window.close();
</script>";
exit;
}

########žÞŒŒÁö opener ÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "°üž®ÀÚ·Î ·Î±×ÀÎÀ» ÇÏ¿ŽœÀŽÏŽÙ."; msgopenerhref($msg);                             ###
###################################################################################
function msgopenerhref($msg,$url){
$fnc="opener.location.href='$url';";
echo "<script language=javascript>
$fnc
//opener.location.reload(true);
window.alert('$msg');
window.close();
</script>";
exit;
}

########žÞŒŒÁö opener ÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $msg = "°üž®ÀÚ·Î ·Î±×ÀÎÀ» ÇÏ¿ŽœÀŽÏŽÙ."; msgclose($msg);                             ###
###################################################################################
function msgclose($msg){
echo "<script language=javascript>
$fnc
window.alert('$msg');
window.close();
</script>";
exit;
}

########close ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) winclose();                             ###
###################################################################################
function winclose(){
echo "<script language=javascript>
window.close();
</script>";
exit;
}

########žÞŒŒÁö opener ÀÌµ¿ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) nomsgreload();                             ###
###################################################################################
function nomsgreload(){
echo "<script language=javascript>
opener.location.reload(true);
window.close();
</script>";
exit;
}

########  auto link Function   ##############################################################
### »ç¿ë ¿¹ ) 		$str_str = http_mail_link($str);                                                                                                              ###
###################################################################################
function http_mail_link($str) {
	$str=explode("\n",$str);
	$str=implode("\n ",$str);
	$str=" ".$str;
	$str = eregi_replace( ">http://([a-z0-9\_\-\.\/\~\@\?\=\;\&\#\-]+)", "><a href=http://\\1 target=_blank>http://\\1</a>", $str);
	$str = eregi_replace( "\(http://([a-z0-9\_\-\.\/\~\@\?\=\;\&\#\-]+)\)", "(<a href=http://\\1 target=_blank>http://\\1</a>)", $str);
	$str = eregi_replace( "  http://([a-z0-9\_\-\.\/\~\@\?\=\;\&\#\-]+)", "  <a href=http://\\1 target=_blank>http://\\1</a>", $str);
	$str = eregi_replace( " http://([a-z0-9\_\-\.\/\~\@\?\=\;\&\#\-]+)", " <a href=http://\\1 target=_blank>http://\\1</a>", $str);
	$str = eregi_replace(" ([_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+){1,})", " <a href=mailto:\\1>\\1</a>", $str);
return $str;
} 

########  ¹®ÀÚ¿­ ÀÚž£±â Function ############################################################
### »ç¿ë ¿¹ ) 		$str_str = func_str_cut($max, $str);                                                                                                      ###
###################################################################################
function func_str_cut($max, $str){
	$count = strlen($str); //¹®ÀÚÀÇ ±æÀÌžŠ ±žÇÑŽÙ.
	if($count >= $max) { //¹®ÀÚ°¡ maxºžŽÙ ±æžé..
		for ($pos=$max;$pos>0 && ord($str[$pos-1])>=127;$pos--); //µÚ¿¡Œ­ ÇÑÀÚŸ¿¶ŒŸî³»Ÿî Á€»óÀûÀÎ ¹®ÀÚ,ŒýÀÚžé for¹® ³¡..
		$str = (($max-$pos)%2 == 0) ? substr($str, 0, $max) . ".." : substr($str, 0, $max+1) . ".." ; //ÂŠÀÌ ŸÈžÂÀžžé ÇÑ±ÛÀÚ Žõ ÀÛ°Ô ÀÚž¥ŽÙ.ŸÆŽÔ ž»±ž.. 
		return $str;
	} else { 
		$str = "$str"; 
		return $str;
	} 
}


########   // °£ŽÜ ±žÇö ÆäÀÌÂ¡ //ÆíÁý....... Function #################################################
### »ç¿ë ¿¹ ) 		$str_str = page_nav($re_page,$total,$scale,$p_num,$page,$query);                                                          ###
###################################################################################
function page_nav($re_page,$total,$scale,$p_num,$page,$query){

	$total_page = ceil($total/$scale);
	if (!$page) $page = 1;
	$page_list = ceil($page/$p_num)-1;

	// ÆäÀÌÁö ž®œºÆ®ÀÇ Ã¹¹øÂ°°¡ ŸÆŽÑ °æ¿ì¿£ [1]...[prev] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_list>0) {
		$navigation = "<a href='$re_page?page=1&$query'><font class='ver9'>[1]</font></a> ... ";
		$prev_page = ($page_list-1)*$p_num+1;
		$navigation .= "<a href='$re_page?page=$prev_page&$query'><img src='/img/board/board_prew.gif' align='absmiddle' border='0'></a> ";
#		$navigation = "<a href='$re_page?page=$prev_page&$query'> [ÀÌÀü 10 ÆäÀÌÁö] </a> ";
	}else{
		$navigation = " <img src='/img/board/board_prew.gif' align='absmiddle' border='0'> ";
#		$navigation = " [ÀÌÀü 10 ÆäÀÌÁö] ";
	}

	// ÆäÀÌÁö žñ·Ï °¡¿îµ¥ ºÎºÐ Ãâ·Â
	$page_end=($page_list+1)*$p_num;
	if ($page_end>$total_page) $page_end=$total_page;

	for ($setpage=$page_list*$p_num+1;$setpage<=$page_end;$setpage++) {
		if ($setpage==$page) {
				$navigation .= "<font class=h3 color=018287><b>$setpage</b></font> ";
		} else {
				$navigation .= "<a href='$re_page?page=$setpage&$query'><font class=h3>$setpage</font></a> ";
		}
	}

	// ÆäÀÌÁö žñ·Ï žÇ ³¡ÀÌ $total_page ºžŽÙ ÀÛÀ» °æ¿ì¿¡žž, [next]...[$total_page] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_end<$total_page) {
		$next_page = ($page_list+1)*$p_num+1;
		$navigation .= "<a href='$re_page?page=$next_page&$query'><img src='/img/board/board_next.gif' align='absmiddle' border='0'></a> ";
#		$navigation .= "<a href='$re_page?page=$next_page&$query'> [ŽÙÀœ 10 ÆäÀÌÁö] </a> ";
		$navigation .= "... <a href='$re_page?page=$total_page&$query'><font class='ver9'>[$total_page]</font></a>";
	}else{
		$navigation .= " <img src='/img/board/board_next.gif' align='absmiddle' border='0'> ";
#		$navigation .= " [ŽÙÀœ 10 ÆäÀÌÁö] ";
	}

	return $navigation;
}

########   // °£ŽÜ ±žÇö ÆäÀÌÂ¡ //ÆíÁý....... Function #################################################
### »ç¿ë ¿¹ ) 		$str_str = page_nav_edu($re_page,$total,$scale,$p_num,$page,$query);                                                          ###
###################################################################################
function page_nav_edu($re_page,$total,$scale,$p_num,$page,$query){

	$total_page = ceil($total/$scale);
	if (!$page) $page = 1;
	$page_list = ceil($page/$p_num)-1;

	// ÆäÀÌÁö ž®œºÆ®ÀÇ Ã¹¹øÂ°°¡ ŸÆŽÑ °æ¿ì¿£ [1]...[prev] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_list>0) {
		$prev_page = ($page_list-1)*$p_num+1;
		$navigation .= "<a href='$re_page?page=$prev_page&$query'><img src='img/btn_prev.gif' border='0'></a> ";
	}else{
		$navigation .= "<img src='img/btn_prev.gif' border='0'> ";
	}

	// ÆäÀÌÁö žñ·Ï °¡¿îµ¥ ºÎºÐ Ãâ·Â
	$page_end=($page_list+1)*$p_num;
	if ($page_end>$total_page) $page_end=$total_page;

	for ($setpage=$page_list*$p_num+1;$setpage<=$page_end;$setpage++) {
		if ($setpage==$page) {
				$navigation .= " $setpage ";
		} else {
				$navigation .= " <a href='$re_page?page=$setpage&$query'>$setpage</a> ";
		}
	}

	// ÆäÀÌÁö žñ·Ï žÇ ³¡ÀÌ $total_page ºžŽÙ ÀÛÀ» °æ¿ì¿¡žž, [next]...[$total_page] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_end<$total_page) {
		$next_page = ($page_list+1)*$p_num+1;
		$navigation .= " <a href='$re_page?page=$next_page&$query'><img src='img/btn_next.gif' border='0'></a>";
	}else{
		$navigation .= " <img src='img/btn_next.gif' border='0'>";
	}

	return $navigation;
}


########   // °£ŽÜ ±žÇö ÆäÀÌÂ¡ //ÆíÁý....... Function #################################################
### »ç¿ë ¿¹ ) 		$str_str = page_nav($re_page,$total,$scale,$p_num,$page,$query);                                                          ###
###################################################################################
function page_nav_admin($re_page,$total,$scale,$p_num,$page,$query){

	$total_page = ceil($total/$scale);
	if (!$page) $page = 1;
	$page_list = ceil($page/$p_num)-1;

	// ÆäÀÌÁö ž®œºÆ®ÀÇ Ã¹¹øÂ°°¡ ŸÆŽÑ °æ¿ì¿£ [1]...[prev] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_list>0) {
		$navigation = "<a href='$re_page?page=1&$query'><font class='ver9'>[1]</font></a> ... ";
		$prev_page = ($page_list-1)*$p_num+1;
		$navigation .= "<a href='$re_page?page=$prev_page&$query'> [ÀÌÀü 10 ÆäÀÌÁö] </a> ";
	}else{
		$navigation .= " [ÀÌÀü 10 ÆäÀÌÁö] ";
	}

	// ÆäÀÌÁö žñ·Ï °¡¿îµ¥ ºÎºÐ Ãâ·Â
	$page_end=($page_list+1)*$p_num;
	if ($page_end>$total_page) $page_end=$total_page;

	for ($setpage=$page_list*$p_num+1;$setpage<=$page_end;$setpage++) {
		if ($setpage==$page) {
				$navigation .= "<font class=h3 color=018287><b>$setpage</b></font> ";
		} else {
				$navigation .= "<a href='$re_page?page=$setpage&$query'><font class=h3>$setpage</font></a> ";
		}
	}

	// ÆäÀÌÁö žñ·Ï žÇ ³¡ÀÌ $total_page ºžŽÙ ÀÛÀ» °æ¿ì¿¡žž, [next]...[$total_page] ¹öÆ°À» »ýŒºÇÑŽÙ.
	if ($page_end<$total_page) {
		$next_page = ($page_list+1)*$p_num+1;
		$navigation .= "<a href='$re_page?page=$next_page&$query'> [ŽÙÀœ 10 ÆäÀÌÁö] </a> ";
		$navigation .= "... <a href='$re_page?page=$total_page&$query'><font class='ver9'>[$total_page]</font></a>";
	}else{
		$navigation .= " [ŽÙÀœ 10 ÆäÀÌÁö] ";
	}

	return $navigation;
}


########  ÅÂ±×»èÁŠ  Function ###############################################################
### »ç¿ë ¿¹ ) 		$str_str = tag($str_str);                                                                                                                       ###
###################################################################################
////////////////////////////////////ÅÂ±×»èÁŠ
function tag_del($str) {
	$str=str_replace("<","&lt;",$str);
	$str=str_replace(">","&gt;",$str);
	return $str;
}

########   ÆÄÀÏÇüœÄ¿¡ žÂŽÂ ŸÆÀÌÄÜ °ªž®ÅÏ Function #################################################
### »ç¿ë ¿¹ ) 		$str_str = return_file_type($filename_str);                                                                                                      ###
###################################################################################
function return_file_type($filename_str){
	$extail = strtolower(substr(strrchr($filename_str, "."), 1)); //.Àž·Î ±žºÐÇØŒ­ ±âÁØÀž·Î ž¶Áöž· °Å žÕ°¡ ¿¹žŠµéžé gif      //ŒÒ¹®ÀÚ·Î ÀüÈ¯ÇØŒ­
	switch ($extail){
		case "asf" : $exstr="asf.gif"; break;
		case "bmp" : $exstr="bmp.gif"; break;
		case "chm" : $exstr="chm.gif"; break;
		case "com" : $exstr="com.gif"; break;
		case "doc" : $exstr="doc.gif"; break;
		case "exe" : $exstr="exe.gif"; break;
		case "fla" : $exstr="fla.gif"; break;
		case "gif" : $exstr="gif.gif"; break;
		case "hlp" : $exstr="hlp.gif"; break;
		case "htm" : $exstr="htm.gif"; break;
		case "html" : $exstr="htm.gif"; break;
		case "hwp" : $exstr="hwp.gif"; break;
		case "jpg" : $exstr="jpg.gif"; break;
		case "jpeg" : $exstr="jpg.gif"; break;
		case "mp3" : $exstr="mp3.gif"; break;
		case "pdf" : $exstr="pdf.gif"; break;
		case "ppt" : $exstr="ppt.gif"; break;
		case "rar" : $exstr="rar.gif"; break;
		case "swf" : $exstr="swf.gif"; break;
		case "txt" : $exstr="txt.gif"; break;
		case "wav" : $exstr="wav.gif"; break;
		case "xls" : $exstr="xls.gif"; break;
		case "zip" : $exstr="zip.gif"; break;
		default : $exstr="etc.gif";
	}
	return $exstr;
}


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
	$exfilename = $exhead.$i.".".$extail; 	//ex)21_cp001.gif ·Î ÀúÀå (21±âÀÇ cp001.gif)

	// µð·ºÅäž®žŠ °Ë»çÇÔ
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




########  File Delete Function ##############################################################
### »ç¿ë ¿¹ ) 		func_filedel($ex_full_file);                                                                                                                    ###
###################################################################################
function func_filedel($ex_full_file){
	if (file_exists($ex_full_file)){ 
		@chmod($ex_full_file,0777);
		@unlink($ex_full_file); 
	}
}


########Ÿ÷·Îµå ±ÝÁö ÆÄÀÏÇüœÄ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) file_up_no($msg);                             ###
###################################################################################
function file_up_no($full_file_name){
	$extail = strtolower(substr(strrchr($full_file_name, "."), 1)); //.Àž·Î ±žºÐÇØŒ­ ±âÁØÀž·Î ž¶Áöž· °Å žÕ°¡ ¿¹žŠµéžé gif      //ŒÒ¹®ÀÚ·Î ÀüÈ¯ÇØŒ­
	if (eregi($extail, "html|php3|shtml|php|phtml|js|htm|inc|asp|aspx|cgi|pl|php3|jsp|class|jar")) {
		$msg="Ÿ÷·Îµå°¡ Çã¿ëµÇÁö ŸÊÀº È­ÀÏÇüœÄÀÔŽÏŽÙ.";msgerror($msg,1); 
	}
}


######## File upload format check Function ######################################################
### »ç¿ë ¿¹ ) 		$file_size_check = func_fileup_format_check($exname);                                                                           ###
###################################################################################
function func_fileup_format_check($exname){
	######ÆÄÀÏ Æ÷žË ÁŠÇÑ......
	$extail = strtolower(substr(strrchr($exname, "."), 1)); //.Àž·Î ±žºÐÇØŒ­ ±âÁØÀž·Î ž¶Áöž· °Å žÕ°¡ ¿¹žŠµéžé gif//ŒÒ¹®ÀÚ·Î ÀüÈ¯[strtolower()]ÇØŒ­
	if (!eregi($extail, "gif|jpeg|bmp|jpg")) {
		$msg = "¿À·ù: [$exname] ±×ž²Æ÷žäÀÌ ŸÆŽÕŽÏŽÙ. È®ÀåÀÚ gif,jpg,jpeg,bmpžž Ÿ÷·Îµå µËŽÏŽÙ."; msgerror($msg,1);
		exit;
	}
}

#######	###Å×ÀÌºíÀÇ ÃÖŽë°ª+1À» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = fnc_max_no2("p_no","talk_data");                                                                                                       ###
###################################################################################
function fnc_max_no2($pild,$tbl){
	$result=mysql_query("select max($pild)+1 from $tbl");
	$row=mysql_fetch_row($result);
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}

########    Å×ÀÌºí¿¡ Ä«¿îÅÍ Áõ°¡  Function ######################################################
### »ç¿ë ¿¹ ) 		$str_str = fnc_upcount($tbl,$kkey);                                                                                                      ###
###################################################################################
function fnc_upcount($tbl,$kkey){
	$result1=mysql_query("update $tbl set b_count=b_count+1 where b_no=$kkey");
}

#######	###Å×ÀÌºíÀÇ ÃÖŽë°ª+1À» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = fnc_max_no("talk_data");                                                                                                       ###
###################################################################################
function fnc_max_no($tbl){
	$result=mysql_query("select max(b_no)+1 from $tbl");
	$row=mysql_fetch_row($result);
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}

#######	###Å×ÀÌºíÀÇ ÃÖŽë°ª+1À» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = get_max_mode($board_name,$field,$mode);                                                                                   ###
###################################################################################
function get_max_mode($board_name,$field,$mode){
	$row=mysql_fetch_array(mysql_query("select max($field) $mode  from $board_name "));
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}


#######	###Å×ÀÌºíÀÇ µðœºÇÃ·¹ÀÌ ÃÖŽë°ªÀ» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = fnc_max_display("talk_data");                                                                                                       ###
###################################################################################
function fnc_max_display($tbl){
	$result=mysql_query("select max(display_no) from $tbl");
	$row=mysql_fetch_row($result);
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}

#######	###Å×ÀÌºíÀÇ ÃÖŽë°ª+1À» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = fnc_max_no_m();                                                                                                       ###
###################################################################################
function fnc_max_no_m(){
	$result=mysql_query("select max(b_no)+1 from mb_data ");
	$row=mysql_fetch_row($result);
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}

########ÇöÀç °øµ¿±žžÅ ÁøÇà»óÅÂ ž®ÅÏ ÇÔŒö#################################################################
### »ç¿ë ¿¹ ) $str = gonggu_str($g_now);                             ###
###################################################################################
function gonggu_str($g_now){
	switch ($g_now){
		case "yes" : $exstr="ÁøÇàÁß"; break;
		case "no" : $exstr="ÁŸ·á"; break;
	}
	return $exstr;
}




#######	###°ÔœÃÆÇ ÄÁÆ®·ÑÅ×ÀÌºí¿¡Œ­ À§Ä¡ Ç¥œÃ ž®ÅÏ ÇÔŒö..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = get_cata_url($query, $return, $url);                                                                                              ###
###################################################################################
function get_cata_url($query,$returnn,$url){
	$row=mysql_fetch_array(mysql_query($query));
	return "<a href='".$url."'>".$row[$returnn]."</a>";
}

#######	###°ÔœÃÆÇ ÄÁÆ®·ÑÅ×ÀÌºí¿¡Œ­ À§Ä¡ Ç¥œÃ ž®ÅÏ ÇÔŒö..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = get_cata($query, $return);                                                                                              ###
###################################################################################
function get_cata($query,$returnn){
	$row_cata=mysql_fetch_array(mysql_query($query));
	return $row_cata[$returnn];
}

#######	###À§Ä¡ ¹øÈ£ ž®ÅÏ ÇÔŒö..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = re_cat_no($no);                                                                                              ###
###################################################################################
function re_cat_no($no){
	$row=mysql_fetch_array(mysql_query("select p_cat_no from book_cat where cat_no='$no' "));
	return $row[0];
}


#######	###ŽºÀÌ¹ÌÁö ž®ÅÏ ÇÔŒö..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = get_new_img($year,$mon,$day,$img_src,$check_day);                                                          ###
###################################################################################
function get_new_img($year,$mon,$day,$img_src,$check_day){
	$diff=abs(mktime(0,0,0,$mon,$day,$year)-mktime(0,0,0,date("m"),date("d"),date("Y")))/(86400);
	return $new_img = ($diff < $check_day)?"<img src='$img_src' border='0' align='absmiddle'>":"";
}



#######	### ³¯Â¥³ª ¿ù ±×ž®°í Ä«¿îÆ®µÇŽÂ°ÍÀÇ option ž®ÅÏÇÔŒö <select>.ŽÙÀœ¿¡ È£Ãâ...... Function #################
### »ç¿ë ¿¹ ) 		$str = count_option($start,$end,$len,$select_no);                                                         ###
###################################################################################
function count_option($start,$endd,$len,$select_no){
	$str = "";
	for ($start;$start<=$endd;$start++){
		if (strlen($start) < $len) { $start="0".$start; }
		$SEL = ($start==$select_no)?"selected":"";
		$str .="<option value='$start' $SEL>$start</option>";
	}
	return $str;
}


#######	###Œ¿·ºÆ® ¹Úœº·Î Ãâ·ÂÇÏŽÂ  ÇÔŒö.... Function #######################################
### »ç¿ë ¿¹ ) 		$name_data_total = get_select_box($query,$oname,$ovalue,$odata,$oselected);                     ###
###################################################################################
function get_select_box($query,$oname,$ovalue,$odata,$oselected,$gibon){
	$get_select_temp=mysql_query($query);
	$str = "<select name='$oname'>";
	if ($gibon!=''){ $str .="<option value=''>$gibon</option>"; }
	while ($get_select_data=mysql_fetch_array($get_select_temp)){
		$SEL = ($get_select_data[$ovalue]==$oselected)?"selected":"";
		$str .="<option value='$get_select_data[$ovalue]' $SEL>$get_select_data[$odata]</option>";
	}
	$str .= "</select>";
	return $str;
}


#######	###³×ÀÓ Ä«Å×·Îž® Œ¿·ºÆ® ¹Úœº·Î Ãâ·ÂÇÏŽÂ  ÇÔŒö.... Function #######################################
### »ç¿ë ¿¹ ) 		$name_data_total = get_select_category($query,$selected_no,$select_name,$value_field,$ovalue_field);                ###
###################################################################################
function get_select_category($query,$selected_no,$select_name,$value_field,$ovalue_field){
	$temp=mysql_query($query);
	$str = "<select name='$select_name'>";
	while ($data=mysql_fetch_array($temp)){
		$SEL = ($data[$value_field]==$selected_no)?"selected":"";
		$str .="<option value='$data[$value_field]' $SEL>$data[$ovalue_field]</option>";
	}
	$str .= "</select>";
	return $str;
}

#######	###°ÔœÃÆÇÀÇ Œ³Á€Á€ºž ž®ÅÏÇÏŽÂ ÇÔŒö.... Function ################################################
### »ç¿ë ¿¹ ) 		$info_board = get_set_board($pds_no);                                                                                                       ###
###################################################################################
function get_set_board($p_no){
	return mysql_fetch_array(mysql_query("select * from pds_name where p_no='$p_no' "));
}

#######	###°ÔœÃÆÇÀÇ Œ³Á€Á€ºž ž®ÅÏÇÏŽÂ ÇÔŒö.... Function ################################################
### »ç¿ë ¿¹ ) 		$info_board = get_set_cody_board($pds_no);                                                                                                       ###
###################################################################################
function get_set_cody_board($p_no){
	return mysql_fetch_array(mysql_query("select * from cody_name where p_no='$p_no' "));
}

#######	###mysqlÀÇ ¿¡·¯ °ËÃâÇÔŒö.. Function ################################################
### »ç¿ë ¿¹ ) 		error_mysql($result99);                                                                                                       ###
###################################################################################
function error_mysql($result99){
	if (!$result99){
		$errNO  = mysql_errno();
		$errMSG = mysql_error();
		echo("¿¡·¯ÄÚµå $errNO : $errMSG<br>");
		exit;
	}
}

#######	###Å×ÀÌºíÀÇ ÃÖŽë°ª+1À» ±žÇØŒ­ Å°°ªÀž·Î »ç¿ë..... Function #######################################
### »ç¿ë ¿¹ ) 		$str_str = MAX_NO("talk_data","p_no");                                                                                                       ###
###################################################################################
function MAX_NO($tbl,$field){
	$result=mysql_query("select max($field)+1 from $tbl");
	$row=mysql_fetch_row($result);
	if ($row[0] == ""){ $row[0] = 1;}
	return $row[0];
}

#######	###°ÔœÃÆÇÀÇ Œ³Á€Á€ºž ž®ÅÏÇÏŽÂ ÇÔŒö.... Function ################################################
### »ç¿ë ¿¹ ) 		$info_board = GET_BOARD_SETING($tbl,$field,$value);                                                                                   ###
######################################################################################
function GET_BOARD_SETING($tbl,$field,$value){
	return mysql_fetch_array(mysql_query("select * from $tbl where $field='$value' "));
}

#######	###ÃÑŒöÀ» ž®ÅÏÇÏŽÂ ÇÔŒö.... Function ###################################################
### »ç¿ë ¿¹ ) 		$total = get_num_row($query);                                                                                                         ###
###################################################################################
function GET_num_row($query){
	return mysql_num_rows(mysql_query($query));
}

#######	### mysql_fetch_array ž®ÅÏ ÇÔŒö..... Function #############3#######################################
### »ç¿ë ¿¹ ) 		$str_str = get_fetch_array($query);                                                                                              ###
###################################################################################
function GET_fetch_array($query){
	return mysql_fetch_array(mysql_query($query));
}

# ŽÞ·Â¿¡ Ÿ²ÀÌŽÂ ÇÔŒö......
###################################################################################
function Month_Day($i_month,$i_year){
	$day=1;
	while(checkdate($i_month,$day,$i_year)){
		$day++;
	}
	$day--;
	return $day;
}	

#######	### ÀÌ¹ÌÁö »çÀÌÁî ž®ÅÏ ÇÔŒö..... Function #############3#######################################
### »ç¿ë ¿¹ ) 		$str_str = get_fetch_array($query);                                                                                              ###
###################################################################################
function GetImgSize($full_url,$exww,$exhh){
$imagehw = @GetImageSize($full_url);
$imagewidth = $imagehw[0];
$imageheight = $imagehw[1];

	if($imagehw){
		$ixy = round($imagewidth / $imageheight);
		if($ixy<=1){###ŒŒ·Î°¡ ±æžé
			$exh=$exhh;
			$exw=round(($imagewidth * $exh)/$imageheight);
			if ($exw>$exww){$exw=$exww;}
		}else{##°¡·Î°¡ ±æžé
			$exw=$exww;
			$exh=round(($imageheight * $exw)/$imagewidth);
			if ($exh>$exhh){$exh=$exhh;}
		}
	}else{
		$exh=$exhh;
		$exw=$exww;
	}
	
	$reGetImgSize["h"]=$exh;
	$reGetImgSize["w"]=$exw;
	return $reGetImgSize;
}



?>
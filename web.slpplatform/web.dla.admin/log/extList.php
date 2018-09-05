<?
session_start();

if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
	echo "<meta http-equiv='refresh' content='0;url=/'>";
	exit;
}
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
                //require_once($_SERVER['DOCUMENT_ROOT']."/inc/lib.php");


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
		return "0000";
        if(jsonStr($json."\"}") == "null")
            return $json;
        else 
            return jsonStr($json."\"}");

    }else{
        return jsonStr($json);
		//return "1111";
    }
}   

function jsonStr($str){
    return json_encode(json_decode($str), JSON_PRETTY_PRINT);
}


function requestHttp($token){
	$url = "http://apidev.doralab.co.kr/nde/open/dec";
	$data = array('token' => $token);

	$options = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($data)
		)
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);
	if ($result === FALSE) { /* Handle error */ 
		return "Error";
	}
	//return var_dump($result);
	return $result;
}

                
                if(isset($_GET['page'])) {
                    $page = $_GET['page'];
                    if(!is_numeric($page)){
                        $page = 1;
                    }
                } else {
                    $page = 1;
				}
                $wherequery = null;
                if(isset($_GET["sv"])) {
                    switch ($_GET["st"]) {
                        case "API_PATH" : $wherequery = " and API_PATH like \"%".$_GET["sv"]."%\"";; break;
                        //case "ACCOUNT_ID" : $wherequery = " and a.ACCOUNT_ID=".$_GET["sv"].""; break;
                        //case "PROFILE_Name" : $wherequery = " and p.Name=\"".$_GET["sv"]."\"";; break;
                        //case "PROFILE_ID" : $wherequery = " and p.PROFILE_ID=".$_GET["sv"].""; break;
                        default : $wherequery = ""; break;
                    }                    
                }

                //echo "<br/>".$wherequery;
				$sql = 'select count(IDX) as cnt
					from slp_kw_action_log_db.check_log_tb  
					where 1=1 '.$wherequery;
                //echo "<br/>".$sql;
				$result = $db->query($sql);
				$row = $result->fetch_assoc();
				$allPost = $row['cnt'];
                $allPage=0;
				$paging = '';
				if($allPost > 0){
					$onePage = 15;
					$allPage = ceil($allPost / $onePage);
					if($page < 1 || ($allPage && $page > $allPage)) {
						?>
						<script>
									alert("존재하지 않는 페이지입니다. <?=$page ?>");
									history.back();
						</script>
						<?php
						exit;
					}

					$oneSection = 10;
					$currentSection = ceil($page / $oneSection);
					$allSection = ceil($allPage / $oneSection);
					$firstPage = ($currentSection * $oneSection) - ($oneSection - 1);
					if($currentSection == $allSection) {
						$lastPage = $allPage;
					} else {
						$lastPage = $currentSection * $oneSection;
					}
					$prevPage = (($currentSection - 1) * $oneSection);
					$nextPage = (($currentSection + 1) * $oneSection) - ($oneSection - 1);
					if($page != 1) {
						$paging .= '
						<li><a href="javascript:GetReport(1);"><<</a></li>';
					}

					if($currentSection != 1) {
						$paging .= '
						<li><a href="javascript:GetReport(' . $prevPage . ');"><</a></li>';
					}

					for($i = $firstPage; $i <= $lastPage; $i++) {
						if($i == $page) {
							$paging .= '
							<li><a href="javascript:;"><b>' . $i . '</b></a></li>';
						} else {
							$paging .= '
							<li><a href="javascript:GetReport(' . $i . ');">' . $i . '</a></li>';
						}
					}
					if($currentSection != $allSection) {
						$paging .= '
						<li><a href="javascript:GetReport(' . $nextPage . ')">></a></li>';
					}
					if($page != $allPage) {
						$paging .= '
						<li><a href="javascript:GetReport(' . $allPage . ')">>></a></li>';
					}
					$currentLimit = ($onePage * $page) - $onePage;
					$sqlLimit = ' limit ' . $currentLimit . ', ' . $onePage;


					$sql = 'select IDX, API_PATH, HEADERS, BODY, RESULT, REG_DATETIME 
							from slp_kw_action_log_db.check_log_tb h 
							where 1=1 '. $wherequery.'
							order by IDX desc ' . $sqlLimit;

					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    EBSLang Log List &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ]
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                                <th><i class="icon_profile"></i> IDX</th>
                                <th><i class="icon_mail_alt"></i> API_PATH / HEADERS</th>
                                <th><i class="icon_pin_alt"></i> BODY</th>
								<th><i class="icon_pin_alt"></i> RESULT</th>
                                <th><i class="icon_cogs"></i> REG_DATETIME</th>
                            </tr>
                            <?
                            if($allPost <= 0)
                            {
                                ?>
                                <tr><td align="center" height="300" colspan="7">조회내역이 없습니다.</td></tr>
                                <?
                            }else{
                            while($row = $result->fetch_assoc())
                            {
                            ?>
                            <tr>
                                <td><?=$row['IDX']?></td>
                                <td width="900px">
									<?=$row['API_PATH']?>
									<pre style='width:500px;font-size:11px;float:left;'><?=pretty_json($row['HEADERS']) ?></pre>
									<?
									$obj = json_decode($row['HEADERS']);
									if(isset($obj->{'x-transfer-token'})){ 
										//echo "<pre style='width:900px;font-size:11px;'>".pretty_json(substr(requestHttp($obj->{'x-transfer-token'}),0,-4))."</pre>";
										//echo substr(requestHttp($obj->{'x-transfer-token'}),0,-4);
										//echo requestHttp($obj->{'x-transfer-token'});
										echo "<pre style='width:330px;font-size:11px;float:left;'>".pretty_json(requestHttp($obj->{'x-transfer-token'}))."</pre>";
									}
									?>
								</td>
                                <td>
									<pre style='width:400px;font-size:11px;'><?=pretty_json($row['BODY']) ?></pre>
								</td>
                                <td><?=$row['RESULT']?></td>
                                <td><?=$row['REG_DATETIME']?></td>
                            </tr>
                            <?
							}
                        }
                            ?>
                        </tbody>
                    </table>
                </section>

                <!--pagination start-->
                <section class="panel">
                    <div class="panel-body">
                        <div class="text-center">
                            <ul class="pagination">
                                <?=$paging ?>
                            </ul>
                        </div>
                    </div>
                </section>
                <!--pagination end-->
                </div>
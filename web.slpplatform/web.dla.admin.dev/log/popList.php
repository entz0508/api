<?
//session_start();
//
//if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
//	echo "<meta http-equiv='refresh' content='0;url=/'>";
//	exit;
//}
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
                    $seqID = $_GET['sv'];
					/*
					switch ($_GET["st"]) {
                        case "EMAIL" : $wherequery = " and a.EMAIL=\"".$_GET["sv"]."\"";; break;
                        case "ACCOUNT_ID" : $wherequery = " and a.ACCOUNT_ID=".$_GET["sv"].""; break;
                        case "PROFILE_Name" : $wherequery = " and p.Name=\"".$_GET["sv"]."\"";; break;
                        case "PROFILE_ID" : $wherequery = " and p.PROFILE_ID=".$_GET["sv"].""; break;
                        default : $wherequery = ""; break;
                    } 
					*/
                    //$wherequery = " and ".$_GET["st"]."=\"".$_GET["sv"]."\"";
                }else{
					$seqID = 686;
				}

				/*
				$sql = 'select count(IDX) as cnt
					from slp_kw_action_log_db.check_log_tb  
					where 1=1'.$wherequery;
					

				if(isset($_GET['seqID'])) {
					$seqID = $_GET['seqID'];
				} else {
					$seqID = 612;
				}
				*/

				$sql = "SELECT count(*) as cnt, it.step_attend_id  as stepAttendID, BUY_IP as buyIP, ac.enc_user_id as encUserID
					FROM slp_nde_db.buy_info_tb it
					left join slp_account_db.nde_account_tb ac on it.account_id = ac.account_id
					left join slp_nde_db.nde_episode_perm_tb et on it.SEQ_ID = et.seq_id 
					left join slp_nde_info_db.ex_product_tb ept on it.PDT_ID = ept.PRODUCT_ID and et.UNIT_ID = ept.UNIT_ID
					where it.SEQ_ID = $seqID and it.STEP_ATTEND_ID is not null and it.EXPIRED = 'N' ".$wherequery;

				$result = $db->query($sql);
				$row = $result->fetch_assoc();
				$allPost = $row['cnt'];
				$stepAttendID = $row['stepAttendID'];
				$buyIP = $row['buyIP'];
				$encUserID = $row['encUserID'];

                $allPage=0;
				$paging = '';
				if($allPost > 0){
					$onePage = 15;
					$allPage = ceil($allPost / $onePage);
					if($page < 1 || ($allPage && $page > $allPage)) {
						?>
						<script>
									alert("Ï°¥Ïû¨?òÏ? ?äÎäî ?òÏù¥ÏßÄ?ÖÎãà?? <?=$page ?>");
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

					/*
					$sql = 'select IDX, API_PATH, HEADERS, BODY, RESULT, REG_DATETIME 
							from slp_kw_action_log_db.check_log_tb h 
							where 1=1 '. $wherequery.'
							order by IDX desc ' . $sqlLimit;
							*/
					$sql = "SELECT it.ACCOUNT_ID, ac.enc_user_id, it.BUY_IP, it.SEQ_ID, it.PDT_ID, it.STEP_ATTEND_ID, it.BUY_ID, pt.name, EX_PRODUCT_ID,
								et.UNIT_ID, ept.EBS_PDT_ID, ept.LESSON_TMPL_ID , ept.LESSON_TITLE
							FROM slp_nde_db.buy_info_tb it
							left join slp_account_db.nde_account_tb ac on it.account_id = ac.account_id
							left join slp_account_db.profile_tb pt on it.account_id = pt.ACCOUNT_ID and pt.HIDDEN = 'n'
							left join slp_nde_db.nde_episode_perm_tb et on it.SEQ_ID = et.seq_id 
							left join slp_nde_info_db.ex_product_tb ept on it.PDT_ID = ept.PRODUCT_ID and et.UNIT_ID = ept.UNIT_ID
							where it.SEQ_ID = $seqID and it.STEP_ATTEND_ID is not null and it.EXPIRED = 'N' 
							ORDER BY it.REG_DATETIME DESC " . $sqlLimit;
					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    EBSLang Log List &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ] <a href="javascript:GetEBSReport('<?=$stepAttendID ?>','<?=$encUserID ?>','<?=$buyIP ?>');">[Î¶¨Ìè¨??Î≥¥Í∏∞]</a>
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
								<th><i class="icon_profile"></i> SEQ_ID</th>
                                <th><i class="icon_profile"></i> UNIT_ID</th>
								<th><i class="icon_pin_alt"></i> STEP_ATTEND_ID</th>
								<th><i class="icon_pin_alt"></i> BUY_ID</th>
                                <th><i class="icon_pin_alt"></i> EBS_PDT_ID</th>
								<th><i class="icon_pin_alt"></i> LESSON_TMPL_ID</th>
                                <th><i class="icon_cogs"></i> LESSON_TITLE</th>
                            </tr>
                            <?
                            if($allPost <= 0)
                            {
                                ?>
                                <tr><td align="center" height="300" colspan="7">Ï°∞Ìöå?¥Ïó≠???ÜÏäµ?àÎã§.</td></tr>
                                <?
                            }else{
                            while($row = $result->fetch_assoc())
                            {
                            ?>
                            <tr>
                                <td><?=$row['SEQ_ID']?></td>
								<td><?=$row['UNIT_ID']?></td>
                                <td><?=$row['STEP_ATTEND_ID']?></td>
								<td><?=$row['BUY_ID']?></td>
								<td><?=$row['EBS_PDT_ID']?></td>
                                <td><?=$row['LESSON_TMPL_ID']?></td>
                                <td><?=$row['LESSON_TITLE']?>
								<a href="javascript:Getplay('<?=$row['STEP_ATTEND_ID']?>','<?=$row['LESSON_TMPL_ID']?>','<?=$row['EBS_PDT_ID']?>','<?=$row['enc_user_id']?>','<?=$row['BUY_IP']?>');">[?ôÏäµ?òÍ∏∞]</a>
								</td>
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
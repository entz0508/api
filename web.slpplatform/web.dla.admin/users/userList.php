<?
session_start();
if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
	echo "<meta http-equiv='refresh' content='0;url=/'>";
	exit;
}
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/lib.php");
                
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
                        case "EMAIL" : $wherequery = " and a.EMAIL=\"".$_GET["sv"]."\"";; break;
                        case "ACCOUNT_ID" : $wherequery = " and a.ACCOUNT_ID=".$_GET["sv"].""; break;
                        case "PROFILE_Name" : $wherequery = " and p.Name=\"".$_GET["sv"]."\"";; break;
                        case "PROFILE_ID" : $wherequery = " and p.PROFILE_ID=".$_GET["sv"].""; break;
                        default : $wherequery = ""; break;
                    }                    
                    //$wherequery = " and ".$_GET["st"]."=\"".$_GET["sv"]."\"";
                }

                //echo "<br/>".$wherequery;
				$sql = 'select count(a.ACCOUNT_ID) as cnt
							from slp_account_db.account_tb a
							left join profile_tb p on a.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" where 1=1'.$wherequery;
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

					$sql = 'select a.ACCOUNT_ID, a.EMAIL, a.COUNTRY, a.SIGNUP_PATH, a.APP_ID, a.REG_DATETIME, a.BLOCK, a.DELETED, p.PROFILE_ID, p.Name, p.BIRTHDAY
                                from slp_account_db.account_tb a
                                left join profile_tb p on a.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" where 1=1 '. $wherequery.'
                                order by a.REG_DATETIME desc ' . $sqlLimit;
                    //echo "<br/>".$sql;
					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    Account List &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ]
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                                <th><i class="icon_profile"></i> Account_ID</th>
                                <th><i class="icon_mail_alt"></i> 이메일</th>
                                <th><i class="icon_pin_alt"></i> 국가</th>
                                <th><i class="icon_cogs"></i> App</th>
                                <th><i class="icon_mobile"></i> 자녀ID</th>
                                <th><i class="icon_profile"></i> 자녀이름</th>
                                <th><i class="icon_calendar"></i> 가입일</th>
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
                            <tr onclick="javascript:GetUserReport('<?=$row['ACCOUNT_ID']?>','<?=$page?>')">
                                <td><?=$row['ACCOUNT_ID']?></td>
                                <td><?=$row['EMAIL']?></td>
                                <td><img src="/img/flags32/<?=strtolower($row['COUNTRY'])?>.png" style="height:18px; margin-top:-2px;"> <?=$row['COUNTRY']?></td>
                                <td><?=appName($row['APP_ID'])?></td>
                                <td><?=$row['PROFILE_ID']?></td>
                                <td><?=$row['Name']?></td>
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
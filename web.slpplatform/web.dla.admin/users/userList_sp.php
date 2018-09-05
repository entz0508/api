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
				$sql = 'select count(*) as cnt
                                            from slp_account_db.account_tb a
                                            left join (
                                                select account_id,app_id from slp_common_db.buy_history_tb where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                                                union all
                                                select account_id,app_id from slp_common_db.buy_history_tb_old where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                                                union all
                                                select account_id,app_id from slp_dla_db.buy_history_tb where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                         ) b on a.account_id = b.account_id
                                            where b.account_id is not null;';
				$result = $db->query($sql);
				$row = $result->fetch_assoc();
				$allPost = $row['cnt'];

				$paging = '';
				if($allPost > 0){
					$onePage = 15;
					$allPage = ceil($allPost / $onePage);
				
					if($page < 1 || ($allPage && $page > $allPage)) {
						?>
						<script>
									alert("존재하지 않는 페이지입니다.");
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

					$sql = 'select a.ACCOUNT_ID as ACCOUNT_ID,EMAIL,STAR_POINT,COUNTRY,SIGNUP_PATH,a.APP_ID,BLOCK,DELETED,REG_DATETIME,b.app_id as buy_app_id,b.reg_date as buy_date
                                                    from slp_account_db.account_tb a
                                                    left join (
                                                        select account_id,app_id,reg_date from slp_common_db.buy_history_tb where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                                                        union all
                                                        select account_id,app_id,reg_date from slp_common_db.buy_history_tb_old where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                                                        union all
                                                        select account_id,app_id,reg_date from slp_dla_db.buy_history_tb where reg_date > DATE_SUB(now(), INTERVAL 15 day) and pay_method = "CASH"
                              ) b on a.account_id = b.account_id
                                                    where b.account_id is not null
                                                    order by a.REG_DATETIME DESC ' . $sqlLimit;
					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    Account List - 마켓 결제회원, 최근 15일 &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ]
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                                <th><i class="icon_profile"></i> Account_ID</th>
                                <th><i class="icon_mail_alt"></i> 이메일</th>
                                <th><i class="icon_pin_alt"></i> 국가</th>
                                <th><i class="icon_cogs"></i> App</th>
                                <th><i class="icon_calendar"></i> 가입일</th>
                                <th><i class="icon_cogs"></i>구매 App</th>
                                <th><i class="icon_calendar"></i> 구매일</th>
                            </tr>
                            <?
                            while($row = $result->fetch_assoc())
                            {
                            ?>
                            <tr onclick="javascript:GetUserReport('<?=$row['ACCOUNT_ID']?>','<?=$page?>')">
                                <td><?=$row['ACCOUNT_ID']?></td>
                                <td><?=$row['EMAIL']?></td>
                                <td><img src="/img/flags32/<?=strtolower($row['COUNTRY'])?>.png" style="height:18px; margin-top:-2px;"> <?=$row['COUNTRY']?></td>
                                <td><?=appName($row['APP_ID'])?></td>
                                <td><?=$row['REG_DATETIME']?></td>
                                <td><?=appName($row['buy_app_id'])?></td>
                                <td><?=$row['buy_date']?></td>
                            </tr>
                            <?
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
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
					from slp_nde_db.buy_history_tb h
					left join slp_account_db.account_tb a on h.account_id = a.account_id
					left join slp_account_db.nde_account_tb n on h.account_id = n.account_id
					left join slp_account_db.profile_tb p on h.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" where 1=1'.$wherequery;
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


					$sql = 'select h.seq_id,h.product_id,h.os,date(i.BEGIN_DATETIME) as BEGIN_DATETIME,date(i.END_DATETIME) as END_DATETIME,h.reg_date
								,h.account_id,a.email,a.reg_datetime as joindate, trim(n.ENC_USER_ID) as ENC_USER_ID, p.profile_id, p.name
								,h.pay_method,h.price,h.receipt,h.refund_date,h.goods_type,h.goods,h.period_type,i.EXPIRED,i.EXPIRED_DATE
								,i.STEP_ATTEND_ID,i.BUY_ID,i.BUY_IP,i.REFUND_STATUS_CODE,i.ATTEND_STAT_CD
							from slp_nde_db.buy_history_tb h 
							left join slp_nde_db.buy_info_tb i on h.seq_id = i.seq_id
							left join slp_account_db.account_tb a on h.account_id = a.account_id
							left join slp_account_db.nde_account_tb n on h.account_id = n.account_id
							left join slp_account_db.profile_tb p on h.account_id = p.account_id and p.HIDDEN = "n" 
							where 1=1 '. $wherequery.'
							order by h.seq desc ' . $sqlLimit;

					//print $sql;
					// $sql = 'select a.ACCOUNT_ID, a.EMAIL, a.COUNTRY, a.SIGNUP_PATH, a.APP_ID, a.REG_DATETIME, a.BLOCK, a.DELETED, p.PROFILE_ID, p.Name, p.BIRTHDAY
                    //             from slp_account_db.account_tb a
                    //             left join profile_tb p on a.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" 
					// 			where 1=1 '. $wherequery.'
                    //             order by a.REG_DATETIME desc ' . $sqlLimit;
                    //echo "<br/>".$sql;
					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    EBSLang 구매 List &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ]
                    </header>



                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                                <th><i class="icon_profile"></i> seq_id</th>
								<th><i class="icon_profile"></i> STEP_ATTEND_ID<br/>BUY_ID</th>
                                <th><i class="icon_mail_alt"></i> product_id<br/>os</th>
								<th><i class="icon_pin_alt"></i> 구매금액</th>
                                <th><i class="icon_mobile"></i> 구매일<br/>학습일</th>
								<th><i class="icon_mobile"></i> 학습상태<br/>취소상태</th>
                                <th><i class="icon_profile"></i> Account ID<br/>Profile ID(NAME)</th>
                                <th><i class="icon_calendar"></i> EMAIL<br/>ENC_USER_ID</th>
								<th><i class="icon_calendar"></i> 구매IP<br/>Receipt</th>
								<th><i class="icon_cogs"></i> 구매취소<br/>취소일</th>
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
                                <td>
									<?=$row['seq_id']?>
									<a class="btn btn-warning" data-toggle="modal" href="#myModal2" style="height:20px;font-size:6pt;padding-top:2px;" onclick="refundAlert('<?=$row['seq_id']?>','<?=$row['BUY_ID']?>');">痍⑥냼</a>
								</td>
								<td><? if($row['EXPIRED'] == 'Y')echo "<strike>"; ?> <?=$row['STEP_ATTEND_ID']?><br/><?=$row['BUY_ID']?></td>
                                <td><?=$row['product_id']?><br/><?=$row['os']?></td>
								<td style="width:100px;text-align:right;"><?=number_format($row['price'])?></td>
                                <td>
									<?=$row['reg_date']?><br/>
									<? 
									if($row['BEGIN_DATETIME'] == null && $row['END_DATETIME'] == null) echo "학습일 미지정";
									else echo $row['BEGIN_DATETIME']. " ~ ".$row['END_DATETIME']; 
									?>
								</td>
								<td><?=ebsStatus($row['ATTEND_STAT_CD'])?><br/><?=$row['REFUND_STATUS_CODE']?></td>
                                <td><?=$row['account_id']?><br/><?=$row['profile_id']?> (<?=$row['name']?>)</td>
                                <td><?=$row['email']?><br/><font size='2'><?=func_str_cut(55, $row['ENC_USER_ID']) ?></font></td>
								<td><?=$row['BUY_IP']?><pre style='width:500px;'><?=pretty_json($row['receipt']) ?></pre></td>
								<td>
									<?
									if($row['EXPIRED'] == "Y") echo "구매취소<br/>(취소일자 : ".$row['EXPIRED_DATE'].")";
									?>
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
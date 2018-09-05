<?
/*
session_start();
if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
	echo "<meta http-equiv='refresh' content='0;url=/'>";
	exit;
}
*/
				require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/lib.php");
                
				/*
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
                }

				$sql = 'select count(a.ACCOUNT_ID) as cnt
							from slp_account_db.account_tb a
							left join profile_tb p on a.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" where 1=1'.$wherequery;
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
                                left join profile_tb p on a.Account_ID = p.ACCOUNT_ID and p.HIDDEN = "n" 
								where 1=1 '. $wherequery.'
                                order by a.REG_DATETIME desc ' . $sqlLimit;
					$result = $db->query($sql);
				}
				*/
				$sql = 'select ACCOUNT_ID,SIGNUP_ID,EMAIL,USERNAME,SIGNUP_PATH,PROFILE_IMAGE,DELETED,REG_DATETIME from account_tb order by ACCOUNT_ID desc;';
				$result = $db->query($sql);
				?>

                                    <table id="datatable-buttons" class="table table-striped table-bordered">
                                        <thead>
                                            <tr>
                                                <th>ACCOUNT_ID</th>
                                                <th>SIGNUP_ID</th>
                                                <th>EMAIL</th>
                                                <th>USERNAME</th>
                                                <th>SIGNUP_PATH</th>
                                                <th>PROFILE_IMAGE</th>
												<th>DELETED</th>
												<th>REG_DATETIME</th>
                                            </tr>
                                        </thead>
                                        <tbody>
										<?
										while($row = $result->fetch_assoc())
										{
											?>
                                            <tr>
                                                <td><?=$row['ACCOUNT_ID']?></td>
                                                <td><?=$row['SIGNUP_ID']?></td>
                                                <td><?=$row['EMAIL']?></td>
                                                <td><?=$row['USERNAME']?></td>
                                                <td><?=$row['SIGNUP_PATH']?></td>
                                                <td><?=$row['PROFILE_IMAGE']?></td>
												<td><?=$row['DELETED']?></td>
												<td><?=$row['REG_DATETIME']?></td>
                                            </tr>
											<?
										}
										?>
                                        </tbody>
                                    </table>
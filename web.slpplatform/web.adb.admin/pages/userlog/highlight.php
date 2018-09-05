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
                        case "SIGNUP_ID" : $wherequery = " and act.SIGNUP_ID like \"%".$_GET["sv"]."%\""; break;	// 로그인이메일
						case "USERNAME" : $wherequery = " and act.USERNAME like \"%".$_GET["sv"]."%\""; break;		// 이름
						case "ACCOUNT_ID" : $wherequery = " and act.ACCOUNT_ID=".$_GET["sv"].""; break;				// 회원번호
						case "EMAIL" : $wherequery = " and act.EMAIL like \"%".$_GET["sv"]."%\""; break;			// 인증이메일
                        default : $wherequery = ""; break;
                    }
                    //$wherequery = " and ".$_GET["st"]."=\"".$_GET["sv"]."\"";
                }

                //echo "<br/>".$wherequery;
				$sql = 'select count(it.idx) as cnt
						from highlight_info_tb it
							left join account_tb act on it.ACCOUNT_ID = act.ACCOUNT_ID
							where DEL = 0 '.$wherequery;
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
						<li class="paginate_button previous"><a href="javascript:GetReport(1);">처음</a></li>';
					}

					if($currentSection != 1) {
						$paging .= '
						<li class="paginate_button previous"><a href="javascript:GetReport(' . $prevPage . ');"><</a></li>';
					}

					for($i = $firstPage; $i <= $lastPage; $i++) {
						if($i == $page) {
							$paging .= '
							<li class="paginate_button active"><a href="javascript:;"><b>' . $i . '</b></a></li>';
						} else {
							$paging .= '
							<li class="paginate_button"><a href="javascript:GetReport(' . $i . ');">' . $i . '</a></li>';
						}
					}
					if($currentSection != $allSection) {
						$paging .= '
						<li class="paginate_button next"><a href="javascript:GetReport(' . $nextPage . ')">></a></li>';
					}
					if($page != $allPage) {
						$paging .= '
						<li class="paginate_button next"><a href="javascript:GetReport(' . $allPage . ')">마지막</a></li>';
					}
					$currentLimit = ($onePage * $page) - $onePage;
					$sqlLimit = ' limit ' . $currentLimit . ', ' . $onePage;
					
					$sql = 'select it.IDX
								, it.account_id
								, act.SIGNUP_ID
								, act.USERNAME
								, act.SIGNUP_PATH
								, it.BID as bible_id
								, it.CID as chapter_id
								, it.VID as verse_ids
								, it.TITLE as TITLE
								, it.COLOR
								, LEFT(vt.`desc`,50) as `desc`
								, DATE_FORMAT(it.REG_DATETIME, "%Y-%m-%d %T") as dt
								from highlight_info_tb it
									left join verse_tb vt on it.BID = vt.bibleid and it.CID = vt.chapterid and SUBSTRING_INDEX(VID,",",1) = vt.ID 
									left join account_tb act on it.ACCOUNT_ID = act.ACCOUNT_ID
                                where DEL = 0 '. $wherequery.'
                                order by it.IDX desc ' . $sqlLimit;
                    //echo "<br/>".$sql;
					$result = $db->query($sql);
				}
				?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    Highlight List &nbsp;&nbsp;&nbsp;[ <?=$page?>/ <?=$allPage?> ]
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
								<th>idx</th> 
								<th>ACCOUNT ID</th>
								<th>SIGNUP ID</th>
								<th>이름</th> 
								<th>가입경로</th>
								<th>Bible</th> 
								<th>Chapter</th>
								<th>Verse</th> 
								<th>Title</th> 
								<th>Color</th> 
								<th>구문</th> 
								<th>로그시간</th>
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
								<td><?=$row['account_id']?></td>
								<td><?=$row['SIGNUP_ID']?></td>
								<td><?=$row['USERNAME']?></td> 
								<td><?=$row['SIGNUP_PATH']?></td>
								<td><?=$row['bible_id']?></td> 
								<td><?=$row['chapter_id']?></td>
								<td><?=$row['verse_ids']?></td> 
								<td><?=$row['TITLE']?></td> 
								<td><?=$row['COLOR']?></td> 
								<td><?=$row['desc']?></td> 
								<td><?=$row['dt']?></td>
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
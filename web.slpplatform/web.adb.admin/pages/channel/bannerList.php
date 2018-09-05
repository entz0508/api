<?
session_start();
if(!isset($_SESSION['user_login']) || !isset($_SESSION['user_name'])) {
	echo "<meta http-equiv='refresh' content='0;url=/'>";
	exit;
}
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
                require_once($_SERVER['DOCUMENT_ROOT']."/inc/lib.php");
                
				if(isset($_GET['type'])) {
					$bType = $_GET['type'];
				} else {
					$bType = 1;                 // 1:top banner, 2:bottom banner
				}

				$sql = "SELECT BANNER_ID,
							BANNER_TITLE,
							IMAGE_URL,
							BANNER_LINK,
							DATE_FORMAT(FROM_DATETIME, '%Y-%m-%d') as `FROM_DATETIME`,
							DATE_FORMAT(TO_DATETIME, '%Y-%m-%d') as `TO_DATETIME`,
							CASE WHEN (now() >= FROM_DATETIME AND now() < date_add(TO_DATETIME, INTERVAL 1 day) AND DISPLAY_TYPE = 1) THEN 1 ELSE 0 END AS LIVE,
							SORT_ID,
							DISPLAY_TYPE,
							REG_DATETIME,
							BANNER_TYPE
						FROM ADB.banner_tb
						WHERE BANNER_TYPE = $bType
						ORDER BY LIVE DESC,DISPLAY_TYPE DESC, SORT_ID ASC,REG_DATETIME DESC;";

				$result = $db->query($sql);
				?>

                <div  id="reportList" style="">
                <section class="panel">
                    <header class="panel-heading">
						Top Banner List [<?=$bType ?>]
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                                <th width="100px">배너 ID</th>
                                <th>배너 이름</th>
                                <th width="420px">BANNER IMAGE</th>
                                <th width="100px">Sort</th>
                                <th width="100px">Display</th>
                                <th width="220px">게재 기간</th>
                                <th width="120px">등록일</th>
                                <th width="150px">옵션</th>
                            </tr>
							<?
                            while($row = $result->fetch_assoc())
                            {
                            $bid = $row['BANNER_ID'];
                            ?>
                            <tr>
                                <td><?=$row['BANNER_ID']?>
                                <?
                                if($row['LIVE'] == 1) echo '<br /><i class="fa fa-eye"></i> 노출';
                                ?>
                                </td>
                                <td><?=$row['BANNER_TITLE']?></td>
                                <td>
                                    <img style="width: 250px;" src="/upfile/banner/<?=$row['IMAGE_URL']?>" alt="image" />
									<br/>
                                    <font size="2">Link : <?=$row['BANNER_LINK']?></font>
                                </td>
                                <td>
                                    <select class="form-control" onchange="modDisplay('<?=$bid?>', this.value, 0);">
                                        <?
                                        for($si=1; $si < 9; $si++){
                                        if($si == $row['SORT_ID'])
                                        echo "
                                        <option selected>".$si."</option>";
                                        else
                                        echo "
                                        <option>".$si."</option>";
                                        }
                                        ?>
                                    </select>
                                </td>
                                <td>
                                    <label>
                                        <?
                                        // modDisplay(bannerID, sortid, isDisplay)
                                        $dp = ($row['DISPLAY_TYPE'] == 1) ? "checked" : "";
                                        ?>
                                        <input type="checkbox" class="flat-red" <?=$dp ?> onclick="modDisplay('<?=$row["BANNER_ID"]?>',0,this.checked);" />
                                    </label>
                                </td>
                                <td>
                                    <?=$row['FROM_DATETIME']?> ~ <?=$row['TO_DATETIME']?>
                                </td>
                                <td>
                                    <?=$row['REG_DATETIME']?>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-default" onclick="modinfo(<?=$row['BANNER_ID']?>);">수정</button>
                                    <button type="button" class="btn btn-danger" onclick="dropbanner(<?=$row['BANNER_ID']?>,'<?=$row["IMAGE_URL"]?>');">삭제</button>
                                </td>
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

                            </ul>
                        </div>
                    </div>

				
                </section>
                <!--pagination end-->
                </div>

<!-- iCheck 1.0.1 -->
<script src="../../plugins/iCheck/icheck.min.js"></script>

<script>
  $(function () {
    //iCheck for checkbox and radio inputs
    $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
      checkboxClass: 'icheckbox_minimal-blue',
      radioClass   : 'iradio_minimal-blue'
    })
    //Red color scheme for iCheck
    $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
      checkboxClass: 'icheckbox_minimal-red',
      radioClass   : 'iradio_minimal-red'
    })
    //Flat red color scheme for iCheck
    $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
      checkboxClass: 'icheckbox_flat-green',
      radioClass   : 'iradio_flat-green'
    })
  })


</script>
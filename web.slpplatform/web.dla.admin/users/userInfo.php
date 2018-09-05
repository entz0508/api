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

                if(isset($_GET['userID'])) {
                    $userID = $_GET['userID'];
                } else {
                    $userID = 0;
            }
                //$userID = 100183888;
                if($userID > 0)
                {
                    $sql = "select a.account_id,a.EMAIL,STAR_POINT,a.COUNTRY,a.SIGNUP_PATH,APP_ID,BLOCK,DELETED,REG_DATETIME,c.country_name_kr,c.country_name
                                                    from slp_account_db.account_tb a
                                                        left join  slp_platform_db.country_tb c on a.COUNTRY = c.iso_cd
                                                    where a.account_id = $userID";
                    $result = $db->query($sql);
                    $row = $result->fetch_assoc();
                }
                ?>
              <!-- page start-->
              <div class="row">
                  <div class="col-sm-6">
                  
                      <section class="panel">
                          <header class="panel-heading">
                                                Account Info Table &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:GetUserReport(<?=$userID?>,<?=$_GET['page'] ?>);">Reload</a>
                          </header>
                          <table class="table">
                              <tbody>
                              <tr>
                                  <td>Account_ID</td>
                                  <td><?=$row['account_id']?></td>
                                  <td>COUNTRY</td>
                                  <td><img src="/img/flags32/<?=strtolower($row['COUNTRY'])?>.png" style="height:18px; margin-top:-2px;"> <?=$row['country_name_kr']?>(<?=$row['country_name']?>)</td>
                              </tr>
                              <tr>
                                  <td>EMAIL</td>
                                  <td colspan="3"><?=$row['EMAIL']?></td>
                              </tr>
                              <tr>
                                  <td>SIGNUP_PATH</td>
                                  <td><?=$row['SIGNUP_PATH']?></td>
                                  <td>REG_DATETIME</td>
                                  <td><?=$row['REG_DATETIME']?></td>
                              </tr>
                              <tr>
                                  <td>APP_ID</td>
                                  <td><?=appName($row['APP_ID'])?></td>
                                  <td>STAR_POINT</td>
                                  <td><?=$row['STAR_POINT']?></td>
                              </tr>
                              <tr>
                                  <td>BLOCK</td>
                                  <td><?=$row['BLOCK']?></td>
                                  <td>DELETED</td>
                                  <td><?=$row['DELETED']?></td>
                              </tr>
                              </tbody>
                          </table>
                      </section>
                      
                  <?
                    if($userID > 0)
                    {
                        $sql = "select pt.PROFILE_ID,pt.NAME,pt.BIRTHDAY,pt.GENDER,it.IMG_FILE_NAME,pt.REG_DATETIME
                                                    from slp_account_db.profile_tb pt
                                                        left join slp_account_db.profile_img_tb it on pt.PROFILE_ID = it.PROFILE_ID
                                                    where pt.account_id = $userID order by pt.HIDDEN";
                        $result = $db->query($sql);
                    }
                    ?>                      
                      <section class="panel">
                          <header class="panel-heading">
                                                profile Table
                          </header>
                          <table class="table table-striped">
                              <thead>
                              <tr>
                                  <th>PROFILE_ID</th>
                                  <th>NAME</th>
                                  <th>BIRTHDAY</th>
                                  <th>GENDER</th>
                                  <th>IMG_FILE_NAME</th>
                                  <th>REG_DATETIME</th>
                              </tr>
                              </thead>
                              <tbody>
                              <?
                                while($row = $result->fetch_assoc())
                                {
                              ?>
                              <tr>
                                  <td><?=$row['PROFILE_ID']?></td>
                                  <td><?=$row['NAME']?></td>
                                  <td><?=$row['BIRTHDAY']?></td>
                                  <td><?=$row['GENDER']?></td>
                                  <td><?=func_str_cut(12,$row['IMG_FILE_NAME'])?></td>
                                  <td><?=$row['REG_DATETIME']?></td>
                              </tr>
                              <?
                                }
                                ?>
                              </tbody>
                          </table>
                      </section>          
                      
                  <?
                    if($userID > 0)
                    {
                        $sql = "select * from slp_account_db.app_access_token_tb where account_id = $userID order by TOKEN_UPDATE desc;";
                        $result = $db->query($sql);
                    }
                    ?>
                      <section class="panel">
                          <header class="panel-heading">
                                                access_token Table
                          </header>
                          <table class="table table-striped">
                              <thead>
                              <tr>
                                  <th>APP_ID</th>
                                  <th>CLIENT_UID</th>
                                  <th>PROFILE_ID</th>
                                  <th>TOKEN</th>
                                  <th>TOKEN_UPDATE</th>
                                  <!--th>REG_DATETIME</th-->
                              </tr>
                              </thead>
                              <tbody>
                              <?
                                while($row = $result->fetch_assoc())
                                {
                              ?>
                              <tr>
                                  <td><?=appName($row['APP_ID'])?></td>
                                  <td><?=func_str_cut(12,$row['CLIENT_UID'])?></td>
                                  <td><?=$row['PROFILE_ID']?></td>
                                  <td><?=$row['TOKEN']?></td>
                                  <td><?=$row['TOKEN_UPDATE']?></td>
                                  <!--td><?=$row['REG_DATETIME']?></td-->
                              </tr>
                              <?
                                }
                                ?>
                              </tbody>
                          </table>
                      </section>      
                      
                  <?
                    if($userID > 0)
                    {
                        $sql = "select * from slp_kw_action_log_db.client_uid_tb where ACCOUNT_ID = $userID order by reg_date desc";
                        $result = $db->query($sql);
                    }
                    ?>
                      <section class="panel">
                          <header class="panel-heading">
                                                client_uid_tb Table
                          </header>
                          <table class="table table-striped">
                              <thead>
                              <tr>
                                  <th>APP_ID</th>
                                  <th>CLIENT_UID_SRL</th>
                                  <th>OS</th>
                                  <th>CLIENT_UID</th>
                                  <th>REG_DATE</th>
                              </tr>
                              </thead>
                              <tbody>
                              <?
                                while($row = $result->fetch_assoc())
                                {
                              ?>
                              <tr>
                                  <td><?=appName($row['APP_ID'])?></td>
                                  <td><?=$row['CLIENT_UID_SRL']?></td>
                                  <td><?=$row['OS']?></td>
                                  <td><?=$row['CLIENT_UID']?></td>
                                  <td><?=$row['REG_DATE']?></td>
                              </tr>
                              <?
                                }
                                ?>
                              </tbody>
                          </table>
                      </section>

                  </div>

                  <div class="col-sm-6">

                      <section class="panel">
                          <header class="panel-heading tab-bg-primary ">
                              <ul class="nav nav-tabs">
                                  <li class="active">
                                      <a data-toggle="tab" href="#note">Note</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#product_perm_tb">product_perm_tb</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#level_perm_tb">level_perm_tb</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#episode_perm_tb_slp_common_db">episode_perm_tb(slp_common_db)</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#episode_perm_tb_slp_dla_db">episode_perm_tb(slp_dla_db)</a>
                                  </li>
                              </ul>
                          </header>
                          <div class="panel-body">
                              <div class="tab-content">
                                  <div id="note" class="tab-pane active"><xmp>
1000000001 Dora 영어 - 도라의 영어모험 (slp_common_db.buy_history_tb)
1000000003 Dora lv1 - 도라영유아편 (slp_dla_db.buy_history_tb)
1000000004 Dora lv2 - 레벨 1 (slp_dla_db.buy_history_tb)
1000000005 Dora lv3 - 레벨 2 (slp_dla_db.buy_history_tb)
                                    </xmp>
                                  </div>
                                  <div id="product_perm_tb" class="tab-pane">
                                       <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_common_db.product_perm_tb where ACCOUNT_ID = $userID order by END_DATETIME desc, SEQ DESC";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>APP_ID</th>
                                                  <th>PRODUCT_ID</th>
                                                  <th>REG_DATETIME</th>
                                                  <th>END_DATETIME</th>
                                                  <th>EXPIRED</th>
                                                  <th>EXPIRED_DATETIME</th>
                                                  <th>PERIOD_TYPE</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=$row['APP_ID']?></td>
                                                  <td><?=$row['PRODUCT_ID']?></td>
                                                  <td><?=$row['REG_DATETIME']?></td>
                                                  <td><?=$row['END_DATETIME']?></td>
                                                  <td><?=$row['EXPIRED']?></td>
                                                  <td><?=$row['EXPIRED_DATETIME']?></td>
                                                  <td><?=$row['PERIOD_TYPE']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>

                                  </div>
                                  <div id="level_perm_tb" class="tab-pane">
                                       <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_common_db.level_perm_tb where ACCOUNT_ID = $userID order by END_DATETIME desc, SEQ DESC";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>APP_ID</th>
                                                  <th>LEVEL_ID</th>
                                                  <th>BEGIN_DATETIME</th>
                                                  <th>END_DATETIME</th>
                                                  <th>EXPIRED</th>
                                                  <th>EXPIRED_DATETIME</th>
                                                  <th>IS_SUBSCRIBE</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=$row['APP_ID']?></td>
                                                  <td><?=$row['LEVEL_ID']?></td>
                                                  <td><?=$row['BEGIN_DATETIME']?></td>
                                                  <td><?=$row['END_DATETIME']?></td>
                                                  <td><?=$row['EXPIRED']?></td>
                                                  <td><?=$row['EXPIRED_DATETIME']?></td>
                                                  <td><?=$row['IS_SUBSCRIBE']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>                                  
                                  </div>
                                  <div id="episode_perm_tb_slp_common_db" class="tab-pane">
                                       <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_common_db.episode_perm_tb where ACCOUNT_ID = $userID order by END_DATETIME desc, SEQ DESC";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>APP_ID</th>
                                                  <th>EPISODE_ID</th>
                                                  <th>BEGIN_DATETIME</th>
                                                  <th>END_DATETIME</th>
                                                  <th>EXPIRED</th>
                                                  <th>EXPIRED_DATE</th>
                                                  <th>IS_SUBSCRIBE</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=$row['APP_ID']?></td>
                                                  <td><?=$row['EPISODE_ID']?></td>
                                                  <td><?=$row['BEGIN_DATETIME']?></td>
                                                  <td><?=$row['END_DATETIME']?></td>
                                                  <td><?=$row['EXPIRED']?></td>
                                                  <td><?=$row['EXPIRED_DATE']?></td>
                                                  <td><?=$row['IS_SUBSCRIBE']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>
                                  
                                  </div>
                                  <div id="episode_perm_tb_slp_dla_db" class="tab-pane">
                                       <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_dla_db.episode_perm_tb where ACCOUNT_ID = $userID order by END_DATETIME desc, SEQ DESC";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>APP_ID</th>
                                                  <th>EPISODE_ID</th>
                                                  <th>BEGIN_DATETIME</th>
                                                  <th>END_DATETIME</th>
                                                  <th>EXPIRED</th>
                                                  <th>EXPIRED_DATE</th>
                                                  <th>IS_SUBSCRIBE</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=$row['APP_ID']?></td>
                                                  <td><?=$row['EPISODE_ID']?></td>
                                                  <td><?=$row['BEGIN_DATETIME']?></td>
                                                  <td><?=$row['END_DATETIME']?></td>
                                                  <td><?=$row['EXPIRED']?></td>
                                                  <td><?=$row['EXPIRED_DATE']?></td>
                                                  <td><?=$row['IS_SUBSCRIBE']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>
                                  </div>
                              </div>
                          </div>
                      </section>    


                      <section class="panel">
                          <header class="panel-heading tab-bg-primary ">
                              <ul class="nav nav-tabs">
                                  <li class="active">
                                      <a data-toggle="tab" href="#CLOSE">CLOSE</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#chapter_play_tb">chapter_play_tb</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#episode_play_tb">episode_play_tb</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#en_episode_play_tb">en_episode_play_tb</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#star_point_history_tb">star_point_history_tb</a>
                                  </li>
                              </ul>
                          </header>
                          <div class="panel-body">
                              <div class="tab-content">
                                  <div id="CLOSE" class="tab-pane active"></div>
                                  <div id="chapter_play_tb" class="tab-pane">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select b.* from slp_account_db.profile_tb a 
                                                                        left join slp_kw_action_log_db.chapter_play_tb b on a.PROFILE_ID = b.PROFILE_ID
                                                                            where a.ACCOUNT_ID = $userID and b.PROFILE_ID is not null
                                                                                order by b.BEGIN_DATETIME desc";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                      <table class="table table-striped">
                                          <thead>
                                          <tr>
                                              <th>PROFILE_ID</th>
                                              <th>CH_PLAY_SRL</th>
                                              <th>EP_PLAY_SRL</th>
                                              <th>CHAPTER</th>
                                              <th>END</th>
                                              <th>BEGIN_DATETIME</th>
                                              <th>END_DATETIME</th>
                                              <th>PLAY_TIME</th>
                                          </tr>
                                          </thead>
                                          <tbody>
                                          <?
                                            while($row = $result->fetch_assoc())
                                            {
                                          ?>
                                          <tr>
                                              <td><?=$row['PROFILE_ID']?></td>
                                              <td><?=$row['CH_PLAY_SRL']?></td>
                                              <td><?=$row['EP_PLAY_SRL']?></td>
                                              <td><?=$row['CHAPTER']?></td>
                                              <td><?=$row['END']?></td>
                                              <td><?=$row['BEGIN_DATETIME']?></td>
                                              <td><?=$row['END_DATETIME']?></td>
                                              <td><?=$row['PLAY_TIME']?></td>
                                          </tr>
                                          <?
                                            }
                                            ?>
                                          </tbody>
                                      </table>

                                  </div>
                                  <div id="episode_play_tb" class="tab-pane">
                                      <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_kw_action_log_db.episode_play_tb where ACCOUNT_ID = $userID order by BEGIN_DATETIME desc limit 100";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>EP_PLAY_SRL</th>
                                                  <th>APP_ID</th>
                                                  <th>PROFILE_ID</th>
                                                  <th>OS</th>
                                                  <th>C_UID_SRL</th>
                                                  <th>EPISODE_ID</th>
                                                  <th>END</th>
                                                  <th>BEGIN_DATETIME</th>
                                                  <th>END_DATETIME</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=$row['EP_PLAY_SRL']?></td>
                                                  <td><?=appName($row['APP_ID'])?></td>
                                                  <td><?=$row['PROFILE_ID']?></td>
                                                  <td><?=$row['OS']?></td>
                                                  <td><?=$row['C_UID_SRL']?></td>
                                                  <td><?=$row['EPISODE_ID']?></td>
                                                  <td><?=$row['END']?></td>
                                                  <td><?=$row['BEGIN_DATETIME']?></td>
                                                  <td><?=$row['END_DATETIME']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>
                                  </div>
                                  <div id="en_episode_play_tb" class="tab-pane">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select b.* from slp_account_db.profile_tb a 
                                                                            left join slp_kw_action_log_db.en_episode_play_tb b on a.PROFILE_ID = b.PROFILE_ID 
                                                                                where a.ACCOUNT_ID = $userID and b.PROFILE_ID is not null 
                                                                                    order by b.BEGIN_DATETIME desc";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                      <table class="table table-striped">
                                          <thead>
                                          <tr>
                                              <th>PROFILE_ID</th>
                                              <th>APP_ID</th>
                                              <th>EN_PLAY_SRL</th>
                                              <th>CLIENT_UID_SRL</th>
                                              <th>EPISODE_ID</th>
                                              <th>OS</th>
                                              <th>PLAY_TIME</th>
                                              <th>END</th>
                                              <th>BEGIN_DATETIME</th>
                                              <th>END_DATETIME</th>
                                          </tr>
                                          </thead>
                                          <tbody>
                                          <?
                                            while($row = $result->fetch_assoc())
                                            {
                                          ?>
                                          <tr>
                                              <td><?=$row['PROFILE_ID']?></td>
                                              <td><?=$row['APP_ID']?></td>
                                              <td><?=$row['EN_PLAY_SRL']?></td>
                                              <td><?=$row['CLIENT_UID_SRL']?></td>
                                              <td><?=$row['EPISODE_ID']?></td>
                                              <td><?=$row['OS']?></td>
                                              <td><?=$row['PLAY_TIME']?></td>
                                              <td><?=$row['END']?></td>
                                              <td><?=$row['BEGIN_DATETIME']?></td>
                                              <td><?=$row['END_DATETIME']?></td>
                                          </tr>
                                          <?
                                            }
                                            ?>
                                          </tbody>
                                      </table>
                            
                                  </div>
                                  <div id="star_point_history_tb" class="tab-pane">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select * from slp_account_db.star_point_history_tb where account_id = $userID order by REG_DATETIME DESC";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                      <table class="table table-striped">
                                          <thead>
                                          <tr>
                                              <th>SRL</th>
                                              <th>INFO</th>
                                              <th>OLD_STAR_POINT</th>
                                              <th>MOD</th>
                                              <th>REG_DATETIME</th>
                                          </tr>
                                          </thead>
                                          <tbody>
                                          <?
                                            while($row = $result->fetch_assoc())
                                            {
                                          ?>
                                          <tr>
                                              <td><?=$row['SRL']?></td>
                                              <td><?=$row['INFO']?></td>
                                              <td><?=$row['OLD_STAR_POINT']?></td>
                                              <td><?=func_str_cut(12,$row['MOD'])?></td>
                                              <td><?=$row['REG_DATETIME']?></td>
                                          </tr>
                                          <?
                                            }
                                            ?>
                                          </tbody>
                                      </table>
                                  
                                  </div>
                              </div>
                          </div>
                      </section>
                  </div>
              </div>

              <div class="row">
                  <div class="col-lg-12">
                      
                      <section class="panel">
                          <header class="panel-heading tab-bg-primary ">
                              <ul class="nav nav-tabs">
                                  <li class="active">
                                      <a data-toggle="tab" href="#slp_dla_db_buy_history_tb">buy_history_tb(slp_dla_db)</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#buy_history_tb_old">buy_history_tb_old</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#slp_common_db_buy_history_tb">buy_history_tb(slp_common_db)</a>
                                  </li>
                                  <li class="">
                                      <a data-toggle="tab" href="#quest_history_tb">quest_history_tb</a>
                                  </li>
                              </ul>
                          </header>
                          <div class="panel-body">
                              <div class="tab-content">
                                  <div id="slp_dla_db_buy_history_tb" class="tab-pane active">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select * from slp_dla_db.buy_history_tb  where account_id = $userID order by reg_date desc;";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                        <table class="table">
                                          <thead>
                                            <tr>
                                              <th>seq</th>
                                              <th>app_id</th>
                                              <th>os</th>
                                              <th>product_id</th>
                                              <th>pay_method</th>
                                              <th>price</th>
                                              <th>receipt</th>
                                              <th>reg_date</th>
                                              <th>goods_type</th>
                                              <th>goods</th>
                                              <th>period</th>
                                              <th>period_type</th>
                                              <th>using_unit</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          <?
                                            while($row = $result->fetch_assoc())
                                            {
                                          ?>                              
                                            <tr>
                                              <td><?=$row['seq']?></td>
                                              <td><?=appName($row['app_id'])?></td>
                                              <td><?=$row['os']?></td>
                                              <td><?=$row['product_id']?></td>
                                              <td><?=$row['pay_method']?></td>
                                              <td><?=$row['price']?></td>
                                              <td><pre style='width:500px;'><?=pretty_json($row['receipt']) ?></pre></td>
                                              <td><?=$row['reg_date']?></td>
                                              <td><?=$row['goods_type']?></td>
                                              <td><pre><?=$row['goods']?></pre></td>
                                              <td><?=$row['period']?></td>
                                              <td><?=$row['period_type']?></td>
                                              <td><?=$row['using_unit']?></td>
                                            </tr>
                                            <?
                                            }
                                            ?>                                
                                          </tbody>
                                        </table>
                                  </div>
                                  <div id="buy_history_tb_old" class="tab-pane">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select * from slp_common_db.buy_history_tb_old where account_id = $userID order by reg_date desc;";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                        <table class="table">
                                          <thead>
                                            <tr>
                                              <th>seq</th>
                                              <th>app_id</th>
                                              <th>os</th>
                                              <th>product_id</th>
                                              <th>pay_method</th>
                                              <th>price</th>
                                              <th>receipt</th>
                                              <th>reg_date</th>
                                              <th>goods</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          <?
                                            while($row = $result->fetch_assoc())
                                            {
                                          ?>                              
                                            <tr>
                                              <td><?=$row['seq']?></td>
                                              <td><?=appName($row['app_id'])?></td>
                                              <td><?=$row['os']?></td>
                                              <td><?=$row['product_id']?></td>
                                              <td><?=$row['pay_method']?></td>
                                              <td><?=$row['price']?></td>
                                              <td>
                                                <pre style='width:500px;'><?=pretty_json($row['receipt']) ?></pre>
                                               </td>
                                              <td><?=$row['reg_date']?></td>
                                              <td><pre><?=$row['goods']?></pre></td>
                                            </tr>
                                            <?
                                            }
                                            ?>                                
                                          </tbody>
                                        </table>
                            
                                  </div>
                                  <div id="slp_common_db_buy_history_tb" class="tab-pane">
                                        <?
                                        if($userID > 0)
                                        {
                                            $sql = "select * from slp_common_db.buy_history_tb  where account_id = $userID order by reg_date desc;";
                                            $result = $db->query($sql);
                                        }
                                        ?>
                                            <table class="table">
                                              <thead>
                                                <tr>
                                                  <th>seq</th>
                                                  <th>app_id</th>
                                                  <th>os</th>
                                                  <th>product_id</th>
                                                  <th>pay_method</th>
                                                  <th>price</th>
                                                  <th>receipt</th>
                                                  <th>reg_date</th>
                                                  <th>goods_type</th>
                                                  <th>goods</th>
                                                  <th>period</th>
                                                  <th>period_type</th>
                                                  <th>using_unit</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>                              
                                                <tr>
                                                  <td><?=$row['seq']?></td>
                                                  <td><?=appName($row['app_id'])?></td>
                                                  <td><?=$row['os']?></td>
                                                  <td><?=$row['product_id']?></td>
                                                  <td><?=$row['pay_method']?></td>
                                                  <td><?=$row['price']?></td>
                                                  <td><pre style='width:500px;'><?=pretty_json($row['receipt']) ?></pre></td>
                                                  <td><?=$row['reg_date']?></td>
                                                  <td><?=$row['goods_type']?></td>
                                                  <td><pre><?=$row['goods']?></pre></td>
                                                  <td><?=$row['period']?></td>
                                                  <td><?=$row['period_type']?></td>
                                                  <td><?=$row['using_unit']?></td>
                                                </tr>
                                                <?
                                                }
                                                ?>                                
                                              </tbody>
                                            </table>
                                                                       
                                  </div>
                                  <div id="quest_history_tb" class="tab-pane">
                                    <?
                                    if($userID > 0)
                                    {
                                        $sql = "select * from slp_common_db.quest_history_tb where ACCOUNT_ID = $userID order by reg_date desc";
                                        $result = $db->query($sql);
                                    }
                                    ?>
                                          <table class="table table-striped">
                                              <thead>
                                              <tr>
                                                  <th>APP_ID</th>
                                                  <th>Profile_ID</th>
                                                  <th>OS</th>
                                                  <th>quest_ID</th>
                                                  <th>duplicate_unit</th>
                                                  <th>quest_class</th>
                                                  <th>star_point</th>
                                                  <th>descript</th>
                                                  <th>reg_date</th>
                                                  <th>time_zone</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              <?
                                                while($row = $result->fetch_assoc())
                                                {
                                              ?>
                                              <tr>
                                                  <td><?=appName($row['app_id'])?></td>
                                                  <td><?=$row['profile_id']?></td>
                                                  <td><?=$row['os']?></td>
                                                  <td><?=$row['quest_id']?></td>
                                                  <td><?=$row['duplicate_unit']?></td>
                                                  <td><?=$row['quest_class']?></td>
                                                  <td><?=$row['star_point']?></td>
                                                  <td><?=$row['descript']?></td>
                                                  <td><?=$row['reg_date']?></td>
                                                  <td><?=$row['time_zone']?></td>
                                              </tr>
                                              <?
                                                }
                                                ?>
                                              </tbody>
                                          </table>
                               
                                  </div>
                              </div>
                          </div>
                      </section>                      
                      
                      
                  </div>
              </div>             
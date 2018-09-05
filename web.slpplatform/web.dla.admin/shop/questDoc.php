<?
$xmlUrl = "http://ftp.bluearkedu.com/dla/data/dla_quest.xml";
$xml = new SimpleXMLElement($xmlUrl, 0, TRUE);
?>
                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    Quest List - <b><?=$xmlUrl ?></b>&nbsp;&nbsp;&nbsp;
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                              <th>quest_id</th>
                              <th>desc</th>
                              <th>class</th>
                              <th>duplicate_unit</th>
                              <th>point</th>
                              <th>app_id</th>
                              <th>use</th>
                            </tr>
                            <? foreach ($xml->quest as $questElement) :?>
                            <tr>
                              <td>
                                <? if($questElement->use == 'false'){ ?>
                                <strike><?=$questElement->quest_id ?></strike>
                                <? }else{ ?>
                                <?=$questElement->quest_id ?>
                                <? } ?>
                              </td>
                              <td><?=$questElement->desc ?></td>
                              <td><?=$questElement->class ?></td>
                              <td><?=$questElement->duplicate_unit ?></td>
                              <td><?=$questElement->point ?></td>
                              <td><?=$questElement->app_id ?></td>
                              <td><?=$questElement->use ?></td>
                            </tr>
                            <? endforeach; ?>
                        </tbody>
                    </table>
                </section>
              </div>


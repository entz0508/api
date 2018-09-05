<?
$xmlUrl=$wherequery = null;
if(isset($_GET["st"])) {
    $wherequery = $_GET["st"];
    if($wherequery == "product_dea.xml"){
        //$xmlUrl = "http://cdn.bluearkedu.com/dea/data/";
        $xmlUrl = "http://ftp.bluearkedu.com/dea/data/";
    }else{
        //$xmlUrl = "http://cdn.bluearkedu.com/dla/data/";
        $xmlUrl = "http://ftp.bluearkedu.com/dla/data/";
    }
}else{
    //$xmlUrl = "http://cdn.bluearkedu.com/dea/data/";
    $xmlUrl = "http://ftp.bluearkedu.com/dea/data/";
    $wherequery = "product_dea.xml";
}
$xml = new SimpleXMLElement($xmlUrl.$wherequery, 0, TRUE);
?>

                <div  id="reportList" >
                <section class="panel">
                    <header class="panel-heading">
                                    Gift List - <b><?=$xmlUrl.$wherequery ?></b>&nbsp;&nbsp;&nbsp;
                    </header>
                    <table class="table table-striped table-advance table-hover">
                        <tbody>
                            <tr>
                              <? if($wherequery == "product_dea.xml"){ ?> <th>product_id</th> <?} ?>
                              <th>product_type</th>
                              <? if($wherequery == "product_dea.xml"){ ?> <th>product_os</th> <?} ?>
                              <th>app_id</th>
                              <th>id</th>
                              <th>use</th>
                              <th>os</th>
                              <th>title</th>
                              <th>period</th>
                              <th>period_type</th>
                              <th>using_unit</th>
                              <? if($wherequery == "product_dea.xml"){ ?>
                              <th>level</th>
                              <th>level_id</th>
                              <? }else{ ?>
                              <th>category_id</th>
                              <? } ?>
                              <th>episode_id</th>
                              <th>pay_payment</th>
                              <th>pay_cash</th>
                              <th>point</th>                            
                            </tr>
                            <? foreach ($xml->products->product as $productElement) :?>
                            <tr>
                              <? if($wherequery == "product_dea.xml"){ ?> <td><?=$productElement["id"] ?></td> <?} ?>
                              <td><?=$productElement["type"] ?></td>
                              <? if($wherequery == "product_dea.xml"){ ?> <td><?=$productElement["os"] ?></td> <?} ?>
                              <td><?=$productElement->app_id ?></td>
                              <td><?=$productElement->id ?></td>
                              <td><?=$productElement->use ?></td>
                              <td><?=$productElement->os ?></td>
                              <td><?=$productElement->title ?></td>
                              <td><?=$productElement->period ?></td>
                              <td><?=$productElement->period_type ?></td>
                              <td><?=$productElement->using_unit ?></td>
                              <? if($wherequery == "product_dea.xml"){ ?>
                              <td><?=$productElement->level ?></td>
                              <td><?=$productElement->level_id ?></td>
                              <? }else{ ?>
                              <td><?=$productElement->category_id ?></td>
                              <? } ?>
                              <td><?=$productElement->episode_id ?></td>
                              <td><?=$productElement->pay_payment ?></td>
                              <td><?=$productElement->pay_cash ?></td>
                              <td><?=$productElement->point ?></td>
                            </tr>
                            <? endforeach; ?>
                        </tbody>
                    </table>
                </section>
              </div>


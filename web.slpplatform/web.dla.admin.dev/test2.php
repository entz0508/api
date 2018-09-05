<?php
//$xml = new SimpleXMLElement('http://data.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue=Partnership', 0, TRUE);
$xml = new SimpleXMLElement('http://cdn.bluearkedu.com/dea/data/product_dea.xml', 0, TRUE);
//$xml = new SimpleXMLElement('http://data.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue='.$_GET["callsign"], 0, TRUE);
?>

<table bgcolor="#cfcfcf" cellpadding="3">
  <thead>
    <tr bgcolor="#eeeeee">
      <th>product_id</th>
      <th>product_type</th>
      <th>product_os</th>
      
      <th>app_id</th>
      <th>id</th>
      <th>use</th>
      <th>os</th>
      <th>title</th>
      <th>period</th>
      <th>period_type</th>
      <th>using_unit</th>
      <th>level</th>
      <th>level_id</th>
      <th>episode_id</th>
      <th>pay_payment</th>
      <th>pay_cash</th>
      <th>point</th>
    </tr>
  </thead>
  <tbody>

<?php foreach ($xml->products->product as $productElement) :?>
    <tr bgcolor="#ffffff">
      <td><?php echo $productElement["id"]; ?></td>
      <td><?php echo $productElement["type"]; ?></td>
      <td><?php echo $productElement["os"]; ?></td>
      <td><?php echo $productElement->app_id; ?></td>
      <td><?php echo $productElement->id; ?></td>
      <td><?php echo $productElement->use; ?></td>
      <td><?php echo $productElement->os; ?></td>
      <td><?php echo $productElement->title; ?></td>
      <td><?php echo $productElement->period; ?></td>
      <td><?php echo $productElement->period_type; ?></td>
      <td><?php echo $productElement->using_unit; ?></td>
      
      <td><?php echo $productElement->level; ?></td>
      <td><?php echo $productElement->level_id; ?></td>
      <td><?php echo $productElement->episode_id; ?></td>
      <td><?php echo $productElement->pay_payment; ?></td>
      <td><?php echo $productElement->pay_cash; ?></td>
      <td><?php echo $productElement->point; ?></td>
    </tr>
<?php endforeach; ?>
  </tbody>
</table>

<?
/*
    $file = file_get_contents('http://cdn.bluearkedu.com/dea/data/product_dea.xml');
    $movies = new SimpleXMLElement($file);

    echo '<pre>';
    print_r($movies);
    echo '<pre>';
*/

/*
    $xml = "<?xml version='1.0' encoding='UTF-8'?>
        <test>
            <tag1>
                <uselesstag>
                    <tag2>test</tag2>
                </uselesstag>
            </tag1>
            <tag2>test2</tag2>
        </test>";
   
    $dom = new DomDocument();
    $dom->loadXML($xml);
    $xpath = new DomXPath($dom);
   
    $tag1 = $dom->getElementsByTagName("tag1")->item(0);
   
    echo "<br/>".$xpath->query("//tag2")->length; //output 2 -> correct
    echo "<br/>".$xpath->query("//tag2", $tag1)->length; //output 2 -> wrong, the query is not relative
    echo "<br/>".$xpath->query(".//tag2", $tag1)->length; //output 1 -> correct (note the dot in front of //)
*/    
?>

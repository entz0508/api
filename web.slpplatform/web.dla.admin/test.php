<?php
$xml = new SimpleXMLElement('http://data.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue=Partnership', 0, TRUE);
///$xml = new SimpleXMLElement('http://data.fcc.gov/api/license-view/basicSearch/getLicenses', 0, TRUE);
//$xml = new SimpleXMLElement('http://data.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue='.$_GET["callsign"], 0, TRUE);
?>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Call Sign</th>
      <th>Type</th>
      <th>Status</th>
      <th>Expiration Date</th>
    </tr>
  </thead>
  <tbody>

<?php foreach ($xml->Licenses->License as $licenseElement) :?>
    <tr>
      <td><?php echo $licenseElement->licName; ?></td>
      <td><?php echo $licenseElement->callsign; ?></td>
      <td><?php echo $licenseElement->serviceDesc; ?></td>
      <td><?php echo $licenseElement->statusDesc; ?></td>
      <td><?php echo $licenseElement->expiredDate; ?></td>
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

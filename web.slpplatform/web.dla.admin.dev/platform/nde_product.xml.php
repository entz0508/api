<?
	header("Content-type: text/xml");
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";

    require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");
    require_once($_SERVER['DOCUMENT_ROOT']."/inc/lib.php");

    $sql = "select pdt_id,title,using_unit,unit_id,period,app_id,amount,os from slp_nde_info_db.product_tb where app_id='1000000007' and use_type='y' order by pdt_id asc;";
    $result = $db->query($sql);

	// pdt_id,title,using_unit,unit_id,period,app_id,amount,os,use_type

	echo "<root xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">";
	echo "<products>";

	while($row = $result->fetch_assoc())
	{
		?>
		<product>
			<pdt_id><?=$row['pdt_id']?></pdt_id>
			<title><?=$row['title']?></title>
			<using_unit><?=$row['using_unit']?></using_unit>
			<unit_id><?=$row['unit_id']?></unit_id>
			<period><?=$row['period']?></period>
			<amount><?=$row['amount']?></amount>
			<app_id><?=$row['app_id']?></app_id>
			<os><?=$row['os']?></os>
		</product>
		<?
	}

	echo "</products>";
	echo "</root>";
?>
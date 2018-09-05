<?php
header('Content-Type: application/json; charset=utf-8');
header("Cache-Control:no-cashe");
header("Pragma:no-cashe");

require_once($_SERVER['DOCUMENT_ROOT']."/inc/dbcon.php");

$someArray = [];

$sql = "select tt.DAYS,
			DATE_FORMAT(tt.DATETIMES, '%Y-%m-%d') as DATES,tt.BID,tt.CID,tt.SVID,tt.EVID
				, bt.`name`
			from todays_tb tt
			inner join bible_tb bt on tt.BID = bt.id
			order by tt.DATETIMES ASC;";
$result = $db->query($sql);

while($row = $result->fetch_assoc())
{
	array_push($someArray,[
		'title' => $row['name']." ".$row['CID'].",".$row['SVID']."-".$row['EVID'],
		'start' => $row['DATES'],
		"allDay" => true, 
		'backgroundColor' => '#f39c12', 
		'borderColor' => '#f39c12'
	]);
}

$someJSON = json_encode($someArray);
echo $someJSON;
?>
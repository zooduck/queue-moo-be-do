<?php

$endpoint = $_GET["endpoint"];


// reset everything (for testing)
if ($endpoint == "QUEUE_RESET") {
	//$jsonDbBackup = fopen("db_backup_DO_NOT_DELETE.json", "r");
	$jsonDbBackup = file_get_contents("db_backup_DO_NOT_DELETE.json");
	$db = fopen("db.json", "w");
	fwrite($db, $jsonDbBackup);

	$updatedDb = fopen("db.json", "r");

	// ECHO DATABASE AS A JSON...
	echo fread($updatedDb, filesize("db.json"));
}



// =====================
// QUEUE_GET
// =====================
if ($endpoint == "QUEUE_GET") {
	$jsonDb = fopen("db.json", "r");
	// ECHO DATABASE AS A JSON...
	echo fread($jsonDb, filesize("db.json"));
}
// =====================
// QUEUE_CREATE
// =====================
if ($endpoint == "QUEUE_CREATE") {
	echo "QUEUE_CREATE..." . $_GET["services"];
}
// =====================
// QUEUE_DELETE
// =====================
if ($endpoint == "QUEUE_DELETE") {
	echo "QUEUE_DELETE";
}


// ============================
// CUSTOMER_DELETE
// ============================
if ($endpoint == "CUSTOMER_DELETE") {

	$jsonDb = file_get_contents("db.json");
	$jsonDbObj = json_decode($jsonDb, true);

	$ticketRef = $_GET["ticketRef"];
	
	function filterByTicketRef($customer) {
		return $customer["ticketRef"] != $_GET["ticketRef"];
	}	
	$filteredCustomers = array_filter($jsonDbObj["customers"], "filterByTicketRef");

	
	$jsonDbObj["customers"] = [];
	foreach ($filteredCustomers as $customer) {
		array_push($jsonDbObj["customers"], $customer);
	}
	
	$updatedJsonDb = json_encode($jsonDbObj);

	$db = fopen("db.json", "w");
	fwrite($db, $updatedJsonDb);

	$updatedDb = fopen("db.json", "r");

	// ECHO DATABASE AS A JSON...
	echo fread($updatedDb, filesize("db.json"));
}



?>
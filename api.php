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
// QUEUES_GET_ALL
// =====================
if ($endpoint == "QUEUES_GET_ALL") {
	$jsonDb = fopen("table_queues.db.json", "r");
	echo fread($jsonDb, filesize("table_queues.db.json"));
}


// =====================
// QUEUE_GET_BY_ID
// =====================
if ($endpoint == "QUEUE_GET_BY_ID") {
	$id = $_GET["id"];
	$tableQueues = file_get_contents("table_queues.db.json");
	$tableQueuesObj = json_decode($tableQueues, true);
	$queue = new class{};
	foreach($tableQueuesObj["queues"] as $key => $val) {
		// echo "key" . $key . "val" .  $val;
		if ($val["id"] == $id) {
			$queue = $val;
		}
	}
	echo json_encode($queue);
}
// ========================
// STAFF_GET_BY_SERVICES
// ========================
if ($endpoint == "STAFF_GET_BY_SERVICES") {
	$services = explode(",", $_GET["services"]);
	$staffWithServices = [];
	$tableStaff = file_get_contents("table_staff.db.json");
	$tableStaffObj = json_decode($tableStaff, true);
	foreach($tableStaffObj["staff"] as $staffMember) {
		foreach($services as $service) {
			if (in_array($service, $staffMember["services"])) {
				array_push($staffWithServices, $staffMember);
				break;
			}
		}
	}

	echo json_encode($staffWithServices);

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
	$id = $_POST["id"];
	$services = $_POST["services"];

	$queueObj = []; //new class{};
	$queueObj["id"] = $id;
	$queueObj["services"] = explode(",", $services);
	$queueObj["customers"] = [];


	$tableQueues = file_get_contents("table_queues.db.json");
	$tableQueuesObj = json_decode($tableQueues, true); // json -> object
  array_push($tableQueuesObj["queues"], $queueObj);

	$tableQueuesJSON = json_encode($tableQueuesObj);


	$db = fopen("table_queues.db.json", "w");
	fwrite($db, $tableQueuesJSON);

	$updatedDb = fopen("table_queues.db.json", "r");

	// ECHO DATABASE AS A JSON...
	echo fread($updatedDb, filesize("table_queues.db.json"));

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

	//$file = "db.json";
	$file = "table_queues.db.json";

	$jsonDb = file_get_contents($file);
	$jsonDbObj = json_decode($jsonDb, true);

	$ticketRef = $_GET["ticketRef"];
	$queueId = $_GET["queueId"];


	$queues = $jsonDbObj["queues"];

	function filterByTicketRef($customer) {
		echo "is " . $customer["ticketRef"] . "!=" . $_GET["ticketRef"];
		return $customer["ticketRef"] != $_GET["ticketRef"];
	}

	foreach($queues as $queue) {
		echo "is " . $queueId . "==" . $queue["id"];
		if ($queue["id"] == $queueId) {
			echo "QUEUE IS SAME>>>>>>>>>>>>>>>>>>>>>>>>>";
			$filteredCustomers = array_filter($queue["customers"], "filterByTicketRef");
		}
	}

	//echo "filteredCustomers" . json_encode($filteredCustomers);

	foreach($jsonDbObj["queues"] as $queue) {
		if ($queue["id"] == $queueId) {
			echo "GOT HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE";
			// THIS DOES NOT SEEM TO ALTER THE jsonDbObj!!!! WHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY NOT?????????????????????????????
			$queue["customers"] = $filteredCustomers;
		}
	}
	echo "you asked me to remove " . $ticketRef . " from queue id of " . $queueId;
	echo "NEW QUEUE DATABASE LOOKS LIKE =>" . json_encode($jsonDbObj);
	exit;









	function filterByTicketRef_ERR($customer) {
		return $customer["ticketRef"] != $_GET["ticketRef"];
	}
	$filteredCustomers = array_filter($jsonDbObj["customers"], "filterByTicketRef_ERR");


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

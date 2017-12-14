<?php

$endpoint = $_GET["endpoint"];


// reset everything (for testing)
if ($endpoint == "TOTAL_RESET") {
	$table_queues_file = "table_queues.db.json";
	$table_staff_file = "table_staff.db.json";
	$table_queues_backup_file = "table_queues.db.backup.json";
	$table_staff_backup_file = "table_staff.db.backup.json";

	$table_queues_backup_resource = file_get_contents($table_queues_backup_file);
	$table_staff_backup_resource = file_get_contents($table_staff_backup_file);

	$q = fopen($table_queues_file, "w");
	fwrite($q, $table_queues_backup_resource);
	$s = fopen($table_staff_file, "w");
	fwrite($s, $table_staff_backup_resource);


	echo "ALL DATABASES RESET!";
}

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
	$queue;
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
	echo "QUEUE_DELETE (TODO)";
}


// =======================
// SERVICES_GET
// =======================
if ($endpoint == "SERVICES_GET") {
	$file = "services.db.json";
	$str = fopen($file, "r");
	echo fread($str, filesize($file));
}


// ==========================
// CUSTOMER_SERVE_COMPLETE
// ==========================
if ($endpoint == "CUSTOMER_SERVE_COMPLETE") {
	$file_queues = "table_queues.db.json";
	$file_staff = "table_staff.db.json";

	// need to update staff member details and remove customer from queue...
	$queuesObj = json_decode(file_get_contents($file_queues), true);
	$staffObj = json_decode(file_get_contents($file_staff), true);

	$queueId = $_GET["queueId"];
	$staffId = $_GET["staffId"];
	$customerId = $_GET["customerId"];

	// update staff member details...
	foreach($staffObj["staff"] as $key => $val) {
		if ($staffObj["staff"][$key]["id"] == $staffId) {
			$staffObj["staff"][$key]["status"] = "available";
			$staffObj["staff"][$key]["serving"]["name"] = "";
			$staffObj["staff"][$key]["serving"]["id"] = "";
			$staffObj["staff"][$key]["serving"]["service"] = "";
			$staffObj["staff"][$key]["serving"]["duration"] = "";
			$staffObj["staff"][$key]["serving"]["start"] = "";
		}
	}


	// remove customer from queue...
	$filteredCustomers = [];
	foreach ($queuesObj["queues"] as $key => $val) {
		if ($queuesObj["queues"][$key]["id"] == $queueId) {
			// remove customer from this queue...
			foreach($queuesObj["queues"][$key]["customers"] as $k => $v) {
				if ($v["id"] != $customerId) {
					array_push($filteredCustomers, $v);
				}
			}
			$queuesObj["queues"][$key]["customers"] = $filteredCustomers;
		}
	}


	$queuesDb = fopen($file_queues, "w");
	fwrite($queuesDb, json_encode($queuesObj));

	$staffDb = fopen($file_staff, "w");
	fwrite($staffDb, json_encode($staffObj));

	echo json_encode($staffObj);

}

// ========================
// CUSTOMER_SERVE
// ========================
if ($endpoint == "CUSTOMER_SERVE") {
		$file_queues = "table_queues.db.json";
		$file_staff = "table_staff.db.json";

		// need to update staff member details and remove customer from queue...
		$queuesObj = json_decode(file_get_contents($file_queues), true);
		$staffObj = json_decode(file_get_contents($file_staff), true);

		$queueId = $_GET["queueId"];
		$staffId = $_GET["staffId"];
		$customerId = $_GET["customerId"];
		$customerName = $_GET["customerName"];
		$service = $_GET["service"];
		$duration = $_GET["duration"];
		$start = $_GET["start"];


    // update staff member details...
		foreach($staffObj["staff"] as $key => $val) {
			if ($staffObj["staff"][$key]["id"] == $staffId) {
				$staffObj["staff"][$key]["status"] = "busy";
				$staffObj["staff"][$key]["serving"]["name"] = $customerName;
				$staffObj["staff"][$key]["serving"]["id"] = $customerId;
				$staffObj["staff"][$key]["serving"]["service"] = $service;
				$staffObj["staff"][$key]["serving"]["duration"] = $duration;
				$staffObj["staff"][$key]["serving"]["start"] = $start;
			}
		}



		// update customer status from "in_queue" to "being_seen"
		// $filteredCustomers = [];
		foreach ($queuesObj["queues"] as $key => $val) {
			if ($queuesObj["queues"][$key]["id"] == $queueId) {
				// set customer status to being_seen
				foreach($queuesObj["queues"][$key]["customers"] as $k => $v) {
					if ($v["id"] == $customerId) {
						// array_push($filteredCustomers, $v);
						$queuesObj["queues"][$key]["customers"][$k]["status"] = "being_seen";
					}
				}
				// $queuesObj["queues"][$key]["customers"] = $filteredCustomers;
			}
		}

		$queuesDb = fopen($file_queues, "w");
		fwrite($queuesDb, json_encode($queuesObj));

		$staffDb = fopen($file_staff, "w");
		fwrite($staffDb, json_encode($staffObj));

		echo json_encode($staffObj);

}

// =========================
// CUSTOMER_ADD
// =========================
if ($endpoint == "CUSTOMER_ADD") {
	$file = "table_queues.db.json";
	$obj = json_decode(file_get_contents($file), true);
	$customer;
	$customer["id"] = $_POST["id"];


	$customer["name"] = $_POST["name"];
	$customer["service"] = $_POST["service"];
	$customer["ticketRef"] = $_POST["ticketRef"];
	$customer["status"] = $_POST["status"];
	$customer["waitTime"] = $_POST["waitTime"];


	foreach($obj["queues"] as $key => $val) {
		if ($val["id"] == $_POST["queueId"]) {
			// this is the queue we need to add the customer to...
			$customer["position"] = count($obj["queues"][$key]["customers"]);
			array_push($obj["queues"][$key]["customers"], $customer);
		}
	}

	$db = fopen($file, "w");
	fwrite($db, json_encode($obj));
	$updatedDb = fopen($file, "r");

	// ECHO DATABASE AS A JSON...
	echo fread($updatedDb, filesize($file));
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

	// function filterByTicketRef($customer) {
	// 	//echo "is " . $customer["ticketRef"] . "!=" . $_GET["ticketRef"];
	// 	return $customer["ticketRef"] != $_GET["ticketRef"];
	// }

	$filteredCustomers = [];
	foreach($queues as $queue) {
		if ($queue["id"] == $queueId) {
			foreach($queue["customers"] as $customer) {
				if ($customer["ticketRef"] != $_GET["ticketRef"]) {
					array_push($filteredCustomers, $customer);
				}
			}
			//$filteredCustomers = array_filter($queue["customers"], "filterByTicketRef");
		}
	}

	// echo "filteredCustomers =>" . json_encode($filteredCustomers);

	foreach($jsonDbObj["queues"] as $key => $val) {
		if ($jsonDbObj["queues"][$key]["id"] == $queueId) {
			$jsonDbObj["queues"][$key]["customers"] = $filteredCustomers;
		}
	}

	$updatedJsonDb = json_encode($jsonDbObj);
	$db = fopen($file, "w");
	fwrite($db, $updatedJsonDb);

	$updatedDb = fopen($file, "r");
	// ECHO DATABASE AS A JSON...
	echo fread($updatedDb, filesize($file));

}



?>

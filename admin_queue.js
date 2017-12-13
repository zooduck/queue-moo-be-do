/*

SPEC:

// ===================================
API ENDPOINTS REQUIRED:
	1. create_queue
	2. delete_queue
	3. add_customer_to_queue
	4. remove_customer_from_queue
	4. serve_customer
	5. update_staff_member (status)
// ====================================


// ==========================================================================================
SERVER RESPONSIBILITIES:
	1. ON INIT: return a list of staff members along with their current status (detailed)
	2. ON INIT: return a list of members who are waiting in a queue
	3. ON CHANGE: return a NEW list if anything changes for that list
// ==========================================================================================


*/






// ====================
// API METHODS...
// ====================
const $http = (type, url, formData=null) => {
	const promise = new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open(type, url);
		// xhr.setRequestHeader('Accept', 'application/json');
		xhr.send(formData);
		xhr.onload = () => {
			resolve(xhr.responseText);
		}
	});
	return promise;
}
// creates a queue with the requested services
// const queueCreate = (services) => {
// 	servicesCSV = services.join(",");
// 	return $http("POST", `api.php?endpoint=QUEUE_CREATE&services=${servicesCSV}`);
//
// };
const queueCreate = (formData) => {
	//servicesCSV = services.join(",");
	return $http("POST", `api.php?endpoint=QUEUE_CREATE`, formData);

};

const queuesGetAll = () => {
	return $http("GET", "api.php?endpoint=QUEUES_GET_ALL");
};

const queueGetById = (id) => {
	return $http("GET", `api.php?endpoint=QUEUE_GET_BY_ID&id=${id}`);
};

const staffGetByServices = (services) => {
	return $http("GET", `api.php?endpoint=STAFF_GET_BY_SERVICES&services=${services}`)
};




// returns an object with an array of staff and customers
const queueGet = () => {
	return $http("GET", "api.php?endpoint=QUEUE_GET");

};
// deletes the current queue
const queueDelete = () => {
	return $http("GET", "api.php?endpoint=QUEUE_DELETE");
};
const customerAddToQueue = () => {

};
const customerDeleteFromQueue = (ticketRef, queueId) => {
	return $http("DELETE", `api.php?endpoint=CUSTOMER_DELETE&ticketRef=${ticketRef}&queueId=${queueId}`);
};
const customerServe = () => {

};
const staffMemberUpdate = () => {

};
const queueReset = () => {
	return $http("GET", "api.php?endpoint=QUEUE_RESET");
};















// =========================
// VIEW...
// TODO!!! MOVE TO VIEW.JS
// =========================
const content = document.querySelector("content"); console.log(content);
const staffWrapper = document.querySelector("#staff");
const customersWrapper = document.querySelector("#customers");
const servicesAvailableWrapper = document.querySelector("#servicesAvailable");
let localQueueData = {};
const queueDataChanged = (newData, oldData) => {
	return JSON.stringify(newData) != JSON.stringify(oldData);
};
const generateStaffTemplate = () => {
	 let staffTemplate = "<div class=\"staff__member\">";
	    staffTemplate += "<button class=\"staff--action-button\">Serve</button>";
	     staffTemplate += "<button class=\"staff--action-button\">%_STATUS_%</button>";
	    staffTemplate += "<div class=\"staff__name\">%_NAME_%</div>";
    	staffTemplate += "<div class=\"staff__status\">%_STATUS_% %_SERVING_%</div>";
    	staffTemplate += "<div class=\"staff__services\">%_SERVICES_%</div>";
    	staffTemplate += "</div>";
    return staffTemplate;
};
const generateCustomerTemplate = () => {
	 let customerTemplate = "<div class=\"customer\" ticket-ref=\"%_TICKET_REF_%\">";
	    customerTemplate += "<button class=\"customer--action-button customer--remove\">Remove</button>";
	    customerTemplate += "<div class=\"customer__ticket-ref\">%_TICKET_REF_%</div>";
	    customerTemplate += "<div class=\"customer__service\">Service: %_SERVICE_%</div>";
    	customerTemplate += "<div class=\"customer__wait-time\">Estimated wait time: %_WAIT_TIME_%</div>";
    	customerTemplate += "</div>";
    return customerTemplate;
};
const addStaffMemberToDOM = (staffMember) => {
	let staffTemplate = generateStaffTemplate();
    staffTemplate = staffTemplate.replace(/%_NAME_%/g, staffMember.name);
    staffTemplate = staffTemplate.replace(/%_STATUS_%/g, staffMember.status);
    staffTemplate = staffTemplate.replace(/%_SERVICES_%/g, staffMember.services);
    staffTemplate = staffTemplate.replace(/%_SERVING_%/g, staffMember.serving);
	staffWrapper.innerHTML += staffTemplate;
};
const addCustomerToDOM = (customer) => {
	let customerTemplate = generateCustomerTemplate();
    customerTemplate = customerTemplate.replace(/%_TICKET_REF_%/g, customer.ticketRef);
    customerTemplate = customerTemplate.replace(/%_WAIT_TIME_%/g, customer.waitTime);
    customerTemplate = customerTemplate.replace(/%_SERVICE_%/g, customer.service);
	customersWrapper.innerHTML += customerTemplate;
};
const clearView = () => {
	staffWrapper.innerHTML = "";
	customersWrapper.innerHTML = "";
	servicesAvailableWrapper.innerHTML = "";
};
const buildView = () => {

	let services = localQueueData.services;
	let staff = localQueueData.staff;
	let customers = localQueueData.customers;
	console.log("BUILDING VIEW WITH: ")
	console.log("staff:", staff);
	console.log("customers:", customers);

	clearView();

	servicesAvailableWrapper.innerHTML = `SERVICES: ${services.join(", ")}`;

	for (let staffMember of staff) {
		let result = staffMember.services.find(function(service) {
			return localQueueData.services.indexOf(service) != -1;
		});
		if (result) {
			addStaffMemberToDOM(staffMember);
		} else {
			console.warn(`${staffMember.name} does not support any of the services for this queue!`);
		}
	}
	console.log("customers:", customers);
	for (let customer of Array.from(customers)) {
		console.log("adding ", customer.name, "to dom");
		addCustomerToDOM(customer);
	}
	let removeCustomerButtons = customersWrapper.querySelectorAll("button.customer--remove");
	for (let button of removeCustomerButtons) {
		button.addEventListener("click", function(e) {
			let ticketRef = this.parentNode.getAttribute("ticket-ref");
			console.log(localQueueData);
			customerRemove(ticketRef, localQueueData.id);
		});
	}
};
const customerRemove = (ticketRef, queueId) => {
	customerDeleteFromQueue(ticketRef, queueId).then((queueData) => {
		console.log("queueData:", queueData);
		if (queueDataChanged(JSON.parse(queueData), localQueueData)) {
			// queue data is different! update view
			console.warn("QUEUE DATA CHANGED!");
			localQueueData = JSON.parse(queueData);
			buildView();
		}
	});
};

const resetDatabase = () => {
	queueReset().then((queueData) => {
		console.warn("QUEUE DATA RESET!");
		localQueueData = JSON.parse(queueData);
		buildView();
	});
};


const createQueue = () => {

	let formEl = document.querySelector("#queueCreate");
	let formData = new FormData(formEl);
	let services = [];
	for (let pair of formData.entries()) {
		let key = pair[0];
		let val = pair[1];
		if (val == "") {
			alert("QUEUE_NAME_CANNOT_BE_BLANK");
			return;
		}
		if (key != "id") {
			services.push(key);
		}
		console.log(key, val);
	}
	formData.append("services", services);

	console.log("services:", services);

	 queueCreate(formData).then((queueData) => {
		 console.log("QUEUE CREATED, QUEUES ARRAY UPDATED!", JSON.parse(queueData));
	 });
};


const getQueueById = () => {
	let id = document.querySelector("#queueSelect").value;
	let queue = {};
	queueGetById(id).then((queueData) => {
		console.log("GET QUEUE BY ID", JSON.parse(queueData));

		let services = JSON.parse(queueData).services;
		queue.id = JSON.parse(queueData).id;
		queue.customers = JSON.parse(queueData).customers;
		queue.services = services;

		console.log("services for selected queue", services);

		staffGetByServices(services).then((staffData) => {
			queue.staff = JSON.parse(staffData);
			console.log("staff get by services", queueData);

			console.log("NEW QUEUE OBJECT!", queue);

			localQueueData = queue;
			buildView();

		});


	});
};

// queueGet().then((queueData) => {
// 	console.log("queueGet() queueData:", queueData);
// 	if (queueDataChanged(JSON.parse(queueData), localQueueData)) {
// 		// queue data is different! update view
// 		console.warn("QUEUE DATA CHANGED!");
// 		localQueueData = JSON.parse(queueData);
// 		buildView();
// 	}
// });



// get all queues and add them to dropdown list...
queuesGetAll().then((queueData) => {
	let allQueues = JSON.parse(queueData).queues;
	const queueSelectEl = document.querySelector("#queueSelect");
	queueSelectEl.innerHTML = "";
	for (let queue of allQueues) {
		console.log("queue id", queue.id);
		let opt = document.createElement("OPTION");
		opt.innerHTML = queue.id;
		queueSelectEl.appendChild(opt);
	}
	console.log("ALL QUEUES:", JSON.parse(queueData));
});

// queueCreate(['tire_fit', 'mot']).then((queueData) => {
// 	console.log(queueData);
// });
queueDelete().then((queueData) => {
	console.log(queueData);
});

// customerDeleteFromQueue("13").then((queueData) => {
// 	console.log(queueData);
// });





// setTimeout(() => {
// 	queueGet().then((queue_data) => {
// 	console.log("queueData changed?:", queueDataChanged(queue_data, queueData));
// 	//console.log(JSON.stringify(queue_data) == JSON.stringify(queueData));
// 	console.log("queueData", queueData);
// 	console.log("queue_data", queue_data);
// 	});
// }, 1000);

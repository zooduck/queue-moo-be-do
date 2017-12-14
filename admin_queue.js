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

const customerAdd = (formData) => {
	return $http("POST", "api.php?endpoint=CUSTOMER_ADD", formData);
};

const queuesGetAll = () => {
	return $http("GET", "api.php?endpoint=QUEUES_GET_ALL");
};

const queueGetById = (id) => {
	return $http("GET", `api.php?endpoint=QUEUE_GET_BY_ID&id=${id}`);
};

const servicesGet = (companyId = "SOME_COMPANY_ID") => {
	return $http("GET", `api.php?endpoint=SERVICES_GET&companyId=${companyId}`);
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
const customerServe = (queueId, staffId, customerId, customerName, service, duration, start) => {
	//alert(staffId + " => " + customerId);
	return $http("GET", `api.php?endpoint=CUSTOMER_SERVE&queueId=${queueId}&staffId=${staffId}&customerId=${customerId}&customerName=${customerName}&service=${service}&duration=${duration}&start=${start}`);
};
const customerServeComplete = (queueId, staffId, customerId) => {
	//alert(staffId + " => " + customerId);
	return $http("GET", `api.php?endpoint=CUSTOMER_SERVE_COMPLETE&queueId=${queueId}&staffId=${staffId}&customerId=${customerId}`);
};
const staffMemberUpdate = () => {

};
// const queueReset = () => {
// 	return $http("GET", "api.php?endpoint=QUEUE_RESET");
// };
const TOTAL_RESET = () => {
	return $http("GET", "api.php?endpoint=TOTAL_RESET");
};















// =========================
// VIEW...
// TODO!!! MOVE TO VIEW.JS
// =========================
let SELECTED_QUEUE = null;
const content = document.querySelector("content"); console.log(content);
const staffWrapper = document.querySelector("#staff");
const customersWrapper = document.querySelector("#customers");
const servicesAvailableWrapper = document.querySelector("#servicesAvailable");
let localQueueData = {};
let localServicesData = {};
const queueDataChanged = (newData, oldData) => {
	return JSON.stringify(newData) != JSON.stringify(oldData);
};

const staffUpdateRemainTime = () => {
	for (let staffMember of localQueueData.staff) {
		if (staffMember.serving.start > 0) {
			// calculate remaining time of appointment...
			console.log("CALCULATE REMAIN TIME FOR >>>>>>>", staffMember.name);
			let start = parseInt(staffMember.serving.start);
			let duration = parseInt(staffMember.serving.duration) * 60 * 1000;
			let end = start + duration;
			let now = new Date().getTime();
			let remainTime = end - now;
			let remainMinutes = Math.round(remainTime / 1000 / 60);

			//debugger

			document.querySelector(`#${staffMember.id}`).children[10].innerHTML = `REMAIN_MINUTES: ${remainMinutes}`;
		}
	}
}


const generateStaffTemplate = () => {
	 let staffTemplate = "<div class=\"staff__member %_STATUS_%\" id=\"%_ID_%\">";
	    staffTemplate += "<button class=\"staff--action-button\" onclick=\"serveCustomer(event)\">Serve</button>";
			staffTemplate += "<button class=\"staff--action-button\" onclick=\"serveCustomerComplete(event)\">Finish Serving</button>";

	    //staffTemplate += "<button class=\"staff--action-button\">%_STATUS_%</button>";
			staffTemplate += "<div class=\"staff__status\">id: %_ID_%</div>";
	    staffTemplate += "<div class=\"staff__name\">%_NAME_%</div>";
    	staffTemplate += "<div class=\"staff__status\">status: %_STATUS_%</div>";
    	staffTemplate += "<div class=\"staff__services\">services: %_SERVICES_%</div>";

			staffTemplate += "<div class=\"staff__status\">serving: %_SERVING_%</div>";
			staffTemplate += "<div class=\"staff__status\">service: %_SERVICE_%</div>";
			staffTemplate += "<div class=\"staff__status\">duration_minutes: %_DURATION_%</div>";
			staffTemplate += "<div class=\"staff__status\">start: %_START_%</div>";

			staffTemplate += "<div class=\"staff__status\">REMAIN_MINUTES:</div>";

    	staffTemplate += "</div>";
    return staffTemplate;
};
const generateCustomerTemplate = () => {
	 let customerTemplate = "<div class=\"customer %_STATUS_%\" ticket-ref=\"%_TICKET_REF_%\">";
	    customerTemplate += "<button class=\"customer--action-button customer--remove\">Remove</button>";
	    customerTemplate += "<div class=\"customer__ticket-ref\">%_TICKET_REF_%</div>";
			customerTemplate += "<div class=\"customer__name\">id: %_ID_%</div>";
	    customerTemplate += "<div class=\"customer__name\">%_NAME_%</div>";
			customerTemplate += "<div class=\"customer__name\">status: %_STATUS_%</div>";
	    customerTemplate += "<div class=\"customer__service\">Service: %_SERVICE_%</div>";
    	customerTemplate += "<div class=\"customer__wait-time\">Estimated wait time: %_WAIT_TIME_%</div>";
    	customerTemplate += "</div>";
    return customerTemplate;
};
const addStaffMemberToDOM = (staffMember) => {
	let staffTemplate = generateStaffTemplate();
		staffTemplate = staffTemplate.replace(/%_ID_%/g, staffMember.id);
    staffTemplate = staffTemplate.replace(/%_NAME_%/g, staffMember.name);
    staffTemplate = staffTemplate.replace(/%_STATUS_%/g, staffMember.status);
    staffTemplate = staffTemplate.replace(/%_SERVICES_%/g, staffMember.services);

    staffTemplate = staffTemplate.replace(/%_SERVING_%/g, staffMember.serving.name);
		staffTemplate = staffTemplate.replace(/%_SERVICE_%/g, staffMember.serving.service);
		staffTemplate = staffTemplate.replace(/%_DURATION_%/g, staffMember.serving.duration);
		staffTemplate = staffTemplate.replace(/%_START_%/g, staffMember.serving.start);

	staffWrapper.innerHTML += staffTemplate;
};
const addCustomerToDOM = (customer) => {
	let customerTemplate = generateCustomerTemplate();
		customerTemplate = customerTemplate.replace(/%_ID_%/g, customer.id);
    customerTemplate = customerTemplate.replace(/%_TICKET_REF_%/g, customer.ticketRef);
    customerTemplate = customerTemplate.replace(/%_NAME_%/g, customer.name);
    customerTemplate = customerTemplate.replace(/%_WAIT_TIME_%/g, customer.waitTime);
    customerTemplate = customerTemplate.replace(/%_SERVICE_%/g, customer.service);
		customerTemplate = customerTemplate.replace(/%_STATUS_%/g, customer.status);
	customersWrapper.innerHTML += customerTemplate;
};
const clearView = () => {
	staffWrapper.innerHTML = "";
	customersWrapper.innerHTML = "";
	servicesAvailableWrapper.innerHTML = "";
};
const getServices = () => {
	servicesGet("SOME_COMPANY_ID").then((servicesData) => {
		//console.log("servicesData", servicesData);
		localServicesData = JSON.parse(servicesData);
		console.log("localServicesData =>", localServicesData);
		//console.log(JSON.parse(servicesData));
	});
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

	let customerAddServiceRadioButtons = document.querySelectorAll("#customerAdd input[type=radio]");
	for (let radioButton of customerAddServiceRadioButtons) {
		radioButton.removeAttribute("hidden");
		radioButton.previousSibling.removeAttribute("hidden");
	}
	for (let radioButton of customerAddServiceRadioButtons) {
		if (localQueueData.services.indexOf(radioButton.value) == -1) {
			radioButton.setAttribute("hidden", true);
			radioButton.previousSibling.setAttribute("hidden", true);
		}
	}
};
const customerRemove = (ticketRef, queueId) => {
	customerDeleteFromQueue(ticketRef, queueId).then((queueData) => {
		console.log("queueData:", queueData);
		if (queueDataChanged(JSON.parse(queueData), localQueueData)) {
			// queue data is different! update view
			console.warn("QUEUE DATA CHANGED!");
			console.log("customerRemove():", JSON.parse(queueData));
			localQueueData["queues"] = JSON.parse(queueData);
			//buildView();
			getQueueById();
		}
	});
};

const serveCustomer = (e) => {
	// get the current queue...
	let queueId = localQueueData.id;
	let staffId = e.target.parentNode.getAttribute("id");
	let staffMember = localQueueData.staff.find((item) => {
		return item.id == staffId;
	});
	if (staffMember.status != "available") {
		alert("SORRY_THAT_STAFF_MEMBER_IS_BUSY");
		return;
	}
	let customerToServe = null;
	for (let customer of localQueueData.customers) {
		// serve the first customer that is waiting for a service associated with this staff member...
		if (staffMember.services.indexOf(customer.service) != -1) {
			//alert("you can serve " + customer.name);
			customerToServe = customer;
			break;
		}
	}

	if (customerToServe) {
		let start = new Date().getTime();
		customerServe(SELECTED_QUEUE.id, staffMember.id, customerToServe.id, customerToServe.name, customerToServe.service, localServicesData[customerToServe.service].duration, start).then((staffData) => {
			console.log("customerServe()", staffData);
			localQueueData.staff = JSON.parse(staffData).staff;
			getQueueById();
			pusherMock();
		});
	} else {
		alert(`THERE_ARE_NO_CUSTOMERS_THAT_${staffMember.name}_CAN_SERVE`);
	}
};

const serveCustomerComplete = (e) => {
	let queueId = localQueueData.id;
	let staffId = e.target.parentNode.getAttribute("id");
	let staffMember = localQueueData.staff.find((item) => {
		return item.id == staffId;
	});
	console.log(staffMember);

	let customerId = staffMember.serving.id;
	if (customerId) {
		let start = new Date().getTime();
		customerServeComplete(SELECTED_QUEUE.id, staffMember.id, customerId).then((staffData) => {
			console.log("customerServeComplete()", staffData);
			localQueueData.staff = JSON.parse(staffData).staff;
			getQueueById();
			pusherMock();
		});
	}
};

// const resetDatabase = () => {
// 	queueReset().then((queueData) => {
// 		console.warn("QUEUE DATA RESET!");
// 		localQueueData = JSON.parse(queueData);
// 		buildView();
// 	});
// };

const resetAllDatabases = () => {
	TOTAL_RESET().then((response) => {
		console.warn(response);
		getAllQueues();
		queueSelect.options[0].selected = true;
		getQueueById();
	});
};


const addCustomerToQueue = () => {

	if (!SELECTED_QUEUE) {
		alert("YOU DID NOT SELECT A QUEUE YET");
		return;
	}


	let formEl = document.querySelector("#customerAdd");
	let formData = new FormData(formEl);


	if (!formData.get("service")) {
		alert("YOU MUST SELECT A SERVICE");
		return;
	}

	if (localQueueData.services.indexOf(formData.get("service")) == -1) {
		alert("THAT SERVICE IS NOT AVAIALBLE IN THIS QUEUE");
		return;
	}

	formData.append("id", (Math.random() * 1000).toString());
	formData.append("status", "in_queue");
	formData.append("waitTime", "TODO");
	formData.append("ticketRef", Math.round(Math.random() * 1000));
	formData.append("queueId", document.querySelector("#queueSelect").value);

	customerAdd(formData).then((queueData) => {
		console.log("addCustomerToQueue()", queueData);
		getQueueById();
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
	if (services.length < 1) {
		alert("QUEUE_MUST_HAVE_AT_LEAST_1_SERVICE");
		return;
	}
	formData.append("services", services);

	console.log("services:", services);

	 queueCreate(formData).then((queueData) => {
		 console.log("createQueue()", JSON.parse(queueData));
		 localQueueData = JSON.parse(queueData);
		 getQueueById();
		 getAllQueues();
	 });
};


const getQueueById = (e) => {
	let id;
	if (e && e.target.nodeName == "BUTTON") {
		id = document.querySelector("#queueSelect").value;
	} else {
		id = SELECTED_QUEUE.id;
	}

	let queue = {};


	queueGetById(id).then((queueData) => {
		console.log("GET QUEUE BY ID", JSON.parse(queueData));

		let services = JSON.parse(queueData).services;
		queue.id = JSON.parse(queueData).id;
		queue.customers = JSON.parse(queueData).customers;
		queue.services = services;


		SELECTED_QUEUE = queue;

		console.log("services for selected queue", services);

		staffGetByServices(services).then((staffData) => {
			queue.staff = JSON.parse(staffData);
			console.log("staff get by services", queueData);

			console.log("NEW QUEUE OBJECT!", queue);

			localQueueData = queue;
			buildView();
			staffUpdateRemainTime();

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


// ===================================================
// get all queues and add them to dropdown list...
// ===================================================
const getAllQueues = () => {
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
		console.log("getAllQueues(): ", JSON.parse(queueData));
	});
};

// ------------------------------------------------------------------------------------------------------------

// INIT
getServices();
getAllQueues();

// PUSHER MOCK
const pusherMock = () => {
	getQueueById();
	staffUpdateRemainTime();

}
setInterval(function(){
	pusherMock();
}, 5000);



// queueCreate(['tire_fit', 'mot']).then((queueData) => {
// 	console.log(queueData);
// });

// queueDelete().then((queueData) => {
// 	console.log(queueData);
// });

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

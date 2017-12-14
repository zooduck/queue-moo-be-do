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

const queuesGetAll = () => {
	return $http("GET", "api.php?endpoint=QUEUES_GET_ALL");
};

const createDiv = (inner_html, class_list="") => {
  let div = document.createElement("DIV");
  div.innerHTML = inner_html;
  if (class_list) {
    div.classList.add(class_list);
  }
  return div;
};


const getAllQueues = () => {
	queuesGetAll().then((queueData) => {
		let allQueues = JSON.parse(queueData).queues;
    const beingSeenWrapper = document.querySelector("#beingSeen");
    const inQueueWrapper = document.querySelector("#inQueue");
    beingSeenWrapper.innerHTML = "";
    inQueueWrapper.innerHTML = "";
		for (let queue of allQueues) {
      let headerA = createDiv(queue.id, "header");
      let headerB = createDiv(queue.id, "header");
      beingSeenWrapper.appendChild(headerA);
      inQueueWrapper.appendChild(headerB);
      for (let customer of queue.customers) {
        let div = createDiv(customer.ticketRef);
        if (customer.status == "being_seen") {
          beingSeenWrapper.appendChild(div);
        } else {
          inQueueWrapper.appendChild(div);
        }
      }

		}
		console.log("getAllQueues(): ", JSON.parse(queueData));
	});
};


getAllQueues();

const pusherMock = () => {
  console.warn("pusher mock...");
  getAllQueues();
};

setInterval(function(){
  pusherMock();
}, 2500);

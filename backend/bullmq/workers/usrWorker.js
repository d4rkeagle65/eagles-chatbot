const { Worker } = require("bullmq");
const path = require("path");

const usrProcPath = path.join(__dirname, "..", "processors", "usrProcessor.js");

let worker;

const setUp_usrWorker = (connection) => {
	worker = new Worker("usrQueue", usrProcPath, {
		connection: connection,
		autorun: true,
		removeOnComplete: { count: 10 }
	});

	worker.on("active", (job) => {
		console.debug("[" + job.id + "] Started usrWorker Job");
	});
	
	worker.on("progress", (job, progressValue) => {
		//console.debug("[" + job.id + "]" + progressValue);
		job.log(progressValue);
	});

	worker.on("completed", (job, returnValue) => {
		console.debug("[" + job.id + "] Completed usrWorker Job: ", returnValue);
	});

	worker.on("error", (failedReason) => {
		console.error("[" + job.id + "] Errors w/ usrWorker Job: ", failedReason);
	});
}

module.exports = setUp_usrWorker;

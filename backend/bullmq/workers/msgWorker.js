const { Worker } = require("bullmq");
const path = require("path");

const msgProcPath = path.join(__dirname, "..", "processors", "msgProcessor.js");

let worker;

const setUp_msgWorker = (connection) => {
	worker = new Worker("msgQueue", msgProcPath, {
		connection: connection,
		autorun: true,
		removeOnComplete: { count: 100 }
	});

	worker.on("active", (job) => {
		console.debug("[" + job.id + "] msgWorker Started Job");
	});
	
	worker.on("progress", (job, progressValue) => {
		console.debug("[" + job.id + "]" + progressValue);
		job.log(progressValue);
	});

	worker.on("completed", (job, returnValue) => {
		console.debug("[" + job.id + "] Completed msgWorker Job: ", returnValue);
	});

	worker.on("error", (failedReason) => {
		console.error("[" + job.id + "] Errors w/ msgWorker Job: ", failedReason);
	});
}

module.exports = setUp_msgWorker;

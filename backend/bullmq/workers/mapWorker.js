const { Worker } = require("bullmq");
const path = require("path");

const mapProcPath = path.join(__dirname, "..", "processors", "mapProcessor.js");

let worker;

const setUp_mapWorker = (connection) => {
	worker = new Worker("mapQueue", mapProcPath, {
		connection: connection,
		autorun: true,
		removeOnComplete: { count: 10 }
	});

	worker.on("active", (job) => {
		console.debug("[" + job.id + "] Started mapWorker Job");
	});
	
	worker.on("progress", (job, progressValue) => {
		console.debug("[" + job.id + "]" + progressValue);
		job.log(progressValue);
	});

	worker.on("completed", (job, returnValue) => {
		console.debug("[" + job.id + "] Completed mapWorker Job: ", returnValue);
	});

	worker.on("error", (failedReason) => {
		console.error("[" + job.id + "] Errors w/ mapWorker Job: ", failedReason);
	});
}

module.exports = setUp_mapWorker;

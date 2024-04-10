const path = require("path");

const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const ch = require(path.join(__dirname, "..", "..", "handler", "chatHandler.js"));

process.on("uncaughtException", err => {
	console.log(err);
});

const msgProcessor = async (job) => {
	return new Promise(async resolve => {
		await job.log("Started msgProcessor Job");
		await ch.chatHandler(job).then(async data => { 
			resolve(job.log("Completed msgProcessor Job"));
		});
	});
}

module.exports = msgProcessor;

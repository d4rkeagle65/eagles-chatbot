const path = require("path");

const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const uh = require(path.join(__dirname, "..", "..", "handler", "usrHandler.js"));

process.on("uncaughtException", err => {
	console.log(err);
});

const usrProcessor = async (job) => {
	return new Promise(async resolve => {
		await job.log("Started usrProcessor Job");
		await uh.usrHandler(job).then(async data => { 
			resolve(job.log("Completed usrProcessor Job"));
		});
	});
}

module.exports = usrProcessor;

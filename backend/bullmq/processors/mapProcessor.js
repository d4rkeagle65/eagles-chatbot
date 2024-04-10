const path = require("path");

const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const map = require(path.join(__dirname, "..", "..", "handler", "mapHandler.js"));

process.on("uncaughtException", err => {
	console.log(err);
});

const mapProcessor = async (job) => {
	return new Promise(async resolve => {
		await job.log("Started mapProcessor Job");
		await map.mapHandler(job).then(async data => { 
			resolve(job.log("Completed mapProcessor Job"));
		});
	});
}

module.exports = mapProcessor;

const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const dbbsr = require(path.join(__dirname, "..", "database", "db_bsr.js"));
const addJob_mapQueue = require(path.join(__dirname, "..", "bullmq", "queues", "mapQueue.js"));

async function addMap_bsData(job,bsr_code) {
	return new Promise(resolve => {
		console.log("Test");
	});
}

module.exports = {
	addMap_bsData: addMap_bsData,
};

const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const setUp_usrWorker = require(path.join(__dirname, "..", "workers", "usrWorker.js"));

const connection = new IORedis(process.env.REDDISURL, { maxRetriesPerRequest: null });

const usrQueue = new Queue("usrQueue", { connection, removeOnComplete: true, removeOnFail: 100 });
usrQueue.setMaxListeners(usrQueue.getMaxListeners() + 100);

setUp_usrWorker(connection);

const addJob_usrQueue = (data) => {
	return usrQueue.add(data.jobName, data);
}

module.exports = addJob_usrQueue;

const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const setUp_msgWorker = require(path.join(__dirname, "..", "workers", "msgWorker.js"));

const connection = new IORedis(process.env.REDDISURL, { maxRetriesPerRequest: null });

const msgQueue = new Queue("msgQueue", { connection, removeOnComplete: 100, removeOnFail: 100 });
msgQueue.setMaxListeners(msgQueue.getMaxListeners() + 100);

setUp_msgWorker(connection);

const addJob_msgQueue = (data) => {
	return msgQueue.add(data.jobName, data);
}

module.exports = addJob_msgQueue;

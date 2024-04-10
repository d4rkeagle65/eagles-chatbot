const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const setUp_mapWorker = require(path.join(__dirname, "..", "workers", "mapWorker.js"));

const connection = new IORedis(process.env.REDDISURL, { maxRetriesPerRequest: null });

const mapQueue = new Queue("mapQueue", { connection, removeOnComplete: true, removeOnFail: 100 });
mapQueue.setMaxListeners(mapQueue.getMaxListeners() + 100);

setUp_mapWorker(connection);

const addJob_mapQueue = (data) => {
	return mapQueue.add(data.jobName, data);
}

module.exports = addJob_mapQueue;

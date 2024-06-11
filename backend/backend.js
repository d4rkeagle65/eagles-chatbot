const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { Chat, ChatEvents } = require("twitch-js");
const https = require("https");
const pg = require("pg");

const db = require(path.join(__dirname, "database", "db.js"));

const username = process.env.USERNAME;
const token = process.env.TOKEN;
const channel = process.env.CHANNEL;

const addJob_msgQueue = require(path.join(__dirname, "bullmq", "queues", "msgQueue.js"));
const addJob_usrQueue = require(path.join(__dirname, "bullmq", "queues", "usrQueue.js"));
const addJob_mapQueue = require(path.join(__dirname, "bullmq", "queues", "mapQueue.js"));

const run = async () => {
	const chat = new Chat({ username, token, log: { legel: "warn"} });
	await chat.connect();
	await chat.join(channel);
	
	const dblclient = new pg.Client(db.conStr);
	dblclient.connect();
	dblclient.query("LISTEN new_bsractive");

	chat.on('PRIVMSG', (msg) => { onMessage(msg) });
	chat.on('JOIN', (msg) => { onUser_join(msg) });
	chat.on('PART', (msg) => { onUser_part(msg) });
	chat.on('ERROR', (msg) => { process.exit(1) });

	dblclient.on('notification', (msg) => { onDB_newActive(msg) });
}

run();

async function onMessage(msg) {
	if (msg.isSelf === false) {
		addJob_usrQueue({ jobName:"usrUpdate", msg});
		addJob_msgQueue({ jobName:"msgJob", msg});
	}
}

async function onUser_join(msg) {
	addJob_usrQueue({ jobName:"usrJoin", msg});
}

async function onUser_part(msg) {
	addJob_usrQueue({ jobName:"usrPart", msg});
}

async function onDB_newActive(msg) {
	addJob_mapQueue({ jobName:"mapInfo", msg});
}

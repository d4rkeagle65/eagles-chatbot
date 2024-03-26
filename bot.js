const dotenv = require("dotenv").config();

const { Chat, ChatEvents } = require("twitch-js");
const https = require("https");

const dbuser = require("./database/db_user");
const ch = require("./chatHandler");

const username = process.env.USERNAME;
const token = process.env.TOKEN;
const channel = process.env.CHANNEL;

const run = async () => {
	const chat = new Chat({ username, token });
	await chat.connect();
	await chat.join(channel);
	
	chat.on('PRIVMSG', (msg) => { onMessage(msg,chat) });
	chat.on('JOIN', (msg) => { onUser_join(msg) });
	chat.on('PART', (msg) => { onUser_part(msg) });
}

run();

async function onMessage(msg,chat) {
	await dbuser.updateUser(msg.username,msg.tags.badges);
	await ch.chatHandler(msg);
}

async function onUser_join(msg) {
	await dbuser.joinUser(msg.username);
}

async function onUser_part(msg) {
	await dbuser.partUser(msg.username);
}



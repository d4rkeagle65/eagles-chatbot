const path = require("path");
const bs = require(path.join(__dirname, "bsHandler.js"));
const dbusr = require(path.join(__dirname, "..", "database", "db_usr.js"));

let bsChatUser = process.env.BSCHATUSER;

if (!bsChatUser) {
	bsChatUser = process.env.CHANNEL;
}

async function chatHandler(job) {
	msg = job.data.msg;
	let breakPromise = 0;
	
	return new Promise(async resolve => {

		// !bsr, !modadd, and !att Commands to Add Maps to Queue
		if (msg.message.match(/^\!(bsr\s|modadd\s|att\s)([a-zA-Z0-9]+)(\s.*)?$/)) {
			if (msg.message.match(/\!bsr\s/)) {
				job.updateProgress("[BOT][MP] !bsr Command Detected");
				resolve(bs.addMap_pQueue(job, false));
			}
			if (msg.tags.isModerator === true || msg.tags.badges.broadcaster === true) {
				if (msg.message.match(/\!modadd\s/)) {
					job.updateProgress("[BOT][MP] !modadd Command Detected, Forcing if Queue Closed");
					resolve(bs.addMap_pQueue(job, false, true));
				} else if (msg.message.match(/\!att\s/)) {
					job.updateProgress("[BOT][MP] !att Command Detected, Forcing if Queue Closed");
					resolve(bs.addMap_pQueue(job, true, true));
				}
			}
		} else { breakPromise++; }

		// Commands Specific for Moderator or Higher Roles
		if (msg.tags.isModerator === true || msg.tags.badges.broadcaster === true) {

			// Command to Reset Pending and Active Queues
			if (msg.message.includes("!cbresetqueue")) {
				resolve(bs.resetBSP_queues(job));

			// Command to Reset User Queue
			} else if (msg.message.includes("!cbresetuser")) {
				resolve(dbusr.reset_userList(job));

			// !cbremove [BSR Code]
			} else if (msg.message.includes("!cbremove")) {
				resolve(bs.removeMap_aQueue(job));
			
			// Command to Open Queue for CB if Not Auto
			} else if (msg.message.includes("!cbopen")) {
				resolve(bs.setBSP_queueState(job,"open"));

			// Command to Close Queue for CB if Not AUto
			} else if (msg.message.includes("!cbclose")) {
				resolve(bs.setBSP_queueState(job,"closed"));

			// !cbinsertmap [BSR Code] [Username] [Position] [Note]
			} else if (msg.message.includes("!cbinsertmap")) {
				resolve(bs.insertMap_aQueue(job));
			} else {
				breakPromise++;
			}
		} else { breakPromise++; }

		// Handles Responses from BS+ User
		if (msg.username === bsChatUser) {
			resolve(bs.bsChatUser_responses(job));
		} else { breakPromise++; }

		if (breakPromise === 3) {
			resolve();
		}
	});
}

module.exports = {
	chatHandler: chatHandler
};

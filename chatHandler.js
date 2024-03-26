const dotenv = require("dotenv").config();

const { Chat, ChatEvents } = require("twitch-js");
const dbuser = require("./database/db_user");
const bs = require("./bsHandler");

const bsChatUser = process.env.BSCHATUSER;
const channel = process.env.CHANNEL;

async function chatHandler(msg, chat) {
	return new Promise(resolve => {
		// !lurk Command to Set User Status
		if (msg.message.includes("!lurk")) {
			dbuser.lurkUser(msg.username);
		}
	
		// !bsr, !modadd, !mtt and !att Commands to Add Songs to Queue
		if (msg.message.match(/^\!(bsr|modadd|att|mtt)\s(.*?)(\s.*)?$/)) {
			if (msg.message.includes("!bsr")) {
				bs.addSong_pendingQueue(msg, false);
			}
			if (msg.tags.isModerator === true || msg.tags.badges.broadcaster === true) {
				// Both !modadd and !att need the song added to the pending queue first.
				if (msg.message.includes("!modadd")) {
					bs.addSong_pendingQueue(msg, false);
				} else if (msg.message.includes("!att")) {
					bs.addSong_pendingQueue(msg, true);
				} else if (msg.message.includes("!mtt")) {
					bs.moveSong(msg,1);
				}
			}
		}

		// Commands only runnable by mods and the broadcaster
		if (msg.tags.isModerator === true || msg.tags.badges.broadcaster === true) {
			if (msg.message.includes("!cbresetqueue")) {
				bs.resetQueues();
			}
			if (msg.message.includes("!cbresetuser")) {
				bs.reset_userList();
			}
			// Removes a song from the queue.
			// Syntax "!cbremove [BSR]"
			if (msg.message.includes("!cbremove")) {
				bs.removeSong_activeQueue_byMsg(msg);
			}
			if (msg.message.includes("!cbopen")) {
				bs.setQueue("open");
			}
			if (msg.message.includes("!cbclose")) {
				bs.setQueue("closed");
			}
			// Manually adds song to queue at optional position.
			// Syntax "!cbinsertsong [BSR] [RequesterUsername] [QueuePosition]
			if (msg.message.includes("!cbinsertsong")) {
				bs.manual_addSong(msg);
			}
			// Skip the top number of songs in queue
			// Syntax "!cbskip [num]
			if (msg.message.includes("!cbskip")) {
				bs.skipSong(msg);
			}
		}

		// Chat reponses from the user defined for BS+ responses
		if (msg.username === bsChatUser) {
			bs.bsChatUser_responses(msg);
		}

		resolve();
	});
}

module.exports = {
	chatHandler: chatHandler	
}

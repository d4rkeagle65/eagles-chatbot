const dotenv = require("dotenv").config()

const { Chat, ChatEvents } = require("twitch-js");
const { pool } = require("./db");
const https = require('https');
const _ = require('lodash');

const username = process.env.USERNAME;
const token = process.env.TOKEN;
const channel = process.env.CHANNEL;

const run = async () => {
	const chat = new Chat({
		username,
		token
	});

	await chatConnect(chat);
	await chat.join(channel);
	
	chat.on('JOIN', (message) => {
		insertUserlist(message.username);
	});

	chat.on('PART', (message) => {
		removeUserlist(message.username);
	});

	chat.on('PRIVMSG', (message) => {

		if (message.message.includes("!lurk")) {
			userLurk(message.username);
		}
		
		// Add bsr,modadd Request to Pending Queue
		if (message.message.match(/^\!(bsr|modadd|att|mtt|remove)\s(.*?)(\s.*)?$/)) {
			bsr_match = (message.message.match(/^\!(.*?)\s\@?(.*?)(\s.*)?$/));
			if (message.message.includes("!bsr") || message.message.includes("!modadd")) {
				insertBsrPending(bsr_match[2],message.username.toLowerCase(),bsr_match[3],false);
			}
			if (message.tags.isModerator === true || message.tags.badges.broadcaster === true) {
				if (message.message.includes("!att")) {
					insertBsrPending(bsr_match[2],message.username.toLowerCase(),bsr_match[3],true);
				}
				if (message.message.includes("!mtt")) {
					moveBsrQueueTop(bsr_match[2],message.username.toLowerCase());	
				}
			}
		}


		if (message.tags.isModerator === true || message.tags.badges.broadcaster === true) {
			if (message.message.includes("!resetcbqueue")) {
				resetCBQueue();
				resetCBPendingQueue();
			}
			if (message.message.includes("!resetcbuser")) {
				resetCBUserlist();
			}
			if (message.message.includes("!cbremove")) {
				bsr_match = (message.message.match(/^\!(.*?)\s(.*?)(\s.*)?$/));
				removeBsrQueue(bsr_match[2].toLowerCase());
			}
			if (message.message.includes("!cbskip")) {
				bsr_match = (message.message.match(/^\!(.*?)\s(.*?)(\s.*)?$/));
				console.log("bsrskip");
				bsrSkip(bsr_match[2].toLowerCase());
			}
		}

		// These only come from the BS+ User
		if (message.username === process.env.BSCHATUSER) {
			// If BS+ Adds to Queue, Remove from Pending and add to Active Queue
			if (message.message.includes("added to queue")) {
				bsr_match = (message.message.match(/^(\!\s)(\@.*?)?\(bsr\s(.*?)\)\s(.*?)\s\/\s(.*?)\s(.*\%)\srequested\sby\s\@?(.*?)\sadded\sto\squeue\.?$/));
				movePendingToActive(bsr_match[3],bsr_match[7].toLowerCase());
			}
			if (message.message.includes("is now on top of queue")) {
				bsr_match = (message.message.match(/^(\!\s)(\@.*?)?\(bsr\s(.*?)\)\s(.*?)\s\/\s(.*?)\s(.*\%\s)?requested\sby\s\@?(.*?)\sis\snow\son\stop\sof\squeue(\.|\!)?$/));
				movePendingToActive(bsr_match[3],bsr_match[7].toLowerCase());
			}

			// If BS+ reports a reason for failure, remove from pending.
			const bsrFailMsgs = [
				'you are not allowed to make requests',
			   	'the queue is closed',
			   	'is blacklisted',
			   	'is already in queue',
			   	'you already have',
			   	'this song was already requested this session',
			   	'maps are not allowed',
				'this song has no difficulty',
				'this song rating is too low',
				'song is too long'
			];
			const bsrFailMsgsMatch = bsrFailMsgs.filter(str => message.message.includes(str));
			if (bsrFailMsgsMatch.length > 0) {
				bsr_match = (message.message.match(/\!\s\@(.*?)\s(.*)$/));
				removeBsrPending(bsr_match[1].toLowerCase());
			}
			
			// When next song remove from active queue.
			if (message.message.match(/^(\!\s)?(.*?)\s\/\s(.*?)\s\d+\%\s\(bsr\s(.*?)\)\srequested\sby\s(.*?)\sis\snext\!$/)) {
				bsr_match = (message.message.match(/^(\!\s)?(.*?)\s\/\s(.*?)\s\d+\%\s\(bsr\s(.*?)\)\srequested\sby\s(.*?)\sis\snext\!$/));
				removeBsrQueue(bsr_match[4]);
			}

			// When remove command is used successfully.
			if (message.message.match(/^(\!\s)?(\@(.*?)\s)?\(bsr\s(.*?)\)\s(.*?)\s\/\s(.*?)\s(.*\%\s)?(request\sby\s\@?(.*?)\s)?is\sremoved\sfrom\squeue(\.|\!)?$/)) {
				bsr_match = (message.message.match(/^(\!\s)?(\@(.*?)\s)?\(bsr\s(.*?)\)\s(.*?)\s\/\s(.*?)\s(.*\%\s)?(request\sby\s\@?(.*?)\s)?is\sremoved\sfrom\squeue(\.|\!)?$/));
				removeBsrQueue(bsr_match[4]);
			}
		}
		
		updateUserlist(message);
	});
};

async function chatConnect(chat) {
	await chat.connect();
}

async function updateUserlist(message) {
	queryUserlistByUser(message.username, async function(userResp){
		if (userResp.rowCount > 0) {
			const res = await pool.query("UPDATE userlist SET user_lastactivets = current_timestamp WHERE user_username = $1", [ message.username ]);
			if (userResp.rows[0].user_type === "unknown" || userResp.rows[0].user_type === "") {
				if (message.tags.badges.moderator === true) {
					const typ = await pool.query("UPDATE userlist SET user_type = $2 WHERE user_username = $1", [ message.username, "moderator" ]);
				} else if (message.tags.badges.vip === true) {
					const typ = await pool.query("UPDATE userlist SET user_type = $2 WHERE user_username = $1", [ message.username, "vip" ]);
				} else if (message.tags.badges.broadcaster === true) {
					const typ = await pool.query("UPDATE userlist SET user_type = $2 WHERE user_username = $1", [ message.username, "broadcaster" ]);
				} else if (message.tags.badges.subscriber > 0) {
					const typ = await pool.query("UPDATE userlist SET user_type = $2 WHERE user_username = $1", [ message.username, "subscriber" ]);
				} else {
					const typ = await pool.query("UPDATE userlist SET user_type = $2 WHERE user_username = $1", [ message.username, "viewer" ]);
				}
			}

			if (userResp.rows[0].user_lurk === true) {
				const lur = await pool.query("UPDATE userlist SET user_lurk = false WHERE user_username = $1", [ message.username ]);
			}
		} else {
			insertUserlist(message.username);
		}
	});
}

async function userLurk (user_username) {
	queryUserlistByUser(user_username, async function(userResp){
		if (userResp.rowCount > 0) {
			const res = await pool.query("UPDATE userlist SET user_lurk = true WHERE user_username = $1", [ user_username ]);
		}
	});
}

async function resetCBUserlist() {
	console.log("[BOT] Resetting the Chatbot User Queue Database");
	const res = await pool.query("DELETE FROM userlist");
}

async function resetCBQueue() {
	console.log("[BOT] Resetting the Chatbot Queue Database");
	const res = await pool.query("DELETE FROM bsrqueue");
}

async function resetCBPendingQueue() {
	console.log("[BOT] Resetting the Chatbot Pending Database");
	const res = await pool.query("DELETE FROM bsrpending");
}

async function insertUserlist(user_username) {
	queryUserlistByUser(user_username, async function(userResp){
		if (userResp.rowCount === 0) {
			console.log("[BOT] User Joined Username:[" + user_username + "]");
			const res = await pool.query("INSERT INTO userlist (user_username,user_joints,user_type,user_lurk) VALUES ($1, current_timestamp,$2,false)",[ user_username, "unknown" ]);
		}
	});
}

async function removeUserlist(user_username) {
	console.log("[BOT] User Left Username:[" + user_username + "]");
	const res = await pool.query("DELETE FROM userlist WHERE user_username = $1",[ user_username ]);
}

async function insertBsrPending(bsr_code,bsr_req,bsr_note,req_att) {
	console.log("[BOT] Adding To Pending Queue Code:[" + bsr_code + "]-Req:[" + bsr_req + "]-Note:[" + bsr_note + "]");
	const res = await pool.query("INSERT INTO bsrpending (bsr_code, bsr_req, bsr_ts, bsr_note, req_att) VALUES ($1, $2, current_timestamp, $3, $4)",[bsr_code,bsr_req,bsr_note,req_att]);
}

async function insertBsrQueue(bsr_count,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note) {
	bsr_count = bsr_count + 1;
	console.log("[BOT] Adding To Active Queue Code:[" + bsr_code + "]-Count:[" + bsr_count + "]-Length:[" + bsr_length + "]-Req:[" + bsr_req + "]-Note:[" + bsr_note + "]");
	const res = await pool.query("INSERT INTO bsrqueue (req_order, bsr_code, bsr_req, bsr_name, bsr_ts, bsr_length, bsr_note) VALUES ($1, $2, $3, $4, $5, $6, $7)",	
		[bsr_count,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note]);
}

async function moveBsrQueueTop(bsr_code,mtt_req) {
	console.log("[BOT] Moving To Top of Active Queue Identifier:[" + bsr_code + "]-ModRan:[" + mtt_req + "]");
	queryBsrQueueByCode( bsr_code, async function(code_return){
		if (code_return.rowCount > 0) {
			const res = await pool.query(" UPDATE bsrqueue SET req_order = req_order + 1 WHERE req_order > 0 AND bsr_code != '" + bsr_code + "';");
			const mov = await pool.query(" UPDATE bsrqueue SET req_order = 1 WHERE bsr_code = '" + bsr_code + "';"); 
		} else {
			queryBsrQueueByUsername( bsr_code, async function(user_return) {
				if(user_return.rowCount > 0) {
					const res = await pool.query(" UPDATE bsrqueue SET req_order = req_order + 1 WHERE req_order > 0 AND bsr_code != '" + user_return.rows[0].bsr_code + "';");
					const mov = await pool.query(" UPDATE bsrqueue SET req_order = 1 WHERE bsr_code = '" + user_return.rows[0].bsr_code + "';"); 		
				} else {
					console.log("[BOT] Cannot Find Song With Identifier:[" + bsr_code + "]");
				}
			});
		}
	});
}

async function insertBsrQueueTop(bsr_count,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note) {
	console.log("[BOT] Adding To Top of Active Queue Code:[" + bsr_code + "]-Count:[" + bsr_count + "]-Length:[" + bsr_length + "]-Req:[" + bsr_req + "]-Note:[" + bsr_note + "]");
	const res = await pool.query("UPDATE bsrqueue SET req_order = req_order + 1 WHERE req_order > 0;");
	const mov = await pool.query("INSERT INTO bsrqueue (req_order, bsr_code, bsr_req, bsr_name, bsr_ts, bsr_length, bsr_note) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		[1,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note]);
}

async function getBsrQueueLength(callback) {
	const res = await pool.query("SELECT * FROM bsrqueue");
	callback(res.rowCount);
}

async function getBsrPending(bsr_code, callback) {
	const res = await pool.query("SELECT * FROM bsrpending WHERE bsr_code = $1",[bsr_code]);
	callback(res.rows[0]);
}

async function movePendingToActive(bsr_code,bsr_req) {
	console.log("[BOT] Moving from Pending to Active Code:[" + bsr_code + "]-Req:[" + bsr_req + "]");
	getBsrPending(bsr_code, function(pQueue){
		if (typeof pQueue !== 'undefined' && pQueue !== null) {
			getMapInfo(bsr_code, function(response){
				var mapData = JSON.parse(response)
				bsr_name = mapData.name;
				bsr_ts = pQueue.bsr_ts;
				bsr_length = mapData.metadata.duration;
				bsr_note = pQueue.bsr_note;
				getBsrQueueLength( function(bsr_count){
					removeBsrPending(bsr_req);
					if (pQueue.req_att === true) {
						insertBsrQueueTop(bsr_count,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note);
					} else {
						insertBsrQueue(bsr_count,bsr_code,bsr_req,bsr_name,bsr_ts,bsr_length,bsr_note);
					}
				});
			});
		} else {
			console.log("[BOT] Map with bsr code of [" + bsr_code + "] not found in pending queue.");
		}
	});
}

async function getMapInfo(bsr_code, callback) {
	console.log("[BOT] Getting Map Info from BeatSaver API Code:[" + bsr_code + "]");
	const options = {
		hostname: 'api.beatsaver.com',
		path: '/maps/id/' + bsr_code,
		port: 443,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	const getPosts = () => {
		let data = '';
		const request = https.request(options, (response) => {
			response.setEncoding('utf8');
			response.on('data', (chunk) => {
				data += chunk;
			});
			response.on('end', () => {
				callback(data);
			});
		});

		request.on('error', (error) => {
			console.error(error);
		});

		request.end();
	};
	
	getPosts();
}

async function queryUserlistByUser(user_username, callback) {
	const res = await pool.query("SELECT * FROM userlist WHERE user_username = $1", [ user_username ]);
	callback( res );
}

async function queryBsrQueueByCode(bsr_code, callback) {
	const res = await pool.query("SELECT * FROM bsrqueue WHERE bsr_code = $1", [ bsr_code ]);
	callback( res );
}

async function queryBsrQueueByUsername(bsr_req, callback) {
	const res = await pool.query("SELECT * FROM bsrqueue WHERE bsr_req = $1 ORDER BY req_order DESC", [ bsr_req ]);
	callback( res );
}

async function removeBsrPending(bsr_req) {
	console.log("[BOT] Removing from Pending Queue Code:[" + bsr_req + "]");
	const res = await pool.query("DELETE FROM bsrpending WHERE bsr_req = $1", [ bsr_req ]); 
}

async function removeBsrQueue(bsr_code) {
	console.log("before queryBsrQueueByCode:[" + bsr_code + "]");
	queryBsrQueueByCode ( bsr_code, async function(by_code){
		if (by_code.rowCount > 0) {
			req_order = by_code.rows[0].req_order;
			console.log("[BOT] Removing from Active Queue Code:[" + bsr_code + "]");
			const res = await pool.query("DELETE FROM bsrqueue WHERE bsr_code = $1", [ bsr_code ]);
			console.log("[BOT] Rebasing the order from req_order:[" + [ req_order ] + "]");
			const upd = await pool.query("UPDATE bsrqueue SET req_order = req_order - 1 WHERE req_order > $1", [ req_order ]);
		}
	});
}

async function removeBsrQueueByUser(bsr_req) {
	console.log("[BOT] Removing from Active Queue User:[" + bsr_req + "]");
	const res = await pool.query("DELETE FROM bsrqueue WHERE bsr_req = $1", [ bsr_req ]);
}

async function removeLastSongByUser(bsr_req) {
	queryBsrQueueByUsername(bsr_req, async function(user_return){
		if (user_return.rowCount > 0) {
			bsr_code = user_return.rows[0].bsr_code;
			const rem = await pool.query("DELETE FROM bsrqueue WHERE bsr_req = $1", [ bsr_code ]);
			const res = await pool.query("UPDATE bsrqueue SET req_order = req_order + 1 WHERE req_order > 0 AND bsr_code != '" + user_return.rows[0].bsr_code + "';");
		}
	});
}

async function getTopQueue(count, callback) {
	console.log("getTopQueue count:[" + count + "]");
	const res = await pool.query("SELECT * FROM bsrqueue ORDER BY req_order ASC FETCH FIRST " + count + " ROWS ONLY");
	console.log(res);
	callback(res);
}

async function bsrSkip(count) {
	console.log("before for loop");
	for ( let i = 0; i < count; i++){
		console.log("before getTopQueue:[" + i + "]");
		getTopQueue(i+1, async function(topRow){
			console.log("before if:[" + i + "]");
			if (topRow.rowCount > 0) {
				console.log("before removeBsrQueue:[" + i + "]");
				const result = await removeBsrQueue(topRow.rows[0].bsr_code);
			}
		});
	}
}

run();

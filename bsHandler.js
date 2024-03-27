const dbbsr = require("./database/db_bsr");
const https = require("https");

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

async function setQueue(queue_status) {
	return new Promise(async resolve => {
		if (queue_status === "open") {
			check_queueState( async function(state) {
				if (! state) {
					console.log("[BOT] Queue is now open");	
					await dbbsr.openQueue();
				}
				resolve();
			});
		} else if (queue_status === "closed") {
			console.log("[BOT] Queue is now closed");
			await dbbsr.closeQueue();
			resolve();
		}
	});
}

async function check_queueState(callback) {
	dbbsr.get_queueState(async function(queue_state) {
		if (queue_state === "open") {
			callback(true);
		} else {
			callback(false);
		}
	});
}

async function get_mapInfo(bsr_code, callback) {
	get_mapInfo_beatSaver(bsr_code, async function(mapInfo) {
		callback(mapInfo);
	});
}

async function get_mapInfo_beatSaver(bsr_code, callback) {
	console.log("[BOT] Getting Map Info from BeatSaver API Code:[" + bsr_code + "]");
	const options = {
		hostname: "api.beatsaver.com",
		path: "/maps/id/" + bsr_code,
		port: 443,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	const getPosts = () => {
		let data = "";
		const request = https.request(options, (response) => {
			response.setEncoding("utf8");
			response.on("data", (chunk) => {
				data += chunk;
			});
			response.on("end", () => {
				callback(data);
			});
		});

		request.on("error", (error) => {
			console.error(error);
		});

		request.end();
	};

	getPosts();
}

async function resetQueues() {
	console.log("[BOT] Clearing Active Queue");
	dbbsr.reset_activeQueue();
	console.log("[BOT] Clearing Pending Queue");
	dbbsr.reset_pendingQueue();
}

async function reset_userList() {
	console.log("[BOT] Clearing Userlist");
	dbbsr.reset_userList();
}

async function get_bsrCode(msg, callback) {
	let bsr_code = "";
	if (typeof msg === "object") {
		if (msg.message.includes("(bsr")) {
			bsr_match = (msg.message.match(/(.*?)\(bsr\s(.*?)\)/));
			bsr_code = bsr_match[2];
		} else if (msg.message.match(/^\!(.*?)\s(\w+)(\s.*)?$/)) {
			bsr_match = (msg.message.match(/^\!(.*?)\s(\w+)(\s.*)?$/));
			bsr_code = bsr_match[2];
		} else if (msg.message.match(/^.*?(\@(.*?)).*?$/)) {
			get_requester_fromResponse(msg, async function(requester) {
				dbbsr.getActive_byUser(requester, async function(aResponse) {
					if (aResponse.rowCount > 0) {
						bsr_code = aResponse.rows[0].bsr_code;
					}
				});
			});
		} 
	} else {
		bsr_match = (msg.match(/((.*))/));
		bsr_code = bsr_match[2];
	}
	
	callback ( bsr_code );
}

async function get_requester_fromResponse(msg, callback) {
	if (msg.message.includes("requested by")) {
		response_match = (msg.message.match(/.*?requested\sby\s(.*?)\sadded/));
		requester = response_match[1].toLowerCase();
	} else if (msg.message.match(/^\!\s\@(.*?)\s/)) {
		response_match = (msg.message.match(/^\!\s\@(.*?)\s/));
		requester = response_match[1].toLowerCase();
	} else {
		response_match = (msg.message.match(/\s\@(.*?)(\s|$)/));
		requester = response_match[1].toLowerCase();
	}
	callback( requester );
}

async function get_bsrMsg(msg, callback) {
	code_match = (msg.message.match(/^\!(.*?)\s(\w+)(\s.*)?$/));
	if (code_match[3]) { 
		bsr_msg = code_match[3].trim();
	} else {
		bsr_msg = ""
	}
	callback( bsr_msg );
}

async function addSong_pendingQueue(msg, bsr_att) {
	return new Promise(resolve => {
		check_queueState(async function(state) {
			if (state) {
				get_bsrCode(msg, async function(bsr_code) {
					if (bsr_code != "") {
						get_bsrMsg(msg, async function(bsr_msg) {
							dbbsr.addPending(bsr_code,msg.username.toLowerCase(),bsr_msg,bsr_att);
						});
					}
				});
			}
		});
		resolve();
	});
}

async function removeSong_pendingQueue_byRequester(msg) {
	get_requester_fromResponse(msg, async function(requester) {
		dbbsr.removePending_byRequester(requester);
	});
}

async function removeSong_activeQueue_byMsg(msg) {
	get_bsrCode(msg, async function(bsr_code) {
		dbbsr.removeActive(bsr_code);
	});
}

async function skipSong(msg) {
	if (msg.message.match(/.*?(\d+)$/)) {
		let sSong_match = msg.message.match(/^.*?(\d+)$/);
		songs_toSkip = sSong_match[1];
	} else {
		songs_toSkip = 1;
	}

	console.log("[BOT] Skipping top songs in queue, Count:[" + songs_toSkip + "]");
	dbbsr.getActive_topCount(songs_toSkip, async function (aQueue) {
		if (aQueue.rowCount > 0) {
			for (song in aQueue.rows) {
				console.log("[BOT] Skipping song in queue, Code:[" + aQueue.rows[song].bsr_code + "]");
				await dbbsr.removeActive(aQueue.rows[song].bsr_code);
			}
		}
	});
}

async function manual_addSong(msg) {
	get_bsrCode(msg, async function(bsr_code) {
		get_requester_fromResponse(msg, async function(requester) {
			await dbbsr.addPending(bsr_code,requester,"cbinsertsong",false);
			await sleep(800);
			await moveSong_pendingToActive(bsr_code,requester);
			if (msg.message.match(/^.*?(\d+)$/)) {
				let mSong_pos = msg.message.match(/^.*?(\d+)$/);
				await moveSong(bsr_code, mSong_pos[1]);
			}
		});
	});
}

async function moveSong(msg, target_queue_pos) {
	return new Promise(resolve => {
		get_bsrCode(msg, async function(bsr_code) {
			dbbsr.getActive_byCode(bsr_code, async function(active_result) {
				if (active_result.rowCount > 0) {
					dbbsr.getQueueLength_active( async function(active_queueLength) {
						console.log("[BOT] Moving song to different position, Code:[" + bsr_code + "]-TgtPos:[" + target_queue_pos + "]");
						
						await dbbsr.shiftDown_activeQueue(target_queue_pos);
						await dbbsr.moveSong_activeQueue(bsr_code,target_queue_pos);
						await dbbsr.shiftUp_activeQueue(active_result.rows[0].req_order);
						resolve();
					});
				}
			});
		});
	});
}

async function add_mapData(bsr_code) {
	return new Promise(async resolve => {
		get_mapInfo(bsr_code, async function(mapInfo) {
			var mapData = JSON.parse(mapInfo);
			let bsr_name = (mapData.name.replace(/[^\x00-\x7F]/g, " ")).trim();
			let bsr_length = mapData.metadata.duration;
			await dbbsr.updateActive_mapInfo(bsr_code,bsr_name,bsr_length);
		});
	});
}

async function moveSong_pendingToActive(bsr_code,requester) {
	return new Promise(resolve => {
		dbbsr.getPending_byCode(bsr_code, async function(pResponse) {
			if (pResponse.rowCount > 0) {
				dbbsr.getActive_byCode(bsr_code, async function(aResponse) {
					if (aResponse.rowCount > 0) {
						console.log("[BOT] Map already in the active queue, Code:[" + bsr_code + "]");
						resolve();
					} else {
						let bsr_ts = pResponse.rows[0].bsr_ts;
						let bsr_note = pResponse.rows[0].bsr_note;
						let bsr_req = pResponse.rows[0].bsr_req;
						
						await dbbsr.addActive(bsr_code,bsr_req,bsr_ts,bsr_note);
						await dbbsr.removePending_byCode(bsr_code);
						add_mapData(bsr_code);

						if (pResponse.rows[0].req_att === true) {
							await moveSong(bsr_code, 1);
							resolve();
						} else {
							resolve();
						}
					}
				});
			} else {
				console.log("[BOT] Map not found in pending queue with Bsr:[" + bsr_code + "]");
				resolve();
			}
		});
	});
}

async function bsChatUser_responses(msg) {
	const bsFailMsgs = [
        	'you are not allowed to make requests',
                'the queue is closed',
                'is blacklisted',
                'is already in queue',
                'you already have',
                'this song was already requested this session',
                'maps are now allowed',
                'this song has no difficulty',
                'this song rating is too low',
                'song is too long',
		'BeatSage map are not allowed',
		'not found'
	];
	const bsFail_match = bsFailMsgs.filter(str => msg.message.includes(str));
	if (bsFail_match.length > 0) {
		removeSong_pendingQueue_byRequester(msg);
	}

	if (msg.message.includes("added to queue")) {
		await setQueue("open");
		get_requester_fromResponse(msg, async function(requester) {
			get_bsrCode(msg, async function(bsr_code) {
				moveSong_pendingToActive(bsr_code,requester);
			});
		});
	}

	if (msg.message.includes("is now on top of queue")) {
		await setQueue("open");
		get_bsrCode(msg, async function(bsr_code) {
			dbbsr.getPending_byCode(bsr_code, async function(pResponse) {
				if (pResponse.rowCount > 0) {
					await moveSong_pendingToActive(bsr_code,pResponse.rows[0].bsr_req);
					moveSong(msg, 1);
				} else {
					moveSong(msg, 1);
				}
			});
		});
	}

	if (msg.message.match(/^.*?requested\sby\s(.*?)\sis\snext.*?$/)) {
		get_bsrCode(msg, async function(bsr_code) {
			dbbsr.removeActive(bsr_code);
		});
	}

	if (msg.message.includes("is removed from queue")) {
		get_bsrCode(msg, async function(bsr_code) {
			dbbsr.removeActive(bsr_code);
		});
	}

	if (msg.message.includes("Queue is open!")) {
		setQueue("open");
	}

	if (msg.message.includes("Queue is now closed!") || msg.message.includes("Song queue is closed")) {
		setQueue("closed");
	}
}

module.exports = {
	setQueue: setQueue,
	resetQueues: resetQueues,
	addSong_pendingQueue: addSong_pendingQueue,
	manual_addSong, manual_addSong,
	skipSong: skipSong,
	moveSong: moveSong,
	reset_userList: reset_userList,
	removeSong_activeQueue_byMsg: removeSong_activeQueue_byMsg,
	bsChatUser_responses: bsChatUser_responses
}

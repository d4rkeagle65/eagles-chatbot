const db = require("./db");

async function openQueue() {
	return new Promise(async resolve => {
		const oQueue = await db.pool.query("UPDATE bsrsettings SET setting_value = 'open' WHERE setting_name = 'queue_state'");
		resolve();
	});
}

async function closeQueue() {
	return new Promise(async resolve => {
		const cQueue = await db.pool.query("UPDATE bsrsettings SET setting_value = 'closed' WHERE setting_name = 'queue_state'");
		resolve();
	});
}

async function get_queueState(callback) {
	const qState = await db.pool.query("SELECT setting_value FROM bsrsettings WHERE setting_name = 'queue_state'");
	callback(qState.rows[0].setting_value);
}

async function reset_activeQueue() {
	const aQueue_reset = await db.pool.query("DELETE FROM bsrqueue");
}

async function reset_pendingQueue() {
	const pQueue_reset = await db.pool.query("DELETE FROM bsrpending");
}

async function reset_userList() {
	const uList_reset = await db.pool.query("DELETE FROM userlist");
}

async function getPending_byCode(bsr_code, callback) {
	const pQueue = await db.pool.query("SELECT * FROM bsrpending WHERE bsr_code = $1", [ bsr_code ]);
	callback(pQueue);
}

async function getPending_byUser(user_username, callback) {
	const pQueue = await db.pool.query("SELECT * FROM bsrpending WHERE bsr_req = $1", [ user_username ]);
	callback(pQueue);
}

async function addPending(bsr_code,bsr_req,bsr_note,bsr_att) {
	return new Promise(resolve => {
		getPending_byCode(bsr_code, async function(pending_result) {
			if (pending_result.rowCount === 0) {
				console.log("[BOT][DB] Adding to pending queue, Bsr:[" + bsr_code + "]-Req:[" + bsr_req + "]");
				const pAdd = db.pool.query("INSERT INTO bsrpending (bsr_code, bsr_req, bsr_ts, bsr_note, req_att) VALUES ($1, $2, current_timestamp, $3, $4)", [ bsr_code, bsr_req, bsr_note, bsr_att ]);
				resolve();
			} else {
				console.log("[BOT][DB] Already in pending queue, Bsr:[" + bsr_code + "]-Req:[" + bsr_req + "]");
				resolve();
			}  
		});
	});
}

async function removePending_byRequester(bsr_req) {
	getPending_byUser(bsr_req, async function(pending_result) {
		if (pending_result.rowCount > 0) {
			console.log("[BOT][DB] Removing from pending queue, Bsr:[" + pending_result.rows[0].bsr_code + "]-Req:[" + bsr_req + "]");
			const pRem = db.pool.query("DELETE FROM bsrpending WHERE bsr_req = $1", [ bsr_req ]);
		}
	});
}

async function removePending_byCode(bsr_code) {
	return new Promise(async resolve => {
		getPending_byCode(bsr_code, async function(pending_result) {
			if (pending_result.rowCount > 0) {
				const pRem = db.pool.query("DELETE FROM bsrpending WHERE bsr_code = $1", [ bsr_code ]);
				resolve();
			}
		});
	});
}

async function getActive_byCode(bsr_code, callback) {
	const aQueue_bCode = await db.pool.query("SELECT * FROM bsrqueue WHERE bsr_code = $1", [ bsr_code ]);
	//console.log("[BOT][DB] Getting Active Queue Item By Code:[" + bsr_code + "]-Count:[" + aQueue_bCode.rowCount + "]");
	callback(aQueue_bCode);
}

async function getActive_byUser(user_username, callback) {
	const aQueue_bUser = await db.pool.query("SELECT * FROM bsrqueue WHERE bsr_req = $1 ORDER BY bsr_ts ASC", [ user_username ]);
	callback(aQueue_bUser);
}

async function getActive_byPosition(queue_pos, callback) {
	return new Promise(async resolve => {
		const aQueue_bPos = await db.pool.query("SELECT * FROM bsrqueue WHERE req_order = $1", [ queue_pos ]);
		callback(aQueue_bPos);
		resolve();
	});
}

async function getActive_topCount(top_count, callback) {
	return new Promise(async resolve => {
		const aQueue_tCount = await db.pool.query("SELECT * FROM bsrqueue WHERE req_order <= $1", [ top_count ]);
		callback(aQueue_tCount);
		resolve();
	});
}

async function getQueueLength_active(callback) {
	const aQueue_len = await db.pool.query("SELECT * FROM bsrqueue");
	callback(aQueue_len.rowCount);
}

async function addActive(bsr_code, bsr_req, bsr_ts, bsr_note){
	return new Promise(resolve => {
		getQueueLength_active( async function(aQueueLength) {
			let bsr_count = aQueueLength + 1;
			const aQueue_add = await db.pool.query("INSERT INTO bsrqueue (req_order, bsr_code, bsr_req, bsr_ts, bsr_note) VALUES ($1, $2, $3, $4, $5)", 
				[ bsr_count, bsr_code, bsr_req, bsr_ts, bsr_note]);
			console.log("[BOT][DB] Adding To Active Queue Code:[" + bsr_code + "]-Req:[" + bsr_req + "]-Note:[" + bsr_note + "]");
			resolve();
		});
	});
}

async function updateActive_mapInfo(bsr_code,bsr_name,bsr_length) {
	return new Promise(resolve => {
		getActive_byCode(bsr_code, async function(aQueue) {
			if (aQueue.rowCount > 0) {
				const aQueue_update = await db.pool.query("UPDATE bsrqueue SET bsr_name = $2,bsr_length = $3 WHERE bsr_code = $1", [ bsr_code, bsr_name, bsr_length ]);
				console.log("[BOT][DB] Updating Song with Map Info, Code:[" + bsr_code + "-Length:[" + bsr_length + "]-Name:[" + bsr_name + "]");
			}
			resolve();
		});
	});
}

async function removeActive(bsr_code){
	return new Promise(resolve => {
		getActive_byCode(bsr_code, async function(aQueue) {
			if (aQueue.rowCount > 0) {
				console.log("[BOT][DB] Removing from active queue, Bsr:[" + bsr_code + "]");
				const aQueue_rem = await db.pool.query("DELETE FROM bsrqueue WHERE bsr_code = $1", [ bsr_code ]);
				console.log("[BOT][DB] Shifting up maps in queue below, Position:[" + aQueue.rows[0].req_order + "]");
				await shiftUp_activeQueue(aQueue.rows[0].req_order);
				resolve();
			} else {
				resolve();
			}
		});
	});
}

async function shiftDown_activeQueue(queue_pos) {
	return new Promise(resolve => {
		getActive_byPosition(queue_pos, async function(active_result) {
			if (active_result.rowCount > 0) {
				//console.log("[BOT][DB] Shifting down active queue, Pos:[" + queue_pos + "]");
				const aQueue_shiftDown = await db.pool.query("UPDATE bsrqueue SET req_order = req_order + 1 WHERE req_order >= $1", [ queue_pos ]);
				resolve();
			}
		});
	});
}

async function shiftUp_activeQueue(queue_pos, callback) {
	return new Promise (resolve => {	
		getQueueLength_active( async function(active_queueLength) {
			if (queue_pos <= active_queueLength) {
				getActive_byPosition((queue_pos + 1), async function(active_result) {
					if (active_result.rowCount > 0) {
						//console.log("[BOT][DB] Shifting up active queue, Pos:[" + queue_pos + "]");
						const aQueue_shiftUp = await db.pool.query("UPDATE bsrqueue SET req_order = req_order - 1 WHERE req_order <= $1 AND req_order > $2", [ (active_queueLength + 1) , queue_pos ]);
						resolve();
					}
				});
			}
		});
	});
}

async function moveSong_activeQueue(bsr_code,queue_pos) {
	return new Promise (resolve => {
		getActive_byCode(bsr_code, async function(active_result_byCode) {
			if (active_result_byCode.rowCount > 0) {
				getActive_byPosition(queue_pos, async function(active_result_byPosition) {
					if (active_result_byPosition.rowCount === 0) {
						//console.log("[BOT][DB] Moving song in active queue, Code:[" + bsr_code + "]-TgtPos:[" + queue_pos + "]");
						const aQueue_moveSong = await db.pool.query("UPDATE bsrqueue SET req_order = $1 WHERE bsr_code = $2", [ queue_pos, bsr_code ]);
						resolve();
					}
				});
			}
		});
	});
}

module.exports = {
	openQueue: openQueue,
	closeQueue: closeQueue,
	get_queueState: get_queueState,
	reset_activeQueue: reset_activeQueue,
	reset_pendingQueue: reset_pendingQueue,
	getPending_byCode: getPending_byCode,
	addPending: addPending,
	getActive_byCode: getActive_byCode,
	getActive_byPosition: getActive_byPosition,
	getActive_byUser: getActive_byUser,
	shiftDown_activeQueue: shiftDown_activeQueue,
	shiftUp_activeQueue: shiftUp_activeQueue,
	moveSong_activeQueue: moveSong_activeQueue,
	reset_userList: reset_userList,
	removePending_byRequester: removePending_byRequester,
	removeActive: removeActive,
	addActive: addActive,
	removePending_byCode: removePending_byCode,
	getQueueLength_active: getQueueLength_active,
	getActive_topCount: getActive_topCount,
	updateActive_mapInfo: updateActive_mapInfo
};

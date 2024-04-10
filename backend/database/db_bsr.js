const path = require("path");
const db = require(path.join(__dirname, "db.js"));

// Funcions for Queue Settings
async function getBSP_qState(job) {
	return new Promise(async (resolve, reject) => {
		const qState = await db.pool.query("SELECT setting_value FROM bsrsettings WHERE setting_name = 'queue_state'");
		job.updateProgress("[BOT][DB] Queue State:[" + qState.rows[0].setting_value + "]");
		if (qState.rows[0].setting_value === "open") {
			return resolve();
		} else {
			return reject("BS+ Queue is Closed");
		}
	});
}
async function setBSP_qState(job,qStatus) {
	return new Promise(async (resolve,reject) => {
		if (qStatus === "open") {
			getBSP_qState(job).then( () => {
				reject();
			}).catch( async () => {
				await db.pool.query("UPDATE bsrsettings SET setting_value = 'open' WHERE setting_name = 'queue_state'").then( () => {
					resolve(" BS+ queue is now open");
				});
			});
		} else if ( qStatus === "closed" ) {
			await db.pool.query("UPDATE bsrsettings SET setting_value = 'closed' WHERE setting_name = 'queue_state'").then( () => {
				resolve(" BS+ queue is now closed");
			});
		}
	});
}
async function resetBSP_qItems(job,queue) {
	return new Promise(async resolve => {
		job.updateProgress("[BOT][DB] Resetting Items in Queue:[" + queue + "]");
		await db.pool.query("DELETE FROM bsr" + queue).then( () => {
			resolve();
		});
	});
}

// Functions for Pending Queue
async function getMap_pQueue_byReq(job,bsr_req) {
	job.updateProgress("[BOT][DB] Getting Map from Pending Queue by Requester");
	return new Promise(async (resolve,reject) => {
		const pQueue = await db.pool.query("SELECT * FROM bsrpending WHERE bsr_req = $1 ORDER BY bsr_ts ASC", [ bsr_req ]);
		if (pQueue.rowCount === 0) {
			reject("[DB] No Map in Pending Queue, Req:[" + bsr_req + "]");
		} else {
			resolve(pQueue);
		}
	});
}
async function addMap_pending(job,bsr_code,bsr_req,bsr_msg,bsr_att) {
	return new Promise(async (resolve, reject) => {
		getMap_byCode(job,bsr_code,"pending").then(() => {
			reject("[DB] Map Found By Code:[" + bsr_code + "]-Queue:[pending]: Skipping");
		}).catch(async (message) => {
			job.updateProgress("[BOT][DB][C]" + message);
			let sql = "INSERT INTO bsrpending (bsr_code, bsr_req, bsr_ts, bsr_note, req_att) VALUES ($1, $2, current_timestamp, $3, $4)";
			await db.pool.query(sql, [ bsr_code, bsr_req, bsr_msg, bsr_att ]).then(pAdd => {
				resolve("[DB] Added to pending queue, Code:[" + bsr_code + "]-Req:[" + bsr_req + "]");
			});
		});
	});
}
async function remMap_pending_byReq(job,bsr_req) {
	return new Promise(async (resolve, reject) => {
		getMap_pQueue_byReq(job,bsr_req).then(async pQueue => {
			if (pQueue.rowCount > 1) {
				reject("[DB] More than 1 Map in Pending Queue by Req:[" + bsr_req + "]");
			} else {
				await db.pool.query("DELETE FROM bsrpending WHERE bsr_req = $1", [ bsr_req ]).then(pRem => {
					resolve("[DB] Removed Map From Pending Queue, Req:[" + bsr_req + "]");
				});
			}
		}).catch(eMsg => {
			reject(eMsg);
		});
	});
}

// Functions for Active Queue
async function addMap_aQueue(job, bsr_code, bsr_req, bsr_ts, bsr_note, req_att, sus_remap) {
	return new Promise((resolve,reject) => {
		let tgt_pos = -1;
		if (req_att) {
			tgt_pos = 1;
		}
		detMap_newPos(job,bsr_code,tgt_pos).then(async pos => {
			job.updateProgress("[BT][BD] Adding Map to oa:[" + pos[0] + "]-ob:[" + pos[1] + "]");
			let query = "INSERT INTO bsractive (oA, oB, bsr_code, bsr_req, bsr_req_here, bsr_ts, bsr_note, sus_remap) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
			await db.pool.query(query,[ pos[0], pos[1], bsr_code, bsr_req, true, bsr_ts, bsr_note, sus_remap ]).then(() => {
				resolve("[DB] Adding Map To Active Queue Code:[" + bsr_code + "]-Req:[" + bsr_req + "]-Note:[" + bsr_note + "]-Att:[" + req_att + "]");
			});
		});
	});
}
async function moveMap_inQueue(job,bsr_code,bsr_req,tgt_pos) {
	return new Promise(resolve => {
		getQueue(job,"active").then(queue => {
			detMap_newPos(job,bsr_code,tgt_pos,queue).then(async newVals => {
				job.updateProgress("[BT][BD] Moving Map to oa:[" + newVals[0] + "]-ob:[" + newVals[1] + "]");
				let query = "UPDATE bsractive SET oa = $1, ob = $2 WHERE bsr_code = $3";
				await db.pool.query(query, [ newVals[0], newVals[1], bsr_code ]).then(() => {
					resolve(console.log("[BOT][DB] Moving Map In Queue Code:[" + bsr_code + "]-Tgt:[" + tgt_pos + "]"));
				});
			});
		});
	});
}
async function detMap_newPos(job,bsr_code,tgt_pos,eQueue) {
	if (! eQueue) { eQueue = ""; }
	job.updateProgress("[BOT][DB] Determining the Position of the Map Code:[" + bsr_code + "]-Tgt:[" + tgt_pos + "]");
	return new Promise(resolve => {
		getQueue_length(job,"active",eQueue).then(async qLength => {
			if (tgt_pos === qLength) { tgt_pos = -1; }
			if (qLength === 0) {
				resolve([1,2]);
			} else {
				if (tgt_pos === 1 || tgt_pos === -1) {
					let ob_end = "max";
					let oa_end = "max";
					if (tgt_pos === 1) {
						oa_end = "min";
					}
					getEnds_ofCol(job,"oa",oa_end).then(oa => {
						getEnds_ofCol(job,"ob",ob_end).then(ob => {
							if (tgt_pos === 1) {
								resolve([ Number(oa), Number(ob) + 1 ]);
							} else {
								resolve([ Number(oa) + 1, Number(ob) ]);
							}
						});
					});
				} else {
					getVals_forPos(job,tgt_pos,eQueue).then(aPos => {
						getVals_forPos(job,Number(tgt_pos) - 1,eQueue).then(bPos => {
							resolve([
								Number(aPos[0]) + Number(bPos[0]),
								Number(aPos[1]) + Number(bPos[1])
							]);
						});
					});
				}
			}
		});
	});
}
async function getEnds_ofCol(job,col,tgt_end) {
	return new Promise(async resolve => {
		if (tgt_end.match(/(min|max)/)) {
			await db.pool.query("SELECT " + tgt_end + "(" + col + ") FROM bsractive").then(end => {
				resolve(end.rows[0][tgt_end]);
			});
		} else {
			reject("[DB] getEnds_ofCol Used Incorrectly");
		}
	});
}
async function getVals_forPos(job,pos,eQueue) {
	if (! eQueue) { let eQueue = ""; }
	job.updateProgress("[BOT][DB] Getting the Values of oa and ob for Map at Position:[" + pos + "]");
	return new Promise((resolve,reject) => {
		getQueue(job,"active",eQueue).then(queue => {
			let pos_req = Number(pos) - 1;
			if (queue.rows[pos_req] === undefined) {
				reject("[DB] No Song at Position:[" + pos + "]");
			} else {
				resolve([ queue.rows[pos_req].oa, queue.rows[pos_req].ob ]);
			}
		});
	});
}
async function updateMap_uStatus(job,bsr_code,aStatus) {
	return new Promise(async resolve => {
		await db.pool.query("UPDATE bsractive SET bsr_req_here = $2 WHERE bsr_code = $1", [ bsr_code, aStatus ]).then( () => {
			resolve();
		});
	});
}
async function updateMap_bsInfo(job,bsr_code,bsr_name,bsr_length) {
	return new Promise(resolve => {
		getMap_byCode(job,bsr_code,"active").then( async () => {
			let query = "UPDATE bsractive SET bsr_name = $2, bsr_length = $3 WHERE bsr_code = $1";
			await db.pool.query(queue, [ bsr_code, bsr_name, bsr_length ]).then( () => {
				resolve("[BOT][DB] Updated Map with Info Code:[" + bsr_code + "]-Length:[" + bsr_length + "]-Name:[" + bsr_name + "]");
			});
		}).catch(eMsg => {
			resolve(job.updateProgress("[BOT][DB]" + eMsg));
		});
	});
}

// Functions for Both Queues
async function getMap_byCode(job,bsr_code,queue) {
	job.updateProgress("[BOT][DB] Getting Map by Bsr Code:[" + bsr_code + "]-Queue:[" + queue + "]");
	return new Promise(async (resolve, reject) => {
		await db.pool.query("SELECT * FROM bsr" + queue + " WHERE bsr_code = $1", [ bsr_code ]).then(qRes => {
			if (qRes.rowCount === 0) {
				reject("[DB] No Map Found By Code:[" + bsr_code + "]-Queue:[" + queue + "]");
			} else {
				resolve(qRes);
			}
		});
	});
}
async function getMap_byPos(job,pos,eQueue) {
	if (! eQueue) { let eQueue = ""; }
	job.updateProgress("[BOT][DB] Getting Map at Position:[" + pos + "]");
	return new Promise((resolve,reject) => {
		getQueue(job,"active",eQueue).then(queue => {
			let pos_req = Number(pos) - 1;
			if (queue.rows[pos_req] === undefined) {
				reject("[DB] No Map at Position:[" + pos + "]");
			} else {
				resolve(queue.rows[pos_req]);
			}
		});
	});
}
async function remMap_byCode(job,bsr_code,queue) {
	job.updateProgress("[BOT][DB] Removing Map by Bsr Code:[" + bsr_code + "]-Queue:[" + queue + "]");
	return new Promise((resolve, reject) => {
		getMap_byCode(job,bsr_code,queue).then(async qRes => {
			await db.pool.query("DELETE FROM bsr" + queue + " WHERE bsr_code = $1", [ bsr_code ]).then(qRem => {
				resolve("[DB] Removed by Code:[" + bsr_code + "]-Queue:[" + queue + "]");
			});
		}).catch(eMsg => {
			reject(eMsg);
		});
	});
}
async function getQueue(job,queue,eQueue) {
	if (typeof eQueue === "object") {
		return eQueue;
	} else {
		job.updateProgress("[BOT][DB] Querying for Entire Queue:[" + queue + "]");
		return new Promise(async resolve => {
			await db.pool.query("SELECT * FROM bsr" + queue + " ORDER BY od ASC").then(nQueue => {
				resolve(nQueue);
			});
		});
	}
}
async function getQueue_byUser(job,queue,username) {
	return new Promise(async (resolve,reject) => {
		job.updateProgress("[BOT][DB] Querying Queue:[" + queue + "] for User:[" + username + "]");
		let query = "SELECT * FROM bsr" + queue + " WHERE bsr_req = $1";
		if (queue === "active") {
			query = query + " ORDER BY od ASC";
		}
		await db.pool.query(query, [ username ]).then(uQueue => {
			if (uQueue.rowCount > 0) {
				resolve(uQueue);
			} else {
				reject("[DB] Nothing in Queue:[" + queue + "] for User:[" + username + "]");
			}
		});
	});
}
async function getQueue_length(job,queue,eQueue) {
	if (! eQueue) { let eQueue = ""; }
	job.updateProgress("[BOT][DB] Getting Length of Queue:[" + queue + "]");
	return new Promise(resolve => {
		getQueue(job,queue,eQueue).then(gQueue => {
			job.updateProgress("[BOT][DB] Size of Queue:[" + queue + "]-Length:[" + gQueue.rowCount + "]");
			if (gQueue.rowCount === 0) {
				resolve(0);
			} else {
				resolve(gQueue.rowCount);
			}
		});
	});
}

module.exports = {
	getBSP_qState: getBSP_qState,
	setBSP_qState: setBSP_qState,
	resetBSP_qItems: resetBSP_qItems,
	addMap_pending: addMap_pending,
	remMap_pending_byReq: remMap_pending_byReq,
	addMap_aQueue: addMap_aQueue,
	moveMap_inQueue: moveMap_inQueue,
	updateMap_bsInfo: updateMap_bsInfo,
	getMap_byCode: getMap_byCode,
	remMap_byCode: remMap_byCode,
	getQueue_byUser: getQueue_byUser,
	getMap_byPos: getMap_byPos
}

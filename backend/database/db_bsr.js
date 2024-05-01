const path = require("path");
const db = require(path.join(__dirname, "db.js"));

// Funcions for Queue Settings
async function getBSP_qState(job, force) {
	if (! force) { let force = false; }
	return new Promise(async (resolve, reject) => {
		if (force === true) {
			job.updateProgress("[BOT][DB] Queue State Ignored, Forced");
			return resolve();
		} else {
			const qState = await db.pool.query("SELECT setting_value FROM bsrsettings WHERE setting_name = 'queue_state'");
			job.updateProgress("[BOT][DB] Queue State:[" + qState.rows[0].setting_value + "]");
			if (qState.rows[0].setting_value === "open") {
				return resolve();
			} else {
				return reject("BS+ Queue is Closed");
			}
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
async function getQS_syncState(job) {
	return new Promise(async (resolve,reject) => {
		job.updateProgress("[BOT][DB] Getting Sync State of Queue");
		const syncState = await db.pool.query("SELECT setting_value FROM bsrsettings WHERE setting_name = 'queue_sync'");
		if (syncState.rows[0].setting_value === "true") {
			resolve();
		} else {
			reject();
		}
	});
}
async function setQS_syncState(job,sStatus) {
	return new Promise(async (resolve) => {
		if (sStatus === true) {
			getQS_syncState(job).then( () => {
				resolve("[DB] Queue is Synced with Streamers BSP");
			}).catch( async () => {
				await db.pool.query("UPDATE bsrsettings SET setting_value = 'true' WHERE setting_name = 'queue_sync'").then( () => {
					resolve("[DB] Queue is Synced with Streamers BSP");
				});
			});
		} else if ( sStatus === false ) {
			getQS_syncState(job).then( async () => {
				await db.pool.query("UPDATE bsrsettings SET setting_value = 'false' WHERE setting_name = 'queue_sync'").then( () => {
					resolve("[DB] Queue is Desynced with Streamers BSP");
				});
			}).catch( () => {
				resolve("[DB] Queue is Desynced with Streamers BSP");
			});
		} else {
			resolve("[DB] ERROR: Wrong Command Syntax for setQS_syncState");
		}
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
			let query = "INSERT INTO bsractive (oA, oB, bsr_code, bsr_req, bsr_req_here, bsr_ts, bsr_note, sus_remap, sus_skip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
			await db.pool.query(query,[ pos[0], pos[1], bsr_code, bsr_req, true, bsr_ts, bsr_note, sus_remap, false ]).then(() => {
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
					resolve(job.updateProgress("[BOT][DB] Moving Map In Queue Code:[" + bsr_code + "]-Tgt:[" + tgt_pos + "]"));
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
								resolve([ Number(oa) + 1, 1]);
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
			await db.pool.query(query, [ bsr_code, bsr_name, bsr_length ]).then( () => {
				resolve("[BOT][DB] Updated Map with Info Code:[" + bsr_code + "]-Length:[" + bsr_length + "]-Name:[" + bsr_name + "]");
			});
		}).catch(eMsg => {
			resolve(job.updateProgress("[BOT]" + eMsg));
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
				reject("[DB] No Map at Position:[" + pos_req + "]");
			} else {
				resolve(queue.rows[pos_req]);
			}
		});
	});
}
async function getPos_byCode(job,bsr_code,eQueue) {
	if (! eQueue) { let eQueue = ""; }
	job.updateProgress("[BOT][DB] Getting Position for Map with Code:[" + bsr_code + "]");
	return new Promise((resolve,reject) => {
		getQueue(job,"active",eQueue).then(queue => {
			pos = queue.rows.findIndex(x => x.bsr_code === bsr_code);
			if (pos === -1) {
				reject("[DB] Position Not Found for Map with Code:[" + bsr_code + "]");
			} else {
				resolve(Number(pos) + 1);
			}
		});
	});
}
async function getMaps_abovePos(job,pos,eQueue) {
	if (! eQueue) { let eQueue = ""; }
	job.updateProgress("[BOT][DB] Getting Maps Above Position:[" + pos + "]");
	return new Promise(async (resolve,reject) => {
		if (eQueue.rows.length > 0) {
			getMap_byPos(job,pos).then(pMap => {
				const mapsAbove = eQueue.rows.map((val,index) => {
					if (eQueue.rows[index].od < pMap.od) {
						return eQueue.rows[index];
					}
				});
				let mapsReturn = mapsAbove.filter(Boolean);
				job.updateProgress("[BOT][DB] Found Maps Above Position:[" + pos + "]-Count:[" + mapsReturn.length + "]");
				resolve(mapsReturn);
			}).catch(eMsg => {
				reject(eMsg);
			});
		} else {
			getMap_byPos(job,pos).then(async (pMap) => {
				await db.pool.query("SELECT * FROM bsractive WHERE od < $1", [ pMap.od ]).then(qRes => {
					if (qRes.rowCount > 0) {
						resolve(qRes);
					} else {
						reject("[DB] Nothing Above Position:[" + pos + "]");
					}
				}).catch(eMsg => {
					reject("[DB] Error Getting Maps Above Position:[" + pos + "]-Error:[" + eMsg + "]");
				});
			}).catch(eMsg => {
				reject(eMsg);
			});
		}
	});
}
async function updateMap_susSkip(job,bsr_code,skip) {
	return new Promise(async (resolve,reject) => {
		await db.pool.query("UPDATE bsractive SET sus_skip = $2 WHERE bsr_code = $1", [ bsr_code, skip ]).then(() => {
			resolve("[DB] Updated Value of Map with Code:[" + bsr_code + "]-Skip:[" + skip + "]");
		}).catch(eMsg => {
			reject("[DB] Error Updating Map with Code:[" + bsr_code + "]-Skip:[" + skip + "]");
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
		return new Promise(async (resolve,reject) => {
			await db.pool.query("SELECT * FROM bsr" + queue + " ORDER BY od ASC").then(nQueue => {
				resolve(nQueue);
			}).catch( () => {
				reject();
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
		}).catch( () => {
			job.updateProgress("[BOT][DB] SIze of Queue:[" + queue + "]-Length:[0]");
			resolve(0);
		});
	});
}

module.exports = {
	getBSP_qState: getBSP_qState,
	setBSP_qState: setBSP_qState,
	resetBSP_qItems: resetBSP_qItems,
	getQS_syncState: getQS_syncState,
	setQS_syncState: setQS_syncState,
	addMap_pending: addMap_pending,
	remMap_pending_byReq: remMap_pending_byReq,
	addMap_aQueue: addMap_aQueue,
	moveMap_inQueue: moveMap_inQueue,
	updateMap_bsInfo: updateMap_bsInfo,
	getMap_byCode: getMap_byCode,
	remMap_byCode: remMap_byCode,
	getQueue_byUser: getQueue_byUser,
	getMap_byPos: getMap_byPos,
	getPos_byCode: getPos_byCode,
	getMaps_abovePos: getMaps_abovePos,
	updateMap_susSkip: updateMap_susSkip,
	getQueue: getQueue,
	getQueue_length: getQueue_length
}

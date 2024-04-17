const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const dbbsr = require(path.join(__dirname, "..", "database", "db_bsr.js"));

// String Handlers
async function get_bsrCode(job,msg) {
	job.updateProgress("[BOT][BH] Getting BSR Code");
	if (msg === undefined) { msg = job.data.msg; }
	return new Promise(resolve => {
		let bsrString = msg;
		if (typeof msg === "object") {
			bsrString = msg.message;
		}
		if (bsrString.match(/(\!|\()(bsr|modadd|att|mtt|remove|cbremove)\s((\w|\d)+)(\s|\))?/)) {
			bsrMatch = (bsrString.match(/(\!|\()(bsr|modadd|att|mtt|remove|cbremove)\s((\w|\d)+)(\s|\))?/));
			job.updateProgress("[BOT][BH] Found BSR Code:[" + bsrMatch[3] + "]");
			resolve(bsrMatch[3]);
		} else {
			resolve(bsrString);
		}
	});
}
async function get_bsrMsg(job) {
	job.updateProgress("[BOT][BH] Getting BSR Message");
	return new Promise(resolve => {	
		if(job.data.msg.message.match(/^\!(.*?)\s(\w+)(\s.*)?$/)) {
			msgMatch = job.data.msg.message.match(/^\!(.*?)\s(\w+)(\s.*)?$/);
			if (typeof msgMatch === "Array") {
				if (msgMatch.length > 2) {
					resolve();	
				} else {
					resolve("");
				}
			} else {
				resolve("");
			}
		} else {
			resolve("");
		}
	});
}
async function get_req(job, required) {
	job.updateProgress("[BOT][BH] Getting Requester");
	return new Promise(resolve => {
		msgMatch = (job.data.msg.message.match(/(requested\sby\s\@?|\@)(.*?)\s/));
		if (msgMatch[2]) {
			resolve(msgMatch[2].toLowerCase());
		} else {
			if (required) {
				reject("Unable To Get Requester From String:[" + msg.message + "]");
			} else {
				resolve("");
			}
		}
	});
}

// Functions Dealing with Queue Settings
async function resetBSP_queues(job) {
	job.updateProgress("[BOT][BH] Resetting Queues");
	return new Promise(resolve => {
		dbbsr.resetBSP_qItems(job,"pending").then( () => {
			dbbsr.resetBSP_qItems(job,"active").then( () => {
				resolve();
			});
		});
	});
}
async function setBSP_queueState(job,qState) { 
	return new Promise(resolve => {
		dbbsr.setBSP_qState(job,qState).then(sMsg => {
			resolve(job.updateProgress("[BOT][BH]" + sMsg));
		}).catch( () => {
			resolve();
		});
	});
}

// Functions Dealing with the Pending Queue
async function addMap_pQueue(job, bsr_att) {
	return new Promise(resolve => {
		dbbsr.getBSP_qState(job).then(() => {
			job.updateProgress("[BOT][BH] Attempting to Add Map to Pending Queue");
			job.updateProgress("[BOT][BH] Requester Username:[" + job.data.msg.username.toLowerCase() + "]");
			get_bsrCode(job).then((bsr_code) => {
				get_bsrMsg(job).then((bsr_msg) => {
					dbbsr.addMap_pending(job,bsr_code,job.data.msg.username.toLowerCase(),bsr_msg,bsr_att).then(alog => {
						job.updateProgress("[BOT][BH]" + alog);
						resolve();
					}).catch(eMsg => {
						job.updateProgress("[BOT][BH][C]" + eMsg);
						resolve();
					});
				});
			});
		}).catch(eMsg => {
			job.updateProgress("[BOT][BH][C] " + eMsg);
			resolve();
		});
	});
}
async function remMap_pQueue_byReq(job) {
	return new Promise(resolve => {
		get_req(job,true).then(bsr_req => {
			dbbsr.remMap_pending_byReq(job,bsr_req).then(log => {
				resolve(job.updateProgress("[BOT][BH]" + log));
			});
		}).catch(eMsg => {
			resolve(job.updateProgress("[BOT][BH][C] " + eMsg));
		});
	});
}

// Functions Dealing with the Active Queue
async function moveMap_pToActive(job,bsr_code,bsr_req) {
	return new Promise(resolve => {
		dbbsr.getQueue_byUser(job,"pending",bsr_req).then(pQueue =>{
			dbbsr.getMap_byCode(job,pQueue.rows[0].bsr_code,"active").then(eMsg => {
				resolve(job.updateProgress("[BOT][BH][C] Already Found in Active Queue Code:[" + pQueue.rows[0].bsr_code + "]"));
			}).catch(async aQueue => {
				let bsr_ts = pQueue.rows[0].bsr_ts;
				let bsr_note = pQueue.rows[0].bsr_note;
				let bsr_req = pQueue.rows[0].bsr_req;
				let req_att = pQueue.rows[0].req_att;
				let sus_remap = false;
				if (pQueue.rows[0].bsr_code != bsr_code) {
					sus_remap = true;
				}

				await dbbsr.addMap_aQueue(job, pQueue.rows[0].bsr_code, bsr_req, bsr_ts, bsr_note, req_att, sus_remap).then(async aMap_log => {
					job.updateProgress("[BOT][BH]" + aMap_log);
					await dbbsr.remMap_byCode(job,bsr_code,"pending").then(rMap_log => {
						job.updateProgress("[BOT][BH]" + rMap_log);
						resolve();
					}).catch(eMsg => {
						resolve(job.updateProgress("[BOT][BH][C]" + eMsg));
					});
				}).catch(eMsg => {
					resolve(job.updateProgress("[BOT][BH][C]" + eMsg));
				});
			});
		}).catch(eMsg => {
			resolve(job.updateProgress("[BOT][BH][C]" + eMsg));
		});
	});
}
async function get_codeReq_fromMsg(job) {
	return new Promise(resolve => {
		get_req(job,false).then(bsr_req => {
			get_bsrCode(job).then(bsr_code => {
				resolve([ bsr_code, bsr_req ]);
			});
		});
	});
}
async function removeMap_aQueue(job) {
	return new Promise(resolve => {
		get_bsrCode(job).then(bsr_code => {
			dbbsr.remMap_byCode(job,bsr_code,"active").then(sMsg => {
				resolve(job.updateProgress("[BOT][BH]" + sMsg));
			}).catch(eMsg => {
				resolve(job.updateProgress("[BOT][BH]" + eMsg));
			});
		});
	});
}
async function insertMap_aQueue(job,bsr_code,tgt_pos) {
	return new Promise(async resolve => {
		const insMatch = job.data.msg.message.match(/^\!cbinsertmap\s(\w+)\s\@?(\w+)(\s(\d+))?(\s(\w+))?$/);
		if (bsr_code === undefined) {
			let bsr_code = insMatch[1];
		}
		if (tgt_pos === undefined) {
			let tgt_pos = -1;
		}
		let bsr_req = "";
		let bsr_ts = new Date();
		let bsr_note = "";
		if (insMatch) {
			if (insMatch.length > 2) {
				bsr_req = insMatch[3];
				if (insMatch.length > 4) {
					tgt_pos = insMatch[6];
					if (insMatch.length > 5) {
						bsr_note = insMatch[7];	
					}
				}
			}
		}
		await dbbsr.addMap_aQueue(job, bsr_code, bsr_req, bsr_ts, bsr_note, false, false).then( async aMap_log => {
			if (tgt_pos > -1) {
				await dbbsr.getMap_byPos(job,tgt_pos).then( async mRes => {
					if ( mRes.bsr_code === bsr_code ) {
						resolve(job.updateProgress("[BOT][BH]" + aMap_log));
					} else {
						await dbbsr.moveMap_inQueue(job,bsr_code,bsr_req,tgt_pos).then( () => {
							resolve(job.updateProgress("[BOT][BH]" + aMap_log));
						});
					}
				}).catch( async eMsg => {
					await dbbsr.moveMap_inQueue(job,bsr_code,bsr_req,tgt_pos).then( () => {
						resolve(job.updateProgress("[BOT][BH]" + aMap_log));
					});
				});
			} else {
				resolve(job.updateProgress("[BOT][BH]" + aMap_log));
			}
		}).catch( () => {
			resolve(job.updateProgress("[BOT][BH] Failed Adding to Active Queue Code:[" + bsr_code + "]"));
		});
	});
}
async function handle_qCommand(job) {
	job.updateProgress("[BOT][BH] !queue Command Detected");
	return new Promise(async resolve => {
		let bsrList = job.data.msg.message.split(":")[1].split(",");

		for await (const [key, bsr] of bsrList.entries()) {
			job.log("[BOT][BH] Handling Key:[" + key + "]-bsr:[" + bsr + "]");
			let req_pos = Number(key) + 1;
			await get_bsrCode(job,bsr.trim()).then(async bsr_code => {
				await dbbsr.getMap_byCode(job,bsr_code,"active").then( async mRes => {
					await dbbsr.getMap_byPos(job,req_pos).then( async map_info => {
						if ( bsr_code === map_info.bsr_code ) {
							job.updateProgress("[BOT][DB] Correct Spot for Map:[" + bsr_code + "]-Pos:[" + req_pos + "]");
						} else {
							await dbbsr.moveMap_inQueue(job,bsr_code,"",req_pos);
						}
					}).catch( eMsg => {
						job.updateProgress("[BOT][BH]" + eMsg);
					});
				}).catch(async eMsg => {
					job.updateProgress("[BOT][BH]" + eMsg);
					await insertMap_aQueue(job,bsr_code,req_pos);
				});
			});
		}
		resolve();
	});
}

// To Handle the BS+ Chat User Responses
async function bsChatUser_responses(job) {
	return new Promise(resolve => {
		let breakPromise = 0;

		// BS+ Message When Streamer Settings Reject Requested Map
		const bsFailMsgs = [
			'you are not allowed to make requests',
			'the queue is closed',
			'is blacklisted',
			'is already in queue',
			'you already have',
			'this song was already requested',
			'maps are not allowed',
			'this song has no difficulty',
			'this song rating is too low',
			'this song is too long',
			'this song is too short',
			'not found',
			'this song is too old',
			'this song is too recent',
			'Search is disabled',
			'BeatSage maps are not allowed',
			'Ranked maps are not allowed',
			'Invalid key'
		];
		const bsFail_match = bsFailMsgs.filter(str => job.data.msg.message.includes(str));
		if (bsFail_match.length > 0) {
			job.updateProgress("[BOT][BH] Attempting to Remove Map from Pending Queue");
			resolve(remMap_pQueue_byReq(job));
		} else { breakPromise++; }

		// BS+ Message For Successful Add To Queue
		if (job.data.msg.message.includes("added to queue")) {
			job.updateProgress("[BOT][BH] Attempting to Move Map from Pending to Active");
			get_codeReq_fromMsg(job).then(codeReq => {
				resolve(moveMap_pToActive(job,codeReq[0],codeReq[1]));
			});
		} else { breakPromise++; }

		// BS+ Message For Song Being Next
		if (job.data.msg.message.includes("is next")) {
			job.updateProgress("[BOT][BH] Attempting to Remove Map from Active Queue");
			get_bsrCode(job).then(bsr_code => {
				dbbsr.remMap_byCode(job,bsr_code,"active").then( () => {
					resolve();
				}).catch(eMsg => {
					resolve(job.updateProgress("[BOT][BH]" + eMsg));
				});
			});
		} else { breakPromise++; }

		// BS+ Message For Adding To Top of Queue
		if (job.data.msg.message.includes("is now on top of queue")) {
			job.updateProgress("[BOT][BH] Attempting to Add a Map to the Top of the Queue");
			get_codeReq_fromMsg(job).then(codeReq => {
				dbbsr.getMap_byCode(job,codeReq[0],"pending").then(pQueue => {
					resolve(moveMap_pToActive(job,codeReq[0],codeReq[1]));
				}).catch(eMsg => {
					resolve(dbbsr.moveMap_inQueue(job,codeReq[0],codeReq[1],1));
				});
			});
		} else { breakPromise++; }

		// BS+ Message For Removing Song From Queue
		if (job.data.msg.message.includes("is removed from queue")) {
			resolve(removeMap_aQueue(job));
		} else { breakPromise++; }

		// BS+ Message For Opening the Queue
		if (job.data.msg.message.includes("Queue is open!") || 
		    job.data.msg.message.includes("Queue is now open!")) {
			resolve(setBSP_queueState(job,"open"));
		} else { breakPromise++; }

		// BS+ Message For Closing the Queue or Error that the Queue is Closed
		if (job.data.msg.message.includes("Queue is now closed!") || 
		    job.data.msg.message.includes("Song queue is closed")) {
			resolve(setBSP_queueState(job,"closed"));
		} else { breakPromise++; }

		// BS+ Message For !queue Command
		if (job.data.msg.message.match(/^\!\sSong\squeue(.*?)next/)) {
			resolve(handle_qCommand(job));
		} else { breakPromise++; }

		if ( breakPromise === 8 ) {
			resolve();
		}

	});
}

module.exports = {
	resetBSP_queues: resetBSP_queues,
	setBSP_queueState: setBSP_queueState,
	addMap_pQueue: addMap_pQueue,
	removeMap_aQueue: removeMap_aQueue,
	insertMap_aQueue: insertMap_aQueue,
	bsChatUser_responses: bsChatUser_responses,
}

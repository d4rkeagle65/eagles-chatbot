const path = require("path");
const db = require(path.join(__dirname, "db.js"));
const dbbsr = require(path.join(__dirname, "db_bsr.js"));

// Gets the User in the Userlist Table
async function getUser(job,username) {
	return new Promise(async (resolve,reject) => {
		await db.pool.query("SELECT * FROM userlist WHERE user_username = $1", [ username ]).then(user => {
			if( user.rowCount > 0 ) {
				resolve(user);
			} else {
				reject();
			}
		});
	});
}

// Adds the User to the Userlist Table
async function joinUser(job,username) {
	return new Promise(async resolve => {
		getUser(job,username).then( () => {
			resolve();
		}).catch( async () => {
			await db.pool.query("INSERT INTO userlist (user_username,user_joints,user_type,user_lurk) VALUES ($1,current_timestamp,$2,false)",
				[ username, "unknown" ]).then( () => {
				resolve(job.updateProgress("[BOT][DBU] User Joined Chat Useername:[" + username + "]"));
			});
		});
	});
}

// Removes the User from the Userlist Table
async function partUser(job,username) {
	return new Promise(async resolve => {
		getUser(job,username).then( async user => {
			await db.pool.query("DELETE FROM userlist WHERE user_username = $1", [ username ]).then( () => {
				resolve(job.updateProgress("[BOT][DBU] User Left Chat Username:[" + username + "]"));
			});
		}).catch( () => {
			resolve();
		});
	});
}

// Logic to Determine Highest Role of User
async function get_userRole(job,username,badgeMap) {
	return new Promise(async resolve => {
		let user_role = undefined;
		let roleAttempts = 0;
		const highRoles = ["broadcaster", "vip", "moderator"];
		for (let highBadge in job.data.msg.tags.badges) {
			if (highRoles.indexOf(highBadge) > -1) {
				resolve(highBadge);
			} else { roleAttempts++; }
		}

		const subRoles = ["subscriber"];
		if (user_role === undefined) {
			for (let subBadge in job.data.msg.tags.badges) {
				if (subRoles.indexOf(subBadge) > -1) {
					resolve(subBadge);
				} else { roleAttempts++; }
			}
		}
			
		if (user_role === undefined && roleAttempts === ((badgeMap.size) * 2)) {
			resolve("viewer");
		}
	});
}

// Updates User Role, Active Timestamp, Lurk Status if Lurked
// Also Updates Active Queue Maps if User Leaves/Joins
async function updateUser(job,username) {
	return new Promise(resolve => {
		getUser(job,username).then( async user => {
			// Updates Active Timestamp
			await db.pool.query("UPDATE userlist SET user_lastactivets = current_timestamp WHERE user_username = $1", [ username ]);
			
			// Updates User Role
			if (user.rows[0].user_type === "unknown") {
				job.updateProgress("[BOT][DBU] Type Unknown Updating User:[" + username + "]");
				await get_userRole(job,username,new Map(Object.entries(job.data.msg.tags.badges))).then( async user_role => {
					job.updateProgress("[BOT][DBU] Setting User:[" + username + "] Type:[" + user_role + "]");
					await db.pool.query("UPDATE userlist SET user_type = $1 WHERE user_username = $2", [ user_role, username ]);
				});
			}

			// Unlurks the User in CB Userlist Only if Lurked
			if (user.rows[0].user_lurk === true) {
				await db.pool.query("UPDATE userlist SET user_lurk = false WHERE user_username = $1", [ username ]);
			}

			// Updates Active Queue Maps if User Joins
			await updateUser_aQueue(job,username,true).then( () => {
				resolve();
			}).catch( () => {
				resolve();
			});
					
		}).catch( () => {
			// If the User is not in the Userlist, Add them, then re-run updateUser
			joinUser(job, username).then( () => {
				updateUser(job,username).then( () => {
					resolve();
				});
			})
		});
	});
}

// Updates Active Queue Maps if User Leaves/Joins
async function updateUser_aQueue(job,username,activeStatus) {
	return new Promise(resolve => {
		dbbsr.getQueue_byUser(job,"active",username).then(aQueue => {
			for (row in aQueue.rows) {
				dbbsr.updateMap_uStatus(job,aQueue.rows[row].bsr_code,activeStatus).then( () => {
					let userHere = "Here";
					if (activeStatus = false) { userHere = "Gone"; }
					resolve(job.updateProgress("[BOT][DBU] User:[" + username + "] Is Now [" + userHere + "] Setting Code:[" + aQueue.rows[row].bsr_code + "]"));
				});
			}
		}).catch(eMsg => {
			resolve(job.updateProgress("[BOT][DBU]" + eMsg));
		});
	});
}

// Sets the User to Lurk Mode in CB Userlist if !lurk is Used
async function lurkUser(job,username) {
	return new Promise(resolve => {
		getUser(job,username).then( async user => {
			await db.pool.query("UPDATE userlist SET user_lurk = true WHERE user_username = $1", [ username ]);
			resolve(job.updateProgress("[BOT][DBU] User Lurked Username:[" + username + "]"));
		}).catch(eMsg => {
			updateUser(job,username).then( () => {
				lurkUser(job.username).then( () => {
					resolve();
				});
			});
		});
	});
}

module.exports = {
	getUser: getUser,
	joinUser: joinUser,
	partUser: partUser,
	updateUser: updateUser,
	lurkUser: lurkUser
};

const db = require("./db");

async function joinUser(user_username) {
	getUser(user_username, async function(userResp){
		if (userResp.rowCount === 0) {
			console.log("[BOT] User Joined Username:[" + user_username + "]");
			const insert_user = await db.pool.query("INSERT INTO userlist (user_username,user_joints,user_type,user_lurk) VALUES ($1, current_timestamp,$2,false)", [ user_username, "unknown" ]);
		}
	});
}

async function partUser(user_username) {
	getUser(user_username, async function(userResp){
		if (userResp.rowCount > 0) {
			console.log("[BOT] User Left Username:[" + user_username + "]");
			const delete_user = await db.pool.query("DELETE FROM userlist WHERE user_username = $1", [ user_username ]);
		}
	});
}

async function user_getRole(user_username, user_badges, callback) {
	return new Promise(resolve => {
		let user_role = undefined;
		const roles = ['broadcaster','vip','moderator'];
		for (var badge in user_badges) {
			if (roles.indexOf(badge) > -1) {
				user_role = badge;
			}
		}

		if (user_role === undefined) {
			const roles = ['subscriber'];
			for (var badge in user_badges) {
				if (roles.indexOf(badge) > -1) {
					user_role = badge;
				}
			}
		}

		if (user_role === undefined) {
			user_role = 'viewer';
		}

		callback(user_role);
	});
}

async function updateUser(user_username, user_badges) {
	return new Promise(async resolve => {
		getUser(user_username, async function(userResp) {
			if (userResp.rowCount > 0) {
				const update_ts = await db.pool.query("UPDATE userlist SET user_lastactivets = current_timestamp WHERE user_username = $1", [ user_username ]);
			
				if (userResp.rows[0].user_type === "unknown" || userResp.rows[0].user_type === "") {
					get_userRole(user_username,user_badges, async function(user_role) {
						const update_badge_viewer = await db.pool.query("UPDATE userlist SET user_type = $1 WHERE user_username = $2", [ user_role, user_username ]);
					});
				}

				if (userResp.rows[0].user_lurk === true) {
					const update_unlurk = await db.pool.query("UPDATE userlist SET user_lurk = false WHERE user_username = $1", [ user_username ]);
				}
				resolve();
			} else {
				joinUser(user_username);
				resolve();
			}
		});
	});
}

async function getUser(user_username, callback) {
	const select = await db.pool.query("SELECT * FROM userlist WHERE user_username = $1", [ user_username]);
	callback ( select );
}

async function lurkUser(user_username) {
	getUser(user_username, async function(userResp) {
		if (userResp.rowCount > 0) {
			const update_lurk = db.pool.query("UPDATE userlist SET user_lurk = true WHERE user_username = $1", [ user_username ]);
		}
	});
}

module.exports = { 
	joinUser: joinUser,
	partUser: partUser,
	updateUser: updateUser,
	getUser: getUser,
	lurkUser: lurkUser
};

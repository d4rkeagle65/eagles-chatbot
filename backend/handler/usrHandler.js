const path = require("path");
const usr = require(path.join(__dirname, "..", "database", "db_usr.js"));

async function usrHandler(job) {
	let breakPromise = 0;
	
	return new Promise(async resolve => {

		// When Users Join Twitch Chat
		if (job.data.msg.event === "JOIN") {
			resolve(usr.joinUser(job,job.data.msg.username));
		} else { breakPromise++; }

		// When Users Leave Tiwtch Chat
		if (job.data.msg.event === "PART") {
			resolve(usr.partUser(job,job.data.msg.username));
		} else { breakPromise++; }

		// For Updating Status/Roles/UserPresence for Maps in Queue
		if (job.data.msg.event === "PRIVMSG") {
			usr.updateUser(job,job.data.msg.username).then( () => {

				// !lurk Command for Streamers that Use It
				if (job.data.msg.message.includes("!lurk")) {
					resolve(usr.lurkUser(job,job.data.msg.username));
				} else { resolve(); }
			});
		} else { breakPromise++; }

		if (breakPromise === 3) {
			resolve();
		}
	});
}

module.exports = {
	usrHandler: usrHandler
};

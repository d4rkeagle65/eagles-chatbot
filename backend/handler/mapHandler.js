const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const https = require("https");

const dbbsr = require(path.join(__dirname, "..", "database", "db_bsr.js"));

async function mapHandler(job) {
	payload = JSON.parse(job.data.msg.payload);

	return new Promise(resolve => {
		get_mapInfo_beatSaver(job,payload.bsr_code).then( mapInfo => {
			job.updateProgress("[BOT][MH] Updating Map in DB with Map Info Code:[" + payload.bsr_code + "]");
			let bsr_name = (mapInfo.name.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ")).trim();
			let bsr_length = mapInfo.metadata.duration;
			dbbsr.updateMap_bsInfo(job,payload.bsr_code,bsr_name,bsr_length).then( msg => {
				resolve(job.updateProgress("[BOT][MH]" + msg));
			}).catch( eMsg => {
				resolve(job.updateProgress("[BOT][MH]" + eMsg));
			});
		}).catch( eMsg => {
			resolve(job.updateProgress("[BOT][MH]" + eMsg));
		});
	});
}

async function get_mapInfo_beatSaver(job,bsr_code) {
	return new Promise( (resolve,reject) => {
		job.updateProgress("[BOT][MH] Getting Map Info from BeatSaver API Code:[" + bsr_code + "]");
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
					resolve(JSON.parse(data));
				});
			});

			request.on("error", (error) => {
				reject(error);
			});

			request.end();
		};

		getPosts();
	});
}

module.exports = {
	mapHandler: mapHandler,
};

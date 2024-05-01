import axios from 'axios';

let clientid = process.env.TWITCH_CLIENT_ID;
let authorization = process.env.TOKEN;

let api = axios.create({
	headers: {
		'Client-ID': clientid,
		'Authorization': 'Bearer ' + authorization,
	}
});

export default api;

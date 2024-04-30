import api from '@/lib/twitch-api';

export async function GET() {
	const res = await api.get('https://api.twitch.tv/helix/chat/badges/global');
	return new Response(JSON.stringify(res.data.data));
}

import api from "@/lib/twitch/twitch_api"

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await api.get("https://api.twitch.tv/helix/chat/badges/global")
  return new Response(JSON.stringify(res.data.data))
}


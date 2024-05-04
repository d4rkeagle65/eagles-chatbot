import prisma from "@/lib/db/prisma"

export async function GET() {
  const res = await prisma.bsrsettings.findMany({
    where: { setting_name: "queue_sync" }
  })
  return new Response(JSON.stringify(res))
}


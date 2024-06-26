import prisma from "@/lib/db/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const res = await prisma.bsractive.findMany({
    orderBy: {
      od: "asc"
    }
  })
  return new Response(JSON.stringify(res))
}


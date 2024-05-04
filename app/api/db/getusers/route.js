import prisma from "@/lib/db/prisma"

export async function GET() {
  const res = await prisma.userlist.findMany({
    orderBy: {
      user_lastactivets: "desc"
    }
  })
  return new Response(JSON.stringify(res))
}


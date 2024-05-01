import prisma from '@/lib/db/prisma';

export async function GET() {
	const res = await prisma.bsactive.findMany({
		orderBy: {
			od: 'desc',
		},
	});
	return new Response(JSON.stringify(res));
}


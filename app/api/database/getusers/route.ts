import prisma from '@/lib/database/prisma';

export async function GET() {
	const res = await prisma.userlist.findMany({
		/*where: {
			NOT:[{
				user_lastactivets: null,
			}],
		},*/
		orderBy: {
			user_lastactivets: 'desc',
		},
	});
	return new Response(JSON.stringify(res));
}

import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

async function UserLastActivity(props) {
	if (props.timestamp === null) {
		return;
	} else {
		const newtimestamp = props.timestamp;
		newtimestamp.setHours(newtimestamp.getHours() + 4);
		const time = newtimestamp.toLocaleTimeString("en-US");
		return (
			<>
				<div className="time-since">{time}</div>
			</>
		);
	}
}

async function UserLurk(props) {
	let lurk;
	if (props.lurk) {
		lurk = "L";
	} else {
		lurk = "";
	}
	return (
		<>
			<div className="user-lurk box-border">{lurk}</div>
		</>
	);
}

async function UserTableSection(props) {
	return (
		<>
			{props.users.map((user) => (
				<div className="user-row flex flex-row">
					<div className="user-role-badge-col flex-none w-18 h-18 pr-2"></div>
					<div className="user-name-col text-slate-500 dark:text-slate-400 mt-1 text-em grow flex flex-row">
						<div className="username grow">{user.user_username}</div>
						<div className="user-lurk-chip justify-items-end"><UserLurk lurk={user.user_lurk} /></div>
					</div>
					<div className="user-lastactivity-col w-80 text-slate-500 dark:text-slate-400 mt-1 pl-2 text-em">
						<UserLastActivity timestamp={user.user_lastactivets} />
					</div>
				</div>
			))}
		</>
	);
}

export default async function UsersTable() {
	const activeUsers = await prisma.userlist.findMany({
		where: {
			NOT: [
				{
					user_lastactivets: null,
				}
			],
		},
		orderBy: {
			user_lastactivets: 'desc',
		},
	});
	const inactiveUsers = await prisma.userlist.findMany({
		where: {
			user_lastactivets: null,
		},
	});
	return (
		<>
			<h1 className="text-slate-900 dark:text-white mt5 text-base font-medium">User List</h1>
			<div className="user-list">
				<UserTableSection users={activeUsers} />
				<UserTableSection users={inactiveUsers} />
			</div>
		</>
	);
}

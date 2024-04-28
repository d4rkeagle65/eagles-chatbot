import UserTable from "@/app/ui/userlist/user-list";

export const dynamic = "force-dynamic";

export default async function Home() {
	return (
		<div className="home basis-4/6 justify-self-center">
			<div className="home-header p-2">
				<h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium">Home Page</h3>
				<p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">This is the home page for Eagles-Chatbot</p>
			</div>
			<div className="content flex flex-row">
				<div className="queue pr-1 basis-4/5 rounded border"></div>
				<div className="usertable pl-1 basis-1/5 rounded border">
					<UserTable />
				</div>
			</div>
		</div>
	);
}

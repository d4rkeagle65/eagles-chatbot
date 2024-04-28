import type { Metadata } from 'next';

import "@/app/globals.css";

export const metadata: Metadata = {
	title: "Eagles Chatbot",
	description: "Chatbot written by d4rkeagle for Twitch and BeatSaberPlus.",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-white dark:bg-slate-800 px-6">
				<main>{children}</main>
			</body>
		</html>
	);
}

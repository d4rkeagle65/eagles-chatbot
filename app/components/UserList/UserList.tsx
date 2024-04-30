'use client';
import * as React from 'react';
import Image from "next/image";

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Table from '@mui/material/Table';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

//import getConfig from 'next/config';
//const { publicRuntimeConfig } = getConfig();

function UserLurk(props) {
	if (props.lurk) {
		return <Chip size="sm">L</Chip>;
	} else {
		return;
	}
}

function UserLastActivity(props) {
	if (props.timestamp) {
		let tStamp = new Date(props.timestamp).toLocaleTimeString("en-US", { timeZone: "UTC" });
		return (
			<>{tStamp}</>
		);
	} else {
		return;
	}
}

function UserType(props) {
	if (typeof props.badge[0] === "undefined") {
		return;
	} else {
		return (
			<Avatar
				src={props.badge[0].versions[0].image_url_1x}
				alt={props.badge[0].set_id}
				width={18}
				height={18}
				variant="square"
			/>
		);
	}
}

function UserRow(props) {
	
	const sBadge = props.badges.map((badge) => { if (badge.set_id === props.user.user_type) { return badge }}).filter(Boolean);

	return (
		<React.Fragment>
			<tr key={props.user.id} sx={{ m: 0, p: 0 }}>
				<td sx={{ m: 0,p: 0 }}><UserType badge={sBadge} /></td>
				<td>{props.user.user_username}</td>
				<td><UserLurk lurk={props.user.user_lurk} /></td>
				<td><UserLastActivity timestamp={props.user.user_lastactivets} /></td>
			</tr>
		</React.Fragment>
	);
}

function UserTable(props) {
	return (
		<React.Fragment>
			<Table
				hoverRow
				noWrap
				size="sm"
				borderAxis="both"
				variant="plain"
				sx={{
					m: 0,
					p: 0,
					"--TableCell-height": "20px",
					"--TableCell-paddingX": "0px",
					"--TableCell-paddingY": "0px",
					'& tbody td:nth-child(1)': {
						width: '10%',
					},
					'& tbody td:nth-child(2)': {
						width: '55%',
					},
					'& tbody td:nth=child(3)': {
						textAligh: 'right'
					},
					'& tbody td:nth-child(4)': {
						width: '25%',
					},
				}}
			>
				<tbody sx={{ m: 0, p: 0 }}>
					{props.users.map((user) => (
						<UserRow user={user} badges={props.badges} />
					))}			
				</tbody>
			</Table>
		</React.Fragment>
	);
}

export default function TableUsers() {
	const [index, setIndex] = React.useState<number | null>(0);
	const [uloading, setULoading] = React.useState(true);
	const [bloading, setBLoading] = React.useState(true);
	const [users, setUsers] = React.useState(null);	
	const [badges, setBadges] = React.useState(null);

	React.useEffect(() => {
		async function getUsers() {
			const userList = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/database/getusers', { next: { revalidate: 60 } });
			const uData = await userList.json();
			setUsers(uData);
			setULoading(false);
		}
		async function getBadges() {
			fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/twitch/getbadges', { next: { revalidate: 86400 } })
				.then(readableStreamData => readableStreamData.json())
				.then(json => {
					setBadges(json);
					setBLoading(false);
				});
		}

		getBadges();		
		getUsers();
	}, []);

	if (uloading || bloading) {
		return <p> Loading Userlist </p>;
	}

	console.log(users);
	console.log(badges);
	return (
		<>
					<Accordion
						expanded={index === 0}
						onChange={(event, expanded) => {
							setIndex(expanded ? 0 : null);
						}}
					>
						<AccordionSummary>Active Users</AccordionSummary>
						<AccordionDetails>
							<UserTable users={users} badges={badges} />
						</AccordionDetails>
					</Accordion>
		</>
	);
}

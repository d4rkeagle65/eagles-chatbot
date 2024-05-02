'use client';
import * as React from 'react';

import LinearProgress from '@mui/joy/LinearProgress';
import Table from '@mui/joy/Table';
import Chip from '@mui/joy/Chip';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';

function CalcLength(props) {
	let date = new Date(0);
	date.setSeconds(props.seconds);
	let timeString = date.toISOString().substring(11, 19);
	return (
		<Typography level="body-xs">
			{timeString}
		</Typography>
	);
}

function MapName(props) {
	let bsrNote;
	if (props.note) {
		bsrNote = (
			<Tooltip 
				title={props.note}
				size="sm" 
				variant="solid"
				arrow
				placement="bottom-start"
			>
				<Chip size="sm" variant="solid">Note</Chip>
			</Tooltip>
		);
	}
	return (
		<Box sx={{ display: 'flex', flexBasis: '100%' }}>
			<Typography level="body-xs" sx={{ flexGrow: 2 }}>{props.bsr_name}</Typography>
			<Box sx={{ flexShrink: 0 }}>{bsrNote}</Box>
		</Box>
	);
}

function MapCode(props) {
	let remapChip;
	let qHref = "https://beatsaver.com/maps/" + props.code;
	if (props.remap) {
		remapChip = (
			<Tooltip
				title="Remapped"
				size="sm"
				variant="solid"
				arrow
				placement="bottom-start"
			>
				<Chip size="sm" variant="soft">R</Chip>
			</Tooltip>
		);
	}
	return ( <Typography 
			level="body-xs"
			endDecorator={ remapChip }
		 >
			<Link
				underline="always"
				variant="plain"
				href={qHref}
				target="_blank"
			>
				{props.code}
			</Link>
		</Typography>
	);
}

function MapRequesterPresence(props) {
	if (props.here === false) {
		return( 
			<Tooltip
				title="User missing from Twitch chat."
				size="sm"
				variant="solid"
				arrow
				placement="bottom-end"
			>
				<Chip size="sm" variant="soft" color="danger">M</Chip> 
			</Tooltip>
		);
	} else { return; }
}

function MapRequester(props) {
	let hereChip;
	if (props.here === false) {
		hereChip = <Chip size="sm">M</Chip>;
	}
	return ( <Typography level="body-xs" endDecorator={ hereChip } > {props.user} </Typography> );
}

function QueueRow(props) {
	let qIndex = props.index + 1;
	return (
		<tr key={props.qMap.bsr_code}>
			<td style={{ textAligh: 'right' }}><Typography level="body-xs">{qIndex}</Typography></td>
			<td><MapName bsr_name={props.qMap.bsr_name} note={props.qMap.bsr_note} /></td>
			<td><MapCode code={props.qMap.bsr_code} remap={props.qMap.sus_remap} /></td>
			<td><MapRequester user={props.qMap.bsr_req} here={props.qMap.bsr_req_here} /></td>
			<td><CalcLength seconds={props.qMap.bsr_length} /></td>
			<td></td>
		</tr>
	);
}

function QueueTable(props) {
	let qOrder = 0;
	return (
		<Table 
			size="sm" 
			stripe="odd" 
			hoverRow
			sx={{
				captionSide: 'top',
				'& tbody': { bgcolor: 'background.surface' },
			}}
		>
			<thead>
				<tr>
					<th style={{ width: '3em' }}></th>
					<th style={{ width: '100%' }}>Map Name</th>
					<th style={{ width: '7em' }}>Code</th>
					<th style={{ width: '25%' }}>Requester</th>
					<th style={{ width: '6em' }}>Length</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{props.maps.map((row, index) => (
					<QueueRow qMap={row} index={index} />
				))}
			</tbody>
		</Table>
	);
}

export default function BsrQueueTable() {
	const [qLoading, setQLoading] = React.useState(true);
	const [activeQueue, setAQueue] = React.useState(true);

	React.useEffect(() => {
		async function getQueue() {
			const queueData = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/db/getqueue', { next: { revalidate: 60 } });
			const qData = await queueData.json();
			setAQueue(qData);
			setQLoading(false);
		}

		getQueue();
	}, []);

	if (qLoading) {
		return (
			<Box
				alignItems="center"
				justifyContent="center"
				display="flex"
				sx={{
					width: '100%',
					mx: 'auto',
					px: 'auto',
					align: 'center',
				}}
			>
				<LinearProgress thickness={1} />
			</Box>
		);
	}

	return (
		<>
			<QueueTable maps={activeQueue} />
		</>
	);
}

'use client';
import * as React from 'react';
import Chip from '@mui/joy/Chip';
import Tooltip from '@mui/joy/Tooltip';

export default function QueueStatus() {
	const [sLoading, setStatusLoading] = React.useState(true);
	const [queueStatus, setQueueStatus] = React.useState(true);

	React.useEffect(() => {
		async function getQueueStatus() {
			const statusData = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/db/getqueuestatus', { next: { revalidate: 60 } });
			const sData = await statusData.json();
			setQueueStatus(sData);
			setStatusLoading(false);
		}
	
		getQueueStatus();
	}, []);

	if (sLoading) {
		return;
	}

	let qStatus = 'Closed';
	let cColor = 'danger'
	if (queueStatus[0].setting_value === 'Open') {
		qStatus = 'Open';
		cColor = 'neutral';
	}
	let ttTitle="The Queue is " + qStatus + "!";

	return (
		<Tooltip
			title={ttTitle}
			size="sm"
			variant="solid"
			arrow
			placement="bottom-end"
		>
			<Chip size="md" variant="outlined" color={cColor}>{qStatus}</Chip>
		</Tooltip>
	);

}

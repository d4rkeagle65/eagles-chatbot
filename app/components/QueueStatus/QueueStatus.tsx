'use client';
import * as React from 'react';
import Chip from '@mui/joy/Chip';

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

	console.log(queueStatus);

	let qStatus = 'Closed';
	let cColor = 'danger'
	if (queueStatus[0].setting_value === 'Open') {
		qStatus = 'Open';
		cColor = 'neutral';
	}

	return (
		<>
			<Chip size="md" variant="outlined" color={cColor}>{qStatus}</Chip>
		</>
	);

}

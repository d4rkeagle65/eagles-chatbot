'use client';
import * as React from 'react';
import Chip from '@mui/joy/Chip';

export default function QueueSyncState() {
	const [sLoading, setStateLoading] = React.useState(true);
	const [queueState, setQueueState] = React.useState(true);

	React.useEffect(() => {
		async function getQueueState() {
			const stateData = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/db/getsyncstate', { next: { revalidate: 60 } });
			const sData = await stateData.json();
			setQueueState(sData);
			setStateLoading(false);
		}
	
		getQueueState();
	}, []);

	if (sLoading) {
		return;
	}

	console.log(queueState);

	let qState = 'Synced with BS+';
	let cColor = 'neutral'
	if (queueState[0].setting_value === true) {
		qState = 'Desynced from BS+';
		cColor = 'danger';
	}

	return (
		<>
			<Chip size="md" variant="outlined" color={cColor}>{qState}</Chip>
		</>
	);

}

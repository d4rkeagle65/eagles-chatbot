'use client';
import * as React from 'react';

import { ColorPaletteProp } from '@mui/joy/styles';
import Chip from '@mui/joy/Chip';
import Tooltip from '@mui/joy/Tooltip';

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

	let qState = 'Synced with BS+';
	let cColor = 'neutral'
	if (Object.values(queueState)[0].setting_value === true) {
		qState = 'Desynced from BS+';
		cColor = 'danger';
	}
	let ttText = "Chatbot Queue is " + qState;
	
	return (
		<Tooltip
			title={ttText}
			size="sm"
			variant="solid"
			arrow
			placement="bottom-end"
		>
			<Chip 
				size="md" 
				variant="outlined" 
				color={
					{
						'Synced with BS+': 'neutral',
						'Desynced from BS+': 'danger',
					}[qState] as ColorPaletteProp
				}
			>
				{qState}
			</Chip>
		</Tooltip>
	);

}

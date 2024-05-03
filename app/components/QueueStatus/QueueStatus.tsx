'use client';
import * as React from 'react';

import { ColorPaletteProp } from '@mui/joy/styles';
import Chip from '@mui/joy/Chip';
import Tooltip from '@mui/joy/Tooltip';

export default function QueueStatus() {
	const [sLoading, setStatusLoading] = React.useState(true);
	const [queueStatus, setQueueStatus] = React.useState(true);

	React.useEffect(() => {
		async function getQueueStatus() {
			const statusData = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/db/getqueuestatus', { next: { revalidate: 60 } });
			const sData = await statusData.json();
			setQueueStatus(sData[0]);
			setStatusLoading(false);
		}
	
		getQueueStatus();
	}, []);

	if (sLoading) {
		return;
	}
	
	console.log(queueStatus);
	let qStatus = queueStatus.setting_value.charAt(0).toUpperCase() + queueStatus.setting_value.substring(1);
	let cColor = 'danger'
	if (qStatus === 'open') {
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
			<Chip 
				size="md" 
				variant="outlined" 
				color={
					{
						Closed: 'danger',
						Open: 'neutral',
					}[qStatus] as ColorPaletteProp
				}
			>
				{qStatus}
			</Chip>
		</Tooltip>
	);

}

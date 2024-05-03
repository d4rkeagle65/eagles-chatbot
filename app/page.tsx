import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

import UserList from '@/components/UserList/UserList';
import BsrQueue from '@/components/BsrQueue/BsrQueue';
import QueueStatus from '@/components/QueueStatus/QueueStatus';
import QueueSyncState from '@/components/QueueSyncState/QueueSyncState';

export default function Home() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column'}}>
			<Grid container spacing={0} sx={{ display: 'flex', flexGrow: 1 }} columns={20}>
				<Grid xs={16}>
					<Sheet variant="soft" sx={{ pt: 1, borderRadius: 'sm', my: 2, ml: 2}}>
						<Box sx={{ display: 'flex', flexBasis: '100%', mx: 2 }}>
							<Typography level="h4" fontSize="x2" sx={{ flexGrow: 2 }}>{process.env.NEXT_PUBLIC_TWITCH_CHANNEL}'s BS+ Queue</Typography>
							<Box sx={{ flexShrink: 0 }}>
								<QueueStatus />
								<QueueSyncState />
							</Box>
						</Box>
						<BsrQueue />
					</Sheet>
				</Grid>
				<Grid xs={4}>
					<Sheet variant="soft" sx={{ m: 2 }}>
						<UserList />
					</Sheet>
				</Grid>
			</Grid>
		</Box>
	);
}

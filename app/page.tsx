import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import Grid from '@mui/joy/Grid';

import UserList from '@/components/UserList/UserList/';

export default function Home() {
	return (
		<Grid container spacing={0.5} sx={{ flexGrow: 1 }}>
			<Grid xs={10}>
				Queue
			</Grid>
			<Grid xs={2}>
				<UserList />
			</Grid>
		</Grid>
	);
}

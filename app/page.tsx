import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';

import UserList from '@/components/UserList/UserList';
import BsrQueue from '@/components/BsrQueue/BsrQueue';

export default function Home() {
	return (
		<Box sx={{ display: 'flex' }}>
			<Grid container spacing={0} sx={{ flexGrow: 1 }} columns={20}>
				<Grid xs={2}>
					Sidebar
				</Grid>
				<Grid xs={12} sx={{ m: 2 }}>
					<BsrQueue />
				</Grid>
				<Grid xs={4} sx={{ my: 2 }}>
					<UserList />
				</Grid>
			</Grid>
		</Box>
	);
}

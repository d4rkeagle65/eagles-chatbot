'use client';
import * as React from 'react';

import Sheet from '@mui/joy/Sheet';

import BsrQueueTable from '@/components/BsrQueue/BsrQueueTable';
		
export default function BsrQueue() {
	return (
		<Sheet variant="soft" sx={{ pt: 1, borderRadius: 'sm' }}>
			<BsrQueueTable />
		</Sheet>
	);
}


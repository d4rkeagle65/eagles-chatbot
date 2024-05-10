import { Suspense } from 'react';
import Box from '@mui/joy/Box';

import BsrQueueTable from '@/components/BsrQueueTable/BsrQueueTable';

export const dynamic = 'force-dynamic';

export default function BsrQueue() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Suspense fallback={<p> Loading BS+ Queue </p>}>
          <BsrQueueTable />
        </Suspense>
    </Box>
  )
}

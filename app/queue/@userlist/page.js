import { Suspense } from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';

import UserListTable from '@/components/UserListTable/UserListTable';

export const dynamic = 'force-dynamic'

export default function UserList() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Sheet variant="soft">
        <Suspense fallback={<p> Loading User List </p>}>
          <UserListTable />
        </Suspense>
      </Sheet>
    </Box>
  )
}

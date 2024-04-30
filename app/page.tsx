import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';

import UserList from '@/components/UserList/UserList/';

export default function Home() {
  return (
    <Sheet
      sx={{
        display: 'flex',
        flexFlow: 'row nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Sheet
        sx={{
          width: '20%',
	  mx: 'auto',
          my: 2,
          py: 2,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 'sm',
          boxShadow: 'md',
        }}
        variant="outlined"
      >
	<UserList />
      </Sheet>
    </Sheet>
  );
}

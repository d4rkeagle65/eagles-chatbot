'use client';
import { usePathname } from 'next/navigation';
import Typography from '@mui/joy/Typography';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { toggleSidebar } from '@/lib/utils/sidebartoggle';

export default function Header() {
    let selectBool = usePathname() === "/" ? "Home" : usePathname().slice(0).charAt(1).toUpperCase() + usePathname().slice(2);
    return (
      <Sheet
        sx={{
          display: { xs: 'flex', sm: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          width: '100vw',
          height: 'var(--Header-height)',
          zIndex: 9995,
          p: 2,
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'background.level1',
          boxShadow: 'sm',
        }}
      >
        <GlobalStyles
          styles={(theme) => ({
            ':root': {
              '--Header-height': '52px',
              [theme.breakpoints.up('md')]: {
                '--Header-height': '0px',
              },
            },
          })}
        />
        <IconButton
          onClick={() => toggleSidebar()}
          variant="outlined"
          color="neutral"
          size="sm"
        >
          <MenuIcon />
        </IconButton>
        <Typography>{selectBool}</Typography>
      </Sheet>
    );
  }

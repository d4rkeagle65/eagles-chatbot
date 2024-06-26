'use client';
import { usePathname, useRouter, useParams } from 'next/navigation';

import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';

import { closeSidebar } from '@/lib/utils/sidebartoggle';
import ColorToggle from "@/components/ColorToggle/ColorToggle"

const menuItems = [
    {
        name: 'Home', 
        icon: 'HomeRounded' ,
        link: '/',
    },
    { 
        name: 'Queue', 
        icon: 'QueueMusic',
        link: '/queue', 
    },
];

export default function Sidebar() {
    const router = useRouter();
    const params = useParams();

    return (
        <Sheet
            className="Sidebar"
            sx={{
                position: { xs: 'fixed', md: 'sticky' },
                transform: {
                  xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                  md: 'none',
                },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10000,
                height: '100dvh',
                width: 'var(--Sidebar-width)',
                top: 0,
                p: 2,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
            }}
        >
            <GlobalStyles
                styles={(theme) => ({
                ':root': {
                    '--Sidebar-width': '220px',
                    [theme.breakpoints.up('lg')]: {
                        '--Sidebar-width': '240px',
                    },
                },
                 })}
            />
                <Box
                    className="Sidebar-overlay"
                    sx={{
                        position: 'fixed',
                        zIndex: 9998,
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        opacity: 'var(--SideNavigation-slideIn)',
                        backgroundColor: 'var(--joy-palette-background-backdrop)',
                        transition: 'opacity 0.4s',
                        transform: {
                            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
                            lg: 'translateX(-100%)',
                        },
                    }}
                    onClick={() => closeSidebar()}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 1, alignItems: 'center' }}>
                        <Typography level="title-lg">Eagle's Chatbot</Typography>
                    </Box>
                    <ColorToggle sx={{ m1: 'auto' }}/>
                </Box>
                <Box
                    sx={{
                    minHeight: 0,
                    overflow: 'hidden auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5,
                    },
                    }}
                >
                    <List  
                        size="sm"
                        sx={{
                            gap: 1,
                            '--List-nextedInsetStart': '30px',
                            '--ListItem-radius': (theme) => theme.vars.radius.sm,
                        }}
                    >
                        {Object.values(menuItems).map((row, index) => (
                            <MenuItem menuRow={row} key={index} />
                        ))}
                    </List>
                </Box>
        </Sheet>
    )
}

function MenuItem({ menuRow, key }) {
    let selectBool = usePathname() === "/" ? "home" : usePathname().slice(1).toLowerCase();

    return (
        <ListItem key={key}>
            <ListItemButton
                role="menuItem"
                component="a"
                href={menuRow.link}
                selected={selectBool === menuRow.name.toLowerCase()}
            >
                <ListItemContent>
                    <Typography level="title-sm">{menuRow.name}</Typography>
                </ListItemContent>
            </ListItemButton>
        </ListItem>
    )

}

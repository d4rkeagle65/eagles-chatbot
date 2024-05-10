import { Grid } from '@mui/joy';
import Box from '@mui/joy/Box';

export default function QueueLayout({ bsrqueue, userlist, children }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
                {children}
            </Box>
            <Grid
                container
                spacing={{ xs: 2, lg: 2 }}
                columns={{ xs: 1, lg: 20 }}
                sx={{ 
                    flexGrow: 1,
                    border: '0px solid grey',
                }}
            >
                <Grid 
                    xs={1} 
                    lg={16} 
                    key='bsrqueue'
                    sx={{
                        border: '0px solid grey',
                    }}
                >
                        {bsrqueue}
                </Grid>
                <Grid 
                    xs={1} 
                    lg={4} 
                    key='userlist'
                    sx={{
                        border: '0px solid grey',
                    }}
                >
                    {userlist}
                </Grid>
            </Grid>
        </Box>
    )
}

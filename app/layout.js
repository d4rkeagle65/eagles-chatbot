import * as React from "react"

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

import ThemeRegistry from "@/lib/theme/ThemeRegistry"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"

export const metadata = {
  title: "Eagles-Chatbot",
  description:
    "Twitch chabot for extending functionality with BeatSaberPlus by d4rkeagle."
}

export const viewport = {
  initialScale: 1,
  width: "device-width"
}

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Box 
            className="Page"
            sx={{ display: 'flex', minHeight: '100dvh' }}
          >
            <Header />
            <Sidebar />
            <Box
              component="main"
              className="MainContent"
              sx={{
                px: { xs: 2, md: 2 },
                pt: {
                  xs: 'calc(12px + var(--Header-height))',
                  sm: 'calc(12px + var(--Header-height))',
                  md: 1,
                },
                pb: { xs: 2, sm: 2, md: 3 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                height: '100dvh',
                gap: 1,
              }}
            >
              {props.children}
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  )
}
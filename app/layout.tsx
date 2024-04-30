import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const metadata = {
  title: 'Eagles-Chatbot',
  description: 'Twitch Chatbot by d4rkeagle',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
	() =>
		createTheme({
			palette: {
				mode: prefersDarkMode ? 'dark' : 'light',
			},
		}),
	[preferDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <html lang="en">
      <body>
	{props.children}
      </body>
    </html>
    </ThemeProvider>
  );
}

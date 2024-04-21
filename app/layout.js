import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
	  <ThemeProvider>
	  	{children}
	  </ThemeProvider>
      </body>
    </html>
  )
}

"use client"
import * as React from "react"
import { CssVarsProvider } from "@mui/joy/styles"
import CssBaseline from "@mui/joy/CssBaseline"
import NextAppDirEmotionCacheProvider from "@/lib/theme/EmotionCache"
import { getInitColorSchemeScript } from "@mui/joy/styles"
import theme from "@/lib/theme/theme"

export const dynamic = 'force-dynamic'

export default function ThemeRegistry({ children }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: "joy" }}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        {getInitColorSchemeScript()}
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  )
}


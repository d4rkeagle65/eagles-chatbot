'use client';
import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import NextAppDirEmotionCacheProvider from '@/lib/theme/EmotionCache';
import { getInitColorSchemeScript } from '@mui/joy/styles';
import theme from './theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
	{getInitColorSchemeScript()}
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}


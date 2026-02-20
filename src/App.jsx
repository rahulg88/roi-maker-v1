import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ZoneDrawingTool from './components/ZoneDrawingTool';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#22c55e' },
    secondary: { main: '#3b82f6' },
    error:     { main: '#ef4444' },
    warning:   { main: '#f97316' },
    background: {
      default: '#0d1117',
      paper:   '#161b22',
    },
    divider: 'rgba(199, 26, 26, 0.08)',
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <ZoneDrawingTool />
    </ThemeProvider>
  );
}
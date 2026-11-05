import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material'
import type { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#147d75', dark: '#0e645d', contrastText: '#ffffff' },
    secondary: { main: '#e7a75a' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#17232b', secondary: '#748188' },
    error: { main: '#b84d42' },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 650, letterSpacing: '-.045em', fontSize: '1.75rem' },
    h6: { fontWeight: 650, letterSpacing: '-.02em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e8ecee',
          boxShadow: '0 3px 12px rgba(28, 48, 56, .035)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 9, minHeight: 38 },
      },
    },
  },
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

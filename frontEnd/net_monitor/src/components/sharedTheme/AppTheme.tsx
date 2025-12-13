import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface AppThemeProps {
  children: ReactNode;
  disableCustomTheme?: boolean;
}

export default function AppTheme({ children, disableCustomTheme }: AppThemeProps) {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00d4ff',
        light: '#45ffff',
        dark: '#008b8b',
        contrastText: '#000000',
      },
      secondary: {
        main: '#011f5b',
        light: '#1e2952',
        dark: '#000a1e',
        contrastText: '#ffffff',
      },
      background: {
        default: '#0c0c0c',
        paper: '#131722',
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
      },
      error: {
        main: '#f44336',
      },
      success: {
        main: '#00d4ff',
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
        fontSize: 'clamp(2rem, 5vw, 3rem)',
      },
      h4: {
        fontWeight: 700,
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      },
      body1: {
        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      },
      body2: {
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0 2px 4px rgba(0, 212, 255, 0.1)',
      '0 4px 8px rgba(0, 212, 255, 0.15)',
      '0 8px 16px rgba(0, 212, 255, 0.2)',
      '0 12px 24px rgba(0, 212, 255, 0.25)',
      '0 16px 32px rgba(0, 212, 255, 0.3)',
      '0 20px 40px rgba(0, 212, 255, 0.35)',
      '0 24px 48px rgba(0, 212, 255, 0.4)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    ],
  });

  if (disableCustomTheme) {
    return <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>{children}</ThemeProvider>;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
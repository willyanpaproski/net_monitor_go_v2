import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface AppThemeProps {
  children: ReactNode;
  disableCustomTheme?: boolean;
}

export default function AppTheme({ children, disableCustomTheme }: AppThemeProps) {
  const theme = createTheme({
    palette: {
      mode: disableCustomTheme ? 'light' : 'dark',
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

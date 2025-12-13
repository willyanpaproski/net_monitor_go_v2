import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppTheme from '../../components/sharedTheme/AppTheme';
import SignInContainer from './components/SignInContainer';
import NetworkBackground from './components/NetworkBackground';

export default function Login(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-end' },
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#0c0c0c',
          padding: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <NetworkBackground />
        <SignInContainer />
      </Box>
    </AppTheme>
  );
}
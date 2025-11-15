import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppTheme from '../../components/sharedTheme/AppTheme';
import SignInContainer from './components/SignInContainer';

export default function Login(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: { xs: "center", md: "flex-end" },
          alignItems: "center",
          position: "relative",
          overflow: "auto",
          background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
          padding: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <SignInContainer />
      </Box>
    </AppTheme>
  );
}
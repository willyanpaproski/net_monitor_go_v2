import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../components/sharedTheme/AppTheme';
import SignInContainer from './components/SignInContainer';

export default function Login(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <div style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        position: "relative"
      }}>
        <SignInContainer />
      </div>
    </AppTheme>
  );
}

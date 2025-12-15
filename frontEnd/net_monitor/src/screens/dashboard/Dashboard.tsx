import SideMenu from "../../components/SideMenu/SideMenu";
import IPVersionDashboard from "./charts/IPVersionDashboard";
import { Box } from "@mui/material";

export default function Dashboard() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0f1419 50%, #1e2139 75%, #0d1117 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.04) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 212, 255, 0.02) 2px,
              rgba(0, 212, 255, 0.02) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 212, 255, 0.02) 2px,
              rgba(0, 212, 255, 0.02) 4px
            )
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <SideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%' },
          ml: { xs: 0 },
          transition: 'margin 0.3s ease',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <IPVersionDashboard />
      </Box>
    </Box>
  );
}
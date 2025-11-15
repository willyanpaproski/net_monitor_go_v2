import SideMenu from "../../components/SideMenu/SideMenu";
import IPVersionDashboard from "./charts/IPVersionDashboard";
import { Box } from "@mui/material";

export default function Dashboard() {
    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)
                `,
                pointerEvents: 'none',
            }
        }}>
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
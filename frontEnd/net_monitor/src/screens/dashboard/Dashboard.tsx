import SideMenu from "../../components/SideMenu/SideMenu";
import IPVersionDashboard from "./charts/IPVersionDashboard";
import { Box } from "@mui/material";

export default function Dashboard() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#070B11' }}>
            <SideMenu />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { xs: '100%' },
                    ml: { xs: 0 },
                    transition: 'margin 0.3s ease',
                    overflow: 'hidden'
                }}
            >
                <IPVersionDashboard />
            </Box>
        </Box>
    );
}
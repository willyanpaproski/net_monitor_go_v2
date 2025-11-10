import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu/SideMenu";
import Box from "@mui/material/Box";

export default function Layout() {
    return(
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <SideMenu />
            <Box 
                component="main"
                sx={{ 
                    flexGrow: 1,
                    overflow: 'auto',
                    minWidth: 0
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
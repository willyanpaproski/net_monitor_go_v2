import { Box } from "@mui/material";
import type { ReactNode } from "react";

type ModalOverlayProps = {
    children: ReactNode
}

export function ModalOverlay({ children }: ModalOverlayProps) {
    return(
        <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
        }}>
            {children}
        </Box>
    );
}
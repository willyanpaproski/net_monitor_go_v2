import { Box } from "@mui/material";
import type { ReactNode } from "react"

type ModalContainerProps = {
    children: ReactNode;
    modalWidth: string;
    modalPadding: string;
    modalMargin: string;
    modalHeight: string;
}

export function ModalContainer({ 
    children, 
    modalWidth,
    modalPadding,
    modalMargin,
    modalHeight
}: ModalContainerProps) {
    const scrollBarStyle = {
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4a5568',
            borderRadius: '4px',
            '&:hover': {
                backgroundColor: '#718096',
            }
        },
        scrollbarWidth: 'thin',
        scrollbarColor: '#4a5568 #1a1a1a',
    }

    return(
        <Box sx={{
            backgroundColor: "#0C1017",
            width: "100%",
            maxWidth: modalWidth,
            padding: modalPadding,
            position: "relative",
            margin: modalMargin,
            maxHeight: modalHeight,
            overflowY: "auto",
            ...scrollBarStyle
        }}>
            {children}
        </Box>
    );
}
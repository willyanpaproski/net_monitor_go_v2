import { Grid } from "@mui/material";
import type { ReactNode } from "react"

type FormGridProps = {
    children: ReactNode;
    size: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    }
}

export function FormGrid({ children, size }: FormGridProps) {
    return (
        <Grid 
            size={size}
            display="flex" 
            flexDirection="column"
        >
            {children}
        </Grid>
    );
}
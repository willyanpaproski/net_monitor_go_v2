import { Paper, type PaperProps } from "@mui/material";
import type { PropsWithChildren } from "react";

type ContainerCardProps = PropsWithChildren<PaperProps>;

export default function ContainerCard({
    children,
    ...paperProps
}: ContainerCardProps) {
    return (
        <Paper
            {...paperProps}
            sx={{
                backgroundColor: "rgba(19, 23, 34, 0.95)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
                borderRadius: "20px",
                boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.1)",
                ...paperProps.sx,
            }}
        >
            {children}
        </Paper>
    );
}

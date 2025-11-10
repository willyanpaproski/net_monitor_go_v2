import { Box, Typography } from "@mui/material";

interface CustomChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            time: string;
            value: number;
        };
        color: string;
        value: number;
    }>;
    unit?: string;
}

export default function CustomChartTooltip({ active, payload, unit = '' }: CustomChartTooltipProps) {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <Box
                sx={{
                    bgcolor: 'rgba(30, 30, 30, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Typography variant="body2" sx={{ color: '#999', mb: 0.5 }}>
                    {dataPoint.time}
                </Typography>
                <Typography variant="body1" sx={{ color: payload[0].color, fontWeight: 600 }}>
                    {payload[0].value.toFixed(1)}{unit}
                </Typography>
            </Box>
        );
    }
    return null;
}
import { useOutletContext } from "react-router-dom";
import { useI18n } from "../../hooks/usei18n";
import { Box, Stack } from "@mui/material";
import UptimeCard from "../routerSnmpMonitor/charts/UptimeCard";
import CpuUsageLineChart from "./charts/CpuUsageLineChart";

type TransmitterDataContext = {
    uptime: string;
    currentCpu: number;
    cpuChartData: any[];
}

export default function TransmitterDashboard() {
    const { t } = useI18n();
    const { uptime, currentCpu, cpuChartData } = useOutletContext<TransmitterDataContext>();

    return (
        <>
            <Box sx={{ mb: 4 }}>
                <UptimeCard uptime={uptime} />
            </Box>
            <Stack spacing={3}>
                <CpuUsageLineChart currentCpu={currentCpu} cpuChartData={cpuChartData} />
            </Stack>
        </>
    );
}
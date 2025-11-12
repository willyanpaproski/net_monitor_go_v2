import { useOutletContext } from "react-router-dom";
import { useI18n } from "../../hooks/usei18n";
import { Box } from "@mui/material";
import UptimeCard from "../routerSnmpMonitor/charts/UptimeCard";

type TransmitterDataContext = {
    uptime: string;
}

export default function TransmitterDashboard() {
    const { t } = useI18n();
    const { uptime } = useOutletContext<TransmitterDataContext>();

    return (
        <>
            <Box sx={{ mb: 4 }}>
                <UptimeCard uptime={uptime} />
            </Box>
        </>
    );
}
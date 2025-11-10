import { useOutletContext } from "react-router-dom";
import { Box } from "@mui/material";
import VlanDashboard from "./charts/VlanList";
import TrapEventsMonitor from "../../components/TrapEventsMonitor";
import { useTrapMonitor } from "../../hooks/useTrapMonitor";

type RouterDataContext = {
    vlans: any[];
    routerId: string;
    websocketRef: React.MutableRefObject<WebSocket | null>;
    isConnected: boolean;
};

export default function RouterVlans() {
    const { vlans, routerId, websocketRef, isConnected } = useOutletContext<RouterDataContext>();
   
    const { events, clearEvents } = useTrapMonitor(websocketRef, isConnected, {
        maxEvents: 50,
        routerId: routerId
    });

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TrapEventsMonitor
                events={events}
                onClearEvents={clearEvents}
            />
           
            <VlanDashboard vlans={vlans} />
        </Box>
    );
}
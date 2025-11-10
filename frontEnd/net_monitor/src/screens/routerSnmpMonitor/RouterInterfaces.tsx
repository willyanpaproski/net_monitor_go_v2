import { useOutletContext } from "react-router-dom";
import { Box } from "@mui/material";
import PhysicalInterfacesDashboard from "./charts/PhysicalInterfaceList";
import TrapEventsMonitor from "../../components/TrapEventsMonitor";
import { useTrapMonitor } from "../../hooks/useTrapMonitor";

type RouterDataContext = {
    physicalInterfaces: any[];
    routerId: string;
    websocketRef: React.MutableRefObject<WebSocket | null>;
    isConnected: boolean;
};

export default function RouterInterfaces() {
    const { physicalInterfaces, routerId, websocketRef, isConnected } = useOutletContext<RouterDataContext>();
    
    const { events, clearEvents } = useTrapMonitor(websocketRef, isConnected, {
        maxEvents: 50,
        routerId: routerId
    });

    return (
        <Box sx={{ width: '100%' }}>
            <TrapEventsMonitor 
                events={events} 
                onClearEvents={clearEvents}
            />
            
            <PhysicalInterfacesDashboard interfaces={physicalInterfaces} />
        </Box>
    );
}
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../../hooks/usei18n";
import { useTransmitter } from "../../api/Transmitters";
import { useSnmpMonitor } from "../../hooks/useSnmpMonitor";
import { useEffect, useMemo } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { Dashboard, SettingsEthernet, HubOutlined } from "@mui/icons-material";

export default function TransmitterSnmpMonitor() {
    const { t } = useI18n();
    const { transmitterId } = useParams<{ transmitterId: string }>();
    const transmitter = useTransmitter(transmitterId!);
    const location = useLocation();
    const navigate = useNavigate();

    const monitor = useSnmpMonitor({
        apiUrl: "http://localhost:9090",
        serverUrl: "ws://localhost:9090/ws/snmp",
        autoReconnect: true,
        reconnectInterval: 5000,
        maxDataPoints: 10,
        vendor: 'thinkOlt'
    });

    useEffect(() => {
        const initCollection = async () => {
            if (transmitterId) {
                const connected = await monitor.connect(transmitterId, 'think');
                if (connected) {
                    await monitor.startCollection(transmitterId)
                }
            }
        };
        initCollection();
        return () => {
            if (transmitterId) {
                monitor.stopCollection(transmitterId);
                monitor.disconnect();
            }
        }
    }, [transmitterId]);

    const uptime = useMemo(() => {
        const [data] = monitor.getMetricData(transmitterId!, 'uptime');
        return data ? data.value as string : '00h 00m 00s';
    }, [monitor.routerData, transmitterId]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    const outletContext = {
        uptime,
        websocketRef: monitor.websocketRef,
        isConnected: monitor.isConnected
    }

    if (transmitter.isLoading) {
        return <div>{t("loading")}...</div>;
    }

    if (transmitter.isError) {
        return <div>Erro ao carregar transmissor</div>;
    }

    return (
        <Box sx={{ 
            bgcolor: '#050810', 
            minHeight: '100vh', 
            width: '100%',
            py: 3, 
            px: { xs: 2, sm: 3 },
            boxSizing: 'border-box'
        }}>
            <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'rgba(148, 163, 184, 0.1)', overflowX: 'hidden' }}>
                <Tabs 
                    value={location.pathname}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            color: '#64748b',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            minHeight: 56,
                            '&.Mui-selected': {
                                color: '#8b5cf6',
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#8b5cf6',
                            height: 3,
                        },
                    }}
                >
                    <Tab 
                        icon={<Dashboard />} 
                        iconPosition="start" 
                        label="Dashboard"
                        value={`/transmitter/${transmitterId}`}
                    />
                    <Tab 
                        icon={<SettingsEthernet />} 
                        iconPosition="start" 
                        label="Interfaces Físicas"
                        value={`/transmitter/${transmitterId}/interfaces`}
                    />
                    <Tab 
                        icon={<HubOutlined />}
                        iconPosition="start"
                        label="Vlans"
                        value={`/transmitter/${transmitterId}/vlans`}
                    />
                </Tabs>
            </Box>

            <Outlet context={outletContext} />
        </Box>
    );
}
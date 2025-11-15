import { useSnmpMonitor } from "../../hooks/useSnmpMonitor";
import { useEffect, useMemo } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Dashboard, SettingsEthernet, HubOutlined } from "@mui/icons-material";
import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRouter } from "../../api/Routers";

export default function RouterSnmpMonitor() {
    const { routerId } = useParams<{ routerId: string }>();
    const router = useRouter(routerId!);
    const location = useLocation();
    const navigate = useNavigate();

    const monitor = useSnmpMonitor({
        apiUrl: "http://localhost:9090",
        serverUrl: "ws://localhost:9090/ws/snmp",
        autoReconnect: true,
        reconnectInterval: 5000,
        maxDataPoints: 10,
        vendor: 'mikrotik'
    });

    useEffect(() => {
        const initCollection = async () => {
            if (routerId) {
                const connected = await monitor.connect(routerId, 'mikrotik');
                if (connected) {
                    await monitor.startCollection(routerId);
                }
            }
        };
        initCollection();
        return () => {
            if (routerId) {
                monitor.stopCollection(routerId);
                monitor.disconnect();
            }
        };
    }, [routerId]);

    const monthlyMemoryData = useMemo(() => {
        if (!router.data?.monthAvarageMemoryUsage?.length) {
            return { average: 0, values: [] };
        }
        
        const validRecords = router.data.monthAvarageMemoryUsage.filter(
            record => record?.value != null && !isNaN(record.value)
        );
        
        if (validRecords.length === 0) {
            return { average: 0, values: [] };
        }
        
        const values = validRecords.map(record => Number(record.value.toFixed(1)));
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;
        
        return { average, values };
    }, [router.data?.monthAvarageMemoryUsage]);

    const monthlyCpuData = useMemo(() => {
        if (!router.data?.monthAverageCpuUsage?.length) {
            return { average: 0, values: [] };
        }
        
        const validRecords = router.data.monthAverageCpuUsage.filter(
            record => record?.value != null && !isNaN(record.value)
        );
        
        if (validRecords.length === 0) {
            return { average: 0, values: [] };
        }
        
        const values = validRecords.map(record => Number(record.value.toFixed(1)));
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;
        
        return { average, values };
    }, [router.data?.monthAverageCpuUsage]);

    const monthlyDiskData = useMemo(() => {
        if (!router.data?.monthAverageDiskUsage?.length) {
            return { average: 0, values: [] };
        }
        
        const validRecords = router.data.monthAverageDiskUsage.filter(
            record => record?.value != null && !isNaN(record.value)
        );
        
        if (validRecords.length === 0) {
            return { average: 0, values: [] };
        }
        
        const values = validRecords.map(record => Number(record.value.toFixed(1)));
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;
        
        return { average, values };
    }, [router.data?.monthAverageDiskUsage]);

    const memoryChartData = useMemo(() => {
        const data = monitor.getMetricData(routerId!, 'memory_usage');
        const uniqueData = data.reduce((acc, item) => {
            const exists = acc.find(d => d.timestamp === item.timestamp);
            if (!exists) {
                acc.push(item);
            }
            return acc;
        }, [] as typeof data);
        
        return uniqueData.map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            timestamp: item.timestamp,
            value: item.value as number,
        }));
    }, [monitor.routerData, routerId]);

    const cpuChartData = useMemo(() => {
        const data = monitor.getMetricData(routerId!, 'cpu_usage');
        const uniqueData = data.reduce((acc, item) => {
            const exists = acc.find(d => d.timestamp === item.timestamp);
            if (!exists) {
                acc.push(item);
            }
            return acc;
        }, [] as typeof data);
        
        return uniqueData.map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            timestamp: item.timestamp,
            value: item.value as number,
        }));
    }, [monitor.routerData, routerId]);

    const diskChartData = useMemo(() => {
        const data = monitor.getMetricData(routerId!, 'disk_usage');
        const uniqueData = data.reduce((acc, item) => {
            const exists = acc.find(d => d.timestamp === item.timestamp);
            if (!exists) {
                acc.push(item);
            }
            return acc;
        }, [] as typeof data);
        
        return uniqueData.map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            timestamp: item.timestamp,
            value: item.value as number,
        }));
    }, [monitor.routerData, routerId]);

    const temperatureChartData = useMemo(() => {
        const data = monitor.getMetricData(routerId!, 'temperature');
        const uniqueData = data.reduce((acc, item) => {
            const exists = acc.find(d => d.timestamp === item.timestamp);
            if (!exists) {
                acc.push(item);
            }
            return acc;
        }, [] as typeof data);
        
        return uniqueData.map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            timestamp: item.timestamp,
            value: item.value as number,
        }));
    }, [monitor.routerData, routerId]);

    const currentMemory = memoryChartData[memoryChartData.length - 1]?.value as number || 0;
    const currentCpu = cpuChartData[cpuChartData.length - 1]?.value as number || 0;
    const currentDisk = diskChartData[diskChartData.length - 1]?.value as number || 0;
    const currentTemperature = temperatureChartData[diskChartData.length - 1]?.value as number || 0;

    const totalMemory = useMemo(() => {
        const [data] = monitor.getMetricData(routerId!, 'total_memory');
        return data ? data.value as number : 0;
    }, [monitor.routerData, routerId]);

    const totalDisk = useMemo(() => {
        const [data] = monitor.getMetricData(routerId!, 'total_disk');
        return data ? data.value as number : 0;
    }, [monitor.routerData, routerId]);

    const uptime = useMemo(() => {
        const [data] = monitor.getMetricData(routerId!, 'uptime');
        return data ? data.value as string : '00h 00m 00s';
    }, [monitor.routerData, routerId]);

    const physicalInterfaces = useMemo(() => {
        const [data] = monitor.getMetricData(routerId!, 'physicalInterfaces');
        return data ? (data.value as any[]) : [];
    }, [monitor.routerData, routerId]);

    const vlans = useMemo(() => {
        const [data] = monitor.getMetricData(routerId!, 'vlans');
        return data ? (data.value as any[]) : [];
    }, [monitor.routerData, routerId]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    const outletContext = {
        uptime,
        monthlyMemoryData,
        monthlyCpuData,
        monthlyDiskData,
        currentMemory,
        memoryChartData,
        totalMemory,
        currentCpu,
        cpuChartData,
        currentDisk,
        diskChartData,
        totalDisk,
        currentTemperature,
        temperatureChartData,
        physicalInterfaces,
        vlans,
        websocketRef: monitor.websocketRef,
        isConnected: monitor.isConnected
    };

    if (router.isLoading) {
        return (
            <Box sx={{ 
                bgcolor: '#0f172a', 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        border: "3px solid rgba(0, 212, 255, 0.2)",
                        borderTop: "3px solid #00d4ff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                        },
                    }}
                />
            </Box>
        );
    }

    if (router.isError) {
        return (
            <Box sx={{ 
                bgcolor: '#0f172a', 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Typography sx={{ color: '#ef4444', fontSize: '1.1rem' }}>
                    Erro ao carregar roteador
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
            minHeight: '100vh', 
            width: '100%',
            py: 3, 
            px: { xs: 2, sm: 3 },
            boxSizing: 'border-box',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 50%)
                `,
                pointerEvents: 'none',
            }
        }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                    mb: 4, 
                    borderBottom: 1, 
                    borderColor: 'rgba(0, 212, 255, 0.1)', 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0, 212, 255, 0.3)',
                        borderRadius: '3px',
                    },
                }}>
                    <Tabs 
                        value={location.pathname}
                        onChange={handleTabChange}
                        sx={{
                            minHeight: 60,
                            '& .MuiTab-root': {
                                color: 'rgba(248, 250, 252, 0.6)',
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                minHeight: 56,
                                padding: '12px 20px',
                                borderRadius: '12px 12px 0 0',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    color: '#00d4ff',
                                    backgroundColor: 'rgba(0, 212, 255, 0.05)',
                                },
                                '&.Mui-selected': {
                                    color: '#00d4ff',
                                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#00d4ff',
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab 
                            icon={<Dashboard sx={{ fontSize: 20 }} />} 
                            iconPosition="start" 
                            label="Dashboard"
                            value={`/router/${routerId}`}
                        />
                        <Tab 
                            icon={<SettingsEthernet sx={{ fontSize: 20 }} />} 
                            iconPosition="start" 
                            label="Interfaces Físicas"
                            value={`/router/${routerId}/interfaces`}
                        />
                        <Tab 
                            icon={<HubOutlined sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label="VLANs"
                            value={`/router/${routerId}/vlans`}
                        />
                    </Tabs>
                </Box>

                <Outlet context={outletContext} />
            </Box>
        </Box>
    );
}
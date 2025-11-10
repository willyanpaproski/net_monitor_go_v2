import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

interface MetricData {
    metric: string;
    value: any;
    timestamp: string;
}

interface RouterData {
    router_id: string;
    router_name?: string;
    device_type?: string;
    vendor: string;
    metrics: Map<string, MetricData[]>;
    lastUpdate: string;
}

interface SnmpMonitorConfig {
    serverUrl?: string;
    apiUrl?: string;
    reconnectInterval?: number;
    autoReconnect?: boolean;
    maxDataPoints?: number;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface UseSnmpMonitorReturn {
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
    routerData: Map<string, RouterData>;
    error: string | null;
    statusMessage: string;

    connect: (deviceId: string, vendor?: string) => Promise<boolean>;
    disconnect: () => void;

    startCollection: (deviceId: string) => Promise<boolean>;
    stopCollection: (deviceId: string) => Promise<boolean>;

    clearData: () => void;
    getRouterData: (deviceId: string) => RouterData | null;
    getMetricData: (deviceId: string, metric: string) => MetricData[];
    getRoutersList: () => string[];
    getAllRoutersData: () => RouterData[];

    clearError: () => void;

    connectedRoutersCount: number;
    hasError: boolean;
    websocketRef: React.RefObject<WebSocket | null>;
}

export const useSnmpMonitor = (config: SnmpMonitorConfig = {}): UseSnmpMonitorReturn => {
    const { token } = useAuth();

    const {
        serverUrl = 'ws://localhost:9090/ws/snmp',
        apiUrl = 'http://localhost:9090',
        reconnectInterval = 5000,
        autoReconnect = true,
        maxDataPoints = 50
    } = config;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [routerData, setRouterData] = useState<Map<string, RouterData>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Desconectado');

    const websocketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const currentDeviceRef = useRef<string | null>(null);
    const currentVendorRef = useRef<string | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const shouldReconnectRef = useRef<boolean>(false);

    const updateStatus = useCallback((status: ConnectionStatus, message: string): void => {
        setConnectionStatus(status);
        setStatusMessage(message);
        setIsConnected(status === 'connected');
    }, []);

    const cleanupConnection = useCallback((): void => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        if (websocketRef.current) {
            websocketRef.current.onopen = null;
            websocketRef.current.onmessage = null;
            websocketRef.current.onclose = null;
            websocketRef.current.onerror = null;
            
            if (websocketRef.current.readyState === WebSocket.OPEN || 
                websocketRef.current.readyState === WebSocket.CONNECTING) {
                websocketRef.current.close();
            }
            websocketRef.current = null;
        }

        isConnectingRef.current = false;
    }, []);

    const connect = useCallback(async (deviceId: string, vendor: string = 'mikrotik'): Promise<boolean> => {
        if (!deviceId) {
            setError('ID do dispositivo é obrigatório');
            return false;
        }

        if (!token) {
            setError('Token de autenticação não encontrado');
            return false;
        }

        if (isConnectingRef.current) {
            console.log('Já existe uma tentativa de conexão em andamento');
            return false;
        }

        if (websocketRef.current && 
            currentDeviceRef.current === deviceId && 
            websocketRef.current.readyState === WebSocket.OPEN) {
            console.log('Já conectado a este dispositivo');
            return true;
        }

        cleanupConnection();

        const wsUrl = `${serverUrl}?device_id=${encodeURIComponent(deviceId)}&vendor=${encodeURIComponent(vendor)}&token=${encodeURIComponent(token)}`;
        
        console.log('Conectando ao WebSocket:', { deviceId, vendor, url: serverUrl });
        
        updateStatus('connecting', 'Conectando...');
        setError(null);
        isConnectingRef.current = true;
        shouldReconnectRef.current = true;

        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(wsUrl);
                websocketRef.current = ws;
                currentDeviceRef.current = deviceId;
                currentVendorRef.current = vendor;

                const connectionTimeout = setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        console.error('Timeout na conexão WebSocket');
                        ws.close();
                        updateStatus('disconnected', 'Timeout na conexão');
                        setError('Timeout ao conectar ao servidor');
                        isConnectingRef.current = false;
                        resolve(false);
                    }
                }, 10000);

                ws.onopen = (): void => {
                    clearTimeout(connectionTimeout);
                    console.log('✅ WebSocket conectado com sucesso');
                    updateStatus('connected', `Conectado - Device: ${deviceId} (${vendor})`);
                    setError(null);
                    isConnectingRef.current = false;
                    resolve(true);
                };

                ws.onmessage = (event: MessageEvent): void => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('📊 Métrica recebida:', data);

                        if (data.event && (data.event === 'link_up' || data.event === 'link_down')) {
                            return;
                        }

                        const deviceId = data.device_id || data.router_id;
                        if (!deviceId) {
                            console.warn('Mensagem sem device_id:', data);
                            return;
                        }

                        setRouterData(prevData => {
                            const newData = new Map(prevData);
                            const existingDevice = newData.get(deviceId);
                            
                            const metrics = existingDevice?.metrics || new Map<string, MetricData[]>();
                            const metricHistory = metrics.get(data.metric) || [];

                            const isDuplicate = metricHistory.some(
                                item => item.timestamp === data.timestamp && item.value === data.value
                            );
                            
                            if (!isDuplicate && data.value !== undefined && data.value !== null) {
                                const updatedHistory = [
                                    ...metricHistory,
                                    {
                                        metric: data.metric,
                                        value: data.value,
                                        timestamp: data.timestamp
                                    }
                                ].slice(-maxDataPoints);
                                
                                metrics.set(data.metric, updatedHistory);
                                
                                newData.set(deviceId, {
                                    router_id: deviceId,
                                    router_name: data.device_name || data.router_name,
                                    device_type: data.device_type,
                                    vendor: data.vendor,
                                    metrics,
                                    lastUpdate: new Date().toISOString()
                                });
                            }
                            
                            return newData;
                        });
                    } catch (parseError) {
                        console.error('❌ Erro ao parsear dados:', parseError, event.data);
                        setError('Erro ao processar dados recebidos');
                    }
                };

                ws.onclose = (event: CloseEvent): void => {
                    clearTimeout(connectionTimeout);
                    console.log('🔌 Conexão WebSocket fechada:', {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean
                    });
                    
                    const wasConnected = isConnected;
                    updateStatus('disconnected', 'Desconectado');
                    isConnectingRef.current = false;

                    if (shouldReconnectRef.current && autoReconnect && currentDeviceRef.current && wasConnected) {
                        console.log(`🔄 Tentando reconectar em ${reconnectInterval}ms...`);
                        reconnectTimerRef.current = setTimeout(() => {
                            if (currentDeviceRef.current && shouldReconnectRef.current) {
                                console.log('🔄 Reconectando...');
                                connect(currentDeviceRef.current, currentVendorRef.current || 'mikrotik');
                            }
                        }, reconnectInterval);
                    }

                    if (!wasConnected) {
                        resolve(false);
                    }
                };

                ws.onerror = (event: Event): void => {
                    clearTimeout(connectionTimeout);
                    console.error('❌ Erro no WebSocket:', event);
                    updateStatus('disconnected', 'Erro na conexão');
                    setError('Erro na conexão WebSocket. Verifique se o servidor está rodando.');
                    isConnectingRef.current = false;
                    resolve(false);
                };

            } catch (error) {
                console.error('❌ Erro ao criar WebSocket:', error);
                updateStatus('disconnected', 'Erro ao conectar');
                setError('Erro ao estabelecer conexão: ' + (error as Error).message);
                isConnectingRef.current = false;
                resolve(false);
            }
        });
    }, [serverUrl, autoReconnect, reconnectInterval, updateStatus, maxDataPoints, token, cleanupConnection, isConnected]);

    const disconnect = useCallback((): void => {
        console.log('🔌 Desconectando...');
        shouldReconnectRef.current = false;
        currentDeviceRef.current = null;
        currentVendorRef.current = null;
        cleanupConnection();
        updateStatus('disconnected', 'Desconectado');
    }, [updateStatus, cleanupConnection]);

    const startCollection = useCallback(async (deviceId: string): Promise<boolean> => {
        if (!deviceId) {
            setError('ID do dispositivo é obrigatório');
            return false;
        }

        if (!token) {
            setError('Token de autenticação não encontrado');
            return false;
        }

        try {
            console.log('🚀 Iniciando coleta para:', deviceId);
            
            const response = await fetch(`${apiUrl}/api/snmp/device/start/${encodeURIComponent(deviceId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Coleta iniciada:', data);
            return true;
        } catch (error) {
            console.error('❌ Erro ao iniciar coleta:', error);
            setError('Erro ao iniciar coleta: ' + (error as Error).message);
            return false;
        }
    }, [apiUrl, token]);

    const stopCollection = useCallback(async (deviceId: string): Promise<boolean> => {
        if (!deviceId) {
            setError('ID do dispositivo é obrigatório');
            return false;
        }

        if (!token) {
            setError('Token de autenticação não encontrado');
            return false;
        }

        try {
            console.log('🛑 Parando coleta para:', deviceId);
            
            const response = await fetch(`${apiUrl}/api/snmp/device/stop/${encodeURIComponent(deviceId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Coleta parada:', data);
            return true;
        } catch (error) {
            console.error('❌ Erro ao parar coleta:', error);
            setError('Erro ao parar coleta: ' + (error as Error).message);
            return false;
        }
    }, [apiUrl, token]);

    const clearData = useCallback((): void => {
        setRouterData(new Map());
    }, []);

    const getRouterData = useCallback((deviceId: string): RouterData | null => {
        return routerData.get(deviceId) || null;
    }, [routerData]);

    const getMetricData = useCallback((deviceId: string, metric: string): MetricData[] => {
        const device = routerData.get(deviceId);
        return device?.metrics.get(metric) || [];
    }, [routerData]);

    const getRoutersList = useCallback((): string[] => {
        return Array.from(routerData.keys());
    }, [routerData]);

    const getAllRoutersData = useCallback((): RouterData[] => {
        return Array.from(routerData.values());
    }, [routerData]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    useEffect(() => {
        return () => {
            console.log('🧹 Limpando hook useSnmpMonitor');
            shouldReconnectRef.current = false;
            cleanupConnection();
        };
    }, [cleanupConnection]);

    return {
        isConnected,
        connectionStatus,
        routerData,
        error,
        statusMessage,

        connect,
        disconnect,

        startCollection,
        stopCollection,

        clearData,
        getRouterData,
        getMetricData,
        getRoutersList,
        getAllRoutersData,

        clearError,

        connectedRoutersCount: routerData.size,
        hasError: !!error,
        websocketRef
    };
};
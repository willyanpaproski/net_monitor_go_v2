import { useState, useEffect, useCallback, useMemo } from 'react';

export interface InterfaceTrapEvent {
    router_id: string;
    router_name: string;
    router_ip: string;
    interface_index: number;
    interface_name: string;
    event: 'link_up' | 'link_down';
    admin_status: number;
    oper_status: number;
    timestamp: string;
    trap_oid: string;
}

interface UseTrapMonitorOptions {
    maxEvents?: number;
    routerId?: string;
    enableNotifications?: boolean;
    onEvent?: (event: InterfaceTrapEvent) => void;
}

interface TrapStatistics {
    totalEvents: number;
    linkUpCount: number;
    linkDownCount: number;
    interfaceStats: Map<string, { up: number; down: number }>;
    lastEvent?: InterfaceTrapEvent;
}

interface TrapMonitorReturn {
    events: InterfaceTrapEvent[];
    allEvents: InterfaceTrapEvent[];
    statistics: TrapStatistics;
    clearEvents: () => void;
    clearStatistics: () => void;
    clearAll: () => void;
}

export function useTrapMonitor(
    websocketRef: React.RefObject<WebSocket | null>,
    isConnected: boolean,
    options: UseTrapMonitorOptions = {}
): TrapMonitorReturn {
    const { maxEvents = 50, routerId, enableNotifications = false, onEvent } = options;

    const [events, setEvents] = useState<InterfaceTrapEvent[]>([]);
    const [statistics, setStatistics] = useState<TrapStatistics>({
        totalEvents: 0,
        linkUpCount: 0,
        linkDownCount: 0,
        interfaceStats: new Map(),
    });

    useEffect(() => {
        if (enableNotifications && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [enableNotifications]);

    const showNotification = useCallback((event: InterfaceTrapEvent) => {
        if (!enableNotifications || Notification.permission !== 'granted') return;

        const isUp = event.event === 'link_up';
        const title = `Interface ${event.interface_name || event.interface_index}`;
        const body = `${isUp ? '🟢 UP' : '🔴 DOWN'} - ${event.router_name}`;

        new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `trap-${event.router_id}-${event.interface_index}`
        });
    }, [enableNotifications]);

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            if (!data.event || (data.event !== 'link_up' && data.event !== 'link_down')) return;
            if (routerId && data.router_id !== routerId) return;

            const ts = data.timestamp?.replace(/(\.\d{3})\d+/, '$1') || new Date().toISOString();

            const trapEvent: InterfaceTrapEvent = {
                router_id: data.router_id,
                router_name: data.router_name,
                router_ip: data.router_ip,
                interface_index: data.interface_index,
                interface_name: data.interface_name || `Interface ${data.interface_index}`,
                event: data.event,
                admin_status: data.admin_status,
                oper_status: data.oper_status,
                timestamp: ts,
                trap_oid: data.trap_oid
            };

            setEvents(prev => [trapEvent, ...prev].slice(0, maxEvents));

            setStatistics(prev => {
                const key = `${trapEvent.router_id}-${trapEvent.interface_index}`;
                const map = new Map(prev.interfaceStats);
                const stats = map.get(key) || { up: 0, down: 0 };
                if (trapEvent.event === 'link_up') stats.up += 1;
                else stats.down += 1;
                map.set(key, stats);

                return {
                    totalEvents: prev.totalEvents + 1,
                    linkUpCount: prev.linkUpCount + (trapEvent.event === 'link_up' ? 1 : 0),
                    linkDownCount: prev.linkDownCount + (trapEvent.event === 'link_down' ? 1 : 0),
                    interfaceStats: map,
                    lastEvent: trapEvent
                };
            });

            if (onEvent) onEvent(trapEvent);
            showNotification(trapEvent);
        } catch (err) {
            console.error('Erro ao processar evento de trap:', err);
        }
    }, [maxEvents, routerId, onEvent, showNotification]);

    useEffect(() => {
        const ws = websocketRef.current;
        if (!ws) return;

        const onMessage = (event: MessageEvent) => handleMessage(event);
        ws.addEventListener('message', onMessage);

        // Se WebSocket já estiver aberto, processa imediatamente
        if (ws.readyState === WebSocket.OPEN) {
            ws.addEventListener('open', () => console.log('WS já aberto'));
        }

        return () => ws.removeEventListener('message', onMessage);
    }, [websocketRef, handleMessage]);

    const clearEvents = useCallback(() => setEvents([]), []);
    const clearStatistics = useCallback(() => setStatistics({
        totalEvents: 0,
        linkUpCount: 0,
        linkDownCount: 0,
        interfaceStats: new Map()
    }), []);
    const clearAll = useCallback(() => { clearEvents(); clearStatistics(); }, [clearEvents, clearStatistics]);

    const filteredEvents = useMemo(() => {
        if (!routerId) return events;
        return events.filter(e => e.router_id === routerId);
    }, [events, routerId]);

    return {
        events: filteredEvents,
        allEvents: events,
        statistics,
        clearEvents,
        clearStatistics,
        clearAll
    };
}

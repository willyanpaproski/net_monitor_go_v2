import { useState } from 'react';
import { Box, Card, Typography, Chip, Stack, IconButton, Tooltip, Collapse } from '@mui/material';
import { Cable, CheckCircle, Cancel, Delete, ExpandMore, ExpandLess, Wifi, WifiOff } from '@mui/icons-material';
import type { InterfaceTrapEvent } from '../hooks/useTrapMonitor';

interface TrapEventsMonitorProps {
    events: InterfaceTrapEvent[];
    onClearEvents: () => void;
}

export default function TrapEventsMonitor({ events, onClearEvents }: TrapEventsMonitorProps) {
    const [expanded, setExpanded] = useState(true);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getEventColor = (event: string) => event === 'link_up' 
        ? { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' }
        : { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };

    return (
        <Card sx={{ bgcolor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p:2, borderBottom: '1px solid rgba(148,163,184,0.1)', display:'flex', justifyContent:'space-between', bgcolor:'rgba(15,23,42,0.8)' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                    <Box sx={{ width:40,height:40,borderRadius:1.5,bgcolor:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Cable sx={{ fontSize:24,color:'#8b5cf6'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color:'#e2e8f0', fontWeight:600}}>Eventos de Interface em Tempo Real</Typography>
                        <Typography variant="caption" sx={{ color:'#94a3b8' }}>{events.length} {events.length === 1 ? 'evento' : 'eventos'} registrados</Typography>
                    </Box>
                </Box>
                <Box sx={{ display:'flex', gap:1 }}>
                    <Tooltip title="Limpar eventos">
                        <IconButton size="small" onClick={onClearEvents} disabled={events.length===0} sx={{ color:'#94a3b8','&:hover':{bgcolor:'rgba(239,68,68,0.1)',color:'#f87171'}, '&:disabled':{color:'#475569'}}}>
                            <Delete fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={()=>setExpanded(!expanded)} sx={{ color:'#94a3b8'}}>
                        {expanded ? <ExpandLess/> : <ExpandMore/>}
                    </IconButton>
                </Box>
            </Box>

            {/* Events list */}
            <Collapse in={expanded}>
                <Box sx={{ maxHeight:400, overflowY:'auto', p:2 }}>
                    {events.length === 0 ? (
                        <Box sx={{ textAlign:'center', py:4 }}>
                            <Cable sx={{ fontSize:48, color:'#64748b', mb:2 }}/>
                            <Typography variant="body2" sx={{ color:'#64748b' }}>Nenhum evento detectado ainda</Typography>
                            <Typography variant="caption" sx={{ color:'#475569', display:'block', mt:1 }}>Os eventos de link up/down aparecerão aqui automaticamente</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {events.map((event, idx) => {
                                const colors = getEventColor(event.event);
                                const isUp = event.event==='link_up';
                                return (
                                    <Card key={`${event.router_id}-${event.interface_index}-${idx}`} sx={{ bgcolor:'rgba(30,41,59,0.4)', border:`1px solid ${colors.border}`, borderRadius:1.5, p:2, transition:'all 0.2s ease', '&:hover':{bgcolor:'rgba(30,41,59,0.6)', transform:'translateX(4px)'}}}>
                                        <Box sx={{ display:'flex', alignItems:'flex-start', gap:2 }}>
                                            <Box sx={{ width:36,height:36,borderRadius:1,bgcolor:colors.bg,border:`1px solid ${colors.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                {isUp ? <Wifi sx={{ fontSize:20,color:colors.text }}/> : <WifiOff sx={{ fontSize:20,color:colors.text }}/>}
                                            </Box>
                                            <Box sx={{ flex:1, minWidth:0 }}>
                                                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.5, flexWrap:'wrap' }}>
                                                    <Typography variant="body2" sx={{ color:'#e2e8f0', fontWeight:600, wordBreak:'break-word' }}>{event.interface_name || `Interface ${event.interface_index}`}</Typography>
                                                    <Chip icon={isUp ? <CheckCircle sx={{ fontSize:14 }}/> : <Cancel sx={{ fontSize:14 }}/>} label={isUp?'UP':'DOWN'} size="small" sx={{ height:22, bgcolor:colors.bg, color:colors.text, border:`1px solid ${colors.border}`, fontWeight:600, fontSize:'0.7rem' }}/>
                                                </Box>
                                                <Typography variant="caption" sx={{ color:'#94a3b8', display:'block', mb:1 }}>{event.router_name} ({event.router_ip})</Typography>
                                                <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, alignItems:'center' }}>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>Index: {event.interface_index}</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>•</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>Admin: {event.admin_status===1?'Up':'Down'}</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>•</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>Oper: {event.oper_status===1?'Up':'Down'}</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b' }}>•</Typography>
                                                    <Typography variant="caption" sx={{ color:'#64748b', fontFamily:'monospace' }}>{formatTimestamp(event.timestamp)}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Card>
    );
}

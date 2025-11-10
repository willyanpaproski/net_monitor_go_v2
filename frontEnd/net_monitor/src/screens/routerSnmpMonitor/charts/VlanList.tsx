import { useState, useMemo } from 'react';
import { Box, Card, Typography, Chip, TextField, InputAdornment, CardContent } from '@mui/material';
import { Lan, CheckCircle, Cancel, Help, Warning, Search as SearchIcon } from '@mui/icons-material';

interface Vlan {
    index: string;
    name: string;
    type: number;
    mac_address: string;
    ip_address?: string[];
    admin_status: number;
    oper_status: number;
}

interface VlanDashboardProps {
    vlans?: Vlan[];
}

const getAdminStatusInfo = (status: number) => {
    switch (status) {
        case 1:
            return { 
                label: 'Ativo', 
                color: 'rgba(59, 130, 246, 0.1)',
                textColor: '#60a5fa',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                icon: CheckCircle
            };
        case 2:
            return { 
                label: 'Desativado', 
                color: 'rgba(239, 68, 68, 0.1)',
                textColor: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                icon: Cancel
            };
        case 3:
            return { 
                label: 'Testando', 
                color: 'rgba(251, 191, 36, 0.1)',
                textColor: '#fbbf24',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                icon: Warning
            };
        default:
            return { 
                label: 'Desconhecido', 
                color: 'rgba(100, 116, 139, 0.1)',
                textColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.3)',
                icon: Help
            };
    }
};

const getOperStatusInfo = (status: number) => {
    switch (status) {
        case 1:
            return { 
                label: 'Operacional', 
                color: 'rgba(59, 130, 246, 0.1)',
                textColor: '#60a5fa',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                icon: CheckCircle
            };
        case 2:
            return { 
                label: 'Inativo', 
                color: 'rgba(239, 68, 68, 0.1)',
                textColor: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                icon: Cancel
            };
        case 3:
            return { 
                label: 'Testando', 
                color: 'rgba(251, 191, 36, 0.1)',
                textColor: '#fbbf24',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                icon: Warning
            };
        case 4:
            return { 
                label: 'Desconhecido', 
                color: 'rgba(100, 116, 139, 0.1)',
                textColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.3)',
                icon: Help
            };
        case 5:
            return { 
                label: 'Dormant', 
                color: 'rgba(251, 191, 36, 0.1)',
                textColor: '#fbbf24',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                icon: Warning
            };
        case 6:
            return { 
                label: 'Não Presente', 
                color: 'rgba(239, 68, 68, 0.1)',
                textColor: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                icon: Cancel
            };
        case 7:
            return { 
                label: 'Lower Layer Down', 
                color: 'rgba(239, 68, 68, 0.1)',
                textColor: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                icon: Cancel
            };
        default:
            return { 
                label: 'Desconhecido', 
                color: 'rgba(100, 116, 139, 0.1)',
                textColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.3)',
                icon: Help
            };
    }
};

const getVlanTypeLabel = (type: number): string => {
    const types: Record<number, string> = {
        135: 'Bridge',
        136: 'VLAN',
        6: 'Ethernet'
    };
    return types[type] || `Type ${type}`;
};

export default function VlanDashboard({ vlans = [] }: VlanDashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVlans = useMemo(() => {
        if (!searchTerm) return vlans;
        
        return vlans.filter(vlan => 
            vlan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vlan.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vlan.index?.includes(searchTerm) ||
            vlan.ip_address?.some(ip => ip.includes(searchTerm))
        );
    }, [vlans, searchTerm]);

    if (!vlans || vlans.length === 0) {
        return (
            <Card 
                sx={{ 
                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center'
                }}
            >
                <Lan sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                    Nenhuma VLAN encontrada
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Aguardando coleta de dados das VLANs
                </Typography>
            </Card>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ 
                mb: 3, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
            }}>
                <Box>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: '#e2e8f0',
                            fontWeight: 600,
                            mb: 0.5
                        }}
                    >
                        VLANs Configuradas
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {filteredVlans.length} {filteredVlans.length === 1 ? 'VLAN detectada' : 'VLANs detectadas'}
                    </Typography>
                </Box>
                
                <TextField
                    placeholder="Buscar VLANs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        width: { xs: '100%', sm: 300 },
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(15, 23, 42, 0.6)',
                            color: '#e2e8f0',
                            '& fieldset': {
                                borderColor: 'rgba(59, 130, 246, 0.2)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(59, 130, 246, 0.4)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                            },
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#64748b',
                            opacity: 1,
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 18, color: '#64748b' }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                width: '100%'
            }}>
                {filteredVlans.map((vlan) => {
                    const adminStatus = getAdminStatusInfo(vlan.admin_status);
                    const operStatus = getOperStatusInfo(vlan.oper_status);
                    const AdminIcon = adminStatus.icon;
                    const OperIcon = operStatus.icon;

                    return (
                        <Box
                            key={vlan.index}
                            sx={{
                                flex: { 
                                    xs: '1 1 100%', 
                                    sm: '1 1 calc(50% - 12px)', 
                                    lg: '1 1 calc(33.333% - 16px)' 
                                },
                                minWidth: 0,
                                maxWidth: { 
                                    xs: '100%', 
                                    sm: 'calc(50% - 12px)', 
                                    lg: 'calc(33.333% - 16px)' 
                                },
                                marginBottom: 5
                            }}
                        >
                            <Card
                                sx={{
                                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: 2,
                                    height: '100%',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'rgba(59, 130, 246, 0.5)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        mb: 2 
                                    }}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(59, 130, 246, 0.15)',
                                                border: '2px solid rgba(59, 130, 246, 0.4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Lan sx={{ fontSize: 32, color: '#3b82f6' }} />
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    color: '#e2e8f0',
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem',
                                                    mb: 0.5,
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {vlan.name}
                                            </Typography>
                                            <Chip 
                                                label={`VLAN ID: ${vlan.index}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    height: 22
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ 
                                        bgcolor: 'rgba(30, 41, 59, 0.5)',
                                        borderRadius: 1.5,
                                        p: 2,
                                        mb: 2
                                    }}>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                fontWeight: 600,
                                                display: 'block',
                                                mb: 1
                                            }}
                                        >
                                            Tipo de Interface
                                        </Typography>
                                        <Chip 
                                            label={getVlanTypeLabel(vlan.type)}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(14, 165, 233, 0.15)',
                                                color: '#38bdf8',
                                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                                fontWeight: 500,
                                                fontSize: '0.8rem'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        mb: 2
                                    }}>
                                        <Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mb: 1
                                                }}
                                            >
                                                Endereço MAC
                                            </Typography>
                                            <Box sx={{
                                                bgcolor: 'rgba(30, 41, 59, 0.5)',
                                                borderRadius: 1,
                                                p: 1.5,
                                                border: '1px solid rgba(59, 130, 246, 0.1)'
                                            }}>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: '#cbd5e1',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.85rem',
                                                        wordBreak: 'break-all'
                                                    }}
                                                >
                                                    {vlan.mac_address || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mb: 1
                                                }}
                                            >
                                                Endereços IP
                                            </Typography>
                                            {vlan.ip_address && vlan.ip_address.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                                    {vlan.ip_address.map((ip, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={ip}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(59, 130, 246, 0.15)',
                                                                color: '#60a5fa',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.75rem',
                                                                height: 24,
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                                                    borderRadius: 1,
                                                    p: 1.5,
                                                    border: '1px solid rgba(59, 130, 246, 0.1)'
                                                }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#64748b',
                                                            fontStyle: 'italic',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        Nenhum IP configurado
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ 
                                        display: 'flex', 
                                        gap: 1.5,
                                        pt: 2,
                                        borderTop: '1px solid rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mb: 0.75
                                                }}
                                            >
                                                Admin
                                            </Typography>
                                            <Chip
                                                icon={<AdminIcon sx={{ fontSize: 14 }} />}
                                                label={adminStatus.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: adminStatus.color,
                                                    color: adminStatus.textColor,
                                                    border: `1px solid ${adminStatus.borderColor}`,
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                    height: 26,
                                                    width: '100%'
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ flex: 1 }}>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mb: 0.75
                                                }}
                                            >
                                                Operacional
                                            </Typography>
                                            <Chip
                                                icon={<OperIcon sx={{ fontSize: 14 }} />}
                                                label={operStatus.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: operStatus.color,
                                                    color: operStatus.textColor,
                                                    border: `1px solid ${operStatus.borderColor}`,
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                    height: 26,
                                                    width: '100%'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>

            {filteredVlans.length === 0 && searchTerm && (
                <Card 
                    sx={{ 
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        mt: 2
                    }}
                >
                    <SearchIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                        Nenhuma VLAN encontrada
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Tente ajustar os termos de busca
                    </Typography>
                </Card>
            )}
        </Box>
    );
}
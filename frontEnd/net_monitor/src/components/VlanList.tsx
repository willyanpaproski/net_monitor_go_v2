import { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  CardContent,
  Grid,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Lan,
  CheckCircle,
  Cancel,
  Help,
  Warning,
  Search as SearchIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

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
        label: "Ativo",
        color: "rgba(0, 212, 255, 0.15)",
        textColor: "#00d4ff",
        borderColor: "rgba(0, 212, 255, 0.3)",
        icon: CheckCircle,
      };
    case 2:
      return {
        label: "Desativado",
        color: "rgba(239, 68, 68, 0.15)",
        textColor: "#ef4444",
        borderColor: "rgba(239, 68, 68, 0.3)",
        icon: Cancel,
      };
    case 3:
      return {
        label: "Testando",
        color: "rgba(251, 191, 36, 0.15)",
        textColor: "#fbbf24",
        borderColor: "rgba(251, 191, 36, 0.3)",
        icon: Warning,
      };
    default:
      return {
        label: "Desconhecido",
        color: "rgba(100, 116, 139, 0.15)",
        textColor: "#94a3b8",
        borderColor: "rgba(148, 163, 184, 0.3)",
        icon: Help,
      };
  }
};

const getOperStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "Up",
        color: "rgba(34, 197, 94, 0.15)",
        textColor: "#22c55e",
        borderColor: "rgba(34, 197, 94, 0.3)",
        icon: CheckCircle,
      };
    case 2:
      return {
        label: "Down",
        color: "rgba(239, 68, 68, 0.15)",
        textColor: "#ef4444",
        borderColor: "rgba(239, 68, 68, 0.3)",
        icon: Cancel,
      };
    case 3:
      return {
        label: "Testando",
        color: "rgba(251, 191, 36, 0.15)",
        textColor: "#fbbf24",
        borderColor: "rgba(251, 191, 36, 0.3)",
        icon: Warning,
      };
    default:
      return {
        label: "Unknown",
        color: "rgba(100, 116, 139, 0.15)",
        textColor: "#94a3b8",
        borderColor: "rgba(148, 163, 184, 0.3)",
        icon: Help,
      };
  }
};

const getVlanTypeLabel = (type: number): string => {
  const types: Record<number, string> = {
    135: "Bridge",
    136: "VLAN",
    6: "Ethernet",
  };
  return types[type] || `Type ${type}`;
};

export default function VlanDashboard({ vlans = [] }: VlanDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "up" | "down">(
    "all"
  );
  const [expandedVlan, setExpandedVlan] = useState<string | null>(null);

  const filteredVlans = useMemo(() => {
    let filtered = vlans;

    if (searchTerm) {
      filtered = filtered.filter(
        (vlan) =>
          vlan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vlan.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vlan.index?.includes(searchTerm) ||
          vlan.ip_address?.some((ip) => ip.includes(searchTerm))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vlan) =>
        statusFilter === "up" ? vlan.oper_status === 1 : vlan.oper_status !== 1
      );
    }

    return filtered;
  }, [vlans, searchTerm, statusFilter]);

  const toggleExpand = (index: string) => {
    setExpandedVlan(expandedVlan === index ? null : index);
  };

  const getStatusStats = () => {
    const up = vlans.filter((vlan) => vlan.oper_status === 1).length;
    const down = vlans.filter((vlan) => vlan.oper_status !== 1).length;
    return { up, down, total: vlans.length };
  };

  const stats = getStatusStats();

  if (!vlans || vlans.length === 0) {
    return (
      <Card
        sx={{
          bgcolor: "rgba(19, 23, 34, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
          borderRadius: "16px",
          p: 4,
          textAlign: "center",
        }}
      >
        <Lan sx={{ fontSize: 48, color: "#a855f7", mb: 2, opacity: 0.5 }} />
        <Typography
          variant="h6"
          sx={{ color: "#f8fafc", mb: 1, fontWeight: 600 }}
        >
          Nenhuma VLAN encontrada
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(248, 250, 252, 0.6)" }}>
          Aguardando coleta de dados das VLANs
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#f8fafc",
                fontWeight: 700,
                mb: 0.5,
                background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VLANs Configuradas
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(248, 250, 252, 0.6)" }}
            >
              {filteredVlans.length} de {vlans.length} VLANs
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<CheckCircle sx={{ color: "#22c55e" }} />}
              label={`${stats.up} Ativas`}
              size="small"
              sx={{
                bgcolor: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<Cancel sx={{ color: "#ef4444" }} />}
              label={`${stats.down} Inativas`}
              size="small"
              sx={{
                bgcolor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Buscar VLANs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(19, 23, 34, 0.6)",
                color: "#f8fafc",
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "rgba(168, 85, 247, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(168, 85, 247, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#a855f7",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(248, 250, 252, 0.5)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "#a855f7" }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              { key: "all", label: "Todas", count: stats.total },
              { key: "up", label: "Ativas", count: stats.up },
              { key: "down", label: "Inativas", count: stats.down },
            ].map((filter) => (
              <Chip
                key={filter.key}
                label={`${filter.label} (${filter.count})`}
                size="small"
                clickable
                onClick={() => setStatusFilter(filter.key as any)}
                sx={{
                  bgcolor:
                    statusFilter === filter.key
                      ? "rgba(168, 85, 247, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  color:
                    statusFilter === filter.key
                      ? "#a855f7"
                      : "rgba(248, 250, 252, 0.6)",
                  border:
                    statusFilter === filter.key
                      ? "1px solid rgba(168, 85, 247, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(168, 85, 247, 0.15)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {filteredVlans.map((vlan) => {
          const adminStatus = getAdminStatusInfo(vlan.admin_status);
          const operStatus = getOperStatusInfo(vlan.oper_status);
          const isExpanded = expandedVlan === vlan.index;

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={vlan.index}>
              <Card
                sx={{
                  bgcolor: "rgba(19, 23, 34, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                  overflow: "visible",
                  "&:hover": {
                    borderColor: "rgba(168, 85, 247, 0.4)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 32px rgba(168, 85, 247, 0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "rgba(168, 85, 247, 0.1)",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Lan sx={{ fontSize: 24, color: "#a855f7" }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#f8fafc",
                            fontWeight: 600,
                            fontSize: "1rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {vlan.name}
                        </Typography>
                        <Chip
                          label={`ID: ${vlan.index}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(168, 85, 247, 0.15)",
                            color: "#a855f7",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={<operStatus.icon sx={{ fontSize: 14 }} />}
                          label={operStatus.label}
                          size="small"
                          sx={{
                            bgcolor: operStatus.color,
                            color: operStatus.textColor,
                            border: `1px solid ${operStatus.borderColor}`,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 22,
                          }}
                        />
                        <Chip
                          label={getVlanTypeLabel(vlan.type)}
                          size="small"
                          sx={{
                            bgcolor: "rgba(14, 165, 233, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(14, 165, 233, 0.3)",
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(vlan.index)}
                      sx={{
                        color: "#a855f7",
                        bgcolor: "rgba(168, 85, 247, 0.1)",
                        "&:hover": {
                          bgcolor: "rgba(168, 85, 247, 0.2)",
                        },
                      }}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto">
                    <Box
                      sx={{
                        pt: 2,
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(248, 250, 252, 0.6)",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            MAC Address
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#f8fafc",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              wordBreak: "break-all",
                              bgcolor: "rgba(30, 41, 59, 0.5)",
                              p: 1,
                              borderRadius: 1,
                            }}
                          >
                            {vlan.mac_address || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(248, 250, 252, 0.6)",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Status Admin
                          </Typography>
                          <Chip
                            icon={<adminStatus.icon sx={{ fontSize: 12 }} />}
                            label={adminStatus.label}
                            size="small"
                            sx={{
                              bgcolor: adminStatus.color,
                              color: adminStatus.textColor,
                              border: `1px solid ${adminStatus.borderColor}`,
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: 20,
                            }}
                          />
                        </Grid>

                        {vlan.ip_address && vlan.ip_address.length > 0 && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(248, 250, 252, 0.6)",
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              IP Addresses
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {vlan.ip_address.map((ip, idx) => (
                                <Chip
                                  key={idx}
                                  label={ip}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(34, 197, 94, 0.1)",
                                    color: "#22c55e",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                    fontFamily: "monospace",
                                    fontSize: "0.7rem",
                                    height: 20,
                                  }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredVlans.length === 0 && (
        <Card
          sx={{
            bgcolor: "rgba(19, 23, 34, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            borderRadius: "16px",
            p: 4,
            textAlign: "center",
            mt: 2,
          }}
        >
          <SearchIcon
            sx={{ fontSize: 48, color: "#a855f7", mb: 2, opacity: 0.5 }}
          />
          <Typography
            variant="h6"
            sx={{ color: "#f8fafc", mb: 1, fontWeight: 600 }}
          >
            Nenhuma VLAN encontrada
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(248, 250, 252, 0.6)" }}
          >
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Aguardando dados das VLANs"}
          </Typography>
        </Card>
      )}
    </Box>
  );
}

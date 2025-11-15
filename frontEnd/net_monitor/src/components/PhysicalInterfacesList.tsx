import { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Collapse,
  CardContent,
} from "@mui/material";
import {
  Cable,
  SettingsEthernet,
  Search as SearchIcon,
  CheckCircle,
  Cancel,
  Help,
  Warning,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

interface PhysicalInterface {
  index: string;
  name: string;
  type: number;
  mac_address: string;
  ip_address?: string[];
  admin_status: number;
  oper_status: number;
}

interface PhysicalInterfacesDashboardProps {
  interfaces?: PhysicalInterface[];
}

const getAdminStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "Ativo",
        color: "rgba(0, 212, 255, 0.15)" as const,
        textColor: "#00d4ff",
        borderColor: "rgba(0, 212, 255, 0.3)",
        icon: CheckCircle,
      };
    case 2:
      return {
        label: "Desativado",
        color: "rgba(239, 68, 68, 0.15)" as const,
        textColor: "#ef4444",
        borderColor: "rgba(239, 68, 68, 0.3)",
        icon: Cancel,
      };
    case 3:
      return {
        label: "Testando",
        color: "rgba(251, 191, 36, 0.15)" as const,
        textColor: "#fbbf24",
        borderColor: "rgba(251, 191, 36, 0.3)",
        icon: Warning,
      };
    default:
      return {
        label: "Desconhecido",
        color: "rgba(100, 116, 139, 0.15)" as const,
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
        color: "rgba(34, 197, 94, 0.15)" as const,
        textColor: "#22c55e",
        borderColor: "rgba(34, 197, 94, 0.3)",
        icon: CheckCircle,
      };
    case 2:
      return {
        label: "Down",
        color: "rgba(239, 68, 68, 0.15)" as const,
        textColor: "#ef4444",
        borderColor: "rgba(239, 68, 68, 0.3)",
        icon: Cancel,
      };
    case 3:
      return {
        label: "Testando",
        color: "rgba(251, 191, 36, 0.15)" as const,
        textColor: "#fbbf24",
        borderColor: "rgba(251, 191, 36, 0.3)",
        icon: Warning,
      };
    default:
      return {
        label: "Unknown",
        color: "rgba(100, 116, 139, 0.15)" as const,
        textColor: "#94a3b8",
        borderColor: "rgba(148, 163, 184, 0.3)",
        icon: Help,
      };
  }
};

const getInterfaceTypeLabel = (type: number): string => {
  const types: Record<number, string> = {
    6: "Ethernet",
    24: "Loopback",
    131: "Tunnel",
    135: "Bridge",
  };
  return types[type] || `Type ${type}`;
};

export default function PhysicalInterfacesDashboard({
  interfaces = [],
}: PhysicalInterfacesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "up" | "down">(
    "all"
  );
  const [expandedInterface, setExpandedInterface] = useState<string | null>(
    null
  );

  const filteredInterfaces = useMemo(() => {
    let filtered = interfaces;

    if (searchTerm) {
      filtered = filtered.filter(
        (iface) =>
          iface.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          iface.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          iface.ip_address?.some((ip) => ip.includes(searchTerm))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((iface) =>
        statusFilter === "up"
          ? iface.oper_status === 1
          : iface.oper_status !== 1
      );
    }

    return filtered;
  }, [interfaces, searchTerm, statusFilter]);

  const toggleExpand = (index: string) => {
    setExpandedInterface(expandedInterface === index ? null : index);
  };

  const getStatusStats = () => {
    const up = interfaces.filter((iface) => iface.oper_status === 1).length;
    const down = interfaces.filter((iface) => iface.oper_status !== 1).length;
    return { up, down, total: interfaces.length };
  };

  const stats = getStatusStats();

  if (!interfaces || interfaces.length === 0) {
    return (
      <Card
        sx={{
          bgcolor: "rgba(19, 23, 34, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          borderRadius: "16px",
          p: 4,
          textAlign: "center",
        }}
      >
        <Cable sx={{ fontSize: 48, color: "#00d4ff", mb: 2, opacity: 0.5 }} />
        <Typography
          variant="h6"
          sx={{ color: "#f8fafc", mb: 1, fontWeight: 600 }}
        >
          Nenhuma interface encontrada
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(248, 250, 252, 0.6)" }}>
          Aguardando coleta de dados das interfaces físicas
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
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
                background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Interfaces Físicas
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(248, 250, 252, 0.6)" }}
            >
              {filteredInterfaces.length} de {interfaces.length} interfaces
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
            placeholder="Buscar interfaces..."
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
                  borderColor: "rgba(0, 212, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 212, 255, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00d4ff",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(248, 250, 252, 0.5)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "#00d4ff" }} />
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
                      ? "rgba(0, 212, 255, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  color:
                    statusFilter === filter.key
                      ? "#00d4ff"
                      : "rgba(248, 250, 252, 0.6)",
                  border:
                    statusFilter === filter.key
                      ? "1px solid rgba(0, 212, 255, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(0, 212, 255, 0.15)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {filteredInterfaces.map((iface) => {
          const adminStatus = getAdminStatusInfo(iface.admin_status);
          const operStatus = getOperStatusInfo(iface.oper_status);
          const isExpanded = expandedInterface === iface.index;

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={iface.index}>
              <Card
                sx={{
                  bgcolor: "rgba(19, 23, 34, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 212, 255, 0.2)",
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                  overflow: "visible",
                  "&:hover": {
                    borderColor: "rgba(0, 212, 255, 0.4)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 32px rgba(0, 212, 255, 0.1)",
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
                        bgcolor: "rgba(0, 212, 255, 0.1)",
                        border: "1px solid rgba(0, 212, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SettingsEthernet
                        sx={{ fontSize: 24, color: "#00d4ff" }}
                      />
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
                          {iface.name}
                        </Typography>
                        <Chip
                          label={getInterfaceTypeLabel(iface.type)}
                          size="small"
                          sx={{
                            bgcolor: "rgba(0, 212, 255, 0.15)",
                            color: "#00d4ff",
                            border: "1px solid rgba(0, 212, 255, 0.3)",
                            fontWeight: 500,
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
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(248, 250, 252, 0.5)",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          #{iface.index}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(iface.index)}
                      sx={{
                        color: "#00d4ff",
                        bgcolor: "rgba(0, 212, 255, 0.1)",
                        "&:hover": {
                          bgcolor: "rgba(0, 212, 255, 0.2)",
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
                            MAC Address
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#f8fafc",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              wordBreak: "break-all",
                            }}
                          >
                            {iface.mac_address || "N/A"}
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

                        {iface.ip_address && iface.ip_address.length > 0 && (
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
                              {iface.ip_address.map((ip, idx) => (
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

      {filteredInterfaces.length === 0 && (
        <Card
          sx={{
            bgcolor: "rgba(19, 23, 34, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            borderRadius: "16px",
            p: 4,
            textAlign: "center",
            mt: 2,
          }}
        >
          <SearchIcon
            sx={{ fontSize: 48, color: "#00d4ff", mb: 2, opacity: 0.5 }}
          />
          <Typography
            variant="h6"
            sx={{ color: "#f8fafc", mb: 1, fontWeight: 600 }}
          >
            Nenhuma interface encontrada
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(248, 250, 252, 0.6)" }}
          >
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Aguardando dados das interfaces"}
          </Typography>
        </Card>
      )}
    </Box>
  );
}

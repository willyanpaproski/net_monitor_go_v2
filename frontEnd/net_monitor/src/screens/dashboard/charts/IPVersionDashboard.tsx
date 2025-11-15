import { Box, Paper, Typography, Grid, Stack, IconButton } from "@mui/material";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useEffect } from "react";
import {
  useIPVersionFlowsPercent,
  useIPVersionBytes,
  useIPVersionFlowsPercentByDay,
} from "../../../api/IPVersionMetrics";
import RouterIcon from "@mui/icons-material/Router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const COLORS = {
  ipv4: "#00d4ff",
  ipv6: "#10b981",
  accent: "#a855f7",
  warning: "#f97316",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload?: any;
  }>;
  label?: string;
}

export default function IPVersionDashboard() {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const {
    data: flowData,
    isLoading: flowLoading,
    error: flowError,
  } = useIPVersionFlowsPercent();

  const {
    data: bytesData,
    isLoading: bytesLoading,
    error: bytesError,
  } = useIPVersionBytes();

  const { data: hourlyData, isLoading: isLoadingHourly } =
    useIPVersionFlowsPercentByDay(selectedDate || "");

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
  }, []);

  const handlePointClick = (data: any) => {
    let clickedDate = null;

    if (data && data.activePayload && data.activePayload[0]) {
      clickedDate = data.activePayload[0].payload?.date;
    } else if (data && data.activeLabel) {
      clickedDate = data.activeLabel;
    }

    if (clickedDate) {
      setSelectedDate(clickedDate);
    }
  };

  const handleBackToDaily = () => {
    setSelectedDate(null);
  };

  if (flowLoading || bytesLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
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

  if (flowError || bytesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography color="error" sx={{ fontWeight: 500 }}>
            Erro ao carregar métricas de IPv4/IPv6
          </Typography>
        </Paper>
      </Box>
    );
  }

  const totalFlows =
    flowData?.reduce((acc, curr) => acc + curr.totalFlows, 0) ?? 0;
  const avgIPv4Percentage =
    flowData && flowData.length > 0
      ? flowData.reduce((acc, curr) => acc + curr.ipv4Percentage, 0) /
        flowData.length
      : 0;
  const avgIPv6Percentage =
    flowData && flowData.length > 0
      ? flowData.reduce((acc, curr) => acc + curr.ipv6Percentage, 0) /
        flowData.length
      : 0;

  const totalIPv4MB =
    bytesData?.reduce((acc, curr) => acc + curr.ipv4MB, 0) ?? 0;
  const totalIPv6MB =
    bytesData?.reduce((acc, curr) => acc + curr.ipv6MB, 0) ?? 0;
  const totalMB = totalIPv4MB + totalIPv6MB;

  const pieData = [
    { name: "IPv4", value: avgIPv4Percentage, mb: totalIPv4MB },
    { name: "IPv6", value: avgIPv6Percentage, mb: totalIPv6MB },
  ];

  const hasMultipleDataPoints = flowData && flowData.length >= 2;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getDate() + 1).toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const FlowPercentTooltip = ({
    active,
    payload,
    label,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: "rgba(19, 23, 34, 0.95)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            sx={{
              color: "#f8fafc",
              fontSize: "0.875rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {selectedDate ? `Hora: ${label}` : `Data: ${label}`}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              sx={{ 
                color: entry.color, 
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {entry.name === "ipv4Percentage" ? "IPv4" : "IPv6"}:{" "}
              {entry.value.toFixed(2)}%
            </Typography>
          ))}
          {payload[0]?.payload?.totalFlows && (
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.6)",
                fontSize: "0.75rem",
                mt: 1,
                fontWeight: 500,
              }}
            >
              Total de Flows: {payload[0].payload.totalFlows.toLocaleString()}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const BytesTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            bgcolor: "rgba(19, 23, 34, 0.95)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            sx={{
              color: "#f8fafc",
              fontSize: "0.875rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Data: {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              sx={{ 
                color: entry.color, 
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {entry.name === "ipv4MB" ? "Volume IPv4" : "Volume IPv6"}:{" "}
              {formatBytes(entry.value)}
            </Typography>
          ))}
          {payload[0]?.payload?.totalMB && (
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.6)",
                fontSize: "0.75rem",
                mt: 1,
                fontWeight: 500,
              }}
            >
              Volume Total: {formatBytes(payload[0].payload.totalMB)}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  const chartData = selectedDate ? hourlyData : flowData;
  const dataKey = selectedDate ? "hour" : "date";
  const tickFormatter = selectedDate ? formatHour : formatDate;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        opacity: show ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: "rgba(0, 212, 255, 0.1)",
              borderRadius: "12px",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <RouterIcon sx={{ color: "#00d4ff", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#f8fafc",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", md: "2rem" },
                background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Análise IPv4 vs IPv6
            </Typography>
            <Typography
              sx={{ 
                color: "rgba(248, 250, 252, 0.7)", 
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {selectedDate
                ? `Detalhamento horário do dia ${formatDate(selectedDate)}`
                : "Monitoramento de tráfego em tempo real"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              backgroundImage: "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                border: "1px solid rgba(0, 212, 255, 0.4)",
                boxShadow: "0 12px 40px rgba(0, 212, 255, 0.15)",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.7)",
                fontSize: "0.8rem",
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Média IPv4
            </Typography>
            <Typography
              sx={{
                color: "#00d4ff",
                fontSize: "2.25rem",
                fontWeight: 800,
                mb: 1,
                lineHeight: 1,
              }}
            >
              {avgIPv4Percentage.toFixed(1)}%
            </Typography>
            <Typography
              sx={{ 
                color: "rgba(248, 250, 252, 0.6)", 
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {formatBytes(totalIPv4MB)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              backgroundImage: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                boxShadow: "0 12px 40px rgba(16, 185, 129, 0.15)",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.7)",
                fontSize: "0.8rem",
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Média IPv6
            </Typography>
            <Typography
              sx={{
                color: "#10b981",
                fontSize: "2.25rem",
                fontWeight: 800,
                mb: 1,
                lineHeight: 1,
              }}
            >
              {avgIPv6Percentage.toFixed(1)}%
            </Typography>
            <Typography
              sx={{ 
                color: "rgba(248, 250, 252, 0.6)", 
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {formatBytes(totalIPv6MB)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              backgroundImage: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                boxShadow: "0 12px 40px rgba(168, 85, 247, 0.15)",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.7)",
                fontSize: "0.8rem",
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total de Flows
            </Typography>
            <Typography
              sx={{
                color: "#a855f7",
                fontSize: "2.25rem",
                fontWeight: 800,
                mb: 1,
                lineHeight: 1,
              }}
            >
              {totalFlows >= 1000
                ? `${(totalFlows / 1000).toFixed(1)}K`
                : totalFlows.toLocaleString()}
            </Typography>
            <Typography
              sx={{ 
                color: "rgba(248, 250, 252, 0.6)", 
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {totalFlows.toLocaleString()} conexões
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(249, 115, 22, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              backgroundImage: "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 100%)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                border: "1px solid rgba(249, 115, 22, 0.4)",
                boxShadow: "0 12px 40px rgba(249, 115, 22, 0.15)",
              },
            }}
          >
            <Typography
              sx={{
                color: "rgba(248, 250, 252, 0.7)",
                fontSize: "0.8rem",
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Volume Total
            </Typography>
            <Typography
              sx={{
                color: "#f97316",
                fontSize: "1.75rem",
                fontWeight: 800,
                mb: 1,
                lineHeight: 1.2,
              }}
            >
              {formatBytes(totalMB)}
            </Typography>
            <Typography
              sx={{ 
                color: "rgba(248, 250, 252, 0.6)", 
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              Tráfego acumulado
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              height: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              sx={{ 
                mb: 3, 
                fontWeight: 700, 
                color: "#f8fafc",
                fontSize: "1.1rem",
              }}
            >
              Distribuição de Tráfego
            </Typography>
            <Box sx={{ flex: 1, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={1200}
                    animationBegin={400}
                    animationEasing="ease-out"
                  >
                    <Cell fill={COLORS.ipv4} stroke="none" />
                    <Cell fill={COLORS.ipv6} stroke="none" />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: "rgba(19, 23, 34, 0.95)",
                              border: "1px solid rgba(0, 212, 255, 0.3)",
                              borderRadius: "8px",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#f8fafc",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                mb: 1,
                              }}
                            >
                              Protocolo: {data.name}
                            </Typography>
                            <Typography
                              sx={{
                                color: data.name === "IPv4" ? COLORS.ipv4 : COLORS.ipv6,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              Percentual: {data.value.toFixed(1)}%
                            </Typography>
                            <Typography
                              sx={{
                                color: "rgba(248, 250, 252, 0.6)",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                              }}
                            >
                              Volume: {formatBytes(data.mb)}
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Area Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              height: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 700, 
                  color: "#f8fafc",
                  fontSize: "1.1rem",
                }}
              >
                {selectedDate
                  ? "Percentual de Flows por Hora"
                  : "Evolução Percentual por Versão IP"}
              </Typography>
              {selectedDate && (
                <IconButton
                  onClick={handleBackToDaily}
                  sx={{ 
                    color: "#00d4ff",
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                    borderRadius: "10px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 212, 255, 0.2)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            {isLoadingHourly && selectedDate ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
            ) : hasMultipleDataPoints || selectedDate ? (
              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    onClick={!selectedDate ? handlePointClick : undefined}
                  >
                    <defs>
                      <linearGradient id="colorIPv4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.ipv4} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={COLORS.ipv4} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIPv6" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.ipv6} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={COLORS.ipv6} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255, 255, 255, 0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey={dataKey}
                      tickFormatter={tickFormatter}
                      tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
                    />
                    <Tooltip content={<FlowPercentTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="ipv4Percentage"
                      stroke={COLORS.ipv4}
                      strokeWidth={3}
                      fill="url(#colorIPv4)"
                      animationDuration={1200}
                      animationBegin={400}
                      cursor={!selectedDate ? "pointer" : "default"}
                    />
                    <Area
                      type="monotone"
                      dataKey="ipv6Percentage"
                      stroke={COLORS.ipv6}
                      strokeWidth={3}
                      fill="url(#colorIPv6)"
                      animationDuration={1200}
                      animationBegin={600}
                      cursor={!selectedDate ? "pointer" : "default"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                {!selectedDate && hasMultipleDataPoints && (
                  <Typography
                    sx={{
                      color: "rgba(248, 250, 252, 0.5)",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      mt: 1,
                      fontWeight: 500,
                    }}
                  >
                    Clique em um ponto para ver detalhes horários
                  </Typography>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "rgba(248, 250, 252, 0.5)", fontWeight: 500 }}>
                  Sem dados disponíveis para o período selecionado
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(19, 23, 34, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              height: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              sx={{ 
                mb: 3, 
                fontWeight: 700, 
                color: "#f8fafc",
                fontSize: "1.1rem",
              }}
            >
              Volume de Dados por Versão IP
            </Typography>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bytesData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
                  />
                  <Tooltip
                    content={<BytesTooltip />}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Bar
                    dataKey="ipv4MB"
                    fill={COLORS.ipv4}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1200}
                    animationBegin={400}
                  />
                  <Bar
                    dataKey="ipv6MB"
                    fill={COLORS.ipv6}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1200}
                    animationBegin={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
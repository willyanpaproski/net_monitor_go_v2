import { Box, Paper, Typography, Grid, Stack } from "@mui/material";
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
} from "../../../api/IPVersionMetrics";
import RouterIcon from "@mui/icons-material/Router";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const COLORS = {
  ipv4: "#3b82f6",
  ipv6: "#10b981",
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

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
  }, []);

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
        <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
          }}
        >
          <Typography color="error">
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
  const hasSingleDataPoint = flowData && flowData.length === 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${(date.getDate() + 1).toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
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
            bgcolor: "#0C1017",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            sx={{
              color: "#e2e8f0",
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
              sx={{ color: entry.color, fontSize: "0.8rem" }}
            >
              {entry.name === "ipv4Percentage" ? "IPv4" : "IPv6"}:{" "}
              {entry.value.toFixed(2)}%
            </Typography>
          ))}
          {payload[0]?.payload?.totalFlows && (
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mt: 1,
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
            bgcolor: "#0C1017",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            sx={{
              color: "#e2e8f0",
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
              sx={{ color: entry.color, fontSize: "0.8rem" }}
            >
              {entry.name === "ipv4MB" ? "Volume IPv4" : "Volume IPv6"}:{" "}
              {formatBytes(entry.value)}
            </Typography>
          ))}
          {payload[0]?.payload?.totalMB && (
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mt: 1,
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

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        opacity: show ? 1 : 0,
        transition: "opacity 0.5s",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <RouterIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{
              color: "#e2e8f0",
              fontWeight: 700,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Análise IPv4 vs IPv6
          </Typography>
        </Stack>
        <Typography
          sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem" }}
        >
          Últimos 30 dias de tráfego da rede
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Média IPv4
            </Typography>
            <Typography
              sx={{
                color: "#3b82f6",
                fontSize: "1.75rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {avgIPv4Percentage.toFixed(1)}%
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.7rem" }}
            >
              {formatBytes(totalIPv4MB)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Média IPv6
            </Typography>
            <Typography
              sx={{
                color: "#10b981",
                fontSize: "1.75rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {avgIPv6Percentage.toFixed(1)}%
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.7rem" }}
            >
              {formatBytes(totalIPv6MB)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Total de Flows
            </Typography>
            <Typography
              sx={{
                color: "#a855f7",
                fontSize: "1.75rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {totalFlows >= 1000
                ? `${(totalFlows / 1000).toFixed(1)}K`
                : totalFlows}
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.7rem" }}
            >
              {totalFlows.toLocaleString()} flows
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(249, 115, 22, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Volume Total
            </Typography>
            <Typography
              sx={{
                color: "#f97316",
                fontSize: "1.75rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {formatBytes(totalMB)}
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.7rem" }}
            >
              Tráfego acumulado
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: 320,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 500, color: "#e2e8f0" }}
            >
              Distribuição de Tráfego
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={1000}
                  animationBegin={600}
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
                            p: 1.5,
                            bgcolor: "#0C1017",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#e2e8f0",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Protocolo: {data.name}
                          </Typography>
                          <Typography
                            sx={{
                              color:
                                data.name === "IPv4"
                                  ? COLORS.ipv4
                                  : COLORS.ipv6,
                              fontSize: "0.7rem",
                            }}
                          >
                            Percentual: {data.value.toFixed(1)}%
                          </Typography>
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.6)",
                              fontSize: "0.65rem",
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
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: 320,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 500, color: "#e2e8f0" }}
            >
              Percentual de Flows por Versão IP
            </Typography>

            {hasMultipleDataPoints ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={flowData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorIPv4" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={COLORS.ipv4}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.ipv4}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorIPv6" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={COLORS.ipv6}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS.ipv6}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
                    label={{
                      value: "%",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 },
                    }}
                  />
                  <Tooltip content={<FlowPercentTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ipv4Percentage"
                    stroke={COLORS.ipv4}
                    strokeWidth={2}
                    fill="url(#colorIPv4)"
                    animationDuration={1000}
                    animationBegin={400}
                  />
                  <Area
                    type="monotone"
                    dataKey="ipv6Percentage"
                    stroke={COLORS.ipv6}
                    strokeWidth={2}
                    fill="url(#colorIPv6)"
                    animationDuration={1000}
                    animationBegin={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : hasSingleDataPoint ? (
              <Box
                sx={{
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Grid container spacing={3} sx={{ maxWidth: 500 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "rgba(59, 130, 246, 0.1)",
                        border: "2px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <TrendingUpIcon
                        sx={{ color: COLORS.ipv4, fontSize: 40, mb: 1 }}
                      />
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      >
                        IPv4
                      </Typography>
                      <Typography
                        sx={{
                          color: COLORS.ipv4,
                          fontSize: "2rem",
                          fontWeight: 700,
                        }}
                      >
                        {flowData[0].ipv4Percentage.toFixed(1)}%
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: "0.7rem",
                          mt: 1,
                        }}
                      >
                        {flowData[0].totalFlows.toLocaleString()} flows
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                        border: "2px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <TrendingUpIcon
                        sx={{ color: COLORS.ipv6, fontSize: 40, mb: 1 }}
                      />
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      >
                        IPv6
                      </Typography>
                      <Typography
                        sx={{
                          color: COLORS.ipv6,
                          fontSize: "2rem",
                          fontWeight: 700,
                        }}
                      >
                        {flowData[0].ipv6Percentage.toFixed(1)}%
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: "0.7rem",
                          mt: 1,
                        }}
                      >
                        Data: {formatDate(flowData[0].date)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
                  Sem dados disponíveis
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#0C1017",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: 320,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 500, color: "#e2e8f0" }}
            >
              Volume de Dados por Versão IP (MB)
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={bytesData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
                  label={{
                    value: "MB",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 },
                  }}
                />
                <Tooltip
                  content={<BytesTooltip />}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Bar
                  dataKey="ipv4MB"
                  fill={COLORS.ipv4}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={400}
                />
                <Bar
                  dataKey="ipv6MB"
                  fill={COLORS.ipv6}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

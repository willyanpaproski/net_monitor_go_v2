import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Chip,
    Skeleton,
} from "@mui/material";
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import ContainerCard from "../../../components/ContainerCard";

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

const MetricCard = styled(Paper)(() => ({
    background: "rgba(19, 23, 34, 0.8)",
    borderRadius: "16px",
}));

const GradientText = styled(Typography)(() => ({
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 700,
}));

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
                    p: { xs: 2, md: 3 },
                    minHeight: "100vh",
                }}
            >
                <Stack spacing={3}>
                    <Skeleton
                        variant="rectangular"
                        height={120}
                        sx={{
                            borderRadius: "20px",
                            bgcolor: "rgba(255, 255, 255, 0.05)",
                        }}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton
                                key={i}
                                variant="rectangular"
                                height={140}
                                sx={{
                                    flex: 1,
                                    borderRadius: "16px",
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                }}
                            />
                        ))}
                    </Stack>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                        <Skeleton
                            variant="rectangular"
                            height={400}
                            sx={{
                                flex: 1,
                                borderRadius: "20px",
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                            }}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={400}
                            sx={{
                                flex: 2,
                                borderRadius: "20px",
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                            }}
                        />
                    </Stack>
                </Stack>
            </Box>
        );
    }

    if (flowError || bytesError) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <ContainerCard>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <NetworkCheckIcon
                                sx={{ color: "error.main", fontSize: 32 }}
                            />
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: "error.main",
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    Erro ao carregar métricas
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Não foi possível carregar os dados de
                                    IPv4/IPv6. Tente novamente mais tarde.
                                </Typography>
                            </Box>
                        </Stack>
                    </ContainerCard>
                </Box>
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
                <ContainerCard
                    sx={{
                        p: 2,
                        minWidth: 180,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#f8fafc",
                            fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
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
                                fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
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
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                mt: 1,
                                fontWeight: 500,
                            }}
                        >
                            Total de Flows:{" "}
                            {payload[0].payload.totalFlows.toLocaleString()}
                        </Typography>
                    )}
                </ContainerCard>
            );
        }
        return null;
    };

    const BytesTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <ContainerCard
                    elevation={0}
                    sx={{
                        p: 2,
                        minWidth: 180,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#f8fafc",
                            fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
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
                                fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                                fontWeight: 500,
                            }}
                        >
                            {entry.name === "ipv4MB"
                                ? "Volume IPv4"
                                : "Volume IPv6"}
                            : {formatBytes(entry.value)}
                        </Typography>
                    ))}
                    {payload[0]?.payload?.totalMB && (
                        <Typography
                            sx={{
                                color: "rgba(248, 250, 252, 0.6)",
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                mt: 1,
                                fontWeight: 500,
                            }}
                        >
                            Volume Total:{" "}
                            {formatBytes(payload[0].payload.totalMB)}
                        </Typography>
                    )}
                </ContainerCard>
            );
        }
        return null;
    };

    const chartData = selectedDate ? hourlyData : flowData;
    const dataKey = selectedDate ? "hour" : "date";
    const tickFormatter = selectedDate ? formatHour : formatDate;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                minHeight: "100vh",
            }}
        >
            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <ContainerCard
                    sx={{
                        p: { xs: 3, sm: 4 },
                        mb: { xs: 3, md: 4 },
                    }}
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                    >
                        <Box
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                backgroundColor: "rgba(0, 212, 255, 0.1)",
                                borderRadius: "16px",
                                border: "1px solid rgba(0, 212, 255, 0.2)",
                            }}
                        >
                            <RouterIcon
                                sx={{
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                    fontSize: { xs: 28, sm: 32, md: 36 },
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <GradientText
                                variant="h4"
                                sx={{
                                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                                    mb: { xs: 0.5, sm: 1 },
                                }}
                            >
                                Análise IPv4 vs IPv6
                            </GradientText>
                            <Typography
                                sx={{
                                    color: "rgba(248, 250, 252, 0.7)",
                                    fontSize: "clamp(0.8rem, 2vw, 1rem)",
                                    fontWeight: 500,
                                }}
                            >
                                {selectedDate
                                    ? `Detalhamento horário do dia ${formatDate(
                                          selectedDate
                                      )}`
                                    : "Monitoramento de tráfego em tempo real"}
                            </Typography>
                        </Box>
                    </Stack>
                </ContainerCard>
            </Box>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, md: 3 }}
                sx={{ mb: { xs: 3, md: 4 } }}
                flexWrap="wrap"
            >
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 } as any}
                    sx={{
                        flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 12px)",
                            md: "1 1 calc(25% - 18px)",
                        },
                    }}
                >
                    <MetricCard
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3 },
                            border: "1px solid rgba(0, 212, 255, 0.2)",
                            backgroundImage:
                                "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <DataUsageIcon
                                sx={{ color: COLORS.ipv4, fontSize: 24 }}
                            />
                            <Typography
                                sx={{
                                    color: "rgba(248, 250, 252, 0.7)",
                                    fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                Média IPv4
                            </Typography>
                        </Stack>
                        <Typography
                            sx={{
                                color: COLORS.ipv4,
                                fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
                                fontWeight: 800,
                                mb: 1,
                                lineHeight: 1,
                            }}
                        >
                            {avgIPv4Percentage.toFixed(1)}%
                        </Typography>
                        <Chip
                            label={formatBytes(totalIPv4MB)}
                            size="small"
                            sx={{
                                bgcolor: "rgba(0, 212, 255, 0.1)",
                                color: "rgba(248, 250, 252, 0.8)",
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                fontWeight: 500,
                                border: "1px solid rgba(0, 212, 255, 0.2)",
                            }}
                        />
                    </MetricCard>
                </Box>

                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 } as any}
                    sx={{
                        flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 12px)",
                            md: "1 1 calc(25% - 18px)",
                        },
                    }}
                >
                    <MetricCard
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3 },
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            backgroundImage:
                                "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <DataUsageIcon
                                sx={{ color: COLORS.ipv6, fontSize: 24 }}
                            />
                            <Typography
                                sx={{
                                    color: "rgba(248, 250, 252, 0.7)",
                                    fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                Média IPv6
                            </Typography>
                        </Stack>
                        <Typography
                            sx={{
                                color: COLORS.ipv6,
                                fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
                                fontWeight: 800,
                                mb: 1,
                                lineHeight: 1,
                            }}
                        >
                            {avgIPv6Percentage.toFixed(1)}%
                        </Typography>
                        <Chip
                            label={formatBytes(totalIPv6MB)}
                            size="small"
                            sx={{
                                bgcolor: "rgba(16, 185, 129, 0.1)",
                                color: "rgba(248, 250, 252, 0.8)",
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                fontWeight: 500,
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                            }}
                        />
                    </MetricCard>
                </Box>

                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 } as any}
                    sx={{
                        flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 12px)",
                            md: "1 1 calc(25% - 18px)",
                        },
                    }}
                >
                    <MetricCard
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3 },
                            border: "1px solid rgba(168, 85, 247, 0.2)",
                            backgroundImage:
                                "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <NetworkCheckIcon
                                sx={{ color: COLORS.accent, fontSize: 24 }}
                            />
                            <Typography
                                sx={{
                                    color: "rgba(248, 250, 252, 0.7)",
                                    fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                Total de Flows
                            </Typography>
                        </Stack>
                        <Typography
                            sx={{
                                color: COLORS.accent,
                                fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
                                fontWeight: 800,
                                mb: 1,
                                lineHeight: 1,
                            }}
                        >
                            {totalFlows >= 1000
                                ? `${(totalFlows / 1000).toFixed(1)}K`
                                : totalFlows.toLocaleString()}
                        </Typography>
                        <Chip
                            label={`${totalFlows.toLocaleString()} conexões`}
                            size="small"
                            sx={{
                                bgcolor: "rgba(168, 85, 247, 0.1)",
                                color: "rgba(248, 250, 252, 0.8)",
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                fontWeight: 500,
                                border: "1px solid rgba(168, 85, 247, 0.2)",
                            }}
                        />
                    </MetricCard>
                </Box>

                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 } as any}
                    sx={{
                        flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 12px)",
                            md: "1 1 calc(25% - 18px)",
                        },
                    }}
                >
                    <MetricCard
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3 },
                            border: "1px solid rgba(249, 115, 22, 0.2)",
                            backgroundImage:
                                "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 100%)",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <TrendingUpIcon
                                sx={{ color: COLORS.warning, fontSize: 24 }}
                            />
                            <Typography
                                sx={{
                                    color: "rgba(248, 250, 252, 0.7)",
                                    fontSize: "clamp(0.7rem, 1.8vw, 0.8rem)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                Volume Total
                            </Typography>
                        </Stack>
                        <Typography
                            sx={{
                                color: COLORS.warning,
                                fontSize: "clamp(1.5rem, 4.5vw, 1.75rem)",
                                fontWeight: 800,
                                mb: 1,
                                lineHeight: 1.2,
                            }}
                        >
                            {formatBytes(totalMB)}
                        </Typography>
                        <Chip
                            label="Tráfego acumulado"
                            size="small"
                            sx={{
                                bgcolor: "rgba(249, 115, 22, 0.1)",
                                color: "rgba(248, 250, 252, 0.8)",
                                fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)",
                                fontWeight: 500,
                                border: "1px solid rgba(249, 115, 22, 0.2)",
                            }}
                        />
                    </MetricCard>
                </Box>
            </Stack>

            <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={{ xs: 3, md: 4 }}
                sx={{ mb: { xs: 3, md: 4 } }}
            >
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 } as any}
                    sx={{ flex: { xs: "1 1 100%", lg: "1 1 35%" } }}
                >
                    <ContainerCard
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            height: { xs: 380, sm: 420, md: 450 },
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
                                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                            }}
                        >
                            Distribuição de Tráfego
                        </Typography>
                        <Box sx={{ flex: 1, position: "relative" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient
                                            id="gradientIPv4Pie"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#00d4ff"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#0099cc"
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="gradientIPv6Pie"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#10b981"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#059669"
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="85%"
                                        paddingAngle={4}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        animationDuration={1200}
                                        animationBegin={400}
                                        animationEasing="ease-out"
                                        strokeWidth={2}
                                    >
                                        <Cell
                                            fill="url(#gradientIPv4Pie)"
                                            stroke="rgba(0, 212, 255, 0.3)"
                                            filter="url(#glow)"
                                        />
                                        <Cell
                                            fill="url(#gradientIPv6Pie)"
                                            stroke="rgba(16, 185, 129, 0.3)"
                                            filter="url(#glow)"
                                        />
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                const data = payload[0].payload;
                                                return (
                                                    <ContainerCard
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            minWidth: 160,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                color: "#f8fafc",
                                                                fontSize:
                                                                    "clamp(0.75rem, 2vw, 0.875rem)",
                                                                fontWeight: 600,
                                                                mb: 1,
                                                            }}
                                                        >
                                                            {data.name}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                color:
                                                                    data.name ===
                                                                    "IPv4"
                                                                        ? COLORS.ipv4
                                                                        : COLORS.ipv6,
                                                                fontSize:
                                                                    "clamp(0.7rem, 1.8vw, 0.8rem)",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {data.value.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                color: "rgba(248, 250, 252, 0.6)",
                                                                fontSize:
                                                                    "clamp(0.65rem, 1.5vw, 0.75rem)",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {formatBytes(
                                                                data.mb
                                                            )}
                                                        </Typography>
                                                    </ContainerCard>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </ContainerCard>
                </Box>

                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 } as any}
                    sx={{ flex: { xs: "1 1 100%", lg: "1 1 65%" } }}
                >
                    <ContainerCard
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            height: { xs: 380, sm: 420, md: 450 },
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
                                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                                }}
                            >
                                {selectedDate
                                    ? "Percentual de Flows por Hora"
                                    : "Evolução Percentual por Versão IP"}
                            </Typography>
                            {selectedDate && (
                            <IconButton
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBackToDaily}
                                sx={{
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                                    border: "1px solid rgba(0, 212, 255, 0.2)",
                                    borderRadius: "12px",
                                    p: { xs: 1, sm: 1.5 },
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(0, 212, 255, 0.2)",
                                    },
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
                                            "100%": {
                                                transform: "rotate(360deg)",
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        ) : hasMultipleDataPoints || selectedDate ? (
                            <Box sx={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 10,
                                        }}
                                        onClick={
                                            !selectedDate
                                                ? handlePointClick
                                                : undefined
                                        }
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorIPv4"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={COLORS.ipv4}
                                                    stopOpacity={0.6}
                                                />
                                                <stop
                                                    offset="50%"
                                                    stopColor={COLORS.ipv4}
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={COLORS.ipv4}
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="colorIPv6"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={COLORS.ipv6}
                                                    stopOpacity={0.6}
                                                />
                                                <stop
                                                    offset="50%"
                                                    stopColor={COLORS.ipv6}
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={COLORS.ipv6}
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                            <filter id="shadow">
                                                <feDropShadow
                                                    dx="0"
                                                    dy="2"
                                                    stdDeviation="3"
                                                    floodOpacity="0.3"
                                                />
                                            </filter>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(255, 255, 255, 0.08)"
                                            vertical={false}
                                            strokeOpacity={0.5}
                                        />
                                        <XAxis
                                            dataKey={dataKey}
                                            tickFormatter={tickFormatter}
                                            tick={{
                                                fill: "rgba(248, 250, 252, 0.7)",
                                                fontSize: 11,
                                                fontWeight: 500,
                                            }}
                                            axisLine={{
                                                stroke: "rgba(0, 212, 255, 0.2)",
                                                strokeWidth: 1.5,
                                            }}
                                            tickLine={{
                                                stroke: "rgba(0, 212, 255, 0.2)",
                                            }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{
                                                fill: "rgba(248, 250, 252, 0.7)",
                                                fontSize: 11,
                                                fontWeight: 500,
                                            }}
                                            axisLine={{
                                                stroke: "rgba(0, 212, 255, 0.2)",
                                                strokeWidth: 1.5,
                                            }}
                                            tickLine={{
                                                stroke: "rgba(0, 212, 255, 0.2)",
                                            }}
                                            label={{
                                                value: "%",
                                                angle: -90,
                                                position: "insideLeft",
                                                style: {
                                                    fill: "rgba(248, 250, 252, 0.5)",
                                                    fontSize: 10,
                                                },
                                            }}
                                        />
                                        <Tooltip
                                            content={<FlowPercentTooltip />}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="ipv4Percentage"
                                            stroke={COLORS.ipv4}
                                            strokeWidth={3}
                                            fill="url(#colorIPv4)"
                                            animationDuration={1200}
                                            animationBegin={400}
                                            cursor={
                                                !selectedDate
                                                    ? "pointer"
                                                    : "default"
                                            }
                                            dot={{
                                                fill: COLORS.ipv4,
                                                strokeWidth: 2,
                                                stroke: "#fff",
                                                r: 4,
                                                filter: "url(#shadow)",
                                            }}
                                            activeDot={{
                                                r: 6,
                                                fill: COLORS.ipv4,
                                                stroke: "#fff",
                                                strokeWidth: 2,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="ipv6Percentage"
                                            stroke={COLORS.ipv6}
                                            strokeWidth={3}
                                            fill="url(#colorIPv6)"
                                            animationDuration={1200}
                                            animationBegin={600}
                                            cursor={
                                                !selectedDate
                                                    ? "pointer"
                                                    : "default"
                                            }
                                            dot={{
                                                fill: COLORS.ipv6,
                                                strokeWidth: 2,
                                                stroke: "#fff",
                                                r: 4,
                                                filter: "url(#shadow)",
                                            }}
                                            activeDot={{
                                                r: 6,
                                                fill: COLORS.ipv6,
                                                stroke: "#fff",
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {!selectedDate && hasMultipleDataPoints && (
                                    <Typography
                                        sx={{
                                            color: "rgba(248, 250, 252, 0.5)",
                                            fontSize:
                                                "clamp(0.65rem, 1.5vw, 0.75rem)",
                                            textAlign: "center",
                                            mt: 1,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Clique em um ponto para ver detalhes
                                        horários
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
                                <Typography
                                    sx={{
                                        color: "rgba(248, 250, 252, 0.5)",
                                        fontWeight: 500,
                                        fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                                    }}
                                >
                                    Sem dados disponíveis para o período
                                    selecionado
                                </Typography>
                            </Box>
                        )}
                    </ContainerCard>
                </Box>
            </Stack>

            <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 } as any}
            >
                <ContainerCard
                    sx={{
                        p: { xs: 3, sm: 4 },
                        height: { xs: 380, sm: 420, md: 450 },
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
                            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                        }}
                    >
                        Volume de Dados por Versão IP
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={bytesData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 10,
                                }}
                                barGap={4}
                                barCategoryGap="20%"
                            >
                                <defs>
                                    <linearGradient
                                        id="barGradientIPv4"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#00d4ff"
                                            stopOpacity={1}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#0099cc"
                                            stopOpacity={0.8}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="barGradientIPv6"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#10b981"
                                            stopOpacity={1}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#059669"
                                            stopOpacity={0.8}
                                        />
                                    </linearGradient>
                                    <filter id="barShadow">
                                        <feDropShadow
                                            dx="0"
                                            dy="3"
                                            stdDeviation="4"
                                            floodOpacity="0.4"
                                        />
                                    </filter>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255, 255, 255, 0.08)"
                                    vertical={false}
                                    strokeOpacity={0.5}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{
                                        fill: "rgba(248, 250, 252, 0.7)",
                                        fontSize: 11,
                                        fontWeight: 500,
                                    }}
                                    axisLine={{
                                        stroke: "rgba(16, 185, 129, 0.2)",
                                        strokeWidth: 1.5,
                                    }}
                                    tickLine={{
                                        stroke: "rgba(16, 185, 129, 0.2)",
                                    }}
                                />
                                <YAxis
                                    tick={{
                                        fill: "rgba(248, 250, 252, 0.7)",
                                        fontSize: 11,
                                        fontWeight: 500,
                                    }}
                                    axisLine={{
                                        stroke: "rgba(16, 185, 129, 0.2)",
                                        strokeWidth: 1.5,
                                    }}
                                    tickLine={{
                                        stroke: "rgba(16, 185, 129, 0.2)",
                                    }}
                                    label={{
                                        value: "MB",
                                        angle: -90,
                                        position: "insideLeft",
                                        style: {
                                            fill: "rgba(248, 250, 252, 0.5)",
                                            fontSize: 10,
                                        },
                                    }}
                                />
                                <Tooltip
                                    content={<BytesTooltip />}
                                    cursor={{
                                        fill: "rgba(255, 255, 255, 0.08)",
                                        radius: 8,
                                    }}
                                />
                                <Bar
                                    dataKey="ipv4MB"
                                    fill="url(#barGradientIPv4)"
                                    radius={[10, 10, 0, 0]}
                                    animationDuration={1200}
                                    animationBegin={400}
                                    filter="url(#barShadow)"
                                />
                                <Bar
                                    dataKey="ipv6MB"
                                    fill="url(#barGradientIPv6)"
                                    radius={[10, 10, 0, 0]}
                                    animationDuration={1200}
                                    animationBegin={600}
                                    filter="url(#barShadow)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </ContainerCard>
            </Box>
        </Box>
    );
}

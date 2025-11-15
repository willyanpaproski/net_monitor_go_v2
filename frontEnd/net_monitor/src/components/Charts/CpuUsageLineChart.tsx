import { Box, Paper, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useEffect } from "react";
import CustomChartTooltip from "../CustomChartTooltip";
import { useI18n } from "../../hooks/usei18n";
import type { LineChartDataPoint } from "../../types/LineChartDataPoint";

type CpuUsageLineChartProps = {
  currentCpu: number;
  cpuChartData: LineChartDataPoint[];
};

export default function CpuUsageLineChart({
  currentCpu,
  cpuChartData,
}: CpuUsageLineChartProps) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "rgba(19, 23, 34, 0.8)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        height: 340,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
        transition: "all 0.5s ease",
        backgroundImage: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)",
        "&:hover": {
          border: "1px solid rgba(16, 185, 129, 0.4)",
          boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
        },
      }}
    >
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: "#f8fafc",
        fontSize: "1.1rem",
      }}>
        {t('routers.snmpMonitor.dashboard.cpuUsageLineChart.title')}:{" "}
        <Box
          component="span"
          sx={{ 
            color: "#10b981", 
            fontWeight: 800, 
            fontSize: "1.2rem",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {currentCpu.toFixed(1)}%
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={cpuChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tick={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(248, 250, 252, 0.3)"
            tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
          />
          <Tooltip content={<CustomChartTooltip unit="%" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#colorCpu)"
            activeDot={{
              r: 6,
              fill: "#10b981",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationBegin={400}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 2, fill: "#10b981", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
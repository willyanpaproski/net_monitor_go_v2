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
import type { LineChartDataPoint } from "../../types/LineChartDataPoint";
import { useI18n } from "../../hooks/usei18n";
import CustomChartTooltip from "../CustomChartTooltip";

type DiskUsageLineChartProps = {
  currentDisk: number;
  diskChartData: LineChartDataPoint[];
};

export default function DiskUsageLineChart({
  currentDisk,
  diskChartData,
}: DiskUsageLineChartProps) {
    const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 400);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "rgba(19, 23, 34, 0.8)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        height: 340,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
        transition: "all 0.5s ease",
        backgroundImage: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)",
        "&:hover": {
          border: "1px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 8px 32px rgba(245, 158, 11, 0.1)",
        },
      }}
    >
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: "#f8fafc",
        fontSize: "1.1rem",
      }}>
        {t('routers.snmpMonitor.dashboard.diskUsageLineChart.title')}:{" "}
        <Box
          component="span"
          sx={{ 
            color: "#f59e0b", 
            fontWeight: 800, 
            fontSize: "1.2rem",
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {currentDisk.toFixed(1)} MB
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={diskChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
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
            stroke="rgba(248, 250, 252, 0.3)"
            tick={{ fill: "rgba(248, 250, 252, 0.6)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(248, 250, 252, 0.1)" }}
          />
          <Tooltip content={<CustomChartTooltip unit="MB" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={3}
            fill="url(#colorDisk)"
            activeDot={{
              r: 6,
              fill: "#f59e0b",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationBegin={600}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 2, fill: "#f59e0b", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
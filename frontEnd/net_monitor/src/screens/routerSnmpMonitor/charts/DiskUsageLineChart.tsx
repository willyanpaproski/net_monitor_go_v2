import { Box, Paper, Typography } from "@mui/material";
import type { LineChartDataPoint } from "../../../types/LineChartDataPoint";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomChartTooltip from "../../../components/CustomChartTooltip";
import { useState, useEffect } from "react";
import { useI18n } from "../../../hooks/usei18n";

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
        bgcolor: "#0C1017",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        borderRadius: 2,
        backdropFilter: "blur(10px)",
        height: 330,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        {t('routers.snmpMonitor.dashboard.diskUsageLineChart.title')}:{" "}
        <Box
          component="span"
          sx={{ color: "#f59e0b", fontWeight: 700, fontSize: "1.1rem" }}
        >
          {currentDisk.toFixed(1)} MB
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={diskChartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
            stroke="rgba(255, 255, 255, 0.03)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tick={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.2)"
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
            label={{
              value: "MB",
              angle: -90,
              position: "insideLeft",
              style: { fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 },
            }}
          />
          <Tooltip content={<CustomChartTooltip unit="MB" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#colorDisk)"
            activeDot={{
              r: 8,
              fill: "#f59e0b",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1000}
            animationBegin={600}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}

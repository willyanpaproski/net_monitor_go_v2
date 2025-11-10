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
        bgcolor: "#0C1017",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: 2,
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        {t('routers.snmpMonitor.dashboard.cpuUsageLineChart.title')}:{" "}
        <Box
          component="span"
          sx={{ color: "#10b981", fontWeight: 700, fontSize: "1.1rem" }}
        >
          {currentCpu.toFixed(1)}%
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={cpuChartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.2)"
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
            label={{
              value: "%",
              angle: -90,
              position: "insideLeft",
              style: { fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 },
            }}
          />
          <Tooltip content={<CustomChartTooltip unit="%" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#colorCpu)"
            activeDot={{
              r: 8,
              fill: "#10b981",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1000}
            animationBegin={400}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}

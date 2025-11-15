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
import type { LineChartDataPoint } from "../../types/LineChartDataPoint";

type MemoryUsageLineChartProps = {
  currentTemperature: number;
  temperatureChartData: LineChartDataPoint[];
};

export default function TemperatureLineChart({
  currentTemperature,
  temperatureChartData,
}: MemoryUsageLineChartProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "#0C1017",
        border: "1px solid rgba(80, 15, 231, 0.2)",
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
        Temperatura: 
        <Box
          component="span"
          sx={{ color: "#520afcff", fontWeight: 700, fontSize: "1.1rem" }}
        >
          {currentTemperature.toFixed(1)} °C
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={temperatureChartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#520afcff" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#5f1affff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6b2dfcff" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />    
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
              value: "°C",
              angle: -90,
              position: "insideLeft",
              style: { fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 },
            }}
          />
          <Tooltip content={<CustomChartTooltip unit="°C" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#520afcff"
            strokeWidth={2.5}
            fill="url(#colorTemperature)"
            activeDot={{
              r: 8,
              fill: "#520afcff",
              stroke: "#fff",
              strokeWidth: 2,
              filter: "url(#glow)",
            }}
            animationDuration={1000}
            animationBegin={200}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 3, fill: "#520afcff", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}

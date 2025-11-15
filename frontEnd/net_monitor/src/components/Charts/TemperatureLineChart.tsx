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
        bgcolor: "rgba(19, 23, 34, 0.8)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        height: 340,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
        transition: "all 0.5s ease",
        backgroundImage: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)",
        "&:hover": {
          border: "1px solid rgba(168, 85, 247, 0.4)",
          boxShadow: "0 8px 32px rgba(168, 85, 247, 0.1)",
        },
      }}
    >
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: "#f8fafc",
        fontSize: "1.1rem",
      }}>
        Temperatura: 
        <Box
          component="span"
          sx={{ 
            color: "#a855f7", 
            fontWeight: 800, 
            fontSize: "1.2rem",
            background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {currentTemperature.toFixed(1)} °C
        </Box>
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={temperatureChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
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
          <Tooltip content={<CustomChartTooltip unit="°C" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#a855f7"
            strokeWidth={3}
            fill="url(#colorTemperature)"
            activeDot={{
              r: 6,
              fill: "#a855f7",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1200}
            animationBegin={200}
            isAnimationActive={true}
            animationEasing="ease-out"
            dot={{ r: 2, fill: "#a855f7", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
import { Box, Paper, Typography } from "@mui/material";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useI18n } from "../../hooks/usei18n";

type MemoryUsageDonutChartProps = {
  currentMemory: number;
  totalMemory: number;
};

export default function MemoryUsagePieChart({
  currentMemory,
  totalMemory,
}: MemoryUsageDonutChartProps) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [_animateText, setAnimateText] = useState(false);
  const usedPercentage =
    totalMemory > 0 ? (currentMemory / totalMemory) * 100 : 0;
  const freeMemory = totalMemory - currentMemory;

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
    setTimeout(() => setAnimateText(true), 1200);
  }, []);

  const data = [
    { name: "used", value: currentMemory, color: "#8b5cf6" },
    {
      name: "free",
      value: freeMemory > 0 ? freeMemory : 0,
      color: "rgba(255, 255, 255, 0.03)",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "#0C1017",
        border: "1px solid rgba(139, 92, 246, 0.2)",
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
        {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.title")}
      </Typography>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: 0,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#8b5cf6",
              fontWeight: 800,
              fontSize: "1.8rem",
              lineHeight: 1,
            }}
          >
            {usedPercentage.toFixed(1)}%
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              mt: 0.5,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.inUsage")}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          pt: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.7rem",
              mb: 0.5,
            }}
          >
            {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.used")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#8b5cf6", fontWeight: 700, fontSize: "0.95rem" }}
          >
            {currentMemory.toFixed(1)} MB
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.7rem",
              mb: 0.5,
            }}
          >
            {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.free")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {freeMemory.toFixed(1)} MB
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.7rem",
              mb: 0.5,
            }}
          >
            Total
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {totalMemory.toFixed(1)} MB
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

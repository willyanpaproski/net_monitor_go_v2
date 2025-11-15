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
  const [animateText, setAnimateText] = useState(false);
  const usedPercentage =
    totalMemory > 0 ? (currentMemory / totalMemory) * 100 : 0;
  const freeMemory = totalMemory - currentMemory;

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
    setTimeout(() => setAnimateText(true), 1200);
  }, []);

  const data = [
    { name: "used", value: currentMemory, color: "#00d4ff" },
    {
      name: "free",
      value: freeMemory > 0 ? freeMemory : 0,
      color: "rgba(255, 255, 255, 0.05)",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "rgba(19, 23, 34, 0.8)",
        border: "1px solid rgba(0, 212, 255, 0.2)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        height: 340,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity: show ? 1 : 0,
        transition: "all 0.5s ease",
        backgroundImage: "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)",
        "&:hover": {
          border: "1px solid rgba(0, 212, 255, 0.4)",
          boxShadow: "0 8px 32px rgba(0, 212, 255, 0.1)",
        },
      }}
    >
      <Typography variant="h6" sx={{ 
        mb: 3, 
        fontWeight: 700, 
        color: "#f8fafc",
        fontSize: "1.1rem",
      }}>
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
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationDuration={1200}
              animationBegin={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                  strokeWidth={0}
                />
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
            opacity: animateText ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#00d4ff",
              fontWeight: 800,
              fontSize: "2rem",
              lineHeight: 1,
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {usedPercentage.toFixed(1)}%
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(248, 250, 252, 0.6)",
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
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(248, 250, 252, 0.6)",
              fontSize: "0.75rem",
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.used")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ 
              color: "#00d4ff", 
              fontWeight: 700, 
              fontSize: "0.95rem",
            }}
          >
            {currentMemory.toFixed(1)} MB
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(248, 250, 252, 0.6)",
              fontSize: "0.75rem",
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            {t("routers.snmpMonitor.dashboard.memoryUsagePieChart.free")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(248, 250, 252, 0.8)",
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
              color: "rgba(248, 250, 252, 0.6)",
              fontSize: "0.75rem",
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            Total
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(248, 250, 252, 0.8)",
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
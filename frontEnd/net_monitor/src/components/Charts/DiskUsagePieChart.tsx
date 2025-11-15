import { Box, Paper, Typography } from "@mui/material";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useI18n } from "../../hooks/usei18n";

type DiskUsageDonutChartProps = {
  currentDisk: number;
  totalDisk: number;
};

export default function DiskUsagePieChart({
  currentDisk,
  totalDisk,
}: DiskUsageDonutChartProps) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [_animateText, setAnimateText] = useState(false);
  const safeTotalDisk = totalDisk || 0;
  const safeCurrentDisk = currentDisk || 0;
  const usedPercentage =
    safeTotalDisk > 0 ? (safeCurrentDisk / safeTotalDisk) * 100 : 0;
  const freeDisk = safeTotalDisk - safeCurrentDisk;

  useEffect(() => {
    setTimeout(() => setShow(true), 500);
    setTimeout(() => setAnimateText(true), 1700);
  }, []);

  const data = [
    { name: "used", value: safeCurrentDisk, color: "#f59e0b" },
    {
      name: "free",
      value: freeDisk > 0 ? freeDisk : 0,
      color: "rgba(255, 255, 255, 0.03)",
    },
  ];

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
        {t("routers.snmpMonitor.dashboard.diskUsagePieChart.title")}
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
              color: "#f59e0b",
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
            {t("routers.snmpMonitor.dashboard.diskUsagePieChart.inUsage")}
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
            {t("routers.snmpMonitor.dashboard.diskUsagePieChart.used")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.95rem" }}
          >
            {safeCurrentDisk.toFixed(1)} MB
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
            {t("routers.snmpMonitor.dashboard.diskUsagePieChart.free")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {freeDisk.toFixed(1)} MB
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
            {t("routers.snmpMonitor.dashboard.diskUsagePieChart.total")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {safeTotalDisk.toFixed(1)} MB
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

import { Box, Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "../../../hooks/usei18n";

interface UptimeCardProps {
  uptime: string;
}

interface UptimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const GradientCard = styled(Card)(() => ({
  background:
    "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
  borderRadius: "16px",
  border: "1px solid rgba(34, 197, 94, 0.2)",
  backdropFilter: "blur(10px)",
}));

const IconWrapper = styled(Box)({
  width: "20px",
  height: "20px",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(34, 197, 94, 0.3)",
});

const TimeSegment = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "rgba(34, 197, 94, 0.08)",
  border: "1px solid rgba(34, 197, 94, 0.15)",
  minWidth: "60px",
});

export default function UptimeCard({ uptime }: UptimeCardProps) {
  const { t } = useI18n();
  const [currentUptime, setCurrentUptime] = useState<UptimeData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<number | null>(null);
  const lastUptimeRef = useRef<string>("");

  const parseUptime = (uptimeStr: string): UptimeData => {
    const regexWithDays = /(\d+)d\s*(\d+)h\s*(\d+)m\s*(\d+)s/;
    const regexWithoutDays = /(\d+)h\s*(\d+)m\s*(\d+)s/;

    let match = uptimeStr.match(regexWithDays);
    if (match) {
      return {
        days: parseInt(match[1]),
        hours: parseInt(match[2]),
        minutes: parseInt(match[3]),
        seconds: parseInt(match[4]),
      };
    }

    match = uptimeStr.match(regexWithoutDays);
    if (match) {
      return {
        days: 0,
        hours: parseInt(match[1]),
        minutes: parseInt(match[2]),
        seconds: parseInt(match[3]),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const incrementUptime = (uptime: UptimeData): UptimeData => {
    let { days, hours, minutes, seconds } = uptime;

    seconds += 1;

    if (seconds >= 60) {
      seconds = 0;
      minutes += 1;
    }

    if (minutes >= 60) {
      minutes = 0;
      hours += 1;
    }

    if (hours >= 24) {
      hours = 0;
      days += 1;
    }

    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    if (uptime && uptime !== lastUptimeRef.current) {
      const parsed = parseUptime(uptime);
      setCurrentUptime(parsed);
      lastUptimeRef.current = uptime;
    }
  }, [uptime]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentUptime((prev) => incrementUptime(prev));
    }, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const totalHours = currentUptime.days * 24 + currentUptime.hours;
  const getUptimeStatus = () => {
    if (totalHours < 1) return { text: "Recently Started", color: "warning" };
    if (totalHours < 24) return { text: "Active Today", color: "info" };
    if (totalHours < 168)
      return { text: "Running This Week", color: "success" };
    return { text: "Long-term Stable", color: "success" };
  };

  const status = getUptimeStatus();

  return (
    <GradientCard>
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconWrapper>
                <AccessTimeIcon sx={{ color: "#22c55e", fontSize: 28 }} />
              </IconWrapper>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#e2e8f0",
                    fontWeight: 600,
                    fontSize: "18px",
                  }}
                >
                  {t("routers.snmpMonitor.dashboard.uptimeCard.title")}
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
              label={status.text}
              size="small"
              sx={{
                backgroundColor:
                  status.color === "success"
                    ? "rgba(34, 197, 94, 0.15)"
                    : status.color === "warning"
                    ? "rgba(251, 191, 36, 0.15)"
                    : "rgba(59, 130, 246, 0.15)",
                color:
                  status.color === "success"
                    ? "#22c55e"
                    : status.color === "warning"
                    ? "#fbbf24"
                    : "#3b82f6",
                border: `1px solid ${
                  status.color === "success"
                    ? "rgba(34, 197, 94, 0.3)"
                    : status.color === "warning"
                    ? "rgba(251, 191, 36, 0.3)"
                    : "rgba(59, 130, 246, 0.3)"
                }`,
                fontWeight: 600,
                fontSize: "11px",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ py: 2 }}
          >
            {currentUptime.days > 0 && (
              <TimeSegment>
                <Typography
                  variant="h3"
                  sx={{
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: "32px",
                    lineHeight: 1,
                  }}
                >
                  {currentUptime.days}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(226, 232, 240, 0.7)",
                    fontSize: "11px",
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                >
                  {t("routers.snmpMonitor.dashboard.uptimeCard.days")}
                </Typography>
              </TimeSegment>
            )}

            <TimeSegment>
              <Typography
                variant="h3"
                sx={{
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "32px",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.hours).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(226, 232, 240, 0.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {t("routers.snmpMonitor.dashboard.uptimeCard.hours")}
              </Typography>
            </TimeSegment>

            <TimeSegment>
              <Typography
                variant="h3"
                sx={{
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "32px",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.minutes).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(226, 232, 240, 0.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {t("routers.snmpMonitor.dashboard.uptimeCard.minutes")}
              </Typography>
            </TimeSegment>

            <TimeSegment>
              <Typography
                variant="h3"
                sx={{
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "32px",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.seconds).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(226, 232, 240, 0.7)",
                  fontSize: "11px",
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {t("routers.snmpMonitor.dashboard.uptimeCard.seconds")}
              </Typography>
            </TimeSegment>
          </Stack>
        </Stack>
      </CardContent>
    </GradientCard>
  );
}

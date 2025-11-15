import { Box, Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "../../hooks/usei18n";

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
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
  borderRadius: "16px",
  border: "1px solid rgba(0, 212, 255, 0.2)",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s ease",
  "&:hover": {
    border: "1px solid rgba(0, 212, 255, 0.4)",
    boxShadow: "0 8px 32px rgba(0, 212, 255, 0.15)",
    transform: "translateY(-2px)",
  },
}));

const IconWrapper = styled(Box)({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(0, 212, 255, 0.3)",
});

const TimeSegment = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "rgba(0, 212, 255, 0.08)",
  border: "1px solid rgba(0, 212, 255, 0.15)",
  minWidth: "70px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(0, 212, 255, 0.12)",
    border: "1px solid rgba(0, 212, 255, 0.25)",
    transform: "translateY(-2px)",
  },
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
    if (totalHours < 1) return { text: "Iniciado Recentemente", color: "warning" };
    if (totalHours < 24) return { text: "Ativo Hoje", color: "info" };
    if (totalHours < 168) return { text: "Executando Esta Semana", color: "success" };
    return { text: "Estável a Longo Prazo", color: "success" };
  };

  const status = getUptimeStatus();

  return (
    <GradientCard>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconWrapper>
                <AccessTimeIcon sx={{ color: "#00d4ff", fontSize: 24 }} />
              </IconWrapper>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  {t("routers.snmpMonitor.dashboard.uptimeCard.title")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(248, 250, 252, 0.7)",
                    fontSize: "0.875rem",
                  }}
                >
                  Tempo de atividade do roteador
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
                    ? "rgba(0, 212, 255, 0.15)"
                    : status.color === "warning"
                    ? "rgba(251, 191, 36, 0.15)"
                    : "rgba(59, 130, 246, 0.15)",
                color:
                  status.color === "success"
                    ? "#00d4ff"
                    : status.color === "warning"
                    ? "#fbbf24"
                    : "#3b82f6",
                border: `1px solid ${
                  status.color === "success"
                    ? "rgba(0, 212, 255, 0.3)"
                    : status.color === "warning"
                    ? "rgba(251, 191, 36, 0.3)"
                    : "rgba(59, 130, 246, 0.3)"
                }`,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: "32px",
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
                    color: "#00d4ff",
                    fontWeight: 800,
                    fontSize: "2rem",
                    lineHeight: 1,
                  }}
                >
                  {currentUptime.days}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(248, 250, 252, 0.7)",
                    fontSize: "0.75rem",
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
                  color: "#00d4ff",
                  fontWeight: 800,
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.hours).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(248, 250, 252, 0.7)",
                  fontSize: "0.75rem",
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
                  color: "#00d4ff",
                  fontWeight: 800,
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.minutes).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(248, 250, 252, 0.7)",
                  fontSize: "0.75rem",
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
                  color: "#00d4ff",
                  fontWeight: 800,
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {String(currentUptime.seconds).padStart(2, "0")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(248, 250, 252, 0.7)",
                  fontSize: "0.75rem",
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
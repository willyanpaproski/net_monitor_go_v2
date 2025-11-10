import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { useMemo, useState, useEffect } from 'react';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  trendPercents?: {
    up?: string,
    down?: string,
    neutral?: string
  };
  data: number[];
  color?: 'purple' | 'green' | 'amber';
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  color = 'purple'
}: StatCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const colorMap = {
    purple: {
      border: 'rgba(139, 92, 246, 0.2)',
      borderHover: 'rgba(139, 92, 246, 0.4)',
      shadow: 'rgba(139, 92, 246, 0.15)',
      gradient: '#8b5cf6',
      text: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.6)'
    },
    green: {
      border: 'rgba(16, 185, 129, 0.2)',
      borderHover: 'rgba(16, 185, 129, 0.4)',
      shadow: 'rgba(16, 185, 129, 0.15)',
      gradient: '#10b981',
      text: '#10b981',
      glow: 'rgba(16, 185, 129, 0.6)'
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.2)',
      borderHover: 'rgba(245, 158, 11, 0.4)',
      shadow: 'rgba(245, 158, 11, 0.15)',
      gradient: '#f59e0b',
      text: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.6)'
    }
  };

  const currentColor = colorMap[color];

  const xAxisLabels = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((_, index) => `Dia ${index + 1}`);
  }, [data]);

  const trendPercentage = useMemo(() => {
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }, [data]);

  const hasData = data.length > 0;

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        flexGrow: 1,
        bgcolor: '#0C1017',
        border: `1px solid ${currentColor.border}`,
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        opacity: show ? 1 : 0,
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Typography 
          component="h2" 
          variant="subtitle2" 
          gutterBottom
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            fontWeight: 500,
            mb: 2
          }}
        >
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 2 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 0.5
              }}
            >
              <Typography 
                variant="h4" 
                component="p"
                sx={{ 
                  color: currentColor.text,
                  fontWeight: 700,
                  fontSize: '2rem',
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
              {hasData && trendPercentage !== '+0.0%' && trendPercentage !== '0.0%' && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                            trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 
                            'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${
                      trend === 'up' ? 'rgba(16, 185, 129, 0.3)' : 
                      trend === 'down' ? 'rgba(239, 68, 68, 0.3)' : 
                      'rgba(255, 255, 255, 0.1)'
                    }`
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: trend === 'up' ? '#10b981' : 
                             trend === 'down' ? '#ef4444' : 
                             'rgba(255, 255, 255, 0.7)',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    {trendPercentage}
                  </Typography>
                </Box>
              )}
            </Stack>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                fontWeight: 400
              }}
            >
              {interval}
            </Typography>
          </Stack>
          
          {hasData ? (
            <Box sx={{ width: '100%', height: 60, mt: 1 }}>
              <SparkLineChart
                color={currentColor.gradient}
                data={data}
                area
                showHighlight
                showTooltip
                curve="monotoneX"
                xAxis={{
                  scaleType: 'band',
                  data: xAxisLabels,
                }}
                sx={{
                  [`& .${areaElementClasses.root}`]: {
                    fill: `url(#area-gradient-${color})`,
                  },
                  '& .MuiLineElement-root': {
                    strokeWidth: 2,
                  },
                  '& .MuiMarkElement-root': {
                    scale: '0.6',
                    fill: currentColor.gradient,
                    strokeWidth: 2,
                  },
                  '& .MuiChartsTooltip-root': {
                    backgroundColor: 'rgba(12, 16, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }
                }}
              >
                <AreaGradient color={currentColor.gradient} id={`area-gradient-${color}`} />
              </SparkLineChart>
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                height: 60, 
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.7rem'
                }}
              >
                Sem dados coletados
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
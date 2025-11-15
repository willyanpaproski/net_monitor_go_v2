import { useOutletContext } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import CpuUsageLineChart from "../../components/Charts/CpuUsageLineChart";
import TemperatureLineChart from "../../components/Charts/TemperatureLineChart";
import UptimeCard from "../../components/Charts/UptimeCard";
import MemoryUsagePercentLineChart from "../../components/Charts/MemoryUsagePercentLineChart";

type TransmitterDataContext = {
  uptime: string;
  currentCpu: number;
  cpuChartData: any[];
  currentMemory: number;
  memoryChartData: any[];
  currentTemperature: number;
  temperatureChartData: any[];
};

export default function TransmitterDashboard() {
  const { uptime, currentCpu, cpuChartData, currentMemory, memoryChartData, currentTemperature, temperatureChartData } =
    useOutletContext<TransmitterDataContext>();

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <UptimeCard uptime={uptime} />
      </Box>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          <Box sx={{ flex: { xs: 1, lg: 2 }, minWidth: 0 }}>
            <MemoryUsagePercentLineChart
              currentMemory={currentMemory}
              memoryChartData={memoryChartData}
            />
          </Box>
          <Box sx={{ flex: { xs: 1, lg: 2 }, minWidth: 0 }}>
            <CpuUsageLineChart
              currentCpu={currentCpu}
              cpuChartData={cpuChartData}
            />
          </Box>
        </Stack>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          <Box sx={{ flex: { xs: 1, lg: 2 }, minWidth: 0 }}>
            <TemperatureLineChart currentTemperature={currentTemperature} temperatureChartData={temperatureChartData} />
          </Box>
        </Stack>
      </Stack>
    </>
  );
}

import React, { useState, useEffect, useMemo } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Date pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Charts
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Notifications() {
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const defaultStart = twoWeeksAgo.toISOString().slice(0, 10);
  const defaultEnd = today.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [barMode, setBarMode] = useState("type"); // 'type' or 'area'
  const [typeStats, setTypeStats] = useState([]);
  const [areaStats, setAreaStats] = useState([]);
  const [dayStats, setDayStats] = useState([]);

  const getDateRangeArray = (start, end) => {
    const arr = [];
    const current = new Date(start);
    const endDateObj = new Date(end);
    while (current <= endDateObj) {
      arr.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return arr;
  };

  // 색상 매핑
  const colorMap = {
    "PPE 감지": "#4dc9f6",
    "ACC 감지": "#f67019",
    "중장비 출입": "#f53794",
    A: "#36a2eb",
    B: "#ffcd56",
    C: "#4bc0c0",
  };

  // 백엔드 데이터 로드
  useEffect(() => {
    fetch(`/web/tablelist/statistics?start=${startDate}&end=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setTypeStats(Array.isArray(data.typeStats) ? data.typeStats : []);
        setAreaStats(Array.isArray(data.areaStats) ? data.areaStats : []);
        setDayStats(Array.isArray(data.dayStats) ? data.dayStats : []);
      })
      .catch((err) => console.error(err));
  }, [startDate, endDate]);

  // 중장비 출입 포함하여 유형 병합
  const mergedTypeStats = {};
  typeStats.forEach((item) => {
    let label = item.type.startsWith("중장비 출입") ? "중장비 출입" : item.type;
    mergedTypeStats[label] = (mergedTypeStats[label] || 0) + item.count;
  });

  const typeLabels = Object.keys(mergedTypeStats);
  const typeCounts = Object.values(mergedTypeStats);

  const typeData = {
    labels: typeLabels,
    datasets: [
      {
        data: typeCounts,
        backgroundColor: typeLabels.map((label) => colorMap[label] || "#9b59b6"),
        borderColor: typeLabels.map((label) => colorMap[label] || "#9b59b6"),
        borderWidth: 2,
      },
    ],
  };

  const areaLabels = areaStats.map((d) => d.area);
  const areaCounts = areaStats.map((d) => d.count);

  const areaData = {
    labels: areaLabels,
    datasets: [
      {
        data: areaCounts,
        backgroundColor: areaLabels.map((label) => colorMap[label] || "#95a5a6"),
        borderColor: areaLabels.map((label) => colorMap[label] || "#95a5a6"),
        borderWidth: 2,
      },
    ],
  };

  const barTypeData = {
    labels: typeLabels,
    datasets: [
      {
        label: "탐지 유형별",
        data: typeCounts,
        backgroundColor: typeLabels.map((label) => colorMap[label] || "#9b59b6"),
      },
    ],
  };

  const barAreaData = {
    labels: areaLabels,
    datasets: [
      {
        label: "발생 구역별",
        data: areaCounts,
        backgroundColor: areaLabels.map((label) => colorMap[label] || "#95a5a6"),
      },
    ],
  };

  // 중장비 출입 추이
  const dateRange = useMemo(() => getDateRangeArray(startDate, endDate), [startDate, endDate]);
  const entryDataMap = {};
  const exitDataMap = {};
  dayStats.forEach((d) => {
    if (d.access === "입차") {
      entryDataMap[d.date] = (entryDataMap[d.date] || 0) + d.count;
    } else if (d.access === "출차") {
      exitDataMap[d.date] = (exitDataMap[d.date] || 0) + d.count;
    }
  });

  const heavyEquipmentData = {
    labels: dateRange,
    datasets: [
      {
        label: "입차",
        data: dateRange.map((date) => entryDataMap[date] || 0),
        borderColor: "#4dc9f6",
        backgroundColor: "rgba(77,201,246,0.15)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "출차",
        data: dateRange.map((date) => exitDataMap[date] || 0),
        borderColor: "#f67019",
        backgroundColor: "rgba(246,112,25,0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 14 } },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>
        <DashboardNavbar />

        {/* 날짜 필터 */}
        <MDBox px={3} pt={3} pb={1} display="flex" gap={2}>
          <DatePicker
            label="시작일"
            value={startDate}
            onChange={(d) => setStartDate(d?.toISOString().slice(0, 10) || null)}
            renderInput={(p) => <TextField {...p} size="small" />}
          />
          <DatePicker
            label="종료일"
            value={endDate}
            onChange={(d) => setEndDate(d?.toISOString().slice(0, 10) || null)}
            renderInput={(p) => <TextField {...p} size="small" />}
          />
        </MDBox>

        {/* 차트 레이아웃 */}
        <MDBox pt={1} pb={3}>
          <Grid container spacing={3}>
            {/* 왼쪽 Pie 2개 */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ height: 250 }}>
                    <MDBox px={2} pt={1}>
                      <MDTypography variant="h6">탐지 유형별</MDTypography>
                    </MDBox>
                    <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
                      <Pie data={typeData} options={pieOptions} />
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ height: 250 }}>
                    <MDBox px={2} pt={1}>
                      <MDTypography variant="h6">발생 구역별</MDTypography>
                    </MDBox>
                    <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
                      <Pie data={areaData} options={pieOptions} />
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* 오른쪽 Bar (탐지유형 / 구역) */}
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} mb={1}>
                <Button
                  variant={barMode === "type" ? "contained" : "outlined"}
                  onClick={() => setBarMode("type")}
                >
                  탐지 유형
                </Button>
                <Button
                  variant={barMode === "area" ? "contained" : "outlined"}
                  onClick={() => setBarMode("area")}
                >
                  발생 구역
                </Button>
              </Stack>
              <Card sx={{ height: 520 }}>
                <MDBox p={2} sx={{ height: "100%" }}>
                  <Bar data={barMode === "type" ? barTypeData : barAreaData} options={barOptions} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* 하단 중장비 출입 통계 */}
        <MDBox pb={3}>
          <Card sx={{ height: 400 }}>
            <MDBox px={2} pt={1}>
              <MDTypography variant="h6">중장비 출입 통계 (입차 / 출차)</MDTypography>
            </MDBox>
            <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
              <Line data={heavyEquipmentData} options={lineOptions} />
            </MDBox>
          </Card>
        </MDBox>

        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

import React, { useState, useEffect, useMemo } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

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
  const [barMode, setBarMode] = useState("type"); // 'type', 'area', 'type-timeline'
  const [typeStats, setTypeStats] = useState([]);
  const [areaStats, setAreaStats] = useState({});
  const [dayStats, setDayStats] = useState([]);
  const [heDayStats, setHeDayStats] = useState([]);

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

  // 색상 매핑 (구역별 추가 필요시 추가)
  const colorMap = {
    "PPE 감지": "#4dc9f6",
    "ACC 감지": "#f67019",
    "중장비 출입": "#f53794",
    "안전장비 미착용": "#9b59b6",
    "1층 일반 좌측 복도 동로": "#36a2eb",
    B: "#ffcd56",
    A: "#4bc0c0",
  };

  // 데이터 로드
  useEffect(() => {
    fetch(`/web/tablelist/statistics?start=${startDate}&end=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setTypeStats(Array.isArray(data.typeStats) ? data.typeStats : []);
        setAreaStats(
          typeof data.areaStats === "object" && data.areaStats !== null ? data.areaStats : {}
        );
        setDayStats(Array.isArray(data.dayStats) ? data.dayStats : []);
        setHeDayStats(Array.isArray(data.heDayStats) ? data.heDayStats : []);
      })
      .catch((err) => console.error(err));
  }, [startDate, endDate]);

  // 도넛/파이/누적용 - 유형별
  const mergedTypeStats = {};
  typeStats.forEach((item) => {
    let label = item.type;
    if (label.startsWith("안전장비 미착용")) label = "안전장비 미착용";
    else if (label.startsWith("중장비 출입")) label = "중장비 출입";
    mergedTypeStats[label] = (mergedTypeStats[label] || 0) + item.count;
  });
  const typeLabels = Object.keys(mergedTypeStats);
  const typeCounts = Object.values(mergedTypeStats);

  // 도넛/파이/누적용 - 구역별
  const mergedAreaStats = {};
  Object.entries(areaStats).forEach(([areaName, dailyStatsArray]) => {
    let areaTotalCount = 0;
    dailyStatsArray.forEach((dailyStat) => {
      const typeCounts = dailyStat.typeCounts || {};
      Object.entries(typeCounts).forEach(([typeLabel, count]) => {
        let label = typeLabel;
        if (label.startsWith("안전장비 미착용")) label = "안전장비 미착용";
        else if (label.startsWith("중장비 출입")) label = "중장비 출입";
        areaTotalCount += count;
      });
    });
    mergedAreaStats[areaName] = areaTotalCount;
  });
  const areaLabels = Object.keys(mergedAreaStats);
  const areaCounts = Object.values(mergedAreaStats);

  // 공통 x축 날짜
  const dateRange = useMemo(() => getDateRangeArray(startDate, endDate), [startDate, endDate]);

  // === [1] 유형별 x 일자별 - 시계열(line/bar)
  const allTypeSeries = {};
  typeLabels.forEach((label) => (allTypeSeries[label] = dateRange.map(() => 0)));
  dayStats.forEach((dayObj) => {
    const d = dayObj.date;
    const idx = dateRange.indexOf(d);
    if (idx === -1) return;
    const typeMap = dayObj.typeCounts;
    Object.entries(typeMap).forEach(([originLabel, count]) => {
      let label = originLabel;
      if (label.startsWith("안전장비 미착용")) label = "안전장비 미착용";
      else if (label.startsWith("중장비 출입")) label = "중장비 출입";
      else if (label === "ACC 감지") label = "ACC 감지";
      else return;
      if (allTypeSeries[label]) allTypeSeries[label][idx] += count;
    });
  });
  const typeTimelineChartData = {
    labels: dateRange,
    datasets: typeLabels.map((label) => ({
      label,
      data: allTypeSeries[label],
      borderColor: colorMap[label] || "#999",
      backgroundColor: (colorMap[label] || "#999") + "55",
      fill: false,
      tension: 0.3,
    })),
  };

  // === [2] 구역별 x 일자별 - 시계열(line/bar)
  const areaSeries = {};
  areaLabels.forEach((area) => (areaSeries[area] = dateRange.map(() => 0)));
  Object.entries(areaStats).forEach(([area, arr]) => {
    arr.forEach((stat) => {
      const idx = dateRange.indexOf(stat.date);
      if (idx !== -1) {
        const dayTotal = Object.values(stat.typeCounts).reduce((a, b) => a + b, 0);
        areaSeries[area][idx] += dayTotal;
      }
    });
  });
  const areaTimelineChartData = {
    labels: dateRange,
    datasets: areaLabels.map((area) => ({
      label: area,
      data: areaSeries[area],
      borderColor: colorMap[area] || "#aaa",
      backgroundColor: (colorMap[area] || "#aaa") + "55",
      fill: false,
      tension: 0.3,
    })),
  };

  // === [3] 중장비 입차/출차 라인 차트
  const entryDataMap = {},
    exitDataMap = {};
  heDayStats.forEach((d) => {
    if (d.access === "입차") entryDataMap[d.date] = (entryDataMap[d.date] || 0) + d.count;
    else if (d.access === "출차") exitDataMap[d.date] = (exitDataMap[d.date] || 0) + d.count;
  });
  const heavyEquipmentData = {
    labels: dateRange,
    datasets: [
      {
        label: "입차",
        data: dateRange.map((date) => entryDataMap[date] || 0),
        borderColor: "#67d5fdff",
        backgroundColor: "rgba(77,201,246,0.8)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "출차",
        data: dateRange.map((date) => exitDataMap[date] || 0),
        borderColor: "#f67019",
        backgroundColor: "rgba(246,112,25,0.8)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart options
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

        {/* 날짜 필터와 버튼을 하나의 flex 컨테이너에 배치합니다. */}
        <MDBox
          px={3}
          pt={3}
          pb={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          {/* 날짜 필터 그룹을 flex-item으로 묶습니다. */}
          <Box display="flex" gap={2}>
            {/* 시작일 라벨과 DatePicker */}
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <MDTypography variant="caption" color="white" fontWeight="regular">
                시작일
              </MDTypography>
              <DatePicker
                value={startDate}
                onChange={(d) => setStartDate(d?.toISOString().slice(0, 10) || null)}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    size="small"
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white !important",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white !important",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "white !important",
                        opacity: 1,
                      },
                      "& .MuiOutlinedInput-root.Mui-disabled": {
                        "& .MuiInputBase-input": {
                          color: "white !important",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "white !important",
                        },
                      },
                    }}
                  />
                )}
              />
            </Box>
            {/* 종료일 라벨과 DatePicker */}
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <MDTypography variant="caption" color="white" fontWeight="regular">
                종료일
              </MDTypography>
              <DatePicker
                value={endDate}
                onChange={(d) => setEndDate(d?.toISOString().slice(0, 10) || null)}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    size="small"
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white !important",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white !important",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "white !important",
                        opacity: 1,
                      },
                      "& .MuiOutlinedInput-root.Mui-disabled": {
                        "& .MuiInputBase-input": {
                          color: "white !important",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "white !important",
                        },
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          {/* 버튼 그룹을 flex-item으로 묶습니다. */}
          <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, md: 0 } }}>
            <MDButton
              variant={barMode === "type" ? "contained" : "outlined"}
              onClick={() => setBarMode("type")}
              sx={{
                flexGrow: 1,
                color: "rgba(255, 255, 255, 1) !important", // 버튼 텍스트 색상을 흰색으로 강제
                "&.MuiButton-contained": {
                  backgroundColor: "rgba(0, 153, 255, 1) !important", // contained 상태일 때 흰색 배경에 투명도 20% 적용
                },
                "&.MuiButton-outlined": {
                  color: "white !important", // outlined 상태일 때 텍스트 색상 강제
                  borderColor: "rgba(139, 139, 139, 1) !important", // outlined 상태일 때 테두리 색상
                },
              }}
            >
              탐지유형 일자별 추이
            </MDButton>
            <MDButton
              variant={barMode === "area" ? "contained" : "outlined"}
              onClick={() => setBarMode("area")}
              sx={{
                flexGrow: 1,
                color: "rgba(255, 255, 255, 1) !important", // 버튼 텍스트 색상을 흰색으로 강제
                "&.MuiButton-contained": {
                  backgroundColor: "rgba(0, 153, 255, 1) !important", // contained 상태일 때 흰색 배경에 투명도 20% 적용
                },
                "&.MuiButton-outlined": {
                  color: "white !important", // outlined 상태일 때 텍스트 색상 강제
                  borderColor: "rgba(139, 139, 139, 1) !important", // outlined 상태일 때 테두리 색상
                },
              }}
            >
              발생구역 일자별 추이
            </MDButton>
          </Stack>
        </MDBox>

        {/* 차트 레이아웃 */}
        <MDBox pt={1} pb={3}>
          <Grid container spacing={3}>
            {/* 왼쪽 Pie 2개 (누적 도넛) */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={3} height={520}>
                <Card sx={{ flexGrow: 1 }}>
                  <MDBox px={2} pt={1}>
                    <MDTypography variant="h6">탐지 유형별 (누적)</MDTypography>
                  </MDBox>
                  <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
                    <Pie
                      data={{
                        labels: typeLabels,
                        datasets: [
                          {
                            data: typeCounts,
                            backgroundColor: typeLabels.map(
                              (label) => colorMap[label] || "#9b59b6"
                            ),
                            borderColor: typeLabels.map((label) => colorMap[label] || "#9b59b6"),
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={pieOptions}
                    />
                  </MDBox>
                </Card>
                <Card sx={{ flexGrow: 1 }}>
                  <MDBox px={2} pt={1}>
                    <MDTypography variant="h6">발생 구역별 (누적)</MDTypography>
                  </MDBox>
                  <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
                    <Pie
                      data={{
                        labels: areaLabels,
                        datasets: [
                          {
                            data: areaCounts,
                            backgroundColor: areaLabels.map(
                              (label) => colorMap[label] || "#95a5a6"
                            ),
                            borderColor: areaLabels.map((label) => colorMap[label] || "#95a5a6"),
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={pieOptions}
                    />
                  </MDBox>
                </Card>
              </Box>
            </Grid>

            {/* 오른쪽 ; 유형·구역별 일자별 추이 (Line/Bar) */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: 520 }}>
                <MDBox p={2} sx={{ height: "100%" }}>
                  <Line
                    data={barMode === "type" ? typeTimelineChartData : areaTimelineChartData}
                    options={lineOptions}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* 하단 중장비 출입 추이(입차/출차) */}
        <MDBox pb={3}>
          <Card sx={{ height: 400 }}>
            <MDBox px={2} pt={1}>
              <MDTypography variant="h6">중장비 입차·출차 추이</MDTypography>
            </MDBox>
            <MDBox p={2} sx={{ height: "calc(100% - 40px)" }}>
              <Bar data={heavyEquipmentData} options={barOptions} />
            </MDBox>
          </Card>
        </MDBox>

        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

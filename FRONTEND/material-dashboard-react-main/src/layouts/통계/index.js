// File: src/layouts/통계/index.js
import React, { useState, useEffect, useMemo } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
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

import { styled, alpha } from "@mui/material/styles";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import StackedBarChartRoundedIcon from "@mui/icons-material/StackedBarChartRounded";

// Charts
import { Bar, Line } from "react-chartjs-2";
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

// Local components / utils
import PieChart from "./components/PieChart";
import { colorOf, fillOf, normalizeLabel } from "./components/Chart";

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

// ============= Styles =============
const FilterPanel = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: 16,
  padding: theme.spacing(2.5),
  background: "linear-gradient(180deg, rgba(17,24,39,0.6), rgba(17,24,39,0.4))",
  border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
  boxShadow: "0 12px 36px rgba(2,8,23,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  overflow: "hidden",

  "&::before": {
    content: '""',
    position: "absolute",
    top: "-20%", // 위쪽 위치를 더 위로 올림
    left: "-50%",
    width: "200%",
    height: "200%",
    background: "radial-gradient(ellipse at top, rgba(64, 224, 208, 0.4) 0%, transparent 60%)", // 위쪽에 타원형 그라데이션으로 투명해짐
    animation: "pulseMint 4s ease-in-out infinite",
    zIndex: 0,
  },

  "& > *": {
    position: "relative",
    zIndex: 1,
  },

  "@keyframes pulseMint": {
    "0%, 100%": {
      transform: "scale(0.9)",
      opacity: 0.6,
    },
    "50%": {
      transform: "scale(1.2)",
      opacity: 0.3,
    },
  },
}));

const FieldCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
}));

const ModeButton = styled(MDButton)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 12,
  padding: "10px 14px",
  "&.MuiButton-contained": {
    color: "#0B1020",
    boxShadow: "0 8px 18px rgba(2,8,23,0.33)",
  },
  "&.MuiButton-outlined": {
    borderColor: "rgba(139,139,139,1)",
    color: "#E6EAF2",
  },
}));

export default function Statistics() {
  // date range (Date objects)
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(twoWeeksAgo);
  const [endDate, setEndDate] = useState(today);

  // view mode + data
  const [barMode, setBarMode] = useState("type"); // 'type' | 'area'
  const [typeStats, setTypeStats] = useState([]);
  const [areaStats, setAreaStats] = useState({});
  const [dayStats, setDayStats] = useState([]);
  const [heDayStats, setHeDayStats] = useState([]);

  const startStr = useMemo(() => startDate.toISOString().slice(0, 10), [startDate]);
  const endStr = useMemo(() => endDate.toISOString().slice(0, 10), [endDate]);

  const API = process.env.REACT_APP_API_BASE || "";

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

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    setStartDate(start);
    setEndDate(end);
  };

  // fetch
  useEffect(() => {
    const url = `${API}/web/tablelist/statistics?start=${startStr}&end=${endStr}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTypeStats(Array.isArray(data.typeStats) ? data.typeStats : []);
        setAreaStats(data?.areaStats && typeof data.areaStats === "object" ? data.areaStats : {});
        setDayStats(Array.isArray(data.dayStats) ? data.dayStats : []);
        setHeDayStats(Array.isArray(data.heDayStats) ? data.heDayStats : []);
      })
      .catch(() => {
        setTypeStats([]);
        setAreaStats({});
        setDayStats([]);
        setHeDayStats([]);
      });
  }, [API, startStr, endStr]);

  // ===== pie: type =====
  const mergedTypeStats = useMemo(() => {
    const acc = {};
    for (const item of typeStats) {
      const label = normalizeLabel(item.type);
      acc[label] = (acc[label] || 0) + (item.count || 0);
    }
    return acc;
  }, [typeStats]);
  const typeLabels = useMemo(() => Object.keys(mergedTypeStats), [mergedTypeStats]);
  const typeCounts = useMemo(() => Object.values(mergedTypeStats), [mergedTypeStats]);

  // ===== pie: area =====
  const mergedAreaStats = useMemo(() => {
    const acc = {};
    Object.entries(areaStats).forEach(([areaName, dailyStatsArray]) => {
      let total = 0;
      (dailyStatsArray || []).forEach((d) => {
        const tc = d?.typeCounts || {};
        Object.values(tc).forEach((v) => (total += Number(v) || 0));
      });
      acc[areaName] = total;
    });
    return acc;
  }, [areaStats]);
  const areaLabels = useMemo(() => Object.keys(mergedAreaStats), [mergedAreaStats]);
  const areaCounts = useMemo(() => Object.values(mergedAreaStats), [mergedAreaStats]);

  // common x axis
  const dateRange = useMemo(() => getDateRangeArray(startStr, endStr), [startStr, endStr]);

  // ===== line: type timeline =====
  const typeTimelineChartData = useMemo(() => {
    const series = {};
    typeLabels.forEach((label) => (series[label] = dateRange.map(() => 0)));
    dayStats.forEach((d) => {
      const idx = dateRange.indexOf(d.date);
      if (idx === -1) return;
      Object.entries(d.typeCounts || {}).forEach(([raw, c]) => {
        const label = normalizeLabel(raw);
        if (series[label]) series[label][idx] += Number(c) || 0;
      });
    });
    return {
      labels: dateRange,
      datasets: typeLabels.map((label) => ({
        label,
        data: series[label],
        borderColor: colorOf(label),
        backgroundColor: fillOf(label, 0.25),
        pointBackgroundColor: colorOf(label),
        pointBorderColor: colorOf(label),
        borderWidth: 2,
        tension: 0.35,
        fill: false,
      })),
    };
  }, [typeLabels, dateRange, dayStats]);

  // ===== line: area timeline =====
  const areaTimelineChartData = useMemo(() => {
    const series = {};
    areaLabels.forEach((area) => (series[area] = dateRange.map(() => 0)));
    Object.entries(areaStats).forEach(([area, arr]) => {
      (arr || []).forEach((st) => {
        const idx = dateRange.indexOf(st.date);
        if (idx !== -1) {
          const sum = Object.values(st.typeCounts || {}).reduce((a, b) => a + (Number(b) || 0), 0);
          series[area][idx] += sum;
        }
      });
    });
    return {
      labels: dateRange,
      datasets: areaLabels.map((area) => ({
        label: area,
        data: series[area],
        borderColor: colorOf(area),
        backgroundColor: fillOf(area, 0.25),
        pointBackgroundColor: colorOf(area),
        pointBorderColor: colorOf(area),
        borderWidth: 2,
        tension: 0.35,
        fill: false,
      })),
    };
  }, [areaLabels, dateRange, areaStats]);

  // ===== bar: heavy equipment =====
  const heavyEquipmentData = useMemo(() => {
    const entry = {};
    const exit = {};
    (heDayStats || []).forEach((d) => {
      const c = Number(d.count) || 0;
      if (d.access === "입차") entry[d.date] = (entry[d.date] || 0) + c;
      else if (d.access === "출차") exit[d.date] = (exit[d.date] || 0) + c;
    });
    return {
      labels: dateRange,
      datasets: [
        {
          label: "입차",
          data: dateRange.map((dt) => entry[dt] || 0),
          borderColor: colorOf("입차"),
          backgroundColor: fillOf("입차", 0.45),
          pointBackgroundColor: colorOf("입차"),
          pointBorderColor: colorOf("입차"),
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
        {
          label: "출차",
          data: dateRange.map((dt) => exit[dt] || 0),
          borderColor: colorOf("출차"),
          backgroundColor: fillOf("출차", 0.45),
          pointBackgroundColor: colorOf("출차"),
          pointBorderColor: colorOf("출차"),
          borderWidth: 2,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [heDayStats, dateRange]);

  // ===== chart options tuned for dark background =====
  const gridColor = "rgba(230,234,242,0.15)";
  const tickColor = "#0b1018ff";
  const legendColor = "#14161aff";

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false, labels: { color: legendColor } },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#E6EDF7",
          bodyColor: "#E6EDF7",
          borderColor: "#23314d",
          borderWidth: 1,
        },
      },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    }),
    []
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      elements: { point: { radius: 2, hitRadius: 6 } },
      plugins: {
        legend: {
          position: "top",
          labels: { color: legendColor, usePointStyle: true, boxWidth: 10 },
        },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#E6EDF7",
          bodyColor: "#E6EDF7",
          borderColor: "#23314d",
          borderWidth: 1,
        },
      },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    }),
    []
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>
        <DashboardNavbar />

        {/* Filter */}
        <FilterPanel sx={{ mx: 3, mt: 3, mb: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mb={1.5}
          >
            <MDTypography
              variant="h6"
              sx={{ fontWeight: 900, color: "#F5F7FB", letterSpacing: 0.2 }}
            >
              통계 기간 설정
            </MDTypography>
            <MDTypography variant="body1" sx={{ color: "#E6EAF2", fontWeight: 600 }}>
              {startStr} ~ {endStr}
            </MDTypography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            {/* 시작일 */}
            <FieldCard>
              <CalendarMonthRoundedIcon sx={{ color: "#FFFFFF", fontSize: 28 }} />
              <Box display="flex" flexDirection="column">
                <MDTypography
                  variant="subtitle2"
                  sx={{ color: "#FFFFFF", mb: 0.75, fontWeight: 700 }}
                >
                  시작일
                </MDTypography>
                <DatePicker
                  value={startDate}
                  onChange={(d) => d && setStartDate(d)}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      size="small"
                      sx={{
                        minWidth: 200,
                        "& .MuiInputBase-input": {
                          color: "#FFFFFF !important",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        },
                        "& .MuiSvgIcon-root": { color: "#FFFFFF !important" },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      }}
                    />
                  )}
                />
              </Box>
            </FieldCard>

            {/* 종료일 */}
            <FieldCard>
              <CalendarMonthRoundedIcon sx={{ color: "#FFFFFF", fontSize: 28 }} />
              <Box display="flex" flexDirection="column">
                <MDTypography
                  variant="subtitle2"
                  sx={{ color: "#FFFFFF", mb: 0.75, fontWeight: 700 }}
                >
                  종료일
                </MDTypography>
                <DatePicker
                  value={endDate}
                  onChange={(d) => d && setEndDate(d)}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      size="small"
                      sx={{
                        minWidth: 200,
                        "& .MuiInputBase-input": {
                          color: "#FFFFFF !important",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        },
                        "& .MuiSvgIcon-root": { color: "#FFFFFF !important" },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      }}
                    />
                  )}
                />
              </Box>
            </FieldCard>

            {/* quick ranges */}
            <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, md: 1 } }}>
              <MDButton variant="outlined" color="info" onClick={() => setQuickRange(1)}>
                오늘
              </MDButton>
              <MDButton variant="outlined" color="info" onClick={() => setQuickRange(7)}>
                7일
              </MDButton>
              <MDButton variant="outlined" color="info" onClick={() => setQuickRange(14)}>
                14일
              </MDButton>
              <MDButton variant="outlined" color="info" onClick={() => setQuickRange(30)}>
                1개월
              </MDButton>
            </Stack>

            {/* mode toggle */}
            <Stack direction="row" spacing={1.2} sx={{ ml: "auto" }}>
              <ModeButton
                variant={barMode === "type" ? "contained" : "outlined"}
                color="info"
                onClick={() => setBarMode("type")}
                startIcon={<TimelineRoundedIcon />}
                sx={{
                  "&.MuiButton-contained": { backgroundColor: "rgba(0,153,255,1) !important" },
                }}
              >
                탐지유형 일자별 추이
              </ModeButton>
              <ModeButton
                variant={barMode === "area" ? "contained" : "outlined"}
                color="info"
                onClick={() => setBarMode("area")}
                startIcon={<StackedBarChartRoundedIcon />}
                sx={{
                  "&.MuiButton-contained": { backgroundColor: "rgba(0,153,255,1) !important" },
                }}
              >
                발생구역 일자별 추이
              </ModeButton>
            </Stack>
          </Box>
        </FilterPanel>

        {/* Charts */}
        <MDBox pt={1} pb={3}>
          <Grid container spacing={3}>
            {/* Pies */}
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={3} height={520}>
                <PieChart title="탐지 유형별 (누적)" labels={typeLabels} values={typeCounts} />
                <PieChart title="발생 구역별 (누적)" labels={areaLabels} values={areaCounts} />
              </Box>
            </Grid>

            {/* Line */}
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

        {/* Bottom bar: Heavy equipment */}
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
      </DashboardLayout>
    </LocalizationProvider>
  );
}

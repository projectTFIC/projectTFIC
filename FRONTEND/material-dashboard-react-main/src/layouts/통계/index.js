import React, { useState, useEffect } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

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
import { Pie, Line, Bar } from "react-chartjs-2";
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
  // 기본 날짜 필터
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const defaultStart = twoWeeksAgo.toISOString().slice(0, 10);
  const defaultEnd = today.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  // API 기본값을 빈배열/객체로 지정
  const [statsData, setStatsData] = useState({
    typeStats: [],
    dayStats: [],
    areaStats: {
      A: [],
      B: [],
      C: [],
    },
  });
  const [loading, setLoading] = useState(false);

  // 날짜 변경 시 API 호출
  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    fetch(`/web/tablelist/statistics?start=${startDate}&end=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setStatsData({
          typeStats: Array.isArray(data.typeStats) ? data.typeStats : [],
          dayStats: Array.isArray(data.dayStats) ? data.dayStats : [],
          areaStats: data.areaStats || { A: [], B: [], C: [] },
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [startDate, endDate]);

  // Pie 차트 데이터(중장비 출입 묶어서 집계)
  const mergedTypeStats = {};
  (statsData.typeStats || []).forEach(({ type, count }) => {
    if (type.startsWith("중장비 출입")) {
      mergedTypeStats["중장비 출입"] = (mergedTypeStats["중장비 출입"] || 0) + count;
    } else {
      mergedTypeStats[type] = (mergedTypeStats[type] || 0) + count;
    }
  });
  const pieLabels = Object.keys(mergedTypeStats);
  const pieData = Object.values(mergedTypeStats);

  const typeData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieData,
        backgroundColor: ["#4dc9f6", "#f67019", "#f53794"],
        borderColor: ["#4dc9f6", "#f67019", "#f53794"],
        borderWidth: 2,
      },
    ],
  };
  // Line 차트 데이터
  const lineData = {
    labels: Array.isArray(statsData.dayStats) ? statsData.dayStats.map((d) => d.date) : [],
    datasets: Array.isArray(statsData.dayStats)
      ? ["ACC 감지", "PPE 감지", "중장비 출입"].map((type, i) => ({
          label: type,
          data: statsData.dayStats.map((d) => d.typeCounts?.[type] || 0),
          fill: true,
          backgroundColor: [
            "rgba(77,201,246,0.15)",
            "rgba(246,112,25,0.15)",
            "rgba(246,55,148,0.15)",
          ][i],
          borderColor: ["#4dc9f6", "#f67019", "#f53794"][i],
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        }))
      : [],
  };

  // 구역별 Bar 차트 데이터
  const areaKeys = ["A", "B", "C"];
  const areaBarData = areaKeys.reduce((acc, area) => {
    const areaStats = Array.isArray(statsData.areaStats[area]) ? statsData.areaStats[area] : [];
    acc[area] = {
      labels: areaStats.map((d) => d.date),
      datasets: ["ACC 감지", "PPE 감지", "중장비 출입"].map((type, i) => ({
        label: type,
        data: areaStats.map((d) => d.typeCounts?.[type] || 0),
        backgroundColor: ["#4dc9f6", "#f67019", "#f53794"][i],
        borderColor: ["#4dc9f6", "#f67019", "#f53794"][i],
        borderWidth: 1,
      })),
    };
    return acc;
  }, {});

  // 차트 옵션
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}건` } },
    },
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true, padding: 16 } },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (items) => `날짜: ${items[0].label}`,
          label: (ctx) => `${ctx.label}: ${ctx.parsed.y}건`,
        },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { stepSize: 1 },
      },
    },
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { usePointStyle: true } },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (items) => `날짜: ${items[0].label}`,
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}건`,
        },
      },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#666",
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 5 ? label.slice(5) : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { stepSize: 1, color: "#666" },
      },
    },
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

        {/* 로딩 표시 */}
        {loading && <MDTypography align="center">데이터 로딩 중...</MDTypography>}
        {/* Top: Pie & Line */}
        <MDBox pt={1} pb={3}>
          <Grid container spacing={3}>
            {/* Pie */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox px={2} pt={1}>
                  <MDTypography variant="h6">유형별 탐지</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Pie data={typeData} options={pieOptions} />
                    </Grid>
                    <Grid item xs={6}>
                      {typeData.labels.map((label, i) => (
                        <MDBox key={label} display="flex" alignItems="center" mb={1}>
                          <MDBox
                            width={12}
                            height={12}
                            mr={1}
                            sx={{ backgroundColor: typeData.datasets[0].backgroundColor[i] }}
                          />
                          <MDTypography variant="body2">
                            {label} ({typeData.datasets[0].data[i]}건)
                          </MDTypography>
                        </MDBox>
                      ))}
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            {/* Line */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 600, position: "relative" }}>
                <MDBox px={2} pt={1}>
                  <MDTypography variant="h6">일별 감지 추이</MDTypography>
                </MDBox>
                <MDBox p={2} sx={{ height: "calc(100% - 56px)" }}>
                  <Line data={lineData} options={lineOptions} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* 전체 차트 */}
        {!loading && statsData && (
          <>
            <MDBox pt={1} pb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <MDBox px={2} pt={1}>
                      <MDTypography variant="h6">유형별 탐지</MDTypography>
                    </MDBox>
                    <MDBox p={2}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6}>
                          <Pie data={typeData} options={pieOptions} />
                        </Grid>
                        <Grid item xs={6}>
                          {typeData.labels.map((label, i) => (
                            <MDBox key={label} display="flex" alignItems="center" mb={1}>
                              <MDBox
                                width={12}
                                height={12}
                                mr={1}
                                sx={{ backgroundColor: typeData.datasets[0].backgroundColor[i] }}
                              />
                              <MDTypography variant="body2">
                                {label} ({typeData.datasets[0].data[i]}건)
                              </MDTypography>
                            </MDBox>
                          ))}
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: 400, position: "relative" }}>
                    <MDBox px={2} pt={1}>
                      <MDTypography variant="h6">일별 감지 추이</MDTypography>
                    </MDBox>
                    <MDBox p={2} sx={{ height: "calc(100% - 56px)" }}>
                      <Line data={lineData} options={lineOptions} />
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox pb={3}>
              <Grid container spacing={3}>
                {areaKeys.map((area) => (
                  <Grid item xs={12} md={4} key={area}>
                    <Card sx={{ height: 350, position: "relative" }}>
                      <MDBox px={2} pt={1}>
                        <MDTypography variant="h6">{`구역 ${area} 탐지`}</MDTypography>
                      </MDBox>
                      <MDBox p={2} sx={{ height: "calc(100% - 56px)" }}>
                        <Bar data={areaBarData[area]} options={barOptions} />
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </>
        )}

        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

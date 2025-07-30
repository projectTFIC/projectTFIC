// File: src/layouts/notifications/index.js

import React, { useState, useMemo } from "react";

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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 1) 랜덤 레코드 생성 (2025년 전체)
  const records = useMemo(() => {
    const types = ["사고 감지", "안전장비 미착용", "입출입"];
    const areas = ["A", "B", "C"];
    const recs = [];
    for (let i = 0; i < 1000; i++) {
      const month = String(Math.ceil(Math.random() * 12)).padStart(2, "0");
      const day = String(Math.ceil(Math.random() * 28)).padStart(2, "0");
      recs.push({
        date: `2025-${month}-${day}`,
        type: types[Math.floor(Math.random() * types.length)],
        area: areas[Math.floor(Math.random() * areas.length)],
      });
    }
    return recs;
  }, []);

  // 2) 필터링 & 집계
  const { typeData, lineData, areaBarData } = useMemo(() => {
    const types = ["사고 감지", "안전장비 미착용", "입출입"];
    const areas = ["A", "B", "C"];

    // 필터
    const filtered = records.filter((r) => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });

    // Pie 데이터 (유형별)
    const typeCounts = types.map((t) => filtered.filter((r) => r.type === t).length);
    const typeData = {
      labels: types,
      datasets: [
        {
          data: typeCounts,
          backgroundColor: ["#4dc9f6", "#f67019", "#f53794"],
          borderColor: ["#4dc9f6", "#f67019", "#f53794"],
          borderWidth: 2,
        },
      ],
    };

    // Line 데이터 (일별 추이)
    const days = Array.from(new Set(filtered.map((r) => r.date))).sort();
    const lineData = {
      labels: days,
      datasets: types.map((t, i) => ({
        label: t,
        data: days.map((d) => filtered.filter((r) => r.date === d && r.type === t).length),
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
      })),
    };

    // Area별 Bar 데이터 (구역 A, B, C 각각: x=날짜, datasets=유형별)
    const areaBarData = areas.reduce((acc, area) => {
      acc[area] = {
        labels: days,
        datasets: types.map((t, i) => ({
          label: t,
          data: days.map(
            (d) => filtered.filter((r) => r.area === area && r.date === d && r.type === t).length
          ),
          backgroundColor: ["#4dc9f6", "#f67019", "#f53794"][i],
          borderColor: ["#4dc9f6", "#f67019", "#f53794"][i],
          borderWidth: 1,
        })),
      };
      return acc;
    }, {});

    return { typeData, lineData, areaBarData };
  }, [records, startDate, endDate]);

  // 공통 옵션
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

        {/* Date filters */}
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

        {/* Bottom: 구역별 막대 3개 */}
        <MDBox pb={3}>
          <Grid container spacing={3}>
            {["A", "B", "C"].map((area) => (
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

        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

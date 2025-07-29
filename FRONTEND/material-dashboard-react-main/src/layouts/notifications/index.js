// File: src/layouts/notifications/index.js

import React, { useState, useMemo } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
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
import Chart from "./components/Chart";
import PieChart from "./components/PieChart";

export default function Notifications() {
  const [tabIndex, setTabIndex] = useState(0); // 0=유형별(Pie),1=구역별(Bar)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 1) 샘플 데이터
  const records = [
    { date: "2025-07-01", type: "사고 감지", area: "A" },
    { date: "2025-07-01", type: "안전장비 미착용", area: "B" },
    { date: "2025-07-01", type: "입출입", area: "C" },
    { date: "2025-07-02", type: "사고 감지", area: "A" },
    { date: "2025-07-02", type: "사고 감지", area: "C" },
    { date: "2025-07-02", type: "안전장비 미착용", area: "B" },
    { date: "2025-07-03", type: "입출입", area: "A" },
    { date: "2025-07-03", type: "입출입", area: "B" },
    { date: "2025-07-03", type: "안전장비 미착용", area: "C" },
    { date: "2025-07-04", type: "사고 감지", area: "B" },
    { date: "2025-07-04", type: "입출입", area: "C" },
  ];

  const normalize = (d) => d; // 이미 ISO 포맷

  // 2) 필터 + 집계(useMemo)
  const { labels, areaDatasets, piePerDate } = useMemo(() => {
    // a) 날짜 필터
    const filtered = records.filter((r) => {
      const d = normalize(r.date);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });

    // b) 고유 날짜 정렬
    const labels = Array.from(new Set(filtered.map((r) => normalize(r.date)))).sort();

    // c) Bar용: 구역별 집계
    const blue = "#36A2EB";
    const areas = ["A", "B", "C"];
    const areaDatasets = areas.map((a) => ({
      label: a,
      data: labels.map((date) => filtered.filter((r) => r.date === date && r.area === a).length),
      backgroundColor: blue,
      borderColor: blue,
      borderWidth: 1,
    }));

    // d) Pie용: 날짜별 유형 분포 + size
    const types = ["사고 감지", "안전장비 미착용", "입출입"];
    const palette = ["#36A2EB", "#FFCE56", "#4BC0C0"];

    const pies = labels.map((date) => {
      const counts = types.map(
        (t) => filtered.filter((r) => r.date === date && r.type === t).length
      );
      const total = counts.reduce((sum, x) => sum + x, 0);
      return { date, counts, total };
    });
    const maxTotal = Math.max(...pies.map((p) => p.total), 1);

    const piePerDate = pies.map(({ date, counts, total }) => {
      const ratio = total / maxTotal;
      const size = 120 + 80 * ratio; // 120~200px

      return {
        date,
        data: {
          labels: types,
          datasets: [
            {
              data: counts,
              backgroundColor: palette,
              borderColor: palette,
              borderWidth: 2,
            },
          ],
        },
        size,
        total,
      };
    });

    return { labels, areaDatasets, piePerDate };
  }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>
        <DashboardNavbar />

        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                {/* 탭 + 날짜 필터 */}
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  flexWrap="wrap"
                  gap={2}
                >
                  <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                    <Tab label="유형별 (Pie)" />
                    <Tab label="구역별 (Bar)" />
                  </Tabs>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <DatePicker
                      label="시작일"
                      value={startDate}
                      onChange={(d) => setStartDate(d?.toISOString().split("T")[0] || null)}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                    <span>~</span>
                    <DatePicker
                      label="종료일"
                      value={endDate}
                      onChange={(d) => setEndDate(d?.toISOString().split("T")[0] || null)}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                  </MDBox>
                </MDBox>

                {/* 차트 영역 */}
                <MDBox p={2}>
                  {tabIndex === 0 ? (
                    <Grid container spacing={2} alignItems="flex-start" alignContent="flex-start">
                      {piePerDate.map(({ date, data, size, total }) => (
                        <Grid item xs={12} sm={6} md={3} key={date} sx={{ display: "flex" }}>
                          <PieChart title={`${date} (${total})`} data={data} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Chart title="구역별 통계" data={{ labels, datasets: areaDatasets }} />
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <Footer />
      </DashboardLayout>
    </LocalizationProvider>
  );
}

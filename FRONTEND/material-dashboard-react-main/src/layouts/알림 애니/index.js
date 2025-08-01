/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/rtl/data/reportsBarChartData";
import reportsLineChartData from "layouts/rtl/data/reportsLineChartData";

// Components
import Projects from "layouts/rtl/components/Projects";
import OrdersOverview from "layouts/rtl/components/OrdersOverview";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import MDAlert from "components/MDAlert";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BuildIcon from "@mui/icons-material/Build";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningIcon from "@mui/icons-material/Warning";
import Grow from "@mui/material/Grow";

import 사고 from "layouts/img/사고.png";
import 중장비 from "layouts/img/중장비.png";
import 보호장구 from "layouts/img/보호장구.png";
import TimelineItem from "examples/Timeline/TimelineItem";

const statusData = [
  {
    label: "금일 사고 감지",
    value: "7건",
    delta: "+2건",
    icon: <img src={사고} alt="사고 아이콘" style={{ width: 70, height: 70 }} />,
    color: "error.main",
  },
  {
    label: "중장비 출입",
    value: "12대",
    delta: "-1대",
    icon: <img src={중장비} alt="중장비 아이콘" style={{ width: 70, height: 70 }} />,
    color: "warning.main",
  },
  {
    label: "안전규정 미준수",
    value: "158건",
    delta: "+5건",
    icon: <img src={보호장구} alt="보호장구 아이콘" style={{ width: 70, height: 70 }} />,
    color: "secondary.main",
  },
];

const logItems = [
  { category: "equipment-access", text: "수구역 중장비(크레인) 출입 - AM 08:24" },
  { category: "accident", text: "C구역 사고 위험 - AM 09:12" },
  { category: "equipment-access", text: "C구역 중장비(덤프트럭) 출입 - AM 11:57" },
  { category: "safety-violation", text: "D구역 작업자(황철) 헬멧 미착용 - PM 13:12" },
  { category: "equipment-access", text: "D구역 중장비(크레인) 출입 - PM 14:25" },
];

const notices = [
  "[공지] 7월 5일(금) 전기설비 점검 예정",
  "[안내] 안전장비 착용 준수 안전 강의 공지 일정",
  "[공지] 무더위 쉼터 이용 안내",
  "[모집] 7월 안전 교육 신청 안내",
];

const alerts = [
  "[안내] 오늘 기준 CCTV 2번, 6번 카메라 녹화 이상 감지",
  "[이벤트] 우수 안전 착용자 포상 추천 접수 중",
  "[권장] 오늘 기온 32도 이상, 무더위 휴식시간 적극 활용 바랍니다",
  "[업데이트] AI 안전시스템 정기점검 완료",
];

// ... (import들은 동일하게 유지)

function LTR() {
  const { sales, tasks } = reportsLineChartData;

  // ✅ logs를 여기에 정의합니다.
  const initialLogs = [
    {
      category: "equipment-access",
      text: "수구역 중장비(크레인) 출입 - AM 08:24",
      time: "08:24",
    },
    {
      category: "accident",
      text: "C구역 사고 위험 - AM 09:12",
      time: "09:12",
    },
  ];

  // ✅ 여기서 useState
  const [logs, setLogs] = useState(initialLogs);

  // ✅ 여기서 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        category:
          Math.random() > 0.7
            ? "accident"
            : Math.random() > 0.5
            ? "safety-violation"
            : "equipment-access",
        text: "새로운 이벤트 감지 - " + new Date().toLocaleTimeString(),
        time: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 여기서 logs 사용 */}
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{ p: 2, borderRadius: 2, height: 500, display: "flex", flexDirection: "column" }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <AccessTimeIcon color="primary" />
                  로그 기록
                </Typography>
                <Chip label="실시간" variant="outlined" size="small" />
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                <Stack spacing={1.5}>
                  {logs.map((log, idx) => {
                    const color =
                      log.category === "equipment-access"
                        ? "success"
                        : log.category === "safety-violation"
                        ? "warning"
                        : "error";

                    const Icon =
                      log.category === "equipment-access"
                        ? BuildIcon
                        : log.category === "safety-violation"
                        ? ReportProblemIcon
                        : WarningIcon;

                    return (
                      <Grow in timeout={500} key={idx}>
                        <Paper
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            p: 1.5,
                            borderLeft: `4px solid`,
                            borderColor: `${color}.main`,
                            backgroundColor: `${color}.light`,
                          }}
                        >
                          <Icon sx={{ color: `${color}.main`, mr: 1, mt: 0.3 }} />
                          <Box flex={1}>
                            <Typography
                              variant="body2"
                              fontWeight={log.category === "accident" ? "bold" : "normal"}
                            >
                              {log.text}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" ml={1}>
                            {log.time}
                          </Typography>
                        </Paper>
                      </Grow>
                    );
                  })}
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LTR;

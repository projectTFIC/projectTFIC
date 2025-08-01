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

import React from "react";

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

function LTR() {
  const { sales, tasks } = reportsLineChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* 1️⃣ 상단 통계 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={<img src={사고} alt="사고 아이콘" style={{ width: 60, height: 60 }} />}
                title="금일 사고 감지"
                count={7}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "지난주 대비",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon={<img src={중장비} alt="중장비 아이콘" style={{ width: 70, height: 70 }} />}
                title="중장비 출입"
                count="12대"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "지난주 대비",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="신규 고객"
                count="34k"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "지난달 대비",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="판매량"
                count="+91"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "어제와 비교",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* 2️⃣ 로그 기록 */}
        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDBox>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    backgroundColor: "#fefefe",
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography
                      variant="h6"
                      sx={{ color: "black", fontWeight: 600, fontSize: "1rem" }}
                    >
                      로그 기록
                    </Typography>
                  </Box>

                  <Stack spacing={1}>
                    {logItems.map((log, index) => {
                      let bgColor, iconColor, icon, label;

                      switch (log.category) {
                        case "accident":
                          bgColor = "rgba(220,0,0,0.1)";
                          iconColor = "red";
                          icon = <ReportProblemIcon sx={{ fontSize: 18, color: iconColor }} />;
                          label = "사고 감지";
                          break;
                        case "equipment-access":
                          bgColor = "rgba(0,180,0,0.1)";
                          iconColor = "green";
                          icon = <BuildIcon sx={{ fontSize: 18, color: iconColor }} />;
                          label = "입출입 감지";
                          break;
                        case "safety-violation":
                          bgColor = "rgba(255,140,0,0.15)";
                          iconColor = "orange";
                          icon = <WarningIcon sx={{ fontSize: 18, color: iconColor }} />;
                          label = "미착용 감지";
                          break;
                        default:
                          bgColor = "#f0f0f0";
                          icon = null;
                          label = "감지";
                      }

                      const isRight = log.category === "accident";

                      return (
                        <Box key={index}>
                          <Box display="flex" justifyContent={isRight ? "flex-end" : "flex-start"}>
                            <Box
                              display="flex"
                              alignItems="flex-start"
                              justifyContent="space-between"
                              sx={{
                                backgroundColor: bgColor,
                                borderRadius: "10px",
                                p: 1.2,
                                width: "68%",
                                maxWidth: 460,
                              }}
                            >
                              {/* 아이콘 (왼쪽 상단) */}
                              <Box mt={0.2} mr={1}>
                                {icon}
                              </Box>

                              {/* 내용 */}
                              <Box flex={1}>
                                <Typography
                                  sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#333" }}
                                >
                                  {label}
                                </Typography>
                                <Typography sx={{ fontSize: "0.7rem", color: "#555", mt: 0.3 }}>
                                  객체 감지 시스템에서 새로운 이벤트가 감지되었습니다
                                </Typography>
                                <Box display="flex" gap={0.8} mt={0.8}>
                                  {/* 구역 Chip */}
                                  <Chip
                                    label="B구역"
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        log.category === "accident"
                                          ? "rgba(211, 47, 47, 0.1)"
                                          : log.category === "safety-violation"
                                          ? "rgba(245, 124, 0, 0.1)"
                                          : "rgba(56, 142, 60, 0.1)",
                                      border: `1px solid ${
                                        log.category === "accident"
                                          ? "#d32f2f"
                                          : log.category === "safety-violation"
                                          ? "#f57c00"
                                          : "#388e3c"
                                      }`,
                                      color:
                                        log.category === "accident"
                                          ? "#d32f2f"
                                          : log.category === "safety-violation"
                                          ? "#f57c00"
                                          : "#388e3c",
                                      height: 20,
                                      fontSize: "0.65rem",
                                      fontWeight: 500,
                                      borderRadius: "10px",
                                      px: 1,
                                    }}
                                  />

                                  {/* CAM Chip */}
                                  <Chip
                                    label="CAM-5"
                                    size="small"
                                    sx={{
                                      backgroundColor: "rgba(255,255,255,0.4)",
                                      border: "1px solid #ccc",
                                      color: "#555",
                                      height: 20,
                                      fontSize: "0.65rem",
                                      fontWeight: 500,
                                      borderRadius: "10px",
                                      px: 1,
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* 시간 */}
                              <Typography
                                sx={{
                                  color: "#999",
                                  fontSize: "0.65rem",
                                  mt: 0.5,
                                  minWidth: 50,
                                  textAlign: "right",
                                }}
                              >
                                오후 05:27
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 1, mb: 0.5 }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LTR;

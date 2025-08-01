// src/layouts/대시보드/index.js

import React from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

// Custom components
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Charts Data
import reportsLineChartData from "layouts/rtl/data/reportsLineChartData";

// Custom sections
import LogHistory from "layouts/대시보드/logHistory";
import TodayWeather from "layouts/대시보드/todayWeatherCard";
import WeeklyMenu from "layouts/대시보드/weeklyMenu";
import NoticeSection from "layouts/대시보드/noticeSections";
import AlertSection from "layouts/대시보드/alertSection";
import { motion } from "framer-motion";

// Images
import 사고 from "layouts/img/사고3.png";
import 중장비 from "layouts/img/중장비3.png";
import 보호장구 from "layouts/img/보호장구3.png";

function DashBoard() {
  const { sales, tasks } = reportsLineChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <MDBox py={3}>
          {/* 상단 통계 카드 */}
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon={<img src={사고} alt="사고 아이콘" style={{ width: 110, height: 80 }} />}
                  title="금일 사고 감지"
                  count={7}
                  percentage={{
                    color: "success",
                    amount: "+15%",
                    label: "지난주 대비",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon={<img src={중장비} alt="중장비 아이콘" style={{ width: 75, height: 75 }} />}
                  title="중장비 출입"
                  count="12"
                  percentage={{
                    color: "success",
                    amount: "-3%",
                    label: "지난주 대비",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="info"
                  icon={
                    <img src={보호장구} alt="보호장구 아이콘" style={{ width: 75, height: 75 }} />
                  }
                  title="보호구 미착용"
                  count="21"
                  percentage={{
                    color: "success",
                    amount: "+7%",
                    label: "지난달 대비",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
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

          {/* 로그기록 + 날씨 + 식단 */}
          <MDBox mt={4}>
            <Grid container spacing={3}>
              {/* 로그 기록 - 좌측 6칸 */}
              <Grid item xs={12} md={6}>
                <Box height="550px">
                  <LogHistory />
                </Box>
              </Grid>

              {/* 날씨 + 식단 - 우측 6칸을 3:3 분할 */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2} sx={{ height: "100%" }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: "100%" }}>
                      <TodayWeather fullHeight />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: "100%" }}>
                      <WeeklyMenu fullHeight />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>

          {/* 공지사항 + 알림사항 */}
          <MDBox mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <NoticeSection />
              </Grid>
              <Grid item xs={12} md={6}>
                <AlertSection />
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </motion.div>
    </DashboardLayout>
  );
}

export default DashBoard;

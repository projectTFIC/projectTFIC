// src/layouts/대시보드/index.js

import React, { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

// Custom components
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

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
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/web/tablelist/summary")
      .then((res) => {
        if (!res.ok) throw new Error("대시보드 요약 데이터를 불러오는데 실패했습니다.");
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>대시보드 정보를 불러오는 중입니다...</div>;
  if (error) return <div>오류가 발생했습니다: {error}</div>;

  /*
    summary 예상 데이터 구조 예:
    {
      todayAccident: 7,
      accidentDiff: 15,
      yesterdayAccidentDiff: 2,   // 어제 대비 추가
      todayEquipment: 12,
      equipmentDiff: -3,
      yesterdayEquipmentDiff: -1, // 어제 대비 추가
      todayPpe: 21,
      ppeDiff: 7,
      yesterdayPpeDiff: 0,        // 어제 대비 추가
      todayEvent: 91,
      eventDiff: 5,
      yesterdayEventDiff: 3       // 어제 대비 추가
    }
  */

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
                  count={summary.todayAccident}
                  percentage={{
                    color: summary.accidentDiff >= 0 ? "success" : "error",
                    amount: `${summary.accidentDiff > 0 ? "+" : ""}${summary.accidentDiff}%`,
                    label: "지난주 대비",
                  }}
                  comparison={{
                    label: "어제 대비",
                    amount: `${summary.yesterdayAccidentDiff > 0 ? "+" : ""}${
                      summary.yesterdayAccidentDiff
                    }건`,
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
                  count={summary.todayEquipment}
                  percentage={{
                    color: summary.equipmentDiff >= 0 ? "success" : "error",
                    amount: `${summary.equipmentDiff > 0 ? "+" : ""}${summary.equipmentDiff}%`,
                    label: "지난주 대비",
                  }}
                  comparison={{
                    label: "어제 대비",
                    amount: `${summary.yesterdayEquipmentDiff > 0 ? "+" : ""}${
                      summary.yesterdayEquipmentDiff
                    }건`,
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
                  count={summary.todayPpe}
                  percentage={{
                    color: summary.ppeDiff >= 0 ? "success" : "error",
                    amount: `${summary.ppeDiff > 0 ? "+" : ""}${summary.ppeDiff}%`,
                    label: "지난주 대비",
                  }}
                  comparison={{
                    label: "어제 대비",
                    amount: `${summary.yesterdayPpeDiff > 0 ? "+" : ""}${
                      summary.yesterdayPpeDiff
                    }건`,
                  }}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="person_add"
                  title="이벤트 발생"
                  count={summary.todayEvent}
                  percentage={{
                    color: summary.eventDiff >= 0 ? "success" : "error",
                    amount: `${summary.eventDiff > 0 ? "+" : ""}${summary.eventDiff}%`,
                    label: "지난주 대비",
                  }}
                  comparison={{
                    label: "어제 대비",
                    amount: `${summary.yesterdayEventDiff > 0 ? "+" : ""}${
                      summary.yesterdayEventDiff
                    }건`,
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

              {/* 날씨 + 식단 - 우측 6칸 3:3 */}
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
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box height="100%">
                <NoticeSection />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box height="100%">
                <AlertSection />
              </Box>
            </Grid>
          </Grid>
        </MDBox>
        {/* <Footer /> */}
      </motion.div>
    </DashboardLayout>
  );
}

export default DashBoard;

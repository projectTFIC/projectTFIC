import React, { useState } from "react";
import { callApi } from "api/api"; // < Spring Boot - React 연동 : callApi 사용 >
import {
  Grid,
  Card,
  TextField,
  Button,
  Radio,
  Typography,
  Box,
  Paper,
  Stack,
  Slide,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DescriptionIcon from "@mui/icons-material/Description";
import { TypeAnimation } from "react-type-animation";
import axios from "axios";
import PsychologyIcon from "@mui/icons-material/Psychology";

function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [promptType, setPromptType] = useState("default");
  const [promptText, setPromptText] = useState(
    `- 기간 동안 작업현장에서 발견된 안전사고 관련 CCTV 영상을 분석하여 중대한 사고 보고서를 작성해 주세요.
- 사고 발생 시간 및 위치
- 사고 전/후 위험 동작
- 사고로 인한 결과
- 사고 유형 분류
- CCTV 기반 추정 원인 등`
  );
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");

  const handleGenerateReport = async () => {
    setLoading(true); // 로딩 시작
    setReportGenerated(false); // 이전 결과 숨김

    const period_start = `${startDate} ${startTime}`;
    const period_end = `${endDate} ${endTime}`;
    const report_type = ["accident", "entry", "total"][tabIndex];
    const use_custom_prompt = promptType === "custom";

    try {
<<<<<<< HEAD
      const res = await axios.post(
        "http://localhost:8090/web/api/reports/generate",
        {
          period_start,
          period_end,
          user_id: "user123",
          report_type,
          use_custom_prompt,
          custom_prompt: promptText,
          extra_note: "",
        },
        { timeout: 60000 }
      );
      setReportHtml(res.data.report_html || "응답이 없습니다.");
=======
      // < Spring Boot - React 연동 : callApi 사용 >
      const data = await callApi("/api/report/generate", {
        method: "POST",
        body: {
          period_start,
          period_end,
          user_id: "user123",
          report_type,
          use_custom_prompt,
          custom_prompt: promptText,
          extra_note: "",
        },
      });

      setReportHtml(data.report_html || "응답이 없습니다.");
>>>>>>> branch 'main' of https://github.com/projectTFIC/projectTFIC.git
      setReportGenerated(true);
    } catch (err) {
      console.error("보고서 생성 오류:", err);
      setReportHtml("🚨 보고서 생성 중 오류가 발생했습니다.");
      setReportGenerated(true);
    } finally {
      setLoading(false); // 로딩 끝
    }
  };

  const reportTitles = ["사고 보고서", "입출입 보고서", "종합 보고서"];
  const reportSubtexts = [
    "안전사고 및 위험 상황 분석",
    "출입 통계 및 보안 행동 분석",
    "현장 전반의 운영 통합 정리",
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        <Grid container spacing={3}>
          {/* 입력 폼 */}
          <Grid item xs={12} md={reportGenerated ? 6 : 12}>
            <Card sx={{ p: 4, borderRadius: 3, maxWidth: "900px", margin: "0 auto" }}>
              <Typography variant="h2" fontWeight="bold" align="center" marginTop={7}>
                모니터링 보고서 생성
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                mb={4}
                marginTop={3}
              >
                건설현장의 CCTV 데이터를 기반으로 AI가 자동으로 보고서를 생성합니다
              </Typography>

              {/* 유형 선택 */}
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                📘 보고서 유형 선택
              </Typography>
              <Grid container spacing={2} mb={4}>
                {[ReportProblemIcon, PeopleIcon, AssessmentIcon].map((Icon, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Paper
                      elevation={tabIndex === i ? 4 : 1}
                      onClick={() => setTabIndex(i)}
                      sx={{
                        cursor: "pointer",
                        border: tabIndex === i ? "2px solid #1976d2" : "1px solid #ccc",
                        borderRadius: 2,
                        p: 2,
                        textAlign: "center",
                        backgroundColor: tabIndex === i ? "#f0f7ff" : "#fff",
                      }}
                    >
                      <Icon fontSize="large" color={tabIndex === i ? "primary" : "disabled"} />
                      <Typography fontWeight="bold" mt={1}>
                        {reportTitles[i]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reportSubtexts[i]}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* 분석 기간 설정 */}
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                📅 분석 기간 설정
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 4 }}>
                <Grid container spacing={2}>
                  {/* 시작 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="medium">
                      시작 날짜
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* 종료 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="medium">
                      종료 날짜
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>

              {/* 보고서 설정 */}
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                📝 보고서 내용 설정
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 4 }}>
                <Stack spacing={1.5}>
                  {[
                    {
                      label: "기본 설정",
                      desc: "AI가 생성한 표준 프롬프트를 사용합니다",
                      value: "default",
                      icon: <SettingsSuggestIcon fontSize="small" />,
                    },
                    {
                      label: "사용자 설정",
                      desc: "프롬프트 내용을 직접 수정할 수 있습니다",
                      value: "custom",
                      icon: <EditNoteIcon fontSize="small" />,
                    },
                  ].map((item) => (
                    <Paper
                      key={item.value}
                      elevation={promptType === item.value ? 1 : 0}
                      onClick={() => setPromptType(item.value)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        border: `1px solid ${promptType === item.value ? "#1976d2" : "#e0e0e0"}`,
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor: promptType === item.value ? "#f0f7ff" : "#fff",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {/* ✅ 아이콘 왼쪽 */}
                        <Box></Box>

                        {/* ✅ 라디오 버튼 */}
                        <Radio
                          checked={promptType === item.value}
                          value={item.value}
                          sx={{ p: 0.5 }}
                          color="primary"
                        />
                        {item.icon}

                        {/* ✅ 텍스트 영역 */}
                        <Box>
                          <Typography fontWeight="medium" fontSize="1rem" lineHeight={1.2}>
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontSize="0.9rem"
                            color="text.secondary"
                            mt={0.2}
                          >
                            {item.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                <Box mt={4}>
                  {/* 👇 조건부 안내 문구 */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="medium"
                    fontSize="0.9rem"
                    mb={1}
                    display="block"
                  >
                    {promptType === "default"
                      ? "AI 생성 프롬프트 (읽기 전용)"
                      : "AI 생성 프롬프트 (사용자 설정)"}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    disabled={promptType === "default"}
                  />
                </Box>
              </Paper>

              {/* 버튼 */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f7faff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Box
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      borderRadius: "16px",
                      px: 1.5,
                      py: 0.5,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      display: "inline-block",
                      mb: 1,
                    }}
                  >
                    {reportTitles[tabIndex]}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    선택된 설정으로 AI가 CCTV 데이터를 분석하여 보고서를 생성합니다
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DescriptionIcon />}
                  sx={{ color: "#fff" }}
                  onClick={handleGenerateReport}
                >
                  보고서 생성
                </Button>
              </Paper>
              {/* ✅ 안내 박스 */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f9fcff",
                  borderColor: "#bbdefb",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="black" gutterBottom>
                  <PsychologyIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                  AI 보고서 생성 안내
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6} fontSize={14}>
                  선택한 기간의 CCTV 영상 데이터를 AI가 분석하여 자동으로 보고서를 생성합니다. 기본
                  설정은 지능적인 프롬프트를 사용하며, 사용자 설정을 통해 세부 내용을 조정할 수
                  있습니다.
                </Typography>
              </Paper>
            </Card>
          </Grid>

          {/* 결과 출력 */}
          <Slide direction="left" in={reportGenerated} mountOnEnter unmountOnExit timeout={500}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3, minHeight: "100%" }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📄 생성된 AI 보고서
                </Typography>
                <Box mt={2}>
                  <TypeAnimation
                    sequence={[reportHtml]}
                    wrapper="pre"
                    cursor
                    speed={40}
                    style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
                  />
                </Box>
              </Card>
            </Grid>
          </Slide>
        </Grid>
      </Box>
      <Footer />
    </DashboardLayout>
  );
}

export default ReportPage;

import React, { useState } from "react";
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
import axios from "axios";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DescriptionIcon from "@mui/icons-material/Description";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { TypeAnimation } from "react-type-animation";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DownloadPdfButton from "./DownloadPdfButton";

function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [promptType, setPromptType] = useState("default");
  const defaultPrompts = {
    accident: `- 작업 중 사고 발생 내용을 바탕으로 사고 보고서를 작성해 주세요.\n- 사고 시간, 장소, 경과, 조치 사항 포함`,
    entry: `- 차량/중장비 출입 기록을 분석하여 출입 관리 보고서를 작성해 주세요.\n- 출입 현황, 통제 상태, 개선 사항 포함`,
    total: `- 사고 및 출입 기록을 종합하여 종합 보고서를 작성해 주세요.\n- 각 항목별 주요 사항 포함`,
  };

  const [promptText, setPromptText] = useState(defaultPrompts["accident"]);
  const [reportHtml, setReportHtml] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");

  const reportTitles = ["사고 보고서", "입출입 보고서", "종합 보고서"];
  const reportTypes = ["accident", "entry", "total"];
  const reportSubtexts = [
    "안전사고 및 위험 상황 분석",
    "출입 통계 및 보안 행동 분석",
    "현장 전반의 운영 통합 정리",
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportGenerated(false);

    const payload = {
      period_start: `${startDate} ${startTime}`,
      period_end: `${endDate} ${endTime}`,
      user_id: "123",
      report_type: reportTypes[tabIndex],
      use_custom_prompt: promptType === "custom",
      custom_prompt: promptText,
      extra_note: "",
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/reports/generate`,
        payload
      );
      setReportHtml(response.data.report_html || "⚠️ 응답이 없습니다.");
    } catch (error) {
      console.error("보고서 생성 오류:", error);
      setReportHtml("🚨 보고서 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setReportGenerated(true);
    }
  };

  const extractTable = (html) => {
    const match = html.match(/<table[\s\S]*?<\/table>/);
    return match ? match[0] : "<p>표 없음</p>";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={reportGenerated ? 6 : 12}>
            <Card sx={{ p: 4, borderRadius: 3, maxWidth: 900, mx: "auto" }}>
              <Typography variant="h2" fontWeight="bold" align="center" gutterBottom>
                모니터링 보고서 생성
              </Typography>
              <Typography align="center" mb={4}>
                건설현장의 CCTV 데이터를 기반으로 AI가 자동으로 보고서를 생성합니다
              </Typography>

              {/* 유형 선택 */}
              <Typography fontWeight="bold" mb={1}>
                📘 보고서 유형 선택
              </Typography>
              <Grid container spacing={2} mb={3}>
                {[ReportProblemIcon, PeopleIcon, AssessmentIcon].map((Icon, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Paper
                      elevation={tabIndex === i ? 4 : 1}
                      onClick={() => setTabIndex(i)}
                      sx={{
                        cursor: "pointer",
                        p: 2,
                        borderRadius: 2,
                        textAlign: "center",
                        border: tabIndex === i ? "2px solid #1976d2" : "1px solid #ccc",
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

              {/* 기간 선택 */}
              <Typography fontWeight="bold" mb={1}>
                📅 분석 기간 설정
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  {[
                    {
                      label: "시작",
                      date: startDate,
                      setDate: setStartDate,
                      time: startTime,
                      setTime: setStartTime,
                    },
                    {
                      label: "종료",
                      date: endDate,
                      setDate: setEndDate,
                      time: endTime,
                      setTime: setEndTime,
                    },
                  ].map((item, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.label} 날짜
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <TextField
                            fullWidth
                            type="date"
                            value={item.date}
                            onChange={(e) => item.setDate(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth
                            type="time"
                            value={item.time}
                            onChange={(e) => item.setTime(e.target.value)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* 프롬프트 설정 */}
              <Typography fontWeight="bold" mb={1}>
                📝 보고서 내용 설정
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <Stack spacing={1.5}>
                  {[
                    {
                      label: "기본 설정",
                      value: "default",
                      icon: <SettingsSuggestIcon fontSize="small" />,
                    },
                    {
                      label: "사용자 설정",
                      value: "custom",
                      icon: <EditNoteIcon fontSize="small" />,
                    },
                  ].map((option) => (
                    <Paper
                      key={option.value}
                      elevation={promptType === option.value ? 1 : 0}
                      onClick={() => setPromptType(option.value)}
                      sx={{
                        mb: 4,
                        px: 1.5,
                        py: 1,
                        border: `1px solid ${promptType === option.value ? "#1976d2" : "#e0e0e0"}`,
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor: promptType === option.value ? "#f0f7ff" : "#fff",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Radio
                          checked={promptType === option.value}
                          value={option.value}
                          sx={{ p: 0.5 }}
                          color="primary"
                        />
                        {option.icon}
                        <Box>
                          <Typography fontWeight="medium">{option.label}</Typography>
                          <Typography variant="body2" color="text.secondary" fontSize={13}>
                            {option.value === "default"
                              ? "AI가 생성한 표준 프롬프트를 사용합니다"
                              : "프롬프트 내용을 직접 수정할 수 있습니다"}
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

              <Button
                sx={{ color: "#fff", height: 50, fontSize: "16px" }}
                variant="contained"
                color="primary"
                startIcon={<DescriptionIcon />}
                fullWidth
                onClick={handleGenerateReport}
                disabled={loading}
              >
                보고서 생성
              </Button>
            </Card>
          </Grid>
          <Slide direction="left" in={reportGenerated} timeout={400} mountOnEnter unmountOnExit>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  maxWidth: 900, // 원하는 최대 넓이
                  mx: "auto", // 중앙 정렬
                  ml: "1%",
                }}
              >
                {/* 1. 수정 가능한 TextField */}
                <Typography variant="subtitle1" fontWeight="medium" mt={2}>
                  📝 보고서 HTML 코드 수정
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={reportHtml}
                  onChange={(e) => setReportHtml(e.target.value)}
                  sx={{
                    fontFamily: "monospace",
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    mt: 1,
                  }}
                />

                {/* 2. 렌더링된 결과 미리보기 */}
                <Typography variant="subtitle1" fontWeight="medium" mt={4}>
                  📄 렌더링된 보고서 미리보기
                </Typography>
                <Box
                  id="report-container"
                  mt={2}
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #ddd",
                    padding: 3,
                    borderRadius: 2,
                    maxHeight: 800,
                    overflowY: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: reportHtml }}
                />

                {/* 3. PDF 다운로드 버튼 */}
                <Box mt={3}>
                  <DownloadPdfButton reportHtml={reportHtml} reportType={reportTypes[tabIndex]} />
                </Box>
              </Card>
            </Grid>
          </Slide>
        </Grid>
      </Box>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default ReportPage;

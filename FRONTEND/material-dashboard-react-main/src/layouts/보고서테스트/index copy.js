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
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DescriptionIcon from "@mui/icons-material/Description";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { TypeAnimation } from "react-type-animation";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ReportPage() {
  // ==== 기존 로직 및 변수명 유지 ====
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

  const reportTitles = ["사고 보고서", "입출입 보고서", "종합 보고서"];
  const reportSubtexts = [
    "안전사고 및 위험 상황 분석",
    "출입 통계 및 보안 행동 분석",
    "현장 전반의 운영 통합 정리",
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportGenerated(false);

    const period_start = `${startDate} ${startTime}`;
    const period_end = `${endDate} ${endTime}`;
    const report_type = ["accident", "entry", "total"][tabIndex];
    const use_custom_prompt = promptType === "custom";

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/reports/generate`,
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
      setReportGenerated(true);
    } catch (err) {
      console.error("보고서 생성 오류:", err);
      setReportHtml("🚨 보고서 생성 중 오류가 발생했습니다.");
      setReportGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box p={3}>
        <Grid container spacing={3}>
          {/* 좌측 입력 영역 */}
          <Grid item xs={12} md={reportGenerated ? 6 : 12}>
            <Card sx={{ p: 4, borderRadius: 3, maxWidth: 900, mx: "auto" }}>
              <Typography variant="h2" fontWeight="bold" align="center" gutterBottom>
                모니터링 보고서 생성
              </Typography>
              <Typography align="center" mb={4}>
                건설현장의 CCTV 데이터를 기반으로 AI가 자동으로 보고서를 생성합니다
              </Typography>

              {/* 보고서 유형 선택 */}
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

              {/* 분석 기간 설정 */}
              <Typography fontWeight="bold" mb={1}>
                📅 분석 기간 설정
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  {[
                    // 시작, 종료 날짜+시간
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
                    // 기본/사용자 설정
                    {
                      label: "기본 설정",
                      value: "default",
                      icon: <SettingsSuggestIcon fontSize="small" />,
                      desc: "AI가 생성한 표준 프롬프트를 사용합니다",
                    },
                    {
                      label: "사용자 설정",
                      value: "custom",
                      icon: <EditNoteIcon fontSize="small" />,
                      desc: "프롬프트 내용을 직접 수정할 수 있습니다",
                    },
                  ].map((option) => (
                    <Paper
                      key={option.value}
                      elevation={promptType === option.value ? 1 : 0}
                      onClick={() => setPromptType(option.value)}
                      sx={{
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
                            {option.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                <Box mt={3}>
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

              {/* 생성 버튼 */}
              <Button
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

          {/* 우측 결과 미리보기 */}
          <Slide direction="left" in={reportGenerated} timeout={400} mountOnEnter unmountOnExit>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
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

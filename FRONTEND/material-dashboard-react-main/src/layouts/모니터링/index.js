import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import MDBadge from "components/MDBadge"; // 없으면 Chip으로 대체
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const MonitoringPage = () => {
  const [cameraList, setCameraList] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [toastInfo, setToastInfo] = useState({ open: false, title: "", description: "" });
  const [isAIOn, setIsAIOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIView, setIsAIView] = useState(false);

  const selectedCamera = cameraList.find((cam) => cam.device_id === selectedCam);
  const currentTime = new Date().toLocaleTimeString("ko-KR");

  // ✅ API로 장비 리스트 불러오기
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/devices");
        const devices = res.data.map((d) => ({
          ...d,
          status: d.status || "online", // status 없을 경우 기본값
        }));
        setCameraList(devices);
        if (devices.length > 0) {
          setSelectedCam(devices[0].device_id);
        }
      } catch (err) {
        console.error("장비 리스트 불러오기 실패", err);
        setCameraList([]);
      }
    };

    fetchDevices();
  }, []);

  const handleAction = (type) => {
    const toggle = (setter, value, label) => {
      const next = !value;
      setter(next);
      showToast(
        `${label} ${next ? "시작" : "중지"}`,
        `${label}이 ${next ? "활성화" : "비활성화"}되었습니다.`
      );
    };

    if (type === "ai") toggle(setIsAIOn, isAIOn, "AI 탐지");
    else if (type === "record") toggle(setIsRecording, isRecording, "녹화");
    else if (type === "view") toggle(setIsAIView, isAIView, "AI 탐지 화면");
  };

  const showToast = (title, description) => {
    setToastInfo({ open: true, title, description });
  };

  return (
    <DashboardLayout>
      <Box display="flex" height="calc(100vh - 100px)">
        {/* 캠 화면 + 버튼 */}
        <Box flex={1} display="flex" flexDirection="column" minWidth={0} pr={2}>
          {/* 캠 화면 */}
          <Box
            flex={1}
            position="relative"
            borderRadius={2}
            overflow="hidden"
            sx={{ backgroundColor: "#000" }}
          >
            {selectedCamera && (
              <>
                <Box
                  position="absolute"
                  top={16}
                  left={16}
                  zIndex={2}
                  bgcolor="rgba(255,255,255,0.9)"
                  borderRadius={1}
                  px={2}
                  py={1}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {selectedCamera.device_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCamera.location}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {selectedCamera.device_id}
                  </Typography>
                </Box>

                <Box
                  position="absolute"
                  top={16}
                  right={16}
                  bgcolor="rgba(255,255,255,0.9)"
                  px={2}
                  py={1}
                  borderRadius={1}
                >
                  <Typography fontSize={14} fontFamily="monospace" color="text.primary">
                    {currentTime}
                  </Typography>
                </Box>
              </>
            )}

            <Box
              width="100%"
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              color="#888"
            >
              <FolderIcon fontSize="large" />
              <Typography variant="body1">
                {selectedCamera ? selectedCamera.device_name : "장비 없음"}
              </Typography>
              <Typography variant="caption">
                {selectedCamera ? selectedCamera.location : ""}
              </Typography>
            </Box>
          </Box>

          {/* 버튼 박스 */}
          <Paper elevation={2} sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff" }}>
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAction("ai")}
                sx={{ borderColor: "#1976d2", color: "#000", fontWeight: 600 }}
              >
                👁️ AI 실시간 탐지
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAction("record")}
                sx={{ borderColor: "#1976d2", color: "#000", fontWeight: 600 }}
              >
                ⏺ 화면 녹화
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAction("view")}
                sx={{ borderColor: "#1976d2", color: "#000", fontWeight: 600 }}
              >
                🖥️ AI탐지화면 전환
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* CCTV 리스트 */}
        <Box sx={{ width: 420, flexShrink: 0 }}>
          <Card sx={{ height: "100%", p: 2, boxShadow: 4, borderRadius: 2 }}>
            <CardContent sx={{ overflowY: "auto", height: "100%" }}>
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  영상장비 리스트
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DB 내 영상장비 디바이스 목록
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1} sx={{ mb: 1 }} fontWeight="bold" fontSize={13}>
                <Grid item xs={3.1}>
                  ID
                </Grid>
                <Grid item xs={4.9}>
                  장비 이름
                </Grid>
                <Grid item xs={4} textAlign="right">
                  위치
                </Grid>
              </Grid>

              <Box display="flex" flexDirection="column" gap={1}>
                {cameraList.map((cam) => {
                  const isActive = cam.device_id === selectedCam;
                  return (
                    <Button
                      key={cam.device_id}
                      fullWidth
                      variant={isActive ? "contained" : "outlined"}
                      color={isActive ? "primary" : "inherit"}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        padding: 1.5,
                        borderRadius: 2,
                        boxShadow: isActive ? 3 : 0,
                        color: "#000",
                      }}
                      onClick={() => setSelectedCam(cam.device_id)}
                    >
                      <Grid container alignItems="center">
                        <Grid item xs={3}>
                          <Typography variant="body2" fontWeight="bold">
                            {cam.device_id}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="body2">{cam.device_name}</Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                          <Typography variant="body2" color="text.secondary">
                            {cam.location}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Button>
                  );
                })}
              </Box>

              <Divider sx={{ mt: 3, mb: 1 }} />
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  • 클릭하여 카메라 전환
                  <br />
                  • 실시간 상태 모니터링
                  <br />• 자동 연결 상태 확인
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 토스트 알림 */}
      <Snackbar
        open={toastInfo.open}
        autoHideDuration={3000}
        onClose={() => setToastInfo({ ...toastInfo, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastInfo({ ...toastInfo, open: false })}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          <strong>{toastInfo.title}</strong>
          <br />
          {toastInfo.description}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default MonitoringPage;

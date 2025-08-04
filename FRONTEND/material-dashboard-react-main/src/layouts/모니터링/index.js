import React, { useState, useEffect, useRef } from "react";
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
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const MonitoringPage = () => {
  const [cameraList, setCameraList] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [toastInfo, setToastInfo] = useState({ open: false, title: "", description: "" });
  const [isAIOn, setIsAIOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIView, setIsAIView] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("ko-KR"));
  const videoRef = useRef(null);

  const selectedCamera = cameraList.find((cam) => cam.device_id === selectedCam);

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ko-KR"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // DB에서 장비 리스트 불러오기
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/devices");
        const devices = res.data.map((d) => ({
          ...d,
          status: d.status || "online",
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

  // 웹캠 연결
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        const waitForRef = setInterval(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            clearInterval(waitForRef);
          }
        }, 100);
      } catch (err) {
        console.error("웹캠 접근 실패:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
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
      <Box display="flex" sx={{ minHeight: "calc(100vh - 100px)" }}>
        {/* 캠 화면 + 버튼 */}
        <Box flex={1} display="flex" flexDirection="column" minWidth={0} pr={2}>
          {/* 캠 화면 */}
          <Box
            height={900}
            position="relative"
            borderRadius={2}
            overflow="hidden"
            sx={{ backgroundColor: "#000" }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

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
          </Box>

          {/* 서브 모니터 2행 3열 */}
          <Box mt={2}>
            <Grid container spacing={2}>
              {[...Array(3)].map((_, idx) => {
                const cam = cameraList[idx];
                const isSelected = cam?.device_id === selectedCam;

                return (
                  <Grid item xs={4} key={idx}>
                    <Box
                      height={220}
                      bgcolor="#000"
                      border={isSelected ? "2px solid #1976d2" : "1px solid #111"}
                      sx={{
                        cursor: cam ? "pointer" : "default",
                        borderRadius: 0,
                        position: "relative",
                      }}
                      onClick={() => {
                        if (cam) setSelectedCam(cam.device_id);
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
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

              <Box display="flex" flexDirection="column" gap={0}>
                {cameraList.map((cam, index) => {
                  const isActive = cam.device_id === selectedCam;
                  const isLast = index === cameraList.length - 1;

                  return (
                    <React.Fragment key={cam.device_id}>
                      <Box
                        onClick={() => setSelectedCam(cam.device_id)}
                        sx={{
                          width: "100%",
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          minHeight: 140,
                          display: "flex",
                          alignItems: "center",
                          backgroundImage: isActive
                            ? "linear-gradient(to right, transparent 5%, rgba(74, 150, 238, 0.7) 50%, transparent 95%)"
                            : "none", // ✅ 선택된 항목만 그라디언트
                          cursor: "pointer",
                          transition: "background 0.3s",
                          "&:hover": {
                            backgroundImage: isActive
                              ? "linear-gradient(to right, transparent, rgba(46, 117, 209, 0.35), transparent)"
                              : "linear-gradient(to right, transparent, rgba(0,0,0,0.04), transparent)",
                          },
                        }}
                      >
                        <Grid container alignItems="center" height="100%">
                          <Grid item xs={3}>
                            <Typography variant="body2" fontWeight="bold" noWrap>
                              {cam.device_id}
                            </Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="body2" noWrap>
                              {cam.device_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} textAlign="right">
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {cam.location}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      {!isLast && <Divider sx={{ my: 0.5, borderColor: "#e0e0e0" }} />}
                    </React.Fragment>
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
        onClose={() => setToastInfo((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastInfo((prev) => ({ ...prev, open: false }))}
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

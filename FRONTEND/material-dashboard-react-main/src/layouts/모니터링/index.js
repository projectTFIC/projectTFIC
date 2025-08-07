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
import socket from "socket"; // [Back] 모니터링 화면의 프레임을 스프링부트로 전달 (웹소캣)
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const MonitoringPage = () => {
  const [cameraList, setCameraList] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [toastInfo, setToastInfo] = useState({ open: false, title: "", description: "" });
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("ko-KR"));
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [globalToggles, setGlobalToggles] = useState({ ppe: false, acc: false, he: false }); // [Back] AI 기능 전원 상태 조작 (기본값 off)
  const [showDetections, setShowDetections] = useState(false); // [Back] AI 탐지 결과 화면으로 전환
  const [detections, setDetections] = useState([]);

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
        const res = await axios.get("http://localhost:8090/web/GetDevicesList");
        const devices = res.data.map((d, index) => ({
          ...d,
          status: d.status || "online",
          video_url: `/videos/video${index + 1}.mp4`,
        }));
        setCameraList(res.data);
        if (res.data.length > 0) {
          const initialCamId = res.data[0].device_id;
          setSelectedCam(initialCamId);

          // ✅ 서버에 초기 선택 카메라 알림 추가
          socket.emit("set_main_device", { deviceId: initialCamId });
        }
      } catch (err) {
        console.error("장비 리스트 불러오기 실패", err);
      }
    };
    fetchDevices();
  }, []);

  // 서브 모니터 영상 리스트
  const subVideos = [
    "/videos/video1.mp4",
    "/videos/video2.mp4",
    "/videos/video3.mp4",
    "/videos/video4.mp4",
  ];

  // 웹캠 연결
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setWebcamStream(stream);
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

  // [Back] 주기적으로 웹캠 프레임을 서버에 전송
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        Object.values(globalToggles).some((status) => status) &&
        videoRef.current &&
        selectedCam
      ) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        socket.emit("image_analysis_request", { image: dataUrl, deviceId: selectedCam });
      }
    }, 500); // 0.5초에 한번
    return () => clearInterval(interval);
  }, [globalToggles, selectedCam]);

  // [Back] 서버로부터 전달 받은 AI 분석 결과 가져오기
  useEffect(() => {
    const handleAnalysisResult = (data) => {
      if (data.deviceId === selectedCam) {
        setDetections(data.detections || []);
      }
    };
    socket.on("analysis_result", handleAnalysisResult);
    return () => socket.off("analysis_result", handleAnalysisResult);
  }, [selectedCam]);

  // [Back] 객체 탐지 결과를 화면에 표현하기
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.clientWidth;
    canvas.height = videoRef.current.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (showDetections && detections.length > 0) {
      const scaleX = canvas.width / (videoRef.current.videoWidth || canvas.width);
      const scaleY = canvas.height / (videoRef.current.videoHeight || canvas.height);
      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.box;
        const label = det.label || "";
        let color = "red";
        if (label.includes("wear")) color = "blue";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.font = "16px Arial";
        ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);
        ctx.fillText(label, x1 * scaleX, y1 * scaleY > 10 ? y1 * scaleY - 5 : 10);
      });
    }
  }, [detections, showDetections]);

  // [Back] 영상 장비 리스트에서 장비를 선택하면, 선택한 장비를 서버에 전송
  const handleSelectCamera = (deviceId) => {
    setSelectedCam(deviceId);
    socket.emit("set_main_device", { deviceId });
  };

  // [Back] AI 기능 전원 핸들러
  const handleToggleDetection = (type) => {
    const newIsActive = !globalToggles[type];
    setGlobalToggles((prev) => ({ ...prev, [type]: newIsActive }));
    socket.emit("toggle_global_detection", { detectionType: type, isActive: newIsActive });
  };

  // [Back] 버튼 스타일 정의
  const buttonStyle = (isActive) => ({
    borderColor: "#1976d2",
    fontWeight: 600,
    color: isActive ? "#fff" : "#000", // 활성화 시 흰색, 비활성화 시 검은색 (글자 색상)
    backgroundColor: isActive ? "#1976d2" : "#fff", // 활성화 시 파란색, 비활성화 시 흰색 (버튼 색상)
    "&:hover": {
      backgroundColor: isActive ? "#1565c0" : "rgba(25, 118, 210, 0.04)",
    },
  });
  useEffect(() => {
    if (
      selectedCamera?.device_id === cameraList[4]?.device_id &&
      webcamStream &&
      videoRef.current
    ) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [selectedCamera, webcamStream, cameraList]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (selectedCamera?.device_id === cameraList[4]?.device_id && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    } else {
      videoRef.current.srcObject = null; // 🧹 스트림 끊기
    }
  }, [selectedCamera, webcamStream, cameraList]);

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
            {selectedCamera?.device_id === cameraList[4]?.device_id && webcamStream ? (
              <video
                ref={videoRef}
                key="webcam" // 💡 강제 리렌더링
                autoPlay
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <video
                key={selectedCamera?.device_id} // 💡 선택된 캠이 바뀔 때마다 리렌더링
                src={selectedCamera?.video_url || "/videos/video1.mp4"}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

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
              {cameraList.slice(1, 4).map((cam, idx) => {
                const isSelected = cam.device_id === selectedCam;

                return (
                  <Grid item xs={4} key={idx}>
                    <Box
                      height={220}
                      border={isSelected ? "2px solid #1976d2" : "1px solid #111"}
                      sx={{
                        cursor: cam ? "pointer" : "default",
                        borderRadius: 0,
                        position: "relative",
                        overflow: "hidden", // 영상 잘림 방지
                        backgroundColor: "#000",
                      }}
                      onClick={() => setSelectedCam(cam.device_id)}
                    >
                      <video
                        src={cam.video_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* [Back] 버튼 박스 */}
          <Paper elevation={2} sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#fff" }}>
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                onClick={() => handleToggleDetection("ppe")}
                sx={buttonStyle(globalToggles.ppe)}
              >
                👁️ PPE AI
              </Button>
              <Button
                fullWidth
                onClick={() => handleToggleDetection("acc")}
                sx={buttonStyle(globalToggles.acc)}
              >
                👁️ ACC AI
              </Button>
              <Button
                fullWidth
                onClick={() => handleToggleDetection("he")}
                sx={buttonStyle(globalToggles.he)}
              >
                👁️ HE AI
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button
                fullWidth
                onClick={() => setShowDetections(!showDetections)}
                sx={buttonStyle(showDetections)}
              >
                🖥️ AI 화면 전환
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

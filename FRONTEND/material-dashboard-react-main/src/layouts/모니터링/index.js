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
import socket from "../../socket"; // [Back] 모니터링 화면의 프레임을 스프링부트로 전달 (웹소캣)
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
  const canSendRef = useRef(false);
  const inFlightRef = useRef(false);

  // 소켓 리스너 등록 (마운트 1회)
  useEffect(() => {
    const onMainDeviceSet = (data) => {
      if (Number(data?.deviceId) === Number(selectedCam)) {
        canSendRef.current = true; // ✅ ACK 도착 → 전송 허용
        inFlightRef.current = false;
      }
    };
    socket.on("main_device_set", onMainDeviceSet);
    return () => socket.off("main_device_set", onMainDeviceSet);
  }, [selectedCam]);

  // 토글/카메라가 바뀌었는데 아직 ACK 못 받았으면 '한 번만' 재요청
  useEffect(() => {
    const anyOn = Object.values(globalToggles).some(Boolean);
    if (anyOn && Number.isFinite(selectedCam) && !canSendRef.current) {
      socket.emit("set_main_device", { deviceId: selectedCam });
    }
  }, [globalToggles, selectedCam]);

  // 프레임 전송 루프 (500ms 고정 X → in-flight/ACK 기반)
  useEffect(() => {
    const tick = () => {
      const v = videoRef.current;
      if (!v) return;

      // 토글이 하나도 켜져 있지 않으면 전송 X
      if (!Object.values(globalToggles).some(Boolean)) return;
      if (!Number.isFinite(selectedCam)) return;

      // 서버로부터 main_device_set ACK 받기 전이면 전송 X
      if (!canSendRef.current) return;

      // 직전 전송의 결과를 기다리는 중이면 전송 X
      if (inFlightRef.current) return;

      const vw = v.videoWidth || v.clientWidth;
      const vh = v.videoHeight || v.clientHeight;
      if (!vw || !vh) return;

      // 캔버스 스냅샷 → JPEG dataURL (품질은 그대로)
      const tmp = document.createElement("canvas");
      tmp.width = vw;
      tmp.height = vh;
      const ctx = tmp.getContext("2d");
      ctx.drawImage(v, 0, 0, vw, vh);
      const dataUrl = tmp.toDataURL("image/jpeg");

      inFlightRef.current = true;
      socket.emit("image_analysis_request", { image: dataUrl, deviceId: selectedCam });

      // 안전 타이머: 결과가 너무 늦으면 락 해제
      const safetyTimer = setTimeout(() => {
        inFlightRef.current = false;
      }, 1500);

      // 이번 전송의 결과만 한 번 듣고 락 해제
      const onResult = (res) => {
        if (Number(res?.deviceId) === Number(selectedCam)) {
          inFlightRef.current = false;
          clearTimeout(safetyTimer);
        }
      };
      socket.once("analysis_result", onResult);
    };

    const id = setInterval(tick, 450);
    return () => clearInterval(id);
  }, [globalToggles, selectedCam]);

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ko-KR"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // DB에서 장비 리스트 불러오기
  const normalizeDevices = (arr) =>
    arr
      .map((d, index) => {
        const rawId = d.device_id ?? d.deviceId ?? d.deviceid ?? d.id ?? null;
        const device_id =
          rawId !== null && rawId !== undefined && rawId !== "" ? Number(rawId) : null;
        return {
          device_id,
          device_name: d.device_name ?? d.deviceName ?? d.name ?? "(이름없음)",
          location: d.location ?? "(미지정)",
          status: d.status ?? "online",
          video_url: `${process.env.PUBLIC_URL || ""}/videos/video${index + 1}.mp4`,
        };
      })
      .filter((x) => Number.isFinite(x.device_id));

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:8090/web/GetDevicesList");
      const devices = normalizeDevices(res.data);
      setCameraList(devices);
      if (devices.length > 0) {
        // 페이지 로드 시, 아직 선택된 카메라가 없을 때만 초기값 설정
        if (selectedCam === null) {
          const initialCamId = devices[0].device_id;
          setSelectedCam(initialCamId);
          socket.emit("set_main_device", { deviceId: initialCamId });
        }
      }
    } catch (err) {
      console.error("장비 리스트 불러오기 실패", err);
    }
  };

  // ✅ 연결 + 리스너 등록을 한 곳에서만
  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      console.log("Socket connected, fetching devices...");
      const saved = Number(localStorage.getItem("lastDeviceId"));
      if (Number.isFinite(saved)) {
        setSelectedCam(saved);
        socket.emit("set_main_device", { deviceId: saved }); // ✅ 복원 즉시 서버에 반영
      }
      fetchDevices(); // 장비 목록 로드
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, []);

  // 서브 모니터 영상 리스트
  const videoBase = process.env.PUBLIC_URL || ""; // 스프링부트의 context path 설정을 제외하기 위해 설정
  const subVideos = [
    `${videoBase}/videos/video1.mp4`,
    `${videoBase}/videos/video2.mp4`,
    `${videoBase}/videos/video3.mp4`,
    `${videoBase}/videos/video4.mp4`,
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

  // [Back] 서버로부터 전달 받은 AI 분석 결과 가져오기
  useEffect(() => {
    const handleAnalysisResult = (data) => {
      if (Number(data.deviceId) === Number(selectedCam)) {
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

    // 비디오 실제 픽셀 기준
    const v = videoRef.current;
    const vw = v.videoWidth || v.clientWidth;
    const vh = v.videoHeight || v.clientHeight;
    if (!vw || !vh) return;

    // 캔버스 화면 크기 = 보이는 영역
    canvas.width = v.clientWidth;
    canvas.height = v.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showDetections || detections.length === 0) return;

    const scaleX = canvas.width / vw;
    const scaleY = canvas.height / vh;

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.box || [];
      if (x1 == null) return;

      const label = det.label || "";
      let color = "red";
      if (label.includes("wear")) color = "blue";

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;
      ctx.font = "16px Arial";

      ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);
      ctx.fillText(label, x1 * scaleX, y1 * scaleY > 10 ? y1 * scaleY - 5 : 10);

      // (선택) 포즈 키포인트가 오면 점 찍기
      if (Array.isArray(det.keypoints)) {
        det.keypoints.forEach(([kx, ky]) => {
          ctx.beginPath();
          ctx.arc(kx * scaleX, ky * scaleY, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
  }, [detections, showDetections]);

  // [Back] 영상 장비 리스트에서 장비를 선택하면, 선택한 장비를 서버에 전송
  const handleSelectCamera = (deviceId) => {
    setSelectedCam(deviceId);
    localStorage.setItem("lastDeviceId", String(deviceId)); // 재연결 복원용
    canSendRef.current = false; // ACK 오기 전까지 전송 금지
    inFlightRef.current = false; // 진행 중인 전송도 초기화
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

  // ✅ 단일 useEffect로 소스 전환 (웹캠은 srcObject, 파일은 src)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const isWebcam = selectedCamera?.device_id === cameraList[4]?.device_id;

    if (isWebcam && webcamStream) {
      // 웹캠 모드
      v.srcObject = webcamStream;
      v.removeAttribute("src"); // src 제거
      v.play().catch(() => {});
    } else {
      // 파일 모드
      v.srcObject = null;
      const src = selectedCamera?.video_url || `${process.env.PUBLIC_URL || ""}/videos/video1.mp4`;
      if (v.src !== src) v.src = src;
      v.play().catch(() => {});
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
            {/* ✅ 단일 비디오만 사용 (웹캠/파일 공용) */}
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* ✅ 오버레이 캔버스 실제 렌더링 */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
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
                      onClick={() => handleSelectCamera(cam.device_id)}
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
                    <React.Fragment key={String(cam?.device_id ?? `idx-${index}`)}>
                      <Box
                        onClick={() => handleSelectCamera(cam.device_id)}
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

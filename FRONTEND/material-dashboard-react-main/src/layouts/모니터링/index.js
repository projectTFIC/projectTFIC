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

import { styled, alpha } from "@mui/material/styles";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const Panel = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  background: "linear-gradient(180deg, rgba(17,24,39,0.55), rgba(17,24,39,0.35))",
  border: `1px solid ${alpha("#FFFFFF", 0.12)}`,
  boxShadow: "0 10px 30px rgba(2,8,23,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(10px)",
}));

const ToggleCard = styled(Paper)(({ theme }) => ({
  borderRadius: 14,
  padding: theme.spacing(1.5),
  height: 88,
  display: "flex",
  alignItems: "center",
  gap: 14,
  cursor: "pointer",
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  border: `1px solid ${alpha("#FFFFFF", 0.12)}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 18px rgba(2,8,23,0.22)",
  color: "#E6EAF2",
  transition:
    "transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 28px rgba(2,8,23,0.33)",
    borderColor: alpha("#FFFFFF", 0.2),
  },
  "&.active": {
    background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
  },
}));

const Dot = styled("span")({
  marginLeft: "auto",
  width: 10,
  height: 10,
  borderRadius: "50%",
  boxShadow: "0 0 0 3px rgba(255,255,255,0.06) inset",
});

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

  const [deck, setDeck] = useState([]); // [mainId, s1Id, s2Id, s3Id]
  const camById = (id) => cameraList.find((c) => c.device_id === id);
  const WEBCAM_DEVICE_ID = 6;

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
    if (anyOn && selectedCam && !canSendRef.current) {
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
      if (!selectedCam) return;

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
        if (String(res?.deviceId) === String(selectedCam)) {
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
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "/web";

  const fileById = {
    1: "/videos/video1.mp4",
    2: "/videos/video2.mp4",
    3: "/videos/video3.mp4",
    4: "/videos/video4.mp4",
    5: "/videos/video5.mp4",
  };

  const normalizeDevices = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((d) => {
        // API 응답의 다양한 id 필드 이름을 처리하고 숫자로 변환
        const rawId = d.device_id ?? d.deviceId ?? d.deviceid ?? d.id ?? null;
        const device_id = Number(rawId);

        // 현재 장치가 웹캠인지 여부를 device_id를 기준으로 명확하게 판단
        const isWebcamDevice = device_id === WEBCAM_DEVICE_ID;

        return {
          device_id,
          device_name: d.device_name ?? d.deviceName ?? d.name ?? "(이름없음)",
          location: d.location ?? "(미지정)",
          status: d.status ?? "online",
          // 웹캠이 아닐 경우, public/videos 폴더의 영상 경로를 device_id에 맞춰 생성
          video_url: isWebcamDevice
            ? null
            : `${process.env.PUBLIC_URL || ""}/videos/video${device_id}.mp4`,
          // isWebcam 플래그를 추가하여 이 장치가 웹캠인지 아닌지 명시
          isWebcam: isWebcamDevice,
        };
      })
      // 유효한 device_id가 없는 데이터는 필터링
      .filter((x) => Number.isFinite(x.device_id));

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/GetDevicesList`);
      const devices = normalizeDevices(res.data);
      setCameraList(devices);
      if (devices.length > 0) {
        // [Back] 화면 로테이션 기능 변수 설정
        const ids = devices.map((d) => d.device_id);
        const saved = Number(localStorage.getItem("lastDeviceId"));
        const main = saved && ids.includes(saved) ? saved : ids[0];
        // [Back] 화면 덱 초기화
        const rest = ids.filter((id) => id !== main);
        const nextDeck = [main, ...rest].slice(0, 4);
        setDeck(nextDeck);
        // [Back] 선택 복원 및 초기화
        // 페이지 로드 시, 아직 선택된 카메라가 없을 때만 초기값 설정
        if (selectedCam == null || !ids.includes(String(selectedCam))) {
          setSelectedCam(main);
          socket.emit("set_main_device", { deviceId: main });
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
      if (Number.isFinite(saved) && saved > 0) {
        // 유효한 숫자인지 확인
        setSelectedCam(saved);
        socket.emit("set_main_device", { deviceId: saved });
      }
      fetchDevices(); // 장비 목록 로드
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, []);

  // 소켓 연결을 못 타더라도 최초 1회는 무조건 장비 리스트 로드
  useEffect(() => {
    fetchDevices();
  }, []);

  // 서브 모니터 영상 리스트
  const videoBase = process.env.PUBLIC_URL || ""; // 스프링부트의 context path 설정을 제외하기 위해 설정
  const subVideos = [
    `${videoBase}/videos/video1.mp4`,
    `${videoBase}/videos/video2.mp4`,
    `${videoBase}/videos/video3.mp4`,
    `${videoBase}/videos/video4.mp4`,
    `${videoBase}/videos/video5.mp4`,
  ];

  // 웹캠 연결
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          console.warn("No mediaDevices (likely HTTP). Skipping webcam.");
        }
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
    setDeck((prev) => {
      if (!prev.length) return [deviceId];
      const prevMain = prev[0];
      // [Back] 덱 내부 (메인 화면 & 서브 화면) 클릭하는 경우
      if (prev.includes(deviceId)) {
        if (deviceId === prevMain) return prev; // 메인화면을 선택하는 경우, 변화 없음
        const rest = prev.filter((id) => id !== deviceId && id !== prevMain);
        return [deviceId, prevMain, ...rest].slice(0, 4);
      }
      // [Back] 덱 외부 (영상 장비 리스트) 클릭하는 경우
      return [deviceId, ...prev.slice(0, 3)];
    });
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

    const isWebcam = selectedCamera?.isWebcam === true;

    if (isWebcam) {
      // 웹캠 모드
      if (webcamStream) {
        v.srcObject = webcamStream;
        v.removeAttribute("src"); // src 제거
        v.play().catch(() => {});
      } else {
        // 파일 모드
        v.srcObject = null;
        v.removeAttribute("src");
      }
    } else {
      v.srcObject = null;
      const src = selectedCamera?.video_url || `${process.env.PUBLIC_URL || ""}/videos/video1.mp4`;
      if (v.src !== src) v.src = src;
      v.play().catch(() => {});
    }
  }, [selectedCamera, webcamStream]);

  const fancyButtonStyle = (isActive, activeColor = "#1976d2") => ({
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: "12px",
    padding: "12px 16px",
    color: isActive ? "#fff" : "#333",
    background: isActive
      ? `linear-gradient(135deg, ${activeColor}, ${activeColor}CC)`
      : "rgba(255, 255, 255, 0.6)",
    boxShadow: isActive ? `0 4px 12px ${activeColor}55` : "0 4px 10px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
    transition: "all 0.25s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isActive ? `0 6px 14px ${activeColor}66` : "0 6px 12px rgba(0,0,0,0.15)",
      background: isActive
        ? `linear-gradient(135deg, ${activeColor}EE, ${activeColor})`
        : "rgba(255, 255, 255, 0.9)",
    },
    "&:active": {
      transform: "translateY(0px)",
      boxShadow: isActive ? `0 2px 6px ${activeColor}66` : "0 2px 6px rgba(0,0,0,0.1)",
    },
  });

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
              {deck
                .slice(1, 4)
                .map((id) => camById(id))
                .filter(Boolean)
                .map((cam) => {
                  const isSelected = cam.device_id === selectedCam;
                  // cam 객체에 들어있는 isWebcam 플래그를 직접 사용합니다.
                  const isWebcamTile = cam.isWebcam;

                  return (
                    <Grid item xs={4} key={cam.device_id}>
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
                        {isWebcamTile ? (
                          <Box
                            height="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="#fff"
                            sx={{ fontWeight: 700, letterSpacing: 1 }}
                          >
                            LIVE 웹캠
                          </Box>
                        ) : (
                          <video
                            src={cam.video_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>

          {/* [Back] 버튼 박스 */}
          <Panel elevation={0} sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#E6EAF2" }}>
                실시간 AI 제어
              </Typography>
              <Typography variant="caption" sx={{ color: "#B7C0CE" }}>
                상태: {Object.values(globalToggles).some(Boolean) ? "ON" : "OFF"}
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              {/* PPE AI */}
              <Grid item xs={12} sm={6} md={3}>
                <ToggleCard
                  className={globalToggles.ppe ? "active" : ""}
                  onClick={() => handleToggleDetection("ppe")}
                  sx={{
                    "& .icon": {
                      background: globalToggles.ppe
                        ? "linear-gradient(135deg, #f59e0b, #f97316)"
                        : "rgba(255,255,255,0.08)",
                      color: globalToggles.ppe ? "#0B1020" : "#E6EAF2",
                    },
                  }}
                >
                  <Box
                    className="icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <SecurityIcon />
                  </Box>
                  <Box>
                    {/* ← 라벨·기능 이름 기존 그대로 */}
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>PPE AI</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      안전모/벨트/고리/안전화
                    </Typography>
                  </Box>
                  <Dot style={{ backgroundColor: globalToggles.ppe ? "#f59e0b" : "#9aa4b2" }} />
                </ToggleCard>
              </Grid>

              {/* 👁️ ACC AI */}
              <Grid item xs={12} sm={6} md={3}>
                <ToggleCard
                  className={globalToggles.acc ? "active" : ""}
                  onClick={() => handleToggleDetection("acc")}
                  sx={{
                    "& .icon": {
                      background: globalToggles.acc
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : "rgba(255,255,255,0.08)",
                      color: globalToggles.acc ? "#0B1020" : "#E6EAF2",
                    },
                  }}
                >
                  <Box
                    className="icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <WarningAmberRoundedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>ACC AI</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      낙상/자세 이상
                    </Typography>
                  </Box>
                  <Dot style={{ backgroundColor: globalToggles.acc ? "#22c55e" : "#9aa4b2" }} />
                </ToggleCard>
              </Grid>

              {/* 👁️ HE AI */}
              <Grid item xs={12} sm={6} md={3}>
                <ToggleCard
                  className={globalToggles.he ? "active" : ""}
                  onClick={() => handleToggleDetection("he")}
                  sx={{
                    "& .icon": {
                      background: globalToggles.he
                        ? "linear-gradient(135deg, #38bdf8, #0ea5e9)"
                        : "rgba(255,255,255,0.08)",
                      color: globalToggles.he ? "#0B1020" : "#E6EAF2",
                    },
                  }}
                >
                  <Box
                    className="icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <PrecisionManufacturingRoundedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>HE AI</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      차종/번호판 & 입·출차
                    </Typography>
                  </Box>
                  <Dot style={{ backgroundColor: globalToggles.he ? "#0ea5e9" : "#9aa4b2" }} />
                </ToggleCard>
              </Grid>

              {/* 🖥️ AI 화면 전환 */}
              <Grid item xs={12} sm={6} md={3}>
                <ToggleCard
                  className={showDetections ? "active" : ""}
                  onClick={() => setShowDetections(!showDetections)}
                  sx={{
                    "& .icon": {
                      background: showDetections
                        ? "linear-gradient(135deg, #c084fc, #a855f7)"
                        : "rgba(255,255,255,0.08)",
                      color: showDetections ? "#0B1020" : "#E6EAF2",
                    },
                  }}
                >
                  <Box
                    className="icon"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <VisibilityRoundedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>AI 화면 전환</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      박스/키포인트 표시
                    </Typography>
                  </Box>
                  <Dot style={{ backgroundColor: showDetections ? "#a855f7" : "#9aa4b2" }} />
                </ToggleCard>
              </Grid>
            </Grid>
          </Panel>
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

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

import PPE from "layouts/img/헬멧_모니터링.png";
import 낙상사고 from "layouts/img/낙상사고_모니터링.png";
import 중장비 from "layouts/img/중장비_모니터링.png";
import 화면전환 from "layouts/img/화면전환_모니터링.png";

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

  const nextDelayRef = useRef(450); // 기본값: 450ms(2.2fps)
  const loopTimerRef = useRef(null);

  // 버튼 클릭 시 1초 알림
  const showQuickToast = (title, description) => {
    setToastInfo({ open: true, title, description });
  };

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

  // 프레임 전송 루프
  useEffect(() => {
    let cancelled = false;

    const scheduleNext = (delay) => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      loopTimerRef.current = setTimeout(runOnce, delay);
    };

    const runOnce = () => {
      if (cancelled) return;

      const v = videoRef.current;
      if (!v) return scheduleNext(300);

      // 전송 가능 조건
      if (
        !Object.values(globalToggles).some(Boolean) ||
        !selectedCam ||
        !canSendRef.current ||
        inFlightRef.current
      ) {
        return scheduleNext(300);
      }

      const vw = v.videoWidth || v.clientWidth;
      const vh = v.videoHeight || v.clientHeight;
      if (!vw || !vh) return scheduleNext(300);

      const tmp = document.createElement("canvas");
      tmp.width = vw;
      tmp.height = vh;
      const ctx = tmp.getContext("2d");
      ctx.drawImage(v, 0, 0, vw, vh);

      // 화질은 그대로(기본 JPEG 품질) — 번호판 품질 보존
      const dataUrl = tmp.toDataURL("image/jpeg");

      inFlightRef.current = true;
      socket.emit("image_analysis_request", { image: dataUrl, deviceId: selectedCam });

      // analysis_result 리스너를 여기에 정의하고 모든 처리를 통합
      const onResult = (res) => {
        // 이 요청에 대한 응답인지 확인
        if (String(res?.deviceId) === String(selectedCam)) {
          inFlightRef.current = false;
          clearTimeout(safetyTimer);
          socket.off("analysis_result", onResult); // 중요: 수신 후 즉시 리스너 해제

          // 1. 상태 업데이트 로직 (제거했던 코드)
          setDetections(res.detections || []);
          if (typeof res.nextDelayMs === "number") {
            const clamped = Math.min(900, Math.max(120, Math.round(res.nextDelayMs)));
            nextDelayRef.current = clamped;
          }

          // 2. 다음 루프 예약
          scheduleNext(nextDelayRef.current);
        }
      };
      socket.on("analysis_result", onResult);

      // 3. 안전장치 (서버 응답이 1.5초 이상 없을 경우)
      const safetyTimer = setTimeout(() => {
        inFlightRef.current = false;
        socket.off("analysis_result", onResult);
        // 타임아웃 시에도 현재 delay 값으로 다음 루프 예약
        scheduleNext(nextDelayRef.current);
      }, 1500);
    };

    // 첫 스타트
    scheduleNext(300);

    return () => {
      cancelled = true;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      // 컴포넌트가 사라질 때 리스너가 남아있을 수 있으므로 확실하게 정리
      socket.off("analysis_result");
    };
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
        const rawId = d.device_id ?? d.deviceId ?? d.deviceid ?? d.id ?? null;
        const device_id = Number(rawId);

        const isWebcamDevice = device_id === WEBCAM_DEVICE_ID;

        return {
          device_id,
          device_name: d.device_name ?? d.deviceName ?? d.name ?? "(이름없음)",
          location: d.location ?? "(미지정)",
          status: d.status ?? "online",
          video_url: isWebcamDevice
            ? null
            : `${process.env.PUBLIC_URL || ""}/videos/video${device_id}.mp4`,
          isWebcam: isWebcamDevice,
        };
      })
      .filter((x) => Number.isFinite(x.device_id));

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/GetDevicesList`);
      const devices = normalizeDevices(res.data);
      setCameraList(devices);
      if (devices.length > 0) {
        const ids = devices.map((d) => d.device_id);
        const saved = Number(localStorage.getItem("lastDeviceId"));
        const main = saved && ids.includes(saved) ? saved : ids[0];
        const rest = ids.filter((id) => id !== main);
        const nextDeck = [main, ...rest].slice(0, 4);
        setDeck(nextDeck);

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
        setSelectedCam(saved);
        socket.emit("set_main_device", { deviceId: saved });
      }
      fetchDevices();
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
  const videoBase = process.env.PUBLIC_URL || "";
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
  // useEffect(() => {
  //   const handleAnalysisResult = (data) => {
  //     if (Number(data.deviceId) === Number(selectedCam)) {
  //       setDetections(data.detections || []);
  //       // ✅ 서버 힌트 반영 (최소/최대 가드)
  //       if (typeof data.nextDelayMs === "number") {
  //         const clamped = Math.min(900, Math.max(120, Math.round(data.nextDelayMs)));
  //         nextDelayRef.current = clamped;
  //       }
  //     }
  //   };
  //   socket.on("analysis_result", handleAnalysisResult);
  //   return () => socket.off("analysis_result", handleAnalysisResult);
  // }, [selectedCam]);

  // [Back] 객체 탐지 결과를 화면에 표현하기
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const v = videoRef.current;
    const vw = v.videoWidth || v.clientWidth;
    const vh = v.videoHeight || v.clientHeight;
    if (!vw || !vh) return;

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
      let color = "rgba(0,128,0,1)";
      if (det.heType) color = "rgba(229,255,0,1)"; // 중장비 노란색
      else if (det.is_falling) color = "rgba(255,139,0,1)"; // 사고 감지 주황
      else if (det.kind === "gear" && det.gear_state === "unwear") color = "rgba(255,86,48,1)";
      else if (det.kind === "gear" && det.gear_state === "wear") color = "rgba(0,82,204,1)";
      else if ((det.safety_status || []).some((s) => s.includes("unwear")))
        color = "rgba(255,86,48,1)"; // 안전장비 미착용 빨강
      else if ((det.safety_status || []).some((s) => s.includes("wear")))
        color = "rgba(0,82,204,1)"; // 안전장비 착용 파랑

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;
      ctx.font = "16px Arial";

      ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);
      ctx.fillText(label, x1 * scaleX, y1 * scaleY > 10 ? y1 * scaleY - 5 : 10);

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
      if (prev.includes(deviceId)) {
        if (deviceId === prevMain) return prev;
        const rest = prev.filter((id) => id !== deviceId && id !== prevMain);
        return [deviceId, prevMain, ...rest].slice(0, 4);
      }
      return [deviceId, ...prev.slice(0, 3)];
    });
    setSelectedCam(deviceId);
    localStorage.setItem("lastDeviceId", String(deviceId));
    canSendRef.current = false;
    inFlightRef.current = false;
    socket.emit("set_main_device", { deviceId });
  };

  // [Back] AI 기능 전원 핸들러 (토스트 표시 포함)
  const handleToggleDetection = (type) => {
    const newIsActive = !globalToggles[type];
    setGlobalToggles((prev) => ({ ...prev, [type]: newIsActive }));
    socket.emit("toggle_global_detection", { detectionType: type, isActive: newIsActive });

    const labelMap = { ppe: "PPE AI", acc: "ACC AI", he: "HE AI" };
    showQuickToast(`${labelMap[type]} ${newIsActive ? "활성화" : "비활성화"}`, "AI 기능 전환됨");
  };

  // [Back] 버튼 스타일 정의
  const buttonStyle = (isActive) => ({
    borderColor: "#1976d2",
    fontWeight: 600,
    color: isActive ? "#fff" : "#000",
    backgroundColor: isActive ? "#1976d2" : "#fff",
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
      if (webcamStream) {
        v.srcObject = webcamStream;
        v.removeAttribute("src");
        v.play().catch(() => {});
      } else {
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
                          overflow: "hidden",
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
                {/* ✅ showDetections도 상태에 반영 */}
                상태: {showDetections || Object.values(globalToggles).some(Boolean) ? "ON" : "OFF"}
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
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src={PPE}
                      alt="PPE 아이콘"
                      style={{
                        width: 53,
                        height: 53,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.15 }}>PPE AI</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      안전모/벨트/고리/안전화
                    </Typography>
                  </Box>
                  <Dot style={{ backgroundColor: globalToggles.ppe ? "#f59e0b" : "#9aa4b2" }} />
                </ToggleCard>
              </Grid>

              {/* ACC AI */}
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
                      width: 58,
                      height: 58,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src={낙상사고}
                      alt="낙상사고 아이콘"
                      style={{
                        width: 68,
                        height: 68,
                        transform: "translateY(-12px)", // ← 아이콘만 위로 이동
                        objectFit: "contain",
                      }}
                    />
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

              {/* HE AI */}
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
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src={중장비}
                      alt="중장비 아이콘"
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                      }}
                    />
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

              {/* AI 화면 전환 */}
              <Grid item xs={12} sm={6} md={3}>
                <ToggleCard
                  className={showDetections ? "active" : ""}
                  onClick={() => {
                    const newValue = !showDetections;
                    setShowDetections(newValue);
                    showQuickToast(`AI 화면 ${newValue ? "ON" : "OFF"}`, "탐지 결과 표시 전환됨");
                  }}
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
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src={화면전환}
                      alt="화면전환 아이콘"
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                      }}
                    />
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
                            ? "linear-gradient(to right, transparent 5%, rgba(74,150,238,0.7) 50%, transparent 95%)"
                            : "none",
                          cursor: "pointer",
                          transition: "background 0.3s",
                          "&:hover": {
                            backgroundImage: isActive
                              ? "linear-gradient(to right, transparent, rgba(46,117,209,0.35), transparent)"
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
        autoHideDuration={1000}
        onClose={() => setToastInfo((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ "&.MuiSnackbar-root": { bottom: 24, right: 24 } }} // 위치값 우선순위 보장
      >
        <Alert
          onClose={() => setToastInfo((prev) => ({ ...prev, open: false }))}
          // severity="info"는 기본 파랑이 강해서 제외, 커스텀 색 적용
          variant="filled"
          icon={false}
          sx={{
            width: "100%",
            height: 200, // ✅ 너가 정한 사이즈 그대로
            minWidth: 450, // ✅ 그대로
            px: 2,
            py: 1.25,
            borderRadius: 1.5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // ✅ 세로 중앙
            alignItems: "center", // ✅ 가로 중앙
            textAlign: "center",
            background: "linear-gradient(135deg, #1f2340 0%, #3b2d5c 55%, #2a2e5a 100%)",
            color: "#ECECF6",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(4px)",

            // 본문/제목 타이포 가독성
            "& .MuiAlert-message": {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5, // 제목-본문 간격
            },
          }}
        >
          {/* 타이틀 */}
          <strong
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.2px",
              marginBottom: 6,
              // 포인트 라인(고급스럽게 살짝만)
              backgroundImage:
                "linear-gradient(to right, rgba(157,141,241,.8), rgba(157,141,241,0))",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 2px",
              backgroundPosition: "0 100%",
              paddingBottom: 4,
            }}
          >
            {toastInfo.title}
          </strong>

          {/* 본문: 한국어 줄바꿈/가독성 최적화 */}
          <span
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              opacity: 0.95,
              whiteSpace: "pre-line", // \n 포함 시 자연스럽게 줄바꿈
              wordBreak: "keep-all", // 한국어 단어 뚝뚝 끊김 방지
              maxWidth: 420, // 너무 길게 늘어지지 않게
            }}
          >
            {toastInfo.description}
          </span>
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default MonitoringPage;

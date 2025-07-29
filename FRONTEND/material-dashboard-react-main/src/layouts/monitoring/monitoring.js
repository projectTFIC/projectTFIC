// src/layouts/notifications/monitoring.js

import React, { useEffect, useState } from "react";
import WebcamStream from "./webcamStream";
import YoloStream from "./YoloStream";
import PropTypes from "prop-types";
import { CCTVList } from "./cctvList";
import CCTVControls from "./cctvControls";
import { Snackbar, Alert } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const CCTVMonitor = ({
  id,
  name,
  location,
  status,
  deviceId,
  isRecording = false,
  isAIDetectionActive = false,
  isAIViewActive = false,
}) => {
  const currentTime = new Date().toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <DashboardLayout>
      <div
        style={{
          height: "800px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.9)",
          borderRadius: "8px",
        }}
      >
        {/* 카메라 정보 오버레이 */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 8,
            padding: 12,
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h3 style={{ fontWeight: "600", fontSize: 18, margin: 0 }}>{name}</h3>
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 12,
                backgroundColor: status === "online" ? "#4caf50" : "#f44336",
                color: "white",
              }}
            >
              {status === "online" ? "온라인" : "오프라인"}
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#ccc", margin: "0 0 4px 0" }}>{location}</p>
          <p style={{ fontSize: 12, color: "#888", margin: 0 }}>카메라 ID: {id}</p>
        </div>

        {/* 시간 표시 */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 8,
            padding: "4px 12px",
          }}
        >
          <p style={{ color: "white", fontSize: 14, fontFamily: "monospace", margin: 0 }}>
            {currentTime}
          </p>
        </div>

        {/* CCTV 화면 영역 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status === "online" && deviceId ? (
            isAIViewActive && isAIDetectionActive ? (
              <YoloStream deviceId={deviceId} isActive={true} />
            ) : (
              <WebcamStream
                deviceId={deviceId}
                label={name}
                isRecording={isRecording}
                isAIViewActive={isAIViewActive}
              />
            )
          ) : (
            <div style={{ textAlign: "center", color: "#888" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  border: "4px solid #555",
                  borderRadius: "50%",
                  margin: "0 auto 16px auto",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: "#555",
                    borderRadius: "50%",
                    margin: "auto",
                    marginTop: 8,
                  }}
                />
              </div>
              <p style={{ fontSize: 18, fontWeight: "500" }}>연결 안됨</p>
              <p style={{ fontSize: 14 }}>장비 연결을 확인하세요</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

CCTVMonitor.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["online", "offline"]).isRequired,
  deviceId: PropTypes.string,
  isRecording: PropTypes.bool,
  isAIDetectionActive: PropTypes.bool,
  isAIViewActive: PropTypes.bool,
};

const sampleCameras = [
  {
    id: "cam01",
    name: "자재 적치장 CCTV",
    location: "현장 북쪽 자재 창고",
    status: "online",
    deviceId: "device1",
  },
  {
    id: "cam02",
    name: "관리동 입구 CCTV",
    location: "관리동 정문",
    status: "offline",
    deviceId: null,
  },
  {
    id: "cam03",
    name: "철골 조립장 CCTV",
    location: "3층 철골 조립 현장",
    status: "online",
    deviceId: "device3",
  },
  {
    id: "cam03",
    name: "2층 작업장 CCTV",
    location: "2층 작업 공간",
    status: "online",
    deviceId: "device3",
  },
  {
    id: "cam03",
    name: "1층 정문 CCTV",
    location: "1층 출입구",
    status: "online",
    deviceId: "device3",
  },
  {
    id: "cam03",
    name: "크레인 작업 구역 CCTV",
    location: "현장 중앙 크레인 위치",
    status: "online",
    deviceId: "device3",
  },
];

const MonitoringPage = () => {
  const [activeCameraId, setActiveCameraId] = useState(sampleCameras[0].id);
  const [deviceId, setDeviceId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIDetectionActive, setIsAIDetectionActive] = useState(false);
  const [isAIViewActive, setIsAIViewActive] = useState(false);
  const [toastInfo, setToastInfo] = useState({ open: false, title: "", description: "" });

  const showToast = (title, description) => {
    setToastInfo({ open: true, title, description });
  };

  const handleAIDetection = () => {
    const newValue = !isAIDetectionActive;
    setIsAIDetectionActive(newValue);
    showToast(
      newValue ? "AI 탐지 활성화" : "AI 탐지 비활성화",
      newValue ? "실시간 AI 탐지를 시작했습니다." : "실시간 AI 탐지를 중지했습니다."
    );
  };

  const handleRecording = () => {
    const newValue = !isRecording;
    setIsRecording(newValue);
    showToast(
      newValue ? "녹화 시작" : "녹화 중지",
      newValue ? "화면 녹화를 시작했습니다." : "화면 녹화를 중지했습니다."
    );
  };

  const handleAIView = () => {
    const newValue = !isAIViewActive;
    setIsAIViewActive(newValue);
    showToast(
      newValue ? "AI 탐지 화면" : "일반 화면",
      newValue ? "AI 탐지 화면으로 전환했습니다." : "일반 화면으로 전환했습니다."
    );
  };

  const handleCameraSelect = (id) => {
    setActiveCameraId(id);
    const selectedCamera = sampleCameras.find((cam) => cam.id === id);
    setDeviceId(selectedCamera ? selectedCamera.deviceId : null);
  };

  const activeCamera = sampleCameras.find((cam) => cam.id === activeCameraId);

  useEffect(() => {
    const getFirstCamera = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      if (videoDevices.length > 0) {
        setDeviceId(videoDevices[0].deviceId);
      }
    };
    getFirstCamera();
  }, []);

  const sampleProps = {
    ...activeCamera,
    deviceId,
    isRecording,
    isAIDetectionActive,
    isAIViewActive,
  };

  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* 캠 화면 */}
      <div style={{ flex: 3.5 }}>
        <CCTVMonitor {...sampleProps} />
        <div style={{ marginTop: 0 }}>
          <CCTVControls
            onAIDetection={handleAIDetection}
            onRecording={handleRecording}
            onAIView={handleAIView}
            isRecording={isRecording}
            isAIDetectionActive={isAIDetectionActive}
            isAIViewActive={isAIViewActive}
          />
        </div>
      </div>

      {/* 오른쪽 CCTV 리스트 */}
      <div style={{ flex: 1 }}>
        <CCTVList
          cameras={sampleCameras}
          activeCameraId={activeCameraId}
          onCameraSelect={handleCameraSelect}
        />
      </div>

      {/* MUI Snackbar 알림 */}
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
    </div>
  );
};

export default MonitoringPage;

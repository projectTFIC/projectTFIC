import React, { useEffect, useState } from "react";
import { CCTVMonitor } from "./monitoring"; // 기존 코드에서 분리했다면 이렇게 import
import { CCTVList } from "./cctvList"; // CCTVList 컴포넌트 import
// WebcamStream, YoloStream는 CCTVMonitor 내부에서 이미 import 됨

const sampleCameras = [
  { id: "cam01", name: "현관 CCTV", location: "1층 입구", status: "online", deviceId: "device1" },
  { id: "cam02", name: "후문 CCTV", location: "후문 출입구", status: "offline", deviceId: null },
  {
    id: "cam03",
    name: "주차장 CCTV",
    location: "주차장 입구",
    status: "online",
    deviceId: "device3",
  },
];

const MonitoringPage = () => {
  const [cameras, setCameras] = useState(sampleCameras);
  const [activeCameraId, setActiveCameraId] = useState(sampleCameras[0].id);
  const [deviceMap, setDeviceMap] = useState({}); // id -> deviceId mapping

  useEffect(() => {
    // 실제 환경이라면 enumerateDevices로 deviceId를 받아 매핑해야 함
    // 여기서는 샘플 데이터 deviceId를 사용
    const map = {};
    sampleCameras.forEach((cam) => {
      map[cam.id] = cam.deviceId;
    });
    setDeviceMap(map);
  }, []);

  const activeCamera = cameras.find((cam) => cam.id === activeCameraId);

  if (!activeCamera) return <div>활성화된 카메라가 없습니다.</div>;

  return (
    <div style={{ display: "flex", height: "100vh", padding: 20, gap: 20 }}>
      {/* 왼쪽 - 캠 화면 */}
      <div style={{ flex: 3 }}>
        <CCTVMonitor
          id={activeCamera.id}
          name={activeCamera.name}
          location={activeCamera.location}
          status={activeCamera.status}
          deviceId={deviceMap[activeCamera.id]}
          isRecording={false}
          isAIDetectionActive={false}
          isAIViewActive={false}
        />
      </div>

      {/* 오른쪽 - 캠 리스트 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <CCTVList
          cameras={cameras}
          activeCameraId={activeCameraId}
          onCameraSelect={setActiveCameraId}
        />
      </div>
    </div>
  );
};

export default MonitoringPage;

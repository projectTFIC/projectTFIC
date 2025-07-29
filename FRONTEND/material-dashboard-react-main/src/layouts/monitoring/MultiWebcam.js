import React, { useEffect, useState } from "react";
import WebcamStream from "./webcamStream";

const MultiWebcam = () => {
  const [devices, setDevices] = useState([]);

  const getDevices = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
    setDevices(videoDevices);
  };

  useEffect(() => {
    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  return (
    <div>
      {devices.map((device) => (
        <div key={device.deviceId}>
          <h4>{device.label || `Camera ${devices.indexOf(device) + 1}`}</h4>
          <WebcamStream
            deviceId={device.deviceId}
            label={device.label || `Camera_${devices.indexOf(device) + 1}`}
          />
        </div>
      ))}
    </div>
  );
};

export default MultiWebcam;

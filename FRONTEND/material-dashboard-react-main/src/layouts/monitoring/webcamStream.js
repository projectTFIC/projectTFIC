import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export const WebcamStream = ({ deviceId, label, isRecording = false, isAIViewActive = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamError, setStreamError] = useState(null);
  const recordingIntervalRef = useRef(null);

  const sendScreenshot = async (imageData) => {
    try {
      await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: label,
          imageData: imageData,
        }),
      });
    } catch (error) {
      console.error(`스크린샷 업로드 오류 ${label}:`, error);
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= video.HAVE_METADATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL("image/png");
          sendScreenshot(imageData);
        }
      }
    }
  };

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        setStreamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("미디어 장치 액세스 오류:", err);
        setStreamError("카메라 연결에 실패했습니다.");
      }
    };

    getMediaStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [deviceId]);

  useEffect(() => {
    if (isRecording) {
      const startRecording = () => {
        takeScreenshot(); // 즉시 스크린샷
        recordingIntervalRef.current = setInterval(takeScreenshot, 5000); // 5초마다
      };

      if (videoRef.current && videoRef.current.readyState >= 2) {
        startRecording();
      } else if (videoRef.current) {
        videoRef.current.oncanplay = startRecording;
      }
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (streamError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground">{streamError}</p>
          <p className="text-sm text-muted-foreground mt-2">카메라 연결을 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg"
        style={{
          width: "1200px", // 혹은 원하는 % 혹은 px
          height: "700px",
          objectFit: "cover",
          borderRadius: "8px",
          transform: isAIViewActive ? "hue-rotate(60deg)" : "none",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {isRecording && (
        <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-medium">
          ● REC
        </div>
      )}
    </div>
  );
};

WebcamStream.propTypes = {
  deviceId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isRecording: PropTypes.bool,
  isAIViewActive: PropTypes.bool,
};

export default WebcamStream;

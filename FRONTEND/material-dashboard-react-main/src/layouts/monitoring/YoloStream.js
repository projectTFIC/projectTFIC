import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const YoloStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [processedImage, setProcessedImage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // Python 서버의 주소 (포트 5001)
    socketRef.current = io("http://localhost:5001");
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to Python server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Python server");
    });

    // 서버로부터 처리된 이미지를 받아 상태에 저장
    socket.on("processed_image", (data) => {
      setProcessedImage(data);
    });

    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    getMediaStream();

    const sendFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_METADATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const imageData = canvas.toDataURL("image/jpeg");
        socket.emit("image", imageData);
      }
    };

    // 100ms 마다 (초당 10프레임) 프레임을 서버로 전송
    const intervalId = setInterval(sendFrame, 100);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h3>YOLO Object Detection Stream</h3>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h4>Original Webcam</h4>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", maxWidth: "500px", border: "1px solid black" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
        <div>
          <h4>Processed by Python (YOLO)</h4>
          {processedImage ? (
            <img
              src={processedImage || undefined}
              alt="Processed Stream"
              style={{ width: "100%", maxWidth: "500px", border: "1px solid black" }}
            />
          ) : (
            <div
              style={{
                width: "500px",
                height: "375px",
                border: "1px solid black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p>Waiting for processed stream...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoloStream;

import { io } from "socket.io-client";

// 파이썬 AI 서버 주소
const SERVER_URL = "http://localhost:5000";

const socket = io(SERVER_URL, {
  transports: ["websocket"], // WebSocket을 우선적으로 사용
});

export default socket;

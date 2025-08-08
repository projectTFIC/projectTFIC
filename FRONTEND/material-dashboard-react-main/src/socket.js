import { io } from "socket.io-client";

const URL = process.env.REACT_APP_AI_WS || "http://localhost:5000";
const socket = io(URL, {
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
});

export default socket;

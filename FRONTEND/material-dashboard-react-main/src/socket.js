import { io } from "socket.io-client";

const URL = process.env.REACT_APP_AI_WS || "/ai-socket";
const PATH = process.env.REACT_APP_AI_WS_PATH || "/ai-socket/socket.io";

const socket = io(URL, {
  path: PATH,
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 2000,
});

export default socket;

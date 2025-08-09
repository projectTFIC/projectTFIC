// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // 환경변수에서 경로 읽음
  withCredentials: true, // 쿠키 사용시 유지
});

export default api;

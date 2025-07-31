import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "/web";

// [ axios 인스턴스 생성 ]
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// [ 공통 API 함수 ]
export async function callApi(endpoint, options = {}) {
  try {
    const response = await apiClient({
      url: endpoint,
      method: options.method || "GET",
      data: options.body || null, // POST, PUT일 경우
      params: options.params || null, // GET 요청에서 쿼리스트링
    });

    console.log(`✅ API 응답 성공(${endpoint}):`, response.data);
    return response.data;
  } catch (err) {
    console.error(`❌ API 응답 실패(${endpoint}):`, err);
    throw err;
  }
}

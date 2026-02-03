import axios from "axios";

// Detect local vs online frontend
const isLocalFrontend =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalFrontend
  ? "http://127.0.0.1:8000/api/"
  :  "https://fresh-merely-randy-segment.trycloudflare.com/api/";


const API = axios.create({
  baseURL: API_BASE_URL,
 
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail || "";

    const tokenErrors = [
      "token is invalid",
      "token expired",
      "given token not valid",
      "not valid for any token type"
    ];

    const isTokenError =
      tokenErrors.some(msg => detail.toLowerCase().includes(msg));

    if (status === 401 && isTokenError) {
      console.warn("🔐 Token expired. Logging out.");

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);



export default API;

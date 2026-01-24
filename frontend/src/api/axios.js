import axios from "axios";

// Detect local vs online frontend
const isLocalFrontend =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalFrontend
  ? "http://127.0.0.1:8000/api/"
  :  "https://brown-have-stress-practitioners.trycloudflare.com/api/";


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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔐 Token expired or invalid. Logging out.");

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // optional: prevent infinite redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
export default API;

import axios from "axios";

// Detect local vs online frontend
const isLocalFrontend =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalFrontend
  ? "http://127.0.0.1:8000/api/"
  : "https://rica-native-demand-determined.trycloudflare.com/api/";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // important for Django
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

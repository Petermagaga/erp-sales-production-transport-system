import axios from "axios";

// Auto-switch between local and production
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/"
    : "https://unibrainerps.onrender.com/api";   // <- change this once

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

export default API;

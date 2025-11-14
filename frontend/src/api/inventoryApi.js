// src/api/inventoryApi.js
import API from "./axios";

// ✅ Fetch daily inventory records
export const getDailyInventory = async (params = {}) => {
  const res = await API.get("dailyinventory/", { params });
  return res.data;
};

// ✅ Fetch daily summary (with filters)
export const getInventorySummary = async (params = {}) => {
  const res = await API.get("dailyinventory/summary/", { params });
  return res.data;
};

// ✅ Create a new inventory record
export const createInventory = async (data) => {
  const res = await API.post("dailyinventory/", data);
  return res.data;
};

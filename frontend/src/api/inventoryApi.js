import API from "axios";

export const getDailyInventory = async (params = {}) => {
  const res = await API.get("daily-inventory/", { params });
  return res.data;
};

export const getInventorySummary = async (params = {}) => {
  const res = await API.get("daily-inventory/summary/", { params });
  return res.data;
};

export const createInventory = async (data) => {
  const res = await API.post("daily-inventory/", data);
  return res.data;
};

// src/api/warehouseApi.js
import API from "./axios";

// ✅ Get all warehouses
export const getWarehouses = async () => {
  const res = await API.get("warehouses/");
  return res.data;
};

// ✅ Get all materials
export const getMaterials = async () => {
  const res = await API.get("materials/");
  return res.data;
};

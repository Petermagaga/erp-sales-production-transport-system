// src/api/analyticsApi.js
import API from "axios";

// Fetch warehouse analytics (by date or all)
export const fetchWarehouseAnalytics = async (params = {}) => {
  try {
    const response = await API.get("warehouse-analytics/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

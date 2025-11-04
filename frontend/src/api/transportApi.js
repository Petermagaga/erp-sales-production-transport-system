import API from "./axios"; // ✅ use the same global axios instance

// Fetch all vehicles
export const getVehicles = async () => {
  const res = await API.get("transport/vehicles/");
  return res.data;
};

// Fetch all transport records
export const getTransportRecords = async () => {
  const res = await API.get("transport/records/");
  return res.data;
};

// Add new transport record
export const addTransportRecord = async (data) => {
  const res = await API.post("transport/records/", data);
  return res.data;
};

// Fetch analytics
export const getTransportAnalytics = async (params = {}) => {
  const res = await API.get("transport/records/analytics/", { params });
  return res.data;
};

// ✅ Fetch single record by ID
export const getTransportRecordById = async (id) => {
  const res = await API.get(`transport/records/${id}/`);
  return res.data;
};

// ✅ Update existing transport record
export const updateTransportRecord = async (id, data) => {
  const res = await API.put(`transport/records/${id}/`, data);
  return res.data;
};



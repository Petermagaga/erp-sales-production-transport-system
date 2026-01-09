import axios from "./axios";   // your configured axios instance

export const getMillingDashboard = async (params = {}) => {
  const response = await axios.get("/milling/dashboard/", {
    params,
  });
  return response.data;
};


export const getMillingBatches = async () => {
  const res = await api.get("/milling/batches/");
  return res.data;
};


export const createMillingBatches = async (payload) => {
  const res = await api.post("/milling/batches/", payload);
  return res.data;
};

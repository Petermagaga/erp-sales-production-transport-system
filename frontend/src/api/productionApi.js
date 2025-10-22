// src/api/productionApi.js
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/production/";


// ✅ Define your API base URL here
const API_URL = "http://127.0.0.1:8000/api/production/";

export const createProduction = async (rawData, flourData) => {
  try {
    const response = await axios.post(
      `${API_URL}create-production/`,
      {
        raw: rawData,
        flour: flourData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Production created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating production:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===========================================
// 🏭 MAIN MERGED PRODUCTION VIEW
// ===========================================
export const getProductions = async () => {
  try {
    const response = await api.get("merged/");
    return response.data;
  } catch (error) {
    console.error("Error fetching merged productions:", error);
    toast.error("Failed to load production summary!");
    throw error;
  }
};

// ===========================================
// 🌾 FLOUR OUTPUT FUNCTIONS
// ===========================================
export const fetchFlourOutputs = async () => {
  try {
    const response = await api.get("flour-output/");
    return response.data;
  } catch (error) {
    console.error("Error fetching flour outputs:", error);
    toast.error("Failed to load flour output data!");
    throw error;
  }
};

export const fetchFlourOutputById = async (id) => {
  try {
    const response = await api.get(`flour-output/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching flour output:", error);
    toast.error("Failed to load this flour output record!");
    throw error;
  }
};

export const createFlourOutput = async (data) => {
  try {
    const efficiency =
      data.total_raw_material && data.total_raw_material > 0
        ? ((data.total_bags * 25) / data.total_raw_material) * 100
        : 0;

    const payload = {
      ...data,
      efficiency_rate: parseFloat(efficiency.toFixed(2)),
    };

    const response = await api.post("flour-output/", payload);
    toast.success("Flour output added successfully!");
    return response.data;
  } catch (error) {
    console.error("Error creating flour output:", error.response?.data || error);
    toast.error("Failed to add flour output!");
    throw error;
  }
};

export const updateFlourOutput = async (id, data) => {

  const payload = { ...data };
  const response = await api.post("flour-output/", payload);

};

export const deleteFlourOutput = async (id) => {
  try {
    await api.delete(`flour-output/${id}/`);
    toast.success("Flour output deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting flour output:", error);
    toast.error("Failed to delete flour output!");
    throw error;
  }
};

// ===========================================
// 🧱 RAW MATERIAL FUNCTIONS
// ===========================================
export const fetchRawMaterials = async () => {
  try {
    const response = await api.get("raw-materials/");
    return response.data;
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    toast.error("Failed to load raw materials!");
    throw error;
  }
};

export const createRawMaterial = async (data) => {
  try {
    const response = await api.post("raw-materials/", data);
    toast.success("Raw material added successfully!");
    return response.data;
  } catch (error) {
    console.error("Error creating raw material:", error);
    toast.error("Failed to add raw material!");
    throw error;
  }
};

export const updateRawMaterial = async (id, data) => {
  try {
    const response = await api.put(`raw-materials/${id}/`, data);
    toast.success("Raw material updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating raw material:", error);
    toast.error("Failed to update raw material!");
    throw error;
  }
};

// ===========================================
// 🧩 EDIT PRODUCTION HELPERS (for EditProduction.jsx)
// ===========================================
export const getProductionById = async (id) => {
  // Uses flour-output record as production reference
  return await fetchFlourOutputById(id);
};

export const updateProduction = async (id, data) => {
  // Reuses flour-output update logic
  return await updateFlourOutput(id, data);
};

export default {
  getProductions,
  fetchFlourOutputs,
  fetchFlourOutputById,
  createFlourOutput,
  updateFlourOutput,
  deleteFlourOutput,
  fetchRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  getProductionById,
  updateProduction,
};

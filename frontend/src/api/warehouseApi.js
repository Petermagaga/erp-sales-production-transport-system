import API from "axios";

export const getWarehouses = async () => {
  const res = await API.get("warehouses/");
  return res.data;
};

export const getMaterials = async () => {
  const res = await API.get("materials/");
  return res.data;
};

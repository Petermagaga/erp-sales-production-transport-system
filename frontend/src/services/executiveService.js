import API from "../api/axios";

export const getExecutiveDashboard = async () => {
  const { data } = await API.get("dashboards/executive/");
  return data;
};

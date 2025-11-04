import React, { useEffect, useState } from "react";
import API from "../api/api";

const WarehouseSelector = ({ onChange }) => {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await API.get("warehouses/");
        setWarehouses(res.data);
      } catch (error) {
        console.error("Error loading warehouses:", error);
      }
    };
    fetchWarehouses();
  }, []);

  return (
    <select onChange={(e) => onChange(e.target.value)} defaultValue="">
      <option value="">All Warehouses</option>
      {warehouses.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  );
};

export default WarehouseSelector;

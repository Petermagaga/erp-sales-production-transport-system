import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const AnalyticsDashboard = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await API.get("inventory/analytics/", { params: filters });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Title & Inline Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📈 Inventory Analytics
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-1 text-sm"
          />
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-1 text-sm"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border rounded-lg px-3 py-1 text-sm"
          >
            <option value="">All Categories</option>
            <option value="raw">Raw Materials</option>
            <option value="finished">Finished Products</option>
            <option value="byproduct">Byproducts</option>
          </select>
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* 🔹 Charts Section */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Total Movement Summary
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product__name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_in" fill="#34d399" name="Total In" />
            <Bar dataKey="total_out" fill="#60a5fa" name="Total Out" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

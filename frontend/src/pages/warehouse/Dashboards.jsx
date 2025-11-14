// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchWarehouseAnalytics } from "../../api/analyticsApi.js";
import AnalyticsFilterBar from "../../../src/components/AnalyticsFilterBar.jsx";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const Dashboards = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category: "",
  });

  const loadData = async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchWarehouseAnalytics(params);
      console.log("Fetched analytics data:", data);
      setAnalytics(
        Array.isArray(data) ? data : data?.data || data?.results || []
      );
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    loadData(filters);
  };

  if (loading) return <p>Loading analytics...</p>;

  const avgEfficiency =
    Array.isArray(analytics) && analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.efficiency || 0), 0) /
        analytics.length
      : 0;

  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      <h1 className="text-2xl font-bold text-gray-800">📊 Warehouse Analytics</h1>
      <p className="text-gray-600 mb-4">Filter and view performance trends</p>

      <AnalyticsFilterBar
        filters={filters}
        onChange={handleChange}
        onApply={handleApply}
      />

      <h3 className="text-lg font-semibold mt-4 text-green-700">
        Average Efficiency: {avgEfficiency.toFixed(2)}%
      </h3>

      {/* 📈 Efficiency Trend */}
      <div style={{ marginTop: 30 }}>
        <h2 className="text-xl font-semibold text-gray-700">
          Efficiency Trend Over Time
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Company Green */}
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#16a34a"
              strokeWidth={3}
              activeDot={{ r: 7 }}
              name="Efficiency (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📦 Production Summary */}
      <div style={{ marginTop: 50 }}>
        <h2 className="text-xl font-semibold text-gray-700">
          Production Summary (Input vs Output vs Waste)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Darker Green for Raw Input */}
            <Bar
              dataKey="total_raw_in"
              fill="#15803d"
              name="Raw Input (Kg)"
            />

            {/* Yellow/Gold for Output */}
            <Bar
              dataKey="total_output"
              fill="#facc15"
              name="Output (Kg)"
            />

            {/* Softer Red for Waste */}
            <Bar
              dataKey="total_waste"
              fill="#dc2626"
              name="Waste (Kg)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Detailed Table */}
      <div style={{ marginTop: 50 }}>
        <h2 className="text-xl font-semibold text-gray-700">Detailed Records</h2>

        <table className="analytics-table w-full mt-3 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Raw In</th>
              <th className="border px-3 py-2">Output</th>
              <th className="border px-3 py-2">Waste</th>
              <th className="border px-3 py-2">Efficiency (%)</th>
            </tr>
          </thead>

          <tbody>
            {analytics.map((item, i) => (
              <tr key={i} className="text-sm">
                <td className="border px-3 py-2">{item.date}</td>
                <td className="border px-3 py-2">{item.total_raw_in}</td>
                <td className="border px-3 py-2">{item.total_output}</td>
                <td className="border px-3 py-2">{item.total_waste}</td>
                <td className="border px-3 py-2">
                  {item.efficiency?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboards;

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
      setAnalytics(Array.isArray(data) ? data : data?.data || data?.results || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics([]); // fallback empty list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(); // Initial load
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
    ? analytics.reduce((sum, a) => sum + (a.efficiency || 0), 0) / analytics.length
    : 0;


  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      <h1>📊 Warehouse Analytics</h1>
      <p>Filter and view performance trends</p>

      <AnalyticsFilterBar
        filters={filters}
        onChange={handleChange}
        onApply={handleApply}
      />

      <h3>Average Efficiency: {avgEfficiency.toFixed(2)}%</h3>

      {/* 📈 Efficiency Trend */}
      <div style={{ marginTop: 30 }}>
        <h2>Efficiency Trend Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#4CAF50"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📦 Production Summary */}
      <div style={{ marginTop: 50 }}>
        <h2>Production Summary (Input vs Output vs Waste)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_raw_in" fill="#2196F3" name="Raw Input (Kg)" />
            <Bar dataKey="total_output" fill="#4CAF50" name="Output (Kg)" />
            <Bar dataKey="total_waste" fill="#F44336" name="Waste (Kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Detailed Table */}
      <div style={{ marginTop: 50 }}>
        <h2>Detailed Records</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Raw In</th>
              <th>Output</th>
              <th>Waste</th>
              <th>Efficiency (%)</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item, i) => (
              <tr key={i}>
                <td>{item.date}</td>
                <td>{item.total_raw_in}</td>
                <td>{item.total_output}</td>
                <td>{item.total_waste}</td>
                <td>{item.efficiency.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboards;

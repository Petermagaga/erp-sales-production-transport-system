// src/pages/SalesAnalytics.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const SalesAnalytics = () => {
  const [filter, setFilter] = useState("monthly");
  const [region, setRegion] = useState("");
  const [salesRep, setSalesRep] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analyticsData, setAnalyticsData] = useState([]);
  const [summary, setSummary] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch filters safely
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [regionsRes, repsRes] = await Promise.all([
          axios.get("/api/sales/regions/"),
          axios.get("/api/sales/reps/"),
        ]);

        const regionData = Array.isArray(regionsRes.data)
          ? regionsRes.data
          : regionsRes.data.regions || [];

        const repData = Array.isArray(repsRes.data)
          ? repsRes.data
          : repsRes.data.reps || [];

        setRegions(regionData);
        setSalesReps(repData);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setRegions([]);
        setSalesReps([]);
      }
    };
    fetchFilters();
  }, []);

  // ✅ Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("filter_type", filter);
      if (region) params.append("region", region);
      if (salesRep) params.append("sales_rep", salesRep);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await axios.get(`/api/sales/analytics/?${params.toString()}`);
      const data = res.data || {};

      const mappedAnalytics = (data.analytics || data.data || []).map((item) => ({
        date: item.date || item.period,
        sales_count: item.sales_count || item.total_sales,
        revenue: item.revenue || item.total_revenue,
      }));

      setAnalyticsData(mappedAnalytics);
      setSummary(data.summary || {});
      setTopProducts(data.top_products || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filter, region, salesRep, startDate, endDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        📊 Sales Analytics Dashboard
      </h1>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        {/* ✅ Safe region rendering (handles objects or strings) */}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Regions</option>
          {Array.isArray(regions) &&
            regions.map((r, index) => {
              const value = typeof r === "string" ? r : r.name;
              const key = r.id || index;
              return (
                <option key={key} value={value}>
                  {value}
                </option>
              );
            })}
        </select>

        <select
          value={salesRep}
          onChange={(e) => setSalesRep(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Sales Reps</option>
          {Array.isArray(salesReps) &&
            salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.first_name} {rep.last_name}
              </option>
            ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600 animate-pulse">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-700 text-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <h3 className="text-sm opacity-90">Total Sales</h3>
              <p className="text-3xl font-bold mt-1">
                {summary.total_sales || 0}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-700 mt-1">
                KES {summary.total_revenue?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-500">
              <h3 className="text-gray-500 text-sm">Average Sale</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                KES {summary.avg_sale?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales_count"
                  stroke="#16a34a"
                  strokeWidth={3}
                  name="Sales Count"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#eab308"
                  strokeWidth={3}
                  name="Revenue (KES)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Top Products
            </h2>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No products found.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <XAxis dataKey="product_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_sales" fill="#16a34a" name="Qty Sold" />
                  <Bar
                    dataKey="total_revenue"
                    fill="#eab308"
                    name="Revenue (KES)"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;

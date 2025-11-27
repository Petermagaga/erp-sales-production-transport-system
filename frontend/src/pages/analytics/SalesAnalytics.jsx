// src/pages/SalesAnalytics.jsx
import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
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

  // Fetch filters
useEffect(() => {
  const fetchFilters = async () => {
    try {
      const [regionsRes, repsRes] = await Promise.all([
        API.get("sales/analytics/regions/"),
        API.get("/sales/reps/"),
      ]);

      // 🔥 Always convert responses into arrays safely
      setRegions(
        Array.isArray(regionsRes.data)
          ? regionsRes.data
          : regionsRes.data.regions || []
      );

      setSalesReps(
        Array.isArray(repsRes.data)
          ? repsRes.data
          : repsRes.data.reps || []
      );
    } catch (err) {
      console.error("Error fetching filters", err);

      // Fallback so UI NEVER crashes
      setRegions([]);
      setSalesReps([]);
    }
  };

  fetchFilters();
}, []);

  // Fetch analytics
const fetchAnalytics = async () => {
  setLoading(true);

  try {
    const params = new URLSearchParams();
    params.append("filter_type", filter);
    if (region) params.append("region", region);
    if (salesRep) params.append("sales_rep", salesRep);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const res = await API.get(`/sales/sales/analytics/?${params.toString()}`);
    const data = res.data || {};

    // 🟢 Summary
    setSummary({
      total_sales: data.summary?.total_sales || 0,
      total_revenue: data.summary?.total_revenue || 0,
      avg_sale:
        data.summary?.total_sales
          ? data.summary.total_revenue / data.summary.total_sales
          : 0,
    });

    // 🟢 Build analytics line graph manually from product totals
    const analyticsMapped = (data.sales_by_product || []).map((item) => ({
      date: item.product__name, // temporary until backend adds date breakdown
      sales_count: item.total_sold || 0,
      revenue: item.revenue || 0,
    }));

    setAnalyticsData(analyticsMapped);

    // 🟢 Top products chart
    setTopProducts(
      (data.sales_by_product || []).map((item) => ({
        product_name: item.product__name,
        total_sales: item.total_sold,
        total_revenue: item.revenue,
      }))
    );
  } catch (err) {
    console.error("Error fetching analytics", err);
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        {/* Regions */}
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


        {/* Sales Reps */}
        <select
          value={salesRep}
          onChange={(e) => setSalesRep(e.target.value)}
          className="p-3 border rounded-xl bg-white shadow-sm"
        >
          <option value="">All Reps</option>
          {salesReps.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.first_name} {rep.last_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-3 border rounded-xl"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-3 border rounded-xl"
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-700 text-white p-5 rounded-xl">
              <h3>Total Sales</h3>
              <p className="text-3xl">{summary.total_sales || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border-l-4 border-green-600">
              <h3>Total Revenue</h3>
              <p className="text-3xl">
                KES {summary.total_revenue?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border-l-4 border-yellow-500">
              <h3>Average Sale</h3>
              <p className="text-3xl">
                KES {summary.avg_sale?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl mb-6">
            <h2 className="text-xl mb-4">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="sales_count" stroke="#16a34a" strokeWidth={3} />
                <Line dataKey="revenue" stroke="#eab308" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl">
            <h2 className="text-xl mb-4">Top Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <XAxis dataKey="product_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_sales" fill="#16a34a" />
                <Bar dataKey="total_revenue" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;

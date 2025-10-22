import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Package } from "lucide-react";

const SalesDashboard = () => {
  const [analytics, setAnalytics] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("monthly");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRep, setSelectedRep] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/sales/analytics/", {
        params: {
          start_date: startDate,
          end_date: endDate,
          filter_type: filterType,
          region: selectedRegion,
          sales_rep: selectedRep,
        },
      });
      setAnalytics(res.data.analytics || []);
      setTopProducts(res.data.top_products || []);
    } catch (err) {
      console.error("Error fetching analytics", err);
    }
  };

  const fetchFilters = async () => {
    try {
      const [regionRes, repRes] = await Promise.all([
        axios.get("/api/regions/"),
        axios.get("/api/sales-officers/"),
      ]);
      setRegions(regionRes.data.regions || regionRes.data || []);
      setSalesReps(repRes.data.reps || repRes.data || []);
    } catch (err) {
      console.error("Error fetching filters", err);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchAnalytics();
  }, [filterType, startDate, endDate, selectedRegion, selectedRep]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
          <BarChart3 className="text-amber-500" /> Sales Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Gain insights into performance, trends, and top products.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 bg-white border border-emerald-100 rounded-xl p-5 shadow-md"
      >
        {[
          {
            label: "Filter Type",
            type: "select",
            value: filterType,
            setValue: setFilterType,
            options: ["weekly", "monthly", "yearly"],
          },
          { label: "Start Date", type: "date", value: startDate, setValue: setStartDate },
          { label: "End Date", type: "date", value: endDate, setValue: setEndDate },
          {
            label: "Region",
            type: "select",
            value: selectedRegion,
            setValue: setSelectedRegion,
            options: [{ name: "All Regions", id: "" }, ...regions],
          },
          {
            label: "Sales Rep",
            type: "select",
            value: selectedRep,
            setValue: setSelectedRep,
            options: [{ first_name: "All", last_name: "Reps", id: "" }, ...salesReps],
          },
        ].map((filter, idx) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-emerald-900">
              {filter.label}
            </label>
            {filter.type === "select" ? (
              <select
                value={filter.value}
                onChange={(e) => filter.setValue(e.target.value)}
                className="w-full mt-1 bg-white border border-emerald-200 rounded-md p-2 text-gray-800 focus:ring-emerald-600 focus:border-emerald-600 hover:shadow-sm"
              >
                {filter.options.map((opt, i) => (
                  <option key={i} value={opt.id || opt}>
                    {opt.name || `${opt.first_name || ""} ${opt.last_name || ""}` || opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={filter.value}
                onChange={(e) => filter.setValue(e.target.value)}
                className="w-full mt-1 bg-white border border-emerald-200 rounded-md p-2 text-gray-800 focus:ring-emerald-600 focus:border-emerald-600 hover:shadow-sm"
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Sales Trends */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-emerald-100 rounded-xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-900">
          <TrendingUp className="text-amber-500" /> Sales Trend ({filterType})
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="period" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #065f46",
                color: "#065f46",
              }}
            />
            <Line
              type="monotone"
              dataKey="total_sales"
              stroke="#047857"
              strokeWidth={3}
              dot={{ r: 5, fill: "#FACC15" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-emerald-100 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-900">
          <Package className="text-amber-500" /> Top Products
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="product_name" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #065f46",
                color: "#065f46",
              }}
            />
            <Legend />
            <Bar dataKey="quantity_sold" fill="#047857" radius={[6, 6, 0, 0]} />
            <Bar dataKey="revenue" fill="#FACC15" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default SalesDashboard;

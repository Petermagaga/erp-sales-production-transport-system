import React, { useContext, useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
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
  const { authTokens } = useContext(AuthContext);

  const [analytics, setAnalytics] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("monthly");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRep, setSelectedRep] = useState("");

  const tokenHeader = {
    headers: { Authorization: `Bearer ${authTokens?.access}` },
  };

  /* ------------------------------------------------------------
     FETCH ANALYTICS  (Memoized for performance)
  -------------------------------------------------------------*/
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await API.get("sales/analytics/sales", {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          filter_type: filterType,
          region: selectedRegion || undefined,
          sales_rep: selectedRep || undefined,
        },
        ...tokenHeader,
      });

      setAnalytics(res.data.analytics ?? []);
      setTopProducts(res.data.top_products ?? []);
    } catch (err) {
      console.error("Error fetching analytics ➜", err.message);
    }
  }, [startDate, endDate, filterType, selectedRegion, selectedRep, authTokens]);

  /* ------------------------------------------------------------
     FETCH FILTER OPTIONS (Regions + Sales Reps)
  -------------------------------------------------------------*/
  const fetchFilters = useCallback(async () => {
    try {
      const [regionRes, repRes] = await Promise.all([
        API.get("/sales/analytics/regions/"),
        API.get("/sales/reps/"),
      ]);

      setRegions(regionRes.data.regions ?? []);
      setSalesReps(repRes.data.reps ?? []);

    } catch (err) {
      console.error("Error fetching filters ➜", err.message);
    }
  }, []);

  /* ------------------------------------------------------------
     INIT + REFETCH WHEN FILTERS CHANGE  
  -------------------------------------------------------------*/
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* ------------------------------------------------------------
     UI
  -------------------------------------------------------------*/
  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-900">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
          <BarChart3 className="text-amber-500" /> Sales Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Gain insights into performance, trends, and top products.</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 bg-white border border-emerald-100 rounded-xl p-5 shadow-md"
      >
        {/* FILTER FIELDS */}
        <FilterField
          label="Filter Type"
          type="select"
          value={filterType}
          setValue={setFilterType}
          options={["weekly", "monthly", "yearly"]}
        />

        <FilterField label="Start Date" type="date" value={startDate} setValue={setStartDate} />
        <FilterField label="End Date" type="date" value={endDate} setValue={setEndDate} />

        <FilterField
          label="Region"
          type="select"
          value={selectedRegion}
          setValue={setSelectedRegion}
          options={[{ id: "", name: "All Regions" }, ...regions]}
        />

        <FilterField
          label="Sales Rep"
          type="select"
          value={selectedRep}
          setValue={setSelectedRep}
          options={[{ id: "", first_name: "All", last_name: "Reps" }, ...salesReps]}
        />
      </motion.div>

      {/* Sales Trends */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-emerald-100 rounded-xl p-6 mb-10 shadow-lg">
        
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-900">
          <TrendingUp className="text-amber-500" /> Sales Trend ({filterType})
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="period" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #065f46" }} />
            <Line type="monotone" dataKey="total_sales" stroke="#047857" strokeWidth={3} dot={{ r: 5, fill: "#FACC15" }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
        className="bg-white border border-emerald-100 rounded-xl p-6 shadow-lg">
        
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-900">
          <Package className="text-amber-500" /> Top Products
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="product_name" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #065f46" }} />
            <Legend />
            <Bar dataKey="quantity_sold" fill="#047857" radius={[6, 6, 0, 0]} />
            <Bar dataKey="revenue" fill="#FACC15" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  );
};

/* ------------------------------------------------------------
   SMALL REUSABLE FILTER COMPONENT
-------------------------------------------------------------*/
const FilterField = ({ label, type, value, setValue, options = [] }) => (
  <div>
    <label className="text-sm font-semibold text-emerald-900">{label}</label>

    {type === "select" ? (
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mt-1 bg-white border border-emerald-200 rounded-md p-2 text-gray-800 
                   focus:ring-emerald-600 focus:border-emerald-600 hover:shadow-sm"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.id ?? opt}>
            {opt.name ?? `${opt.first_name ?? ""} ${opt.last_name ?? ""}` ?? opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full mt-1 bg-white border border-emerald-200 rounded-md p-2 text-gray-800 
                   focus:ring-emerald-600 focus:border-emerald-600 hover:shadow-sm"
      />
    )}
  </div>
);

export default SalesDashboard;

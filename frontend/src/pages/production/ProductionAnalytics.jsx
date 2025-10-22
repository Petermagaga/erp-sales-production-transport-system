import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Line, Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    shift: "All",
  });

  const shifts = ["All", "Morning", "Evening", "Night"];

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.shift && filters.shift !== "All") params.shift = filters.shift;

      const res = await API.get("production/analytics/", { params });
      setAnalytics(res.data);

      if (res.data && Object.keys(res.data).length > 0) {
        toast.success("✅ Analytics loaded successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.info("ℹ️ No analytics data found for selected filters.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("❌ Failed to load analytics!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  if (!analytics)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading analytics...
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );

  const {
    totals = {},
    shift_performance = [],
    weekly_trends = [],
  } = analytics || {};

  // ✅ Line Chart — Raw vs Flour Trend (Weekly)
  const lineData = {
    labels: weekly_trends.map((t) => t.week_start),
    datasets: [
      {
        label: "Raw Material (Kg)",
        data: weekly_trends.map((t) => t.total_raw),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: "Flour Output (Kg)",
        data: weekly_trends.map((t) => t.total_flour),
        borderColor: "#EAB308",
        backgroundColor: "rgba(250,204,21,0.2)",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  // ✅ Pie Chart — Efficiency vs Waste
  const efficiencyPieData = {
    labels: ["Efficiency (%)", "Waste (%)"],
    datasets: [
      {
        data: [totals.efficiency, totals.waste_ratio],
        backgroundColor: ["#16A34A", "#DC2626"],
        hoverBackgroundColor: ["#22C55E", "#EF4444"],
        borderWidth: 2,
      },
    ],
  };

  // ✅ Bar Chart — Shift Performance
  const barData = {
    labels: shift_performance.map((s) => s.shift),
    datasets: [
      {
        label: "Efficiency (%)",
        data: shift_performance.map((s) => s.efficiency),
        backgroundColor: "rgba(34,197,94,0.8)",
        borderRadius: 6,
      },
      {
        label: "Waste (%)",
        data: shift_performance.map((s) => s.waste_ratio),
        backgroundColor: "rgba(234,179,8,0.8)",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 via-white to-yellow-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-green-800 tracking-wide">
        Production Analytics Dashboard
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white/90 p-5 rounded-2xl shadow-md border border-green-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift
          </label>
          <select
            name="shift"
            value={filters.shift}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          >
            {shifts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-green-700 text-white px-6 py-2 mt-auto rounded-lg font-medium hover:bg-green-800 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-green-600">
          <p className="text-gray-500 text-sm">Total Raw (Kg)</p>
          <h3 className="text-2xl font-semibold text-green-700">
            {totals.total_raw?.toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Flour Output (Kg)</p>
          <h3 className="text-2xl font-semibold text-yellow-600">
            {totals.total_flour?.toLocaleString()}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Efficiency (%)</p>
          <h3 className="text-2xl font-semibold text-green-600">
            {totals.efficiency}%
          </h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Waste (%)</p>
          <h3 className="text-2xl font-semibold text-red-600">
            {totals.waste_ratio}%
          </h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-5 rounded-2xl shadow-md border border-green-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Raw vs Flour Trend
          </h3>
          <Line data={lineData} />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-yellow-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Efficiency vs Waste
          </h3>
          <Pie data={efficiencyPieData} />
        </div>
      </div>

      {/* Shift Performance */}
      <div className="bg-white mt-8 p-5 rounded-2xl shadow-md border border-green-100">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Shift Performance
        </h3>
        <Bar data={barData} />
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProductionAnalytics;

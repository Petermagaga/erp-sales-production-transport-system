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
        toast.success("Analytics loaded successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.info("No analytics data found for selected filters.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to load analytics!", {
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

  // Updated Colors (softer, professional)
  const lineData = {
    labels: weekly_trends.map((t) => t.week_start),
    datasets: [
      {
        label: "Raw Material (Kg)",
        data: weekly_trends.map((t) => t.total_raw),
        borderColor: "#1E88E5",
        backgroundColor: "rgba(30,136,229,0.12)",
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: "Flour Output (Kg)",
        data: weekly_trends.map((t) => t.total_flour),
        borderColor: "#F9A825",
        backgroundColor: "rgba(249,168,37,0.15)",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  const efficiencyPieData = {
    labels: ["Efficiency (%)", "Waste (%)"],
    datasets: [
      {
        data: [totals.efficiency, totals.waste_ratio],
        backgroundColor: ["#4CAF50", "#FF6B6B"],
        hoverBackgroundColor: ["#66BB6A", "#FF7F7F"],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: shift_performance.map((s) => s.shift),
    datasets: [
      {
        label: "Efficiency (%)",
        data: shift_performance.map((s) => s.efficiency),
        backgroundColor: "rgba(76,175,80,0.85)",
        borderRadius: 6,
      },
      {
        label: "Waste (%)",
        data: shift_performance.map((s) => s.waste_ratio),
        backgroundColor: "rgba(255,167,38,0.85)",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-green-800">
        Production Analytics Dashboard
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Shift</label>
          <select
            name="shift"
            value={filters.shift}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {shifts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 text-white px-6 py-2 mt-auto rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-100">
          <p className="text-gray-500 text-sm">Total Raw (Kg)</p>
          <h3 className="text-2xl font-semibold text-green-800">
            {totals.total_raw?.toLocaleString()}
          </h3>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl shadow-md border border-yellow-100">
          <p className="text-gray-500 text-sm">Flour Output (Kg)</p>
          <h3 className="text-2xl font-semibold text-yellow-700">
            {totals.total_flour?.toLocaleString()}
          </h3>
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-md border border-green-100">
          <p className="text-gray-500 text-sm">Efficiency (%)</p>
          <h3 className="text-2xl font-semibold text-green-700">
            {totals.efficiency}%
          </h3>
        </div>

        <div className="bg-red-50 p-6 rounded-xl shadow-md border border-red-100">
          <p className="text-gray-500 text-sm">Waste (%)</p>
          <h3 className="text-2xl font-semibold text-red-600">
            {totals.waste_ratio}%
          </h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Raw vs Flour Trend
          </h3>
          <Line data={lineData} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Efficiency vs Waste
          </h3>
          <Pie data={efficiencyPieData} />
        </div>
      </div>

      {/* Shift Performance */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Shift Performance
        </h3>
        <Bar data={barData} />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProductionAnalytics;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:8000/api/transport"; // change for production

const TransportAnalytics = () => {
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    vehicle: "all",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicles/`);
      const uniqueVehicles = [...new Set(res.data.map((item) => item.vehicle))];
      setVehicles(uniqueVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("❌ Failed to load vehicles");
    }
  };

  // ✅ Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.vehicle && filters.vehicle !== "all")
        params.append("vehicle", filters.vehicle);

      const res = await axios.get(
        `${API_BASE}/records/analytics/?${params.toString()}`
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("⚠️ Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchAnalytics();
  }, []);

  // ✅ Handle filter change
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // ✅ Handle apply filters
  const handleApply = () => {
    fetchAnalytics();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          🚛 Transport Cost & Analytics
        </h1>
        <Button
          onClick={fetchAnalytics}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          🔄 Refresh
        </Button>
      </div>

      {/* 🧭 Filters */}
      <div className="grid md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Vehicle</label>
          <select
            name="vehicle"
            value={filters.vehicle}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* 📊 Summary Cards */}
      {data && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-md border-t-4 border-blue-500">
            <CardHeader>
              <CardTitle>Total Fuel Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-blue-600">
                Ksh {data.summary.total_fuel.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-green-500">
            <CardHeader>
              <CardTitle>Total Service Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">
                Ksh {data.summary.total_service.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-purple-500">
            <CardHeader>
              <CardTitle>Total Transport Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-purple-600">
                Ksh{" "}
                {(
                  data.summary.total_fuel + data.summary.total_service
                ).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 📈 Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Line Chart - Fuel Trend */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Fuel Cost Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Top Vehicles */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Top Vehicles (Fuel Cost)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.top_vehicles || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_fuel" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 📉 Total Cost Trend */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Total Cost Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                data?.daily_data?.map((d) => ({
                  ...d,
                  total: d.fuel + d.service,
                })) || []
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ⏳ Loading */}
      {loading && (
        <p className="text-gray-500 text-center animate-pulse">
          Loading analytics...
        </p>
      )}
    </div>
  );
};

export default TransportAnalytics;

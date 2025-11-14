// TransportAnalyticsPremium_v2.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:8000/api/transport"; // update for production
const GOLD = ["#101011ff", "#2b2927ff", "#030303ff"]; // theme colors for gold accents

const THEME = {
  yellow: "#FACC15",
  green: "#22C55E",
  blue: "#101011ff",
  gray: "#9CA3AF",
};


const KPI_DELTA = (current, previous) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

function formatKsh(value) {
  if (value == null) return "Ksh 0";
  return `Ksh ${Number(value).toLocaleString()}`;
}

export default function TransportAnalyticsPremiumV2() {
  const [tab, setTab] = useState("summary"); // summary | vehicle | insights
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ start_date: "", end_date: "", vehicle: "all" });
  const [loading, setLoading] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicles/`);
      // expect array of vehicle objects {id, name, plate_number, driver_name}
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast.error("❌ Failed to load vehicles");
    }
  };

  // Fetch analytics (backend filtering when vehicle param provided)
  const fetchAnalytics = async (opts = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const fd = { ...filters, ...opts };
      if (fd.start_date) params.append("start_date", fd.start_date);
      if (fd.end_date) params.append("end_date", fd.end_date);
      if (fd.vehicle && fd.vehicle !== "all") params.append("vehicle", fd.vehicle);

      const res = await axios.get(`${API_BASE}/records/analytics/?${params.toString()}`);
      console.log("✅ Analytics data:", res.data);
      console.log("📊 Daily Data:", res.data.daily_data);
      console.log("📈 Monthly Trends:", res.data.monthly_trends);
      console.log("🚗 Vehicle Totals:", res.data.vehicle_totals);
      console.log("🏆 Top Vehicles:", res.data.top_vehicles);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When vehicle selection changes we auto-fetch (backend filtering requested)
  useEffect(() => {
    // only refetch if vehicle changed from initial
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.vehicle]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleApply = () => fetchAnalytics();
  const handleReset = () => {
    setFilters({ start_date: "", end_date: "", vehicle: "all" });
    fetchAnalytics({ start_date: "", end_date: "", vehicle: "all" });
  };

  const selectedVehicle = useMemo(() => {
    if (filters.vehicle === "all") return null;
    return vehicles.find((v) => String(v.id) === String(filters.vehicle)) || null;
  }, [filters.vehicle, vehicles]);

  // KPI deltas (month-over-month) from backend monthly_trends
  const computeKpiDeltas = (monthly_trends = []) => {
    try {
      if (!monthly_trends || monthly_trends.length < 2) return {};
      const len = monthly_trends.length;
      const last = monthly_trends[len - 1];
      const prev = monthly_trends[len - 2];
      return {
        fuelDelta: KPI_DELTA(last.fuel, prev.fuel),
        serviceDelta: KPI_DELTA(last.service, prev.service),
        totalDelta: KPI_DELTA(last.total, prev.total),
      };
    } catch (e) {
      return {};
    }
  };
  const kpiDeltas = computeKpiDeltas(data?.monthly_trends || []);

  // Top vehicles chart data (map to label + total)
  const topVehiclesChartData = (data?.top_vehicles || []).map((v) => ({
    vehicle_label: v.plate_number || v.name || `Vehicle ${v.vehicle_id}`,
    total: v.total || v.fuel + v.service || 0,
  }));

  // Pie data: when vehicle selected, use vehicle_totals entry for that vehicle (backend should return vehicle_totals even when filtered)
  const pieData = useMemo(() => {
    if (!data) return [{ name: "Fuel", value: 0 }, { name: "Service", value: 0 }];
    if (selectedVehicle) {
      const vt = (data.vehicle_totals || []).find((x) => String(x.vehicle_id) === String(filters.vehicle)) || null;
      const fuel = vt ? vt.fuel : 0;
      const service = vt ? vt.service : 0;
      return [ { name: "Fuel", value: fuel }, { name: "Service", value: service } ];
    }
    return [ { name: "Fuel", value: data.summary?.total_fuel || 0 }, { name: "Service", value: data.summary?.total_service || 0 } ];
  }, [data, selectedVehicle, filters.vehicle]);

  // Helper: find vehicle totals entry
  const findVehicleTotals = (vehicleId) => {
    if (!data?.vehicle_totals) return null;
    return data.vehicle_totals.find((v) => String(v.vehicle_id) === String(vehicleId)) || null;
  };


  // Small animated KPI Card
  const KpiCard = ({ title, value, delta }) => {
    const up = delta != null && delta > 0;
    const down = delta != null && delta < 0;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-1">Period</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${up ? "bg-emerald-100 text-emerald-800" : down ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                  {delta == null ? "—" : `${delta.toFixed(1)}%`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Optional filter handler (to prevent crash if called anywhere)
const handleFilter = (key, value) => {
  console.log(`Filter changed: ${key} → ${value}`);
  setFilters((prev) => ({ ...prev, [key]: value }));
};

  // Render
  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-[#a3e635] to-[#bef264] min-h-screen text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Executive Dashboard</h1>
          <p className="text-sm text-gray-300"></p>
        </div>
        <div className="flex items-center gap-3">
        <Button onClick={() => fetchAnalytics()} className="bg-green-700 text-white px-6 py-2 mt-auto rounded-lg font-medium hover:bg-green-800 transition">
          🔄 Refresh
        </Button>
       <Button
  onClick={() => window.print()}
  className="bg-green-700 text-white px-6 py-2 mt-auto rounded-lg font-medium hover:bg-green-800 transition"
>
  🖨 Export
</Button>
</div>
</div>

{/* Tabs */}
<div className="flex items-center gap-3">
  {/* Executive Summary */}
  <button
    onClick={() => setTab("summary")}
    className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
      tab === "summary" ? "shadow-lg scale-105" : "opacity-90 hover:opacity-100"
    }`}
    style={{
      background:
        tab === "summary"
          ? "#07101A" // active: dark navy
          : "linear-gradient(90deg, #2E8B57, #D4AF37)", // inactive: green-gold gradient
      color: tab === "summary" ? "#9CA3AF" : "#0B1220", // muted gray on active, dark text on inactive
      border:
        tab === "summary"
          ? "1px solid #2E8B57"
          : "1px solid #D4AF37",
    }}
  >
    Executive Summary
  </button>

  {/* Vehicle Performance */}
  <button
    onClick={() => setTab("vehicle")}
    className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
      tab === "vehicle" ? "shadow-lg scale-105" : "opacity-90 hover:opacity-100"
    }`}
    style={{
      background:
        tab === "vehicle"
          ? "#07101A"
          : "linear-gradient(90deg, #2E8B57, #D4AF37)",
      color: tab === "vehicle" ? "#9CA3AF" : "#0B1220",
      border:
        tab === "vehicle"
          ? "1px solid #2E8B57"
          : "1px solid #D4AF37",
    }}
  >
    Vehicle Performance
  </button>

  {/* Cost Insights */}
  <button
    onClick={() => setTab("insights")}
    className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
      tab === "insights" ? "shadow-lg scale-105" : "opacity-90 hover:opacity-100"
    }`}
    style={{
      background:
        tab === "insights"
          ? "#07101A"
          : "linear-gradient(90deg, #2E8B57, #D4AF37)",
      color: tab === "insights" ? "#9CA3AF" : "#0B1220",
      border:
        tab === "insights"
          ? "1px solid #2E8B57"
          : "1px solid #D4AF37",
    }}
  >
    Cost Insights
  </button>


      </div>



<div
  className="grid md:grid-cols-4 gap-4 items-end bg-[#0B1220] p-4 rounded-xl shadow-lg border border-[#1f2937]"
  style={{
    background: `linear-gradient(145deg, ${THEME.blue}, #0B1220)`,
  }}
>
  {/* Start Date */}
  <div>
    <label
      className="block text-xs font-semibold mb-2 uppercase tracking-wide"
      style={{ color: THEME.gray }}
    >
      Start Date
    </label>
    <input
      type="date"
      name="start_date"
      value={filters.start_date}
      onChange={handleChange}
      className="w-full p-2.5 rounded-md focus:ring-2 focus:outline-none transition-all"
      style={{
        background: "#0f172a",
        color: "#f9fafb",
        border: `1px solid ${THEME.green}`,
        boxShadow: `0 0 5px ${THEME.green}30`,
      }}
    />
  </div>

  {/* End Date */}
  <div>
    <label
      className="block text-xs font-semibold mb-2 uppercase tracking-wide"
      style={{ color: THEME.gray }}
    >
      End Date
    </label>
    <input
      type="date"
      name="end_date"
      value={filters.end_date}
      onChange={handleChange}
      className="w-full p-2.5 rounded-md focus:ring-2 focus:outline-none transition-all"
      style={{
        background: "#0f172a",
        color: "#f9fafb",
        border: `1px solid ${THEME.green}`,
        boxShadow: `0 0 5px ${THEME.green}30`,
      }}
    />
  </div>

  {/* Vehicle Select */}
  <div>
    <label
      className="block text-xs font-semibold mb-2 uppercase tracking-wide"
      style={{ color: THEME.gray }}
    >
      Vehicle
    </label>
    <select
      name="vehicle"
      value={filters.vehicle}
      onChange={handleChange}
      className="w-full p-2.5 rounded-md focus:ring-2 focus:outline-none transition-all"
      style={{
        background: "#0f172a",
        color: "#f9fafb",
        border: `1px solid ${THEME.yellow}`,
        boxShadow: `0 0 5px ${THEME.yellow}25`,
      }}
    >
      <option value="all">All Vehicles</option>
      {vehicles.map((v) => (
        <option key={v.id} value={v.id}>
          {v.plate_number} — {v.name}
        </option>
      ))}
    </select>
  </div>

  {/* Optional Filter Button */}
  <div className="flex justify-end mt-2 md:mt-0">
    <button
      onClick={handleApply}
      className="px-4 py-2 rounded-md font-semibold transition-all"
      style={{
        background: THEME.green,
        color: THEME.blue,
        boxShadow: `0 0 10px ${THEME.green}40`,
      }}
    >
      Apply Filters
    </button>
  </div>
</div>

      {/* Tab content */}
      {tab === "summary" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-6">
          {/* KPI Row */}
          <div className="grid md:grid-cols-4 gap-4">
            <KpiCard title="Total Fuel Cost" value={formatKsh(data?.summary?.total_fuel || 0)} delta={kpiDeltas?.fuelDelta} />
            <KpiCard title="Total Service Cost" value={formatKsh(data?.summary?.total_service || 0)} delta={kpiDeltas?.serviceDelta} />
            <KpiCard title="Total Operating Cost" value={formatKsh(data?.summary?.total_cost || ((data?.summary?.total_fuel||0) + (data?.summary?.total_service||0)))} delta={kpiDeltas?.totalDelta} />
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">Best / Worst Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#F9E79F]
">
                  <div>
                    <span className="text-xs text-gray-400">Most Costly: </span>
                    <span className="font-semibold">{(data?.top_vehicles && data.top_vehicles[0] && `${data.top_vehicles[0].plate_number} — ${formatKsh(data.top_vehicles[0].total)}`) || "—"}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">Lowest Cost: </span>
                    <span className="font-semibold">{(data?.top_vehicles && data.top_vehicles.length && `${data.top_vehicles[data.top_vehicles.length - 1].plate_number} — ${formatKsh(data.top_vehicles[data.top_vehicles.length - 1].total)}`) || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg col-span-1">
              <CardHeader>
                <CardTitle>Fuel Cost Trend (Daily)</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.daily_data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fuel" stroke={THEME.green} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg col-span-1">
              <CardHeader>
                <CardTitle>Top Vehicles (Total Cost)</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topVehiclesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="vehicle_label" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="total" fill={THEME.green} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg col-span-1">
              <CardHeader>
                <CardTitle>Total Cost Trend (Monthly)</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.monthly_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke={THEME.green} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {tab === "vehicle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-6">
          {/* Vehicle header */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center text-black font-bold text-lg">{selectedVehicle ? (selectedVehicle.plate_number.slice(0, 2)) : "FL"}</div>
              <div>
                <div className="text-lg font-semibold">{selectedVehicle ? `${selectedVehicle.plate_number} — ${selectedVehicle.name}` : "All Vehicles"}</div>
                <div className="text-sm text-gray-300">{selectedVehicle ? selectedVehicle.driver_name : "Company fleet overview"}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => { setFilters({ ...filters, vehicle: "all" }); setTab("summary"); }} className="bg-green-700 text-white px-6 py-2 mt-auto rounded-lg font-medium hover:bg-green-800 transition">Back to Summary</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Pie: Fuel vs Service */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fuel vs Service</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GOLD[index % GOLD.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fuel & service trend */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fuel & Service Trend (Daily)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.daily_data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke={THEME.green} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="fuel" stroke={THEME.green} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="service" stroke={THEME.yellow} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* KPI mini */}
            <div className="space-y-4">
              <Card className="shadow-lg p-4">
                <div className="text-sm text-gray-300">Avg Fuel / Month</div>
                <div className="text-2xl font-semibold mt-2">{formatKsh((findVehicleTotals(filters.vehicle)?.fuel || 0) / Math.max(1, (data?.monthly_trends?.length || 1)))}</div>
              </Card>
              <Card className="shadow-lg p-4">
                <div className="text-sm text-gray-300">Avg Service / Month</div>
                <div className="text-2xl font-semibold mt-2">{formatKsh((findVehicleTotals(filters.vehicle)?.service || 0) / Math.max(1, (data?.monthly_trends?.length || 1)))}</div>
              </Card>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "insights" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Fuel Cost Comparison by Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data?.vehicle_totals || []).map((v) => ({ label: v.plate_number, fuel: v.fuel, service: v.service, total: v.total }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="label" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fuel" stackId="a" fill={THEME.green} />
                    <Bar dataKey="service" stackId="a" fill={THEME.green} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Total Cost Trend by Vehicle (Monthly)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.monthly_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fuel" stroke={THEME.green} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="service" stroke={THEME.green} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="total" stroke={THEME.green} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* additional ranking */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ranking — Vehicles by Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {(data?.top_vehicles || []).map((v, idx) => (
                  <div key={v.vehicle_id} className="p-4 rounded border border-gray-800">
                    <div className="text-xs text-gray-400">#{idx + 1}</div>
                    <div className="text-sm font-semibold mt-1">{v.plate_number}</div>
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="text-lg font-bold text-amber-300">{formatKsh(v.total)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* loading */}
      {loading && <div className="text-gray-300 text-center">Loading analytics...</div>}
    </div>
  );
}

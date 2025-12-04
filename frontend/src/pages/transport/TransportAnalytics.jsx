// Analysis.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import API from "../../api/axios"; // your axios instance
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const COLORS = ["#FFD700", "#00C49F", "#8884D8"];

const formatKsh = (value) => {
  if (value == null) return "Ksh 0";
  if (typeof value === "string") value = Number(value);
  return `Ksh ${Number(value || 0).toLocaleString("en-KE")}`;
};

const Analysis = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Filter state (vehicle "all" reserved)
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    vehicle: "all",
  });

  // local vehicles list sourced from analytics or a separate endpoint
  const [vehicles, setVehicles] = useState([]);

  // UI tab state
  const [tab, setTab] = useState("summary"); // summary | vehicle | insights

  // Selected vehicle id (string or "all")
  const selectedVehicleId = filters.vehicle;

  // Fetch vehicles (optional endpoint)
  const fetchVehicles = async () => {
    try {
      const res = await API.get("/transport/vehicles/"); // change if your endpoint differs
      setVehicles(res.data || []);
    } catch (err) {
      console.warn("Couldn't fetch vehicles list (optional).", err);
      // it's okay if this fails; we'll fall back to vehicle_totals in analytics
    }
  };

  // Fetch analytics (uses Option A params: start_date, end_date, vehicle)
  const fetchAnalytics = async (opts = {}) => {
    try {
      setLoading(true);
      const payload = { ...filters, ...opts };
      const params = new URLSearchParams();
      if (payload.start_date) params.append("start_date", payload.start_date);
      if (payload.end_date) params.append("end_date", payload.end_date);
      if (payload.vehicle && payload.vehicle !== "all")
        params.append("vehicle", payload.vehicle);

      const url = `/transport/records/analytics/?${params.toString()}`;
      const res = await API.get(url);
      setAnalytics(res.data);
      // if no separate vehicles endpoint, populate vehicles from vehicle_totals
      if ((!vehicles || vehicles.length === 0) && res.data?.vehicle_totals) {
        const derived = res.data.vehicle_totals.map((v) => ({
          id: v.vehicle_id,
          plate_number: v.plate_number,
          name: v.name || "",
        }));
        setVehicles(derived);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchVehicles();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected vehicle object for display
  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId || selectedVehicleId === "all") return null;
    return (
      vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || null
    );
  }, [selectedVehicleId, vehicles]);

  // Helper to get vehicle_totals entry by id
  const findVehicleTotals = (vid) => {
    if (!analytics?.vehicle_totals) return null;
    return (
      analytics.vehicle_totals.find(
        (x) => String(x.vehicle_id) === String(vid)
      ) || null
    );
  };

  // Pie chart data: either selected vehicle or overall summary
  const pieData = useMemo(() => {
    if (!analytics) return [];
    if (selectedVehicle) {
      const vt = findVehicleTotals(selectedVehicleId);
      return [
        { name: "Fuel", value: vt?.fuel || 0, total: vt?.fuel || 0 },
        { name: "Service", value: vt?.service || 0, total: vt?.service || 0 },
      ];
    }
    // when no vehicle selected show summary totals
    return [
      { name: "Fuel", total: analytics.summary?.total_fuel || 0 },
      { name: "Service", total: analytics.summary?.total_service || 0 },
    ];
  }, [analytics, selectedVehicle, selectedVehicleId]);

  // Best / Worst vehicles computed from vehicle_totals (Option 1)
  const bestWorst = useMemo(() => {
    if (!analytics?.vehicle_totals || analytics.vehicle_totals.length === 0)
      return { best: null, worst: null };

    // Sort descending by total
    const sorted = [...analytics.vehicle_totals].sort(
      (a, b) => (b.total || 0) - (a.total || 0)
    );
    const worst = sorted.length ? sorted[sorted.length - 1] : null;
    const best = sorted.length ? sorted[0] : null;
    return { best, worst };
  }, [analytics]);

  // UI handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    // fetch with current filters
    fetchAnalytics();
  };

  const handleReset = () => {
    setFilters({ start_date: "", end_date: "", vehicle: "all" });
    fetchAnalytics({ start_date: "", end_date: "", vehicle: "all" });
  };

  if (loading || !analytics) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center text-xl text-gray-700">
        Loading analytics...
      </div>
    );
  }

  const { summary, daily_data, monthly_trends, top_vehicles } = analytics;

  return (
    <div className="p-6 min-h-screen bg-[#0F172A] text-slate-100">


      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Unibrain Vehicles Dashboard</h1>
          <p className="text-sm text-slate-800">Executive summary & insights</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => fetchAnalytics()} className="bg-green-700 text-white px-4 py-2 rounded-md">
            🔄 Refresh
          </Button>
          <Button onClick={() => window.print()} className="bg-green-700 text-white px-4 py-2 rounded-md">
            🖨 Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setTab("summary")}
          className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
            tab === "summary"
              ? "shadow-lg scale-105 text-white"
              : "opacity-90 hover:opacity-100 text-black"
          }`}
          style={{
            background:
              tab === "summary"
                ? "#07101A"
                : "linear-gradient(90deg, #c6d6cdff, #D4AF37)",
          }}
        >
          Executive Summary
        </button>

        <button
          onClick={() => setTab("vehicle")}
          className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
            tab === "vehicle"
              ? "shadow-lg scale-105 text-white"
              : "opacity-90 hover:opacity-100 text-black"
          }`}
          style={{
            background:
              tab === "vehicle"
                ? "#07101A"
                : "linear-gradient(90deg, #2E8B57, #D4AF37)",
          }}
        >
          Vehicle Performance
        </button>

        <button
          onClick={() => setTab("insights")}
          className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
            tab === "insights"
              ? "shadow-lg scale-105 text-white"
              : "opacity-90 hover:opacity-100 text-black"
          }`}
          style={{
            background:
              tab === "insights"
                ? "#07101A"
                : "linear-gradient(90deg, #2E8B57, #D4AF37)",
          }}
        >
          Cost Insights
        </button>
      </div>

      {/* Filters (top area) */}
      <div className="grid md:grid-cols-4 gap-4 items-end bg-[#0B1220] p-4 rounded-xl shadow-lg border border-[#1f2937] mb-6">
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-300 uppercase">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="w-full p-2.5 rounded-md focus:ring-2"
            style={{
              background: "#0f172a",
              color: "#f9fafb",
              border: `1px solid #22C55E`,
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-300 uppercase">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="w-full p-2.5 rounded-md focus:ring-2"
            style={{
              background: "#0f172a",
              color: "#f9fafb",
              border: `1px solid #22C55E`,
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-300 uppercase">
            Vehicle
          </label>
          <select
            name="vehicle"
            value={filters.vehicle}
            onChange={handleFilterChange}
            className="w-full p-2.5 rounded-md"
            style={{
              background: "#0f172a",
              color: "#f9fafb",
              border: `1px solid #FFD700`,
            }}
          >
            <option value="all">All Vehicles</option>
            {/* prefer vehicles list; fallback to analytics.vehicle_totals */}
            {(vehicles.length ? vehicles : analytics.vehicle_totals || []).map(
              (v) => {
                // when mapping from vehicle_totals the keys differ
                const id = v.id ?? v.vehicle_id;
                const plate = v.plate_number ?? v.plate;
                const name = v.name ?? v.title ?? "";
                return (
                  <option key={id} value={id}>
                    {plate} {name ? `— ${name}` : ""}
                  </option>
                );
              }
            )}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md font-semibold"
            style={{ background: "#22C55E", color: "#07101A" }}
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md font-semibold bg-slate-800 text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Fuel Cost" value={summary?.total_fuel} />
        <SummaryCard title="Total Service Cost" value={summary?.total_service} />
        <SummaryCard
          title="Total Operating Cost"
          value={summary?.total_cost || (summary?.total_fuel || 0) + (summary?.total_service || 0)}
        />
        <Card className="rounded-xl">
          <CardContent>
            <div className="text-sm text-slate-500 font-semibold mb-2">
              Best / Worst Vehicles
            </div>

            <div className="text-sm">
              <div>
                <span className="text-xs text-slate-600">Most Costly: </span>
                <span className="font-semibold">
                  {bestWorst.best
                    ? `${bestWorst.best.plate_number} — ${formatKsh(bestWorst.best.total)}`
                    : "—"}
                </span>
              </div>

              <div className="mt-2">
                <span className="text-xs text-slate-600">Lowest Cost: </span>
                <span className="font-semibold">
                  {bestWorst.worst
                    ? `${bestWorst.worst.plate_number} — ${formatKsh(bestWorst.worst.total)}`
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab content */}
      {tab === "summary" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Daily Trend */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">Daily Fuel & Service Trend</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="fuel" stroke="#FFD700" />
                    <Line type="monotone" dataKey="service" stroke="#00C49F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly & Top Vehicles */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-3">Monthly Cost Trend</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly_trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#FFD700" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-3">Top Performing Vehicles</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top_vehicles || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="plate_number" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884D8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pie */}
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">
                {selectedVehicle ? "Selected Vehicle Cost Breakdown" : "Vehicle Cost Distribution"}
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="total"
                      nameKey="name"
                      label
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "vehicle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Vehicle details & focused charts */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                {selectedVehicle
                  ? `${selectedVehicle.plate_number} — ${selectedVehicle.name}`
                  : "All Vehicles"}
              </div>
              <div className="text-sm text-slate-600">{selectedVehicle ? "Single vehicle analysis" : "Select a vehicle to analyze"}</div>
            </div>

            <div>
              <Button onClick={() => { setFilters((p) => ({ ...p, vehicle: "all" })); setTab("summary"); }} className="bg-slate-800 text-white px-4 py-2 rounded-md">
                Back to Summary
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent>
                <h4 className="font-semibold text-sm mb-2">Fuel vs Service</h4>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={pieData.map(p => ({ name: p.name, value: p.total }))} cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4 className="font-semibold text-sm mb-2">Fuel & Service Trend (Daily)</h4>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={daily_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="fuel" stroke="#22C55E" dot={false} />
                      <Line type="monotone" dataKey="service" stroke="#FFD700" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4 className="font-semibold text-sm mb-2">Avg / Month</h4>
                <div className="text-2xl font-bold">{formatKsh((findVehicleTotals(selectedVehicleId)?.fuel || 0) / Math.max(1, (monthly_trends?.length || 1)))}</div>
                <div className="text-sm text-slate-600 mt-1">Avg fuel / month</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {tab === "insights" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-3">Fuel Cost Comparison by Vehicle</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(analytics.vehicle_totals || []).map(v => ({ label: v.plate_number, fuel: v.fuel, service: v.service, total: v.total }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="fuel" stackId="a" fill="#22C55E" />
                      <Bar dataKey="service" stackId="a" fill="#FFD700" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-3">Ranking — Vehicles by Total Cost</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {(analytics.top_vehicles || []).map((v, idx) => (
                    <div key={v.vehicle_id} className="p-3 rounded border border-slate-700 bg-white/5">
                      <div className="text-xs text-slate-400">#{idx + 1}</div>
                      <div className="text-sm font-semibold">{v.plate_number}</div>
                      <div className="text-xs text-slate-400 mt-1">Total</div>
                      <div className="text-lg font-bold">{formatKsh(v.total)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* Small helpers / components */

const SummaryCard = ({ title, value }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-xl">
        <CardContent>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-2xl font-bold mt-2 text-amber-400">{formatKsh(value)}</div>
          <div className="text-xs text-slate-400 mt-1">Period</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// helper used inside vehicle tab (defined after component to keep linter happy)
function findVehicleTotals(analyticsVehicleId) {
  // note: this function relies on `analytics` in closure — we will avoid using it directly here.
  // The component uses the inline helper `findVehicleTotals(selectedVehicleId)` via a closure above.
  return null;
}

export default Analysis;

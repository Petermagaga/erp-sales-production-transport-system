import React, { useEffect, useState } from "react";
import { getExecutiveDashboard } from "../../services/executiveService";

import KpiCards from "./KpiCards";
import RevenueTrendChart from "./RevenueTrendChart";
import CostBreakdownChart from "./CostBreakdownChart";

const ExecutiveDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutiveDashboard()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600 animate-pulse">Loading executive dashboard...</p>
      </div>
    );
  if (!data)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">No data available</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-green-800">Executive Dashboard</h1>
        <p className="text-lg text-gray-600 mt-1">
          Company: <span className="font-semibold">{data.company_name || "UNIBRAIN"}</span>
        </p>
      </header>

      {/* KPI Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Key Metrics</h2>
        <KpiCards kpis={data.kpis} colors={{ primary: "#28a745", secondary: "#ffc107", accent: "#ffffff" }} />
      </section>

      {/* Revenue Trend Chart */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-700">Revenue Trend</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <RevenueTrendChart data={data.revenue_trend} color="#28a745" />
        </div>
      </section>

      {/* Cost Breakdown Chart */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gold-600">Cost Breakdown</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <CostBreakdownChart data={data.cost_breakdown} colors={["#28a745", "#ffc107", "#ffd700", "#ffffff"]} />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 mt-16">
        <p>© {new Date().getFullYear()} UNIBRAIN Executive Dashboard</p>
      </footer>
    </div>
  );
};

export default ExecutiveDashboard;

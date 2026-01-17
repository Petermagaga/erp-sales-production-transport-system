import { useEffect, useState } from "react";
import { getMillingDashboard } from "../../api/millingApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MillingDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getMillingDashboard();
        setData(res);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const { summary, daily_efficiency, monthly_trends, waste_ratio_chart, shift_ranking } =
    data;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-green-700">
        📊 Malkia Dashboard
      </h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard title="Total Maize (kg)" value={summary.total_maize} />
        <KpiCard title="Total Output (kg)" value={summary.total_output} />
        <KpiCard title="Avg Efficiency (%)" value={summary.avg_efficiency} />
        <KpiCard title="Total Waste (kg)" value={summary.total_waste} />
        <KpiCard title="Waste Ratio (%)" value={summary.waste_ratio} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="📈 Daily Efficiency">
          <LineChartBlock data={daily_efficiency} dataKey="efficiency" />
        </ChartCard>

        <ChartCard title="📅 Monthly Efficiency">
          <LineChartBlock data={monthly_trends} dataKey="avg_efficiency" />
        </ChartCard>

        <ChartCard title="♻️ Waste Ratio Trend">
          <LineChartBlock data={waste_ratio_chart} dataKey="waste_ratio" />
        </ChartCard>
      </div>

      {/* ================= SHIFT RANKING ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RankingCard title="🏆 Best Shift" data={shift_ranking.best_shift} />
        <RankingCard title="⚠️ Worst Shift" data={shift_ranking.worst_shift} />
      </div>
    </div>
  );
};

export default MillingDashboard;


const KpiCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-4 border">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-green-700">
      {value ?? "-"}
    </p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow p-4 border">
    <h3 className="font-semibold mb-3 text-gray-700">{title}</h3>
    <div className="h-72">{children}</div>
  </div>
);

const LineChartBlock = ({ data, dataKey }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke="#16a34a"
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
);

const RankingCard = ({ title, data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow p-4 border text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <p><b>Shift:</b> {data.shift}</p>
      <p><b>Avg Efficiency:</b> {data.avg_efficiency?.toFixed(2)}%</p>
      <p><b>Total Maize:</b> {data.total_maize}</p>
      <p><b>Total Waste:</b> {data.total_waste}</p>
    </div>
  );
};

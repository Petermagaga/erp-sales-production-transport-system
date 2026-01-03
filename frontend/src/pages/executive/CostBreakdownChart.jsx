import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CostBreakdownChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CostBreakdownChart;

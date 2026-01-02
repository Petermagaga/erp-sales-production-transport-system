import React, { useEffect, useState } from "react";
import { getExecutiveDashboard } from "../../services/executiveService";

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

  if (loading) return <p>Loading executive dashboard...</p>;
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h1>Executive Dashboard</h1>
      <p>Company: {data.company_name || "UNIBRAIN"}</p>

      <section>
        <h2>Key Metrics</h2>
        <p>Revenue: {data.kpis.revenue}</p>
        <p>Transport Cost: {data.kpis.transport_cost}</p>
        <p>Profit: {data.kpis.profit}</p>
        <p>Inventory Waste: {data.kpis.inventory_waste}</p>
      </section>
    </div>
  );
};

export default ExecutiveDashboard;

import React from "react";

const KpiCards = ({ kpis }) => {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div>Revenue: {kpis.revenue}</div>
      <div>Profit: {kpis.profit}</div>
      <div>Transport Cost: {kpis.transport_cost}</div>
      <div>Inventory Waste: {kpis.inventory_waste}</div>
    </div>
  );
};

export default KpiCards;

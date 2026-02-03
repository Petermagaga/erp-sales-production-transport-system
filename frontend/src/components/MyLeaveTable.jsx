// src/components/AnalyticsFilterBar.jsx
import React from "react";

const AnalyticsFilterBar = ({ filters, onChange, onApply }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        marginBottom: "25px",
        flexWrap: "wrap",
        background: "#f9f9f9",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Date Range */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label>📅 From:</label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={onChange}
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ddd" }}
        />
        <label>To:</label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={onChange}
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ddd" }}
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label>🏷️ Category: </label>
        <select
          name="category"
          value={filters.category}
          onChange={onChange}
          style={{
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            minWidth: "150px",
          }}
        >
          <option value="">All</option>
          <option value="raw">Raw Material</option>
          <option value="finished">Finished Product</option>
          <option value="byproduct">By-product</option>
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={onApply}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default AnalyticsFilterBar;

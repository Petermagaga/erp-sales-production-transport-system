// pages/MyLeaveTable.jsx (or components/MyLeaveTable.jsx)
import { useState } from "react";
import AnalyticsFilterBar from "../components/AnalyticsFilterBar";

export default function MyLeaveTable() {
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    console.log("Applying filters:", filters);
    // later: refetch leave requests here
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <AnalyticsFilterBar
        filters={filters}
        onChange={handleChange}
        onApply={applyFilters}
      />

      {/* table goes here */}
    </div>
  );
}

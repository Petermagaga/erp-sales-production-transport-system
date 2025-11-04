// src/pages/AddWarehouse.jsx
import React, { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddWarehouse = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    warehouse: "",
    material: "",
    opening_balance: "",
    raw_in: "",
    shift_1: "",
    shift_2: "",
    shift_3: "",
    closing_balance: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("dailyinventory/", form);
      alert("✅ Warehouse record added successfully!");
      navigate("/warehouseanalytics"); // go back to dashboard
    } catch (error) {
      console.error("Error adding warehouse record:", error);
      alert("❌ Failed to add record");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          ➕ Add New Warehouse Record
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            Date:
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </label>

          <label className="flex flex-col">
            Warehouse:
            <input
              type="text"
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </label>

          <label className="flex flex-col">
            Material:
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </label>

          <label className="flex flex-col">
            Opening Balance:
            <input
              type="number"
              name="opening_balance"
              value={form.opening_balance}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            Raw In:
            <input
              type="number"
              name="raw_in"
              value={form.raw_in}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            Shift 1:
            <input
              type="number"
              name="shift_1"
              value={form.shift_1}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            Shift 2:
            <input
              type="number"
              name="shift_2"
              value={form.shift_2}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            Shift 3:
            <input
              type="number"
              name="shift_3"
              value={form.shift_3}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col col-span-2">
            Closing Balance:
            <input
              type="number"
              name="closing_balance"
              value={form.closing_balance}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </label>

          <div className="col-span-2 flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate("/warehouseanalytics")}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWarehouse;

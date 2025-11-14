import React, { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddWarehouse = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
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
      navigate("/warehouseanalytics");
    } catch (error) {
      console.error("Error adding warehouse record:", error);
      alert("❌ Failed to add record");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 animate-fadeIn border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            ➕ Add Warehouse Record
          </h2>

          <button
            onClick={() => navigate("/warehouseanalytics")}
            className="text-slate-500 hover:text-slate-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* Date */}
          <label className="flex flex-col text-slate-700 font-medium">
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="mt-1 border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </label>

          {/* Material */}
          <label className="flex flex-col text-slate-700 font-medium">
            Material
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              className="mt-1 border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </label>

          {/* Number Inputs */}
          {[
            "opening_balance",
            "raw_in",
            "shift_1",
            "shift_2",
            "shift_3",
          ].map((field) => (
            <label key={field} className="flex flex-col text-slate-700 font-medium">
              {field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              <input
                type="number"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="mt-1 border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          ))}

          {/* Closing Balance */}
          <label className="flex flex-col col-span-2 text-slate-700 font-medium">
            Closing Balance
            <input
              type="number"
              name="closing_balance"
              value={form.closing_balance}
              onChange={handleChange}
              className="mt-1 border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate("/warehouseanalytics")}
              className="px-5 py-2 rounded-lg bg-slate-400 text-white hover:bg-slate-500 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
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

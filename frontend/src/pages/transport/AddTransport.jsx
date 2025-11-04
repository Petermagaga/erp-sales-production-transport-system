import React, { useState, useEffect } from "react";
import { getVehicles, addTransportRecord } from "../../api/transportApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddTransport = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: "",
    date: "",
    fuel_cost: "",
    service_cost: "",
    mechanical_issues: "",
  });

  // ✅ Fetch vehicles for the dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles();
        setVehicles(res);
      } catch (error) {
        toast.error("Failed to fetch vehicles");
      }
    };
    fetchVehicles();
  }, []);

  // ✅ Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Calculate total dynamically
  const fuel = parseFloat(form.fuel_cost) || 0;
  const service = parseFloat(form.service_cost) || 0;
  const total = fuel + service;

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addTransportRecord(form);
      toast.success("✅ Transport record saved successfully!");
      navigate("/transport/list");
    } catch (error) {
      toast.error("Failed to save transport record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-white rounded-xl">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-emerald-100">
        {/* 🧭 Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-700">
            ➕ Add Transport Record
          </h2>
          <button
            onClick={() => navigate("/transport/list")}
            className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-200 transition"
          >
            ← Back
          </button>
        </div>

        {/* 🧾 Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle */}
          <div>
            <label className="block text-gray-600 font-semibold mb-2">
              Vehicle
            </label>
            <select
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name || v.registration_number}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-600 font-semibold mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Fuel Cost */}
          <div>
            <label className="block text-gray-600 font-semibold mb-2">
              Fuel Cost (Ksh)
            </label>
            <input
              type="number"
              name="fuel_cost"
              value={form.fuel_cost}
              onChange={handleChange}
              placeholder="Enter fuel cost"
              required
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Service Cost */}
          <div>
            <label className="block text-gray-600 font-semibold mb-2">
              Service Cost (Ksh)
            </label>
            <input
              type="number"
              name="service_cost"
              value={form.service_cost}
              onChange={handleChange}
              placeholder="Enter service cost"
              required
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Live Total Display */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mt-2 flex justify-between">
            <span className="text-emerald-700 font-medium">💰 Total Cost:</span>
            <span className="text-emerald-800 font-bold">
              Ksh {total.toFixed(2)}
            </span>
          </div>

          {/* Mechanical Issues */}
          <div>
            <label className="block text-gray-600 font-semibold mb-2">
              Mechanical Issues
            </label>
            <textarea
              name="mechanical_issues"
              value={form.mechanical_issues}
              onChange={handleChange}
              placeholder="Describe any mechanical issues..."
              rows="3"
              className="w-full border-gray-300 rounded-xl p-3 focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/transport/list")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-white transition ${
                loading
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransport;

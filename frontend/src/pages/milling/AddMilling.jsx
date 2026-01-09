import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMillingBatch } from "../../api/millingApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddMilling = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    shift: "",
    batch_no: "",
    expiry_date: "",
    premix_kg: "",
    maize_milled_kg: "",
    maize_germ_kg: "",
    maize_chaffs_kg: "",
    waste_kg: "",
    bales: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        shift: form.shift.toLowerCase(),
        premix_kg: parseFloat(form.premix_kg || 0),
        maize_milled_kg: parseFloat(form.maize_milled_kg || 0),
        maize_germ_kg: parseFloat(form.maize_germ_kg || 0),
        maize_chaffs_kg: parseFloat(form.maize_chaffs_kg || 0),
        waste_kg: parseFloat(form.waste_kg || 0),
        bales: parseInt(form.bales || 0),
      };

      await createMillingBatch(payload);

      toast.success("✅ Milling batch saved successfully!");
      setTimeout(() => navigate("/milling"), 1500);
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to save milling batch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">
            ➕ Add Milling Batch
          </h2>

          <button
            onClick={() => navigate("/milling")}
            className="text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* BASIC INFO */}
          <section className="bg-green-50 rounded-lg p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Batch Information
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="input"
              />

              <select
                name="shift"
                value={form.shift}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>

              <input
                type="text"
                name="batch_no"
                placeholder="Batch Number"
                value={form.batch_no}
                onChange={handleChange}
                required
                className="input"
              />

              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </section>

          {/* RAW MATERIALS */}
          <section className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Raw Materials
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="premix_kg"
                placeholder="Premix (kg)"
                value={form.premix_kg}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="maize_milled_kg"
                placeholder="Maize Milled (kg)"
                value={form.maize_milled_kg}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          {/* OUTPUT */}
          <section className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Output & Waste
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="maize_germ_kg"
                placeholder="Maize Germ (kg)"
                value={form.maize_germ_kg}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="maize_chaffs_kg"
                placeholder="Maize Chaffs (kg)"
                value={form.maize_chaffs_kg}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="waste_kg"
                placeholder="Waste (kg)"
                value={form.waste_kg}
                onChange={handleChange}
                className="input"
              />

              <input
                type="number"
                name="bales"
                placeholder="Bales"
                value={form.bales}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 text-white rounded-lg font-semibold ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 transition"
              }`}
            >
              {loading ? "Saving..." : "💾 Save Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMilling;

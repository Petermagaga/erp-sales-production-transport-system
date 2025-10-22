import React, { useState, useEffect } from "react";
import { getProductionById, updateProduction } from "../../api/productionApi";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProduction = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState({
    date: "",
    shift: "",
    maize_kg: "",
    soya_kg: "",
    sugar_kg: "",
    sorghum_kg: "",
    premix_kg: "",
    supervisor: "",
  });

  const [flourData, setFlourData] = useState({
    date: "",
    shift: "",
    product_name: "NACONEK CSB 25KG",
    total_bags: "",
    spillage_kg: "",
    germ_kg: "",
    chaff_kg: "",
    waste_kg: "",
    supervisor: "",
  });

  useEffect(() => {
    fetchProduction();
  }, []);

  const fetchProduction = async () => {
    try {

      const { raw, flour } = await getProductionById(id);
      setRawData({
        date: data.date || "",
        shift: data.shift || "",
        maize_kg: data.maize || "",
        soya_kg: data.soya || "",
        sugar_kg: data.sugar || "",
        sorghum_kg: data.sorghum || "",
        premix_kg: data.premix || "",
        supervisor: data.supervisor || "",
      });

      setFlourData({
        date: data.date || "",
        shift: data.shift || "",
        product_name: data.product_name || "NACONEK CSB 25KG",
        total_bags: data.total_bags || "",
        spillage_kg: data.flour_spillage || "",
        germ_kg: data.maize_germ || "",
        chaff_kg: data.maize_chaff || "",
        waste_kg: data.sorghum_waste || "",
        supervisor: data.supervisor || "",
      });
    } catch (error) {
      console.error("Error fetching production:", error);
      toast.error("⚠️ Failed to load production record.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleRawChange = (e) => {
    setRawData({ ...rawData, [e.target.name]: e.target.value });
  };

  const handleFlourChange = (e) => {
    setFlourData({ ...flourData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        raw: {
          ...rawData,
          shift: rawData.shift.toLowerCase(),
          maize_kg: parseFloat(rawData.maize_kg || 0),
          soya_kg: parseFloat(rawData.soya_kg || 0),
          sugar_kg: parseFloat(rawData.sugar_kg || 0),
          sorghum_kg: parseFloat(rawData.sorghum_kg || 0),
          premix_kg: parseFloat(rawData.premix_kg || 0),
        },
        flour: {
          ...flourData,
          shift: flourData.shift.toLowerCase(),
          total_bags: parseInt(flourData.total_bags || 0),
          spillage_kg: parseFloat(flourData.spillage_kg || 0),
          germ_kg: parseFloat(flourData.germ_kg || 0),
          chaff_kg: parseFloat(flourData.chaff_kg || 0),
          waste_kg: parseFloat(flourData.waste_kg || 0),
        },
      };

      await updateProduction(id, payload.raw, payload.flour);

      toast.success("✅ Production record updated successfully!", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
      });

      setTimeout(() => navigate("/production"), 1800);
    } catch (error) {
      console.error("Error updating production:", error);
      toast.error("❌ Failed to update record. Try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Edit Production Record
          </h2>
          <button
            onClick={() => navigate("/production")}
            className="text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded hover:bg-gray-200 transition"
          >
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* RAW MATERIALS SECTION */}
          <section className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Raw Material Input
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="date"
                name="date"
                value={rawData.date}
                onChange={handleRawChange}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />

              <select
                name="shift"
                value={rawData.shift}
                onChange={handleRawChange}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>

              <input
                type="number"
                name="maize_kg"
                placeholder="Maize (kg)"
                value={rawData.maize_kg}
                onChange={handleRawChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="soya_kg"
                placeholder="Soya (kg)"
                value={rawData.soya_kg}
                onChange={handleRawChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="sugar_kg"
                placeholder="Sugar (kg)"
                value={rawData.sugar_kg}
                onChange={handleRawChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="sorghum_kg"
                placeholder="Sorghum (kg)"
                value={rawData.sorghum_kg}
                onChange={handleRawChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="premix_kg"
                placeholder="Premix (kg)"
                value={rawData.premix_kg}
                onChange={handleRawChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </section>

          {/* FLOUR OUTPUT SECTION */}
          <section className="bg-green-50 rounded-lg p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Flour Output
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="date"
                name="date"
                value={flourData.date}
                onChange={handleFlourChange}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />

              <select
                name="shift"
                value={flourData.shift}
                onChange={handleFlourChange}
                required
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>

              <input
                type="number"
                name="total_bags"
                placeholder="Total Bags"
                value={flourData.total_bags}
                onChange={handleFlourChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />
              <input
                type="number"
                name="spillage_kg"
                placeholder="Spillage (kg)"
                value={flourData.spillage_kg}
                onChange={handleFlourChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />
              <input
                type="number"
                name="germ_kg"
                placeholder="Germ (kg)"
                value={flourData.germ_kg}
                onChange={handleFlourChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />
              <input
                type="number"
                name="chaff_kg"
                placeholder="Chaff (kg)"
                value={flourData.chaff_kg}
                onChange={handleFlourChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />
              <input
                type="number"
                name="waste_kg"
                placeholder="Waste (kg)"
                value={flourData.waste_kg}
                onChange={handleFlourChange}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              />
            </div>
          </section>

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
              {loading ? "Updating..." : "💾 Update Production"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduction;

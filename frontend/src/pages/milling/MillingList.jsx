import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getMillingBatches } from "../../api/millingApi";

const MillingList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getMillingBatches();
        setBatches(data);
      } catch (error) {
        console.error("Failed to load milling batches", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-gray-500 text-center animate-pulse">
        Loading milling data...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          🌽 Milling Production Dashboard
        </h1>

        <button
          onClick={() => navigate("/milling/add")}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.03]"
        >
          + Add Batch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-3">Date</th>
              <th className="p-3">Shift</th>
              <th className="p-3">Premix Used (kg)</th>
              <th className="p-3">Maize Milled (kg)</th>
              <th className="p-3">Maize Germ (kg)</th>
              <th className="p-3">Maize Chaffs (kg)</th>
              <th className="p-3">Waste (kg)</th>
              <th className="p-3">Bales</th>
              <th className="p-3">Packed Product (kg)</th>
              <th className="p-3">Batch No</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {batches.map((b) => {
              const packedKg = b.bales * 25;

              return (
                <tr
                  key={b.id}
                  className="hover:bg-green-50 transition"
                >
                  <td className="p-2 border">{b.date}</td>
                  <td className="p-2 border capitalize">{b.shift}</td>

                  <td className="p-2 border">{b.premix_kg}</td>
                  <td className="p-2 border font-medium">
                    {b.maize_milled_kg}
                  </td>

                  <td className="p-2 border text-yellow-700">
                    {b.maize_germ_kg}
                  </td>

                  <td className="p-2 border text-yellow-700">
                    {b.maize_chaffs_kg}
                  </td>

                  <td className="p-2 border text-red-600">
                    {b.waste_kg}
                  </td>

                  <td className="p-2 border font-semibold">
                    {b.bales}
                  </td>

                  <td className="p-2 border text-green-700 font-semibold">
                    {packedKg}
                  </td>

                  <td className="p-2 border font-mono text-xs">
                    {b.batch_no}
                  </td>

                  <td className="p-2 border">
                    {b.expiry_date}
                  </td>

                  <td className="p-2 border">
                    <button
                      onClick={() =>
                        navigate(`/milling/edit/${b.id}`)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {batches.length === 0 && (
          <div className="text-center py-6 text-gray-500 italic">
            No milling batches found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MillingList;

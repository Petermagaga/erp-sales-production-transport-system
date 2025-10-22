import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductions } from "../../api/productionApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductionList = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const data = await getProductions();
        setProductions(data);
      } catch (err) {
        console.error("Error fetching productions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductions();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-gray-600 text-center animate-pulse">
        Loading production data...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          🏭 Production Summary
        </h1>
        <button
          onClick={() => navigate("/production/add")}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.03]"
        >
          + Add Production
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Daily Production Data
        </h2>

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border-collapse text-sm text-center">
            <thead>
              <tr className="bg-green-700 text-white">
                <th rowSpan="2" className="p-3 rounded-tl-xl">
                  Date
                </th>
                <th rowSpan="2" className="p-3">
                  Shift
                </th>
                <th colSpan="6" className="p-3 bg-green-600/80">
                  Raw Materials (kgs)
                </th>
                <th rowSpan="2" className="p-3 bg-green-700/90">
                  Total Raw (kg)
                </th>
                <th colSpan="1" className="p-3 bg-yellow-600/80">
                  Flour Output
                </th>
                <th colSpan="4" className="p-3 bg-yellow-500/70">
                  By-Products (kgs)
                </th>
                <th rowSpan="2" className="p-3">
                  Efficiency (%)
                </th>
                <th rowSpan="2" className="p-3 rounded-tr-xl">
                  Actions
                </th>
              </tr>

              <tr className="bg-green-50 text-gray-700 font-semibold">
                <th className="p-2 border">Premix</th>
                <th className="p-2 border">Maize</th>
                <th className="p-2 border">Soya</th>
                <th className="p-2 border">Sugar</th>
                <th className="p-2 border">Sorghum</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">CSB (25kg Bags)</th>
                <th className="p-2 border">Spillage</th>
                <th className="p-2 border">Maize Germ</th>
                <th className="p-2 border">Chaff</th>
                <th className="p-2 border">Sorghum Waste</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {productions.map((p, index) => (
                <tr
                  key={index}
                  className="hover:bg-green-50 transition-colors duration-200"
                >
                  <td className="p-2 border">{p.date}</td>
                  <td className="p-2 border">{p.shift}</td>
                  <td className="p-2 border">{p.premix}</td>
                  <td className="p-2 border">{p.maize}</td>
                  <td className="p-2 border">{p.soya}</td>
                  <td className="p-2 border">{p.sugar}</td>
                  <td className="p-2 border">{p.sorghum}</td>
                  <td className="p-2 border font-semibold text-gray-800">
                    {p.total_raw}
                  </td>
                  <td className="p-2 border text-yellow-700 font-medium">
                    {p.flour_output}
                  </td>
                  <td className="p-2 border text-red-500">{p.flour_spillage}</td>
                  <td className="p-2 border text-yellow-800">{p.maize_germ}</td>
                  <td className="p-2 border text-yellow-800">{p.maize_chaff}</td>
                  <td className="p-2 border text-yellow-800">
                    {p.sorghum_waste}
                  </td>
                  <td className="p-2 border font-semibold text-green-700">
                    {p.efficiency ? `${p.efficiency}%` : "-"}
                  </td>

                  {/* 🟢 Edit Button */}
                  <td className="p-2 border">
                    <button
                      onClick={() => navigate(`/production/edit/${record.flour_id}`)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productions.length === 0 && (
          <div className="text-center py-8 text-gray-500 italic">
            No production records available.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionList;

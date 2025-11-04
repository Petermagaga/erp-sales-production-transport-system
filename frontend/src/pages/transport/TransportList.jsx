import React, { useEffect, useState } from "react";
import { getTransportRecords } from "../../api/transportApi";
import { useNavigate } from "react-router-dom";

const TransportList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await getTransportRecords();
      setRecords(data);
    } catch (err) {
      console.error("Error loading transport records", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fff9] to-[#fdfdf5] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#009540] flex items-center gap-2">
          🚚 Transport Records
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg shadow hover:bg-gray-300 transition-all hover:scale-105"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate("/transport/add")}
            className="bg-[#FFD200] text-[#009540] font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#ffcc00] transition-all hover:scale-[1.05]"
          >
            + Add Transport
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500 animate-pulse">
            Loading transport records...
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white shadow-md rounded-xl p-10 text-center text-gray-500">
          <p>No transport records found. Try adding one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-[#009540]/20">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-[#009540]/10 text-[#009540] uppercase">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle</th>
                <th className="py-3 px-4 text-left font-semibold">Fuel (Ksh)</th>
                <th className="py-3 px-4 text-left font-semibold">Service</th>
                <th className="py-3 px-4 text-left font-semibold">Total</th>
                <th className="py-3 px-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => (
                <tr
                  key={rec.id}
                  className={`border-t hover:bg-[#009540]/5 transition-all ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4">{rec.date}</td>
                  <td className="py-3 px-4">{rec.vehicle_name || rec.vehicle_id}</td>
                  <td className="py-3 px-4">{rec.fuel_cost}</td>
                  <td className="py-3 px-4">{rec.service_cost}</td>
                  <td className="py-3 px-4 font-semibold text-[#009540]">
                    {rec.total_cost}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => navigate(`/transport/edit/${rec.id}`)}
                      className="bg-[#009540] hover:bg-[#007f35] text-white px-4 py-1 rounded-md shadow transition-all hover:scale-105"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransportList;

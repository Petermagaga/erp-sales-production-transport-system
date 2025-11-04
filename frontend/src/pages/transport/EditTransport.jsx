import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTransportRecordById,
  updateTransportRecord,
  getVehicles,
} from "../../api/transportApi";
import { toast } from "react-toastify";

const EditTransport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState({
    date: "",
    vehicle_id: "",
    fuel_cost: "",
    service_cost: "",
    total_cost: 0,
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
    loadVehicles();
  }, []);

  // ✅ Fetch record details
  const loadRecord = async () => {
    try {
      const data = await getTransportRecordById(id);
      setRecord({
        date: data.date,
        vehicle_id: data.vehicle_id,
        fuel_cost: data.fuel_cost,
        service_cost: data.service_cost,
        total_cost: parseFloat(data.fuel_cost) + parseFloat(data.service_cost),
      });
    } catch (err) {
      toast.error("Failed to load record");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch available vehicles
  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      toast.error("Failed to load vehicles");
    }
  };

  // ✅ Update form field and recalculate total
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedRecord = { ...record, [name]: value };

    // Auto calculate total
    const fuel = parseFloat(updatedRecord.fuel_cost) || 0;
    const service = parseFloat(updatedRecord.service_cost) || 0;
    updatedRecord.total_cost = fuel + service;

    setRecord(updatedRecord);
  };

  // ✅ Submit updated record
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTransportRecord(id, record);
      toast.success("✅ Transport record updated successfully!");
      navigate("/transport/list");
    } catch (err) {
      toast.error("Failed to update record");
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading record...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          ✏️ Edit Transport Record
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Field */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={record.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Vehicle Field */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Vehicle
            </label>
            <select
              name="vehicle_id"
              value={record.vehicle_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name || v.registration_number}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Cost */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Fuel Cost (Ksh)
            </label>
            <input
              type="number"
              name="fuel_cost"
              value={record.fuel_cost}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Service Cost */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Service Cost (Ksh)
            </label>
            <input
              type="number"
              name="service_cost"
              value={record.service_cost}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* ✅ Auto Total Cost */}
          <div className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-200 mt-3">
            <span className="text-gray-600 font-medium">Total Cost (Auto):</span>
            <span className="text-emerald-700 font-semibold text-lg">
              Ksh {record.total_cost.toFixed(2)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-5">
            <button
              type="button"
              onClick={() => navigate("/transport/list")}
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-400 transition-all"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2 rounded-xl hover:scale-[1.03] shadow-md transition-all"
            >
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransport;

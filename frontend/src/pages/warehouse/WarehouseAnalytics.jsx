import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

const WarehouseAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("warehouseanalytics/dashboard/");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error loading analytics", err);
      }
    };
    fetchAnalytics();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await API.get("dailyinventory/");
      setInventory(res.data);
    } catch (err) {
      console.error("Error loading inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`dailyinventory/${id}/`);
      alert("Record deleted successfully ✅");
      fetchInventory();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting record ❌");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put(`dailyinventory/${editItem.id}/`, editItem);
      alert("Inventory updated successfully ✅");
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      console.error("Update failed", err);
      alert("Error updating record ❌");
    }
  };

  const handleChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Warehouse Analytics Dashboard
        </h2>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Production Overview
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="warehouse__categories" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip />

            <Bar dataKey="total_raw_in" fill="#1E88E5" name="Total Raw In" />
            <Bar dataKey="total_output" fill="#4CAF50" name="Total Output" />
            <Bar dataKey="total_waste" fill="#FF6B6B" name="Total Waste" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Records */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Inventory Records
          </h3>

          <div>
            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>

            <button
              onClick={() => navigate("/addwarehouse")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-3"
            >
              ➕ Add Warehouse Record
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "Date",
                    "Warehouse",
                    "Material",
                    "Opening",
                    "Raw In",
                    "Shift 1",
                    "Shift 2",
                    "Shift 3",
                    "Closing",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border px-4 py-2 text-left text-gray-700 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-gray-50">
                    <td className="border px-4 py-2">{item.date}</td>
                    <td className="border px-4 py-2">
                      {item.warehouse_name || item.Warehouse}
                    </td>
                    <td className="border px-4 py-2">
                      {item.material_name || item.material}
                    </td>
                    <td className="border px-4 py-2">{item.opening_balance}</td>
                    <td className="border px-4 py-2">{item.raw_in}</td>
                    <td className="border px-4 py-2">{item.shift_1}</td>
                    <td className="border px-4 py-2">{item.shift_2}</td>
                    <td className="border px-4 py-2">{item.shift_3}</td>
                    <td className="border px-4 py-2">{item.closing_balance}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline mr-3 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-1/2 shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Inventory Record
            </h3>

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4">
                {["raw_in", "shift_1", "shift_2", "shift_3"].map((field) => (
                  <label key={field} className="text-gray-700 font-medium">
                    {field.replace("_", " ").toUpperCase()}:
                    <input
                      type="number"
                      name={field}
                      value={editItem[field]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 mt-1 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg mr-3 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseAnalytics;

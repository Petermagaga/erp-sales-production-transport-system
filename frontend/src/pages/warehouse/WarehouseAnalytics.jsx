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

  // ✅ Fetch inventory records
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

  // ✅ Handle edit
  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  // ✅ Handle delete
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

  // ✅ Handle save update
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

  // ✅ Handle input change in edit modal
  const handleChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Warehouse Analytics Dashboard
        </h2>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-10">
        <h3 className="text-lg font-semibold mb-4">Production Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="warehouse__categories" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_raw_in" fill="#60a5fa" name="Total Raw In" />
            <Bar dataKey="total_output" fill="#34d399" name="Total Output" />
            <Bar dataKey="total_waste" fill="#f87171" name="Total Waste" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Records Section */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Inventory Records</h3>
          <button
            onClick={fetchInventory}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>

          <button
          onClick={() => navigate("/addwarehouse")}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
        >
          ➕ Add Warehouse Record
        </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Warehouse</th>
                  <th className="border px-3 py-2">Material</th>
                  <th className="border px-3 py-2">Opening</th>
                  <th className="border px-3 py-2">Raw In</th>
                  <th className="border px-3 py-2">Shift 1</th>
                  <th className="border px-3 py-2">Shift 2</th>
                  <th className="border px-3 py-2">Shift 3</th>
                  <th className="border px-3 py-2">Closing</th>
                  <th className="border px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="border px-3 py-2">{item.date}</td>
                    <td className="border px-3 py-2">
                      {item.warehouse_name || item.Warehouse}
                    </td>
                    <td className="border px-3 py-2">
                      {item.material_name || item.material}
                    </td>
                    <td className="border px-3 py-2">{item.opening_balance}</td>
                    <td className="border px-3 py-2">{item.raw_in}</td>
                    <td className="border px-3 py-2">{item.shift_1}</td>
                    <td className="border px-3 py-2">{item.shift_2}</td>
                    <td className="border px-3 py-2">{item.shift_3}</td>
                    <td className="border px-3 py-2">{item.closing_balance}</td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl w-1/2 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Inventory Record</h3>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  Raw In:
                  <input
                    type="number"
                    name="raw_in"
                    value={editItem.raw_in}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </label>
                <label>
                  Shift 1:
                  <input
                    type="number"
                    name="shift_1"
                    value={editItem.shift_1}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </label>
                <label>
                  Shift 2:
                  <input
                    type="number"
                    name="shift_2"
                    value={editItem.shift_2}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </label>
                <label>
                  Shift 3:
                  <input
                    type="number"
                    name="shift_3"
                    value={editItem.shift_3}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
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

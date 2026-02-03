// components/LeaveRequestForm.jsx
import { useState } from "react";
import axios from "../api/axios";

export default function LeaveRequestForm() {
  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const submit = async () => {
    await axios.post("/leave/leave-requests/", form);
    alert("Leave submitted successfully 🌿");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#009540]/20 p-6">
      <h3 className="text-xl font-bold text-[#009540] mb-4">
        ✍️ Request Leave
      </h3>

      <div className="space-y-4">
        <select
          className="w-full border rounded-lg px-3 py-2"
          onChange={(e) =>
            setForm({ ...form, leave_type: e.target.value })
          }
        >
          <option value="">Select Leave Type</option>
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="maternity">Maternity Leave</option>
        </select>

        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          onChange={(e) =>
            setForm({ ...form, start_date: e.target.value })
          }
        />

        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          onChange={(e) =>
            setForm({ ...form, end_date: e.target.value })
          }
        />

        <textarea
          placeholder="Reason for leave..."
          className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
        />

        <button
          onClick={submit}
          className="w-full bg-[#FFD200] text-[#009540] font-semibold py-2 rounded-lg shadow hover:bg-[#ffcc00] transition-all hover:scale-[1.03]"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}

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
    alert("Leave submitted");
  };

  return (
    <div className="card">
      <h2>Request Leave</h2>

      <input type="date" onChange={e => setForm({...form, start_date: e.target.value})} />
      <input type="date" onChange={e => setForm({...form, end_date: e.target.value})} />
      <textarea placeholder="Reason" onChange={e => setForm({...form, reason: e.target.value})} />

      <button onClick={submit}>Submit</button>
    </div>
  );
}

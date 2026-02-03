// components/MyLeaveTable.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function MyLeaveTable() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    axios.get("/leave/leave-requests/")
      .then(res => setLeaves(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Dates</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map(l => (
          <tr key={l.id}>
            <td>{l.leave_type_name}</td>
            <td>{l.start_date} → {l.end_date}</td>
            <td>{l.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// components/LeaveBalanceCards.jsx
import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function LeaveBalanceCards() {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    axios.get("/leave/leave-balances/")
        .then(res => setBalances(res.data))
        .catch(() => setBalances([]));
}, []);

  const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/leave/leave-balances/")
            .then(res => setBalances(res.data))
            .finally(() => setLoading(false));
    }, []);


  return (
    <div className="grid grid-cols-3 gap-4">
      {balances.map(b => (
        <div key={b.id} className="card">
          <h3>{b.leave_type}</h3>
          <p>Remaining: {b.remaining_days}</p>
        </div>
      ))}
    </div>
  );
}

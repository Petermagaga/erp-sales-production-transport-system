// components/LeaveBalanceCards.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

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
// components/LeaveBalanceCards.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function LeaveBalanceCards() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/leave/leave-balances/")
      .then((res) => setBalances(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow animate-pulse text-gray-400">
        Loading leave balances...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {balances.map((b) => (
        <div
          key={b.id}
          className="bg-white rounded-2xl shadow-md border border-[#009540]/20 p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <h3 className="text-lg font-semibold text-[#009540] mb-2">
            🌴 {b.leave_type}
          </h3>
          <p className="text-gray-600">
            Remaining Days
          </p>
          <p className="text-3xl font-bold text-[#009540]">
            {b.remaining_days}
          </p>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { CheckCircle, Mail, User } from "lucide-react";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    API.get("accounts/pending-users/")
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Failed to load pending users"))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      setApprovingId(id);

      await API.post(`accounts/approve-user/${id}/`);

      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User approved successfully");
    } catch (err) {
      toast.error("Approval failed. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Pending User Approvals
      </h2>

      {loading && <p className="text-gray-500">Loading pending users…</p>}

      {!loading && users.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          🎉 No pending users at the moment
        </div>
      )}

      <div className="space-y-4">
        {users.map(u => (
          <div
            key={u.id}
            className="bg-white shadow-sm border rounded-xl p-4 flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{u.username}</span>

                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {u.role}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                {u.email}
              </div>
            </div>

            <button
              onClick={() => approve(u.id)}
              disabled={approvingId === u.id}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition
                ${
                  approvingId === u.id
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              `}
            >
              {approvingId === u.id ? "Approving..." : "Approve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingUsers;

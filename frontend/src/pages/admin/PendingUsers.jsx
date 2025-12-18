import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Mail, User } from "lucide-react";
import { successToast, errorToast } from "../../components/toasts/AdminToasts";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    API.get("accounts/pending-users/")
      .then(res => setUsers(res.data))
      .catch(() =>
        errorToast("Failed to load pending users", fetchUsers)
      )
      .finally(() => setLoading(false));
  };

  const approve = async (user) => {
    try {
      setApprovingId(user.id);

      await API.post(`accounts/approve-user/${user.id}/`);
      setUsers(prev => prev.filter(u => u.id !== user.id));

      successToast(
        "User approved successfully",
        "Undo",
        () => undoApproval(user)
      );
    } catch {
      errorToast(
        "Approval failed",
        () => approve(user)
      );
    } finally {
      setApprovingId(null);
    }
  };

  const undoApproval = async (user) => {
    try {
      await API.post(`accounts/revoke-approval/${user.id}/`);
      setUsers(prev => [user, ...prev]);
      successToast("Approval reverted");
    } catch {
      errorToast("Failed to undo approval", () => undoApproval(user));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Pending User Approvals
      </h2>

      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && users.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          🎉 No pending users
        </div>
      )}

      <div className="space-y-4">
        {users.map(u => (
          <div
            key={u.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{u.username}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {u.role}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                {u.email}
              </div>
            </div>

            <button
              onClick={() => approve(u)}
              disabled={approvingId === u.id}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition
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

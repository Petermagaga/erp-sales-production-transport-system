import { useEffect, useState } from "react";
import API from "../../api/axios";
import { successToast, errorToast } from "../../components/toasts/AdminToasts";
import { Shield, Power } from "lucide-react";

const ROLES = [
  "admin",
  "sales",
  "warehouse",
  "marketing",
  "transporter",
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    API.get("accounts/users/")
      .then(res => setUsers(res.data))
      .catch(() =>
        errorToast("Failed to load users", fetchUsers)
      )
      .finally(() => setLoading(false));
  };

  /* -------------------- Status Toggle -------------------- */
  const toggleActive = async (user) => {
    const updated = { ...user, is_active: !user.is_active };

    // Optimistic UI
    setUsers(prev =>
      prev.map(u => (u.id === user.id ? updated : u))
    );
    setSavingId(user.id);

    try {
      await API.patch(`accounts/users/${user.id}/`, {
        is_active: updated.is_active,
      });

      successToast(
        `User ${updated.is_active ? "activated" : "deactivated"}`,
        "Undo",
        () => toggleActive(updated)
      );
    } catch {
      // Rollback
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? user : u))
      );
      errorToast("Failed to update user status", () => toggleActive(user));
    } finally {
      setSavingId(null);
    }
  };

  /* -------------------- Role Change -------------------- */
  const changeRole = async (user, role) => {
    const previousRole = user.role;

    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, role } : u
      )
    );
    setSavingId(user.id);

    try {
      await API.patch(`accounts/users/${user.id}/`, { role });

      successToast(
        "Role updated",
        "Undo",
        () => changeRole({ ...user, role }, previousRole)
      );
    } catch {
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, role: previousRole } : u
        )
      );
      errorToast("Failed to update role", () =>
        changeRole(user, role)
      );
    } finally {
      setSavingId(null);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        User Management
      </h1>

      {loading && <p className="text-gray-500">Loading users…</p>}

      {!loading && users.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No users found
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-gray-500 text-xs">
                      {user.email}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <select
                      value={user.role}
                      disabled={savingId === user.id}
                      onChange={(e) =>
                        changeRole(user, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      disabled={savingId === user.id}
                      onClick={() => toggleActive(user)}
                      className={`
                        inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                        text-white text-xs font-medium transition
                        ${
                          user.is_active
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }
                        ${savingId === user.id && "opacity-60 cursor-not-allowed"}
                      `}
                    >
                      <Power className="w-3 h-3" />
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;

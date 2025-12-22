import { useEffect, useState } from "react";
import API from "../../api/axios";
import { successToast, errorToast } from "../../components/toasts/AdminToasts";
import { ChevronDown, ChevronRight } from "lucide-react";

const ACTION_COLORS = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters] = useState({
    action: "",
    module: "",
    user: "",
  });

  const fetchLogs = () => {
    setLoading(true);
    API.get("accounts/audit-logs/", { params: filters })
      .then(res => setLogs(res.data))
      .catch(() =>
        errorToast("Failed to load audit logs", fetchLogs)
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Audit Logs
      </h1>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          placeholder="User email"
          className="border rounded px-3 py-2 text-sm w-64"
          onChange={(e) =>
            setFilters(prev => ({ ...prev, user: e.target.value }))
          }
        />

        <input
          placeholder="Module"
          className="border rounded px-3 py-2 text-sm w-40"
          onChange={(e) =>
            setFilters(prev => ({ ...prev, module: e.target.value }))
          }
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          onChange={(e) =>
            setFilters(prev => ({ ...prev, action: e.target.value }))
          }
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>

        <button
          onClick={fetchLogs}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm"
        >
          Apply Filters
        </button>
      </div>
      

      <div className="flex gap-2 mb-4">
        <a
          href={`${API.defaults.baseURL}accounts/audit-logs/export/csv/`}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Export CSV
        </a>

        <a
          href={`${API.defaults.baseURL}accounts/audit-logs/export/pdf/`}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Export PDF
        </a>
      </div>


      {/* States */}
      {loading && <p className="text-gray-500">Loading audit logs…</p>}

      {!loading && logs.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No logs found for the selected filters
        </div>
      )}

      {/* Table */}
      {!loading && logs.length > 0 && (
        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Module</th>
                <th className="p-3">Changes</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {logs.map(log => (
                <>
                  <tr
                    key={log.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{log.user_email}</td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ACTION_COLORS[log.action] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {log.module}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          setExpanded(
                            expanded === log.id ? null : log.id
                          )
                        }
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {expanded === log.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        View
                      </button>
                    </td>

                    <td className="p-3 text-center text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>

                  {expanded === log.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-4">
                        <pre className="text-xs bg-white border rounded p-3 overflow-x-auto">
{JSON.stringify(
  { old: log.old_data, new: log.new_data },
  null,
  2
)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

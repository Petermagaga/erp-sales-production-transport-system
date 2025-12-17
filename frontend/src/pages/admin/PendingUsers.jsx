import { useEffect, useState } from "react";
import API from "../../api/axios";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("accounts/pending-users/")
      .then(res => setUsers(res.data));
  }, []);

  const approve = async (id) => {
    await API.post(`accounts/approve-user/${id}/`);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Users</h2>

      {users.map(u => (
        <div key={u.id} className="flex justify-between p-3 border mb-2">
          <div>
            <p>{u.username} ({u.role})</p>
            <p className="text-sm text-gray-500">{u.email}</p>
          </div>

          <button
            onClick={() => approve(u.id)}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};

export default PendingUsers;

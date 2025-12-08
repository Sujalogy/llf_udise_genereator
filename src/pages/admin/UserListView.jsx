import { useState, useEffect } from "react";
import { Search, Edit, Trash2, Shield, ShieldAlert, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const UserListView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: searchTerm,
        role: roleFilter
      });

      const response = await fetch(`http://localhost:3000/api/users?${params}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        alert("User deleted successfully!");
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold text-left">User</th>
                <th className="px-6 py-4 font-semibold text-left">Role</th>
                <th className="px-6 py-4 font-semibold text-left">Status</th>
                <th className="px-6 py-4 font-semibold text-left">Last Login</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt={user.name} className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.name || "Unnamed"}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {editingUser?.user_id === user.user_id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                          user.role === "super_admin" ? "bg-purple-100 text-purple-700" :
                          user.role === "admin" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {user.role.replace("_", " ")}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingUser?.user_id === user.user_id ? (
                        <select
                          value={editingUser.status}
                          onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {editingUser?.user_id === user.user_id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateUser(user.user_id, { role: editingUser.role, status: editingUser.status })} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingUser(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                          <button onClick={() => setEditingUser(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(user.user_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <div>Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
            Previous
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserListView;
// ============================================================================
// --- FILE: src/pages/admin/UserListView.jsx ---
// ============================================================================
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Shield,
  ShieldAlert
} from 'lucide-react';

const UserListView = () => {
  // Mock Data - Replace with API fetch later
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User", email: "admin@org.com", role: "admin", status: "active", lastActive: "Just now" },
    { id: 2, name: "Rahul Sharma", email: "do.pune@gov.in", role: "user", status: "active", lastActive: "2 hours ago" },
    { id: 3, name: "Priya Singh", email: "beo.torpa@gov.in", role: "user", status: "inactive", lastActive: "5 days ago" },
    { id: 4, name: "Amit Patel", email: "do.mumbai@gov.in", role: "user", status: "active", lastActive: "1 day ago" },
    { id: 5, name: "Sneha Gupta", email: "data.entry@gov.in", role: "editor", status: "active", lastActive: "3 mins ago" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      {/* --- Toolbar --- */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-900/30 text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">User Details</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Last Active</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}>
                      {user.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {user.lastActive}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-10 h-10 mb-3 opacity-20" />
                    <p>No users found matching "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination (Mock) */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div>Showing {filteredUsers.length} of {users.length} users</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserListView;
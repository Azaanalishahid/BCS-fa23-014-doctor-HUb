import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      alert('User role updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update role.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Doctor Hub - Admin</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Manage Users</h2>
          {loading ? (
            <div className="text-gray-500">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg bg-gray-50">
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Role: <span className="font-medium">{u.role}</span>
                  </div>
                  <div className="text-sm text-gray-600">{u.specialization ? `${u.specialization} • ${u.treatment_type}` : u.blood_group ? `Blood Group: ${u.blood_group}` : ''}</div>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

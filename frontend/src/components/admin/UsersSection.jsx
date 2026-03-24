import React, { useState, useEffect } from 'react';
import { Users, Check, X, Trash2 } from 'lucide-react';
import axios, { API } from './adminApi';
import { useAuth } from '../../context/AuthContext';

const UsersSection = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRoleTab, setUserRoleTab] = useState('all');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (err) { console.error('Error loading users:', err); }
    setLoading(false);
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/toggle-status`);
      loadUsers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const setUserRole = async (userId, role) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/set-role?role=${role}`);
      loadUsers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible.')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      loadUsers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de la suppression'); }
  };

  return (
    <div className="space-y-6" data-testid="users-admin-section">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">Utilisateurs ({users.length})</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Tous', count: users.length, color: 'bg-gray-50 text-gray-700 border-gray-200' },
            { id: 'admin_principal', label: 'Admins Principaux', count: users.filter(u => u.role === 'admin_principal' || u.role === 'admin').length, color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { id: 'admin_secondary', label: 'Admins Secondaires', count: users.filter(u => u.role === 'admin_secondary').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { id: 'user', label: 'Utilisateurs', count: users.filter(u => u.role === 'user').length, color: 'bg-green-50 text-green-700 border-green-200' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setUserRoleTab(tab.id)}
              data-testid={`user-tab-${tab.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                userRoleTab === tab.id ? tab.color + ' ring-2 ring-offset-1 ring-current/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {users
            .filter(u => {
              if (userRoleTab === 'all') return true;
              if (userRoleTab === 'admin_principal') return u.role === 'admin_principal' || u.role === 'admin';
              return u.role === userRoleTab;
            })
            .map(u => {
              const roleConfig = {
                admin_principal: { label: 'Admin Principal', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-purple-700' },
                admin: { label: 'Admin Principal', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-500 to-purple-700' },
                admin_secondary: { label: 'Admin Secondaire', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-blue-700' },
                user: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-700', gradient: 'from-[#1e3a5f] to-[#2a5298]' },
              };
              const rc = roleConfig[u.role] || roleConfig.user;
              const isSelf = u.id === user?.id;

              return (
                <div key={u.id} className="bg-white rounded-2xl shadow-sm p-5" data-testid={`user-card-${u.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm">{u.firstName} {u.lastName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rc.color}`}>{rc.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive !== false ? 'Actif' : 'Inactif'}
                        </span>
                        {isSelf && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-medium">Vous</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{u.phone || '—'} | Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    {!isSelf && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={u.role === 'admin' ? 'admin_principal' : u.role}
                          onChange={(e) => setUserRole(u.id, e.target.value)}
                          data-testid={`role-select-${u.id}`}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white"
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin_secondary">Admin Secondaire</option>
                          <option value="admin_principal">Admin Principal</option>
                        </select>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          data-testid={`toggle-status-${u.id}`}
                          className={`p-2 rounded-lg transition-colors ${u.isActive !== false ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={u.isActive !== false ? 'Désactiver' : 'Activer'}
                        >
                          {u.isActive !== false ? <X size={16} /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          data-testid={`delete-user-${u.id}`}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default UsersSection;

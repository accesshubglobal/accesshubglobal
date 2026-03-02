import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Building, Home, MessageCircle, FileText, 
  LogOut, Plus, Edit, Trash2, Eye, Check, X, ChevronRight, Search, 
  RefreshCw, Mail, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (activeSection === 'dashboard') loadStats();
    else loadData();
  }, [activeSection]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        users: '/admin/users',
        offers: '/admin/offers',
        universities: '/admin/universities',
        housing: '/admin/housing',
        messages: '/admin/messages',
        applications: '/admin/applications'
      };
      const response = await axios.get(`${API}${endpoints[activeSection]}`);
      setData(response.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) return;
    
    try {
      const endpoints = {
        offers: '/admin/offers',
        universities: '/admin/universities',
        housing: '/admin/housing'
      };
      await axios.delete(`${API}${endpoints[activeSection]}/${id}`);
      loadData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/toggle-status`);
      loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.put(`${API}/admin/messages/${messageId}/read`);
      loadData();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyContent.trim()) return;
    
    try {
      await axios.post(`${API}/admin/messages/${messageId}/reply`, {
        content: replyContent
      });
      setReplyContent('');
      setReplyingTo(null);
      loadData();
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const handleUpdateApplicationStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/admin/applications/${appId}/status?status=${status}`);
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const sections = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'offers', label: 'Offres', icon: GraduationCap },
    { id: 'universities', label: 'Universités', icon: Building },
    { id: 'housing', label: 'Logements', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'applications', label: 'Candidatures', icon: FileText }
  ];

  const getStatusBadge = (status) => {
    const config = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
      reviewing: { icon: AlertCircle, color: 'bg-blue-100 text-blue-700', label: 'En examen' },
      accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Acceptée' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Refusée' }
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
        <Icon size={12} />
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#1a56db] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_chinese-education/artifacts/gc6ncp0j_0C3E8C4F-6FA9-4406-98A9-D40F8A0065C9-removebg-preview.png" 
              alt="Logo" 
              className="h-10"
            />
            <div>
              <h1 className="text-xl font-bold">Administration</h1>
              <p className="text-sm text-blue-200">Winner's Consulting CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.firstName} {user?.lastName}</span>
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => { setActiveSection(section.id); setShowForm(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-[#1a56db] font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {section.label}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Dashboard */}
            {activeSection === 'dashboard' && stats && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl font-bold text-[#1a56db]">{stats.users}</div>
                    <div className="text-gray-500">Utilisateurs</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl font-bold text-green-600">{stats.offers}</div>
                    <div className="text-gray-500">Offres actives</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">{stats.universities}</div>
                    <div className="text-gray-500">Universités</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-3xl font-bold text-orange-600">{stats.housing}</div>
                    <div className="text-gray-500">Logements</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold">{stats.messages}</span>
                    </div>
                    <div className="flex items-center justify-between text-red-600">
                      <span>Non lus</span>
                      <span className="font-bold">{stats.unreadMessages}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Candidatures</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold">{stats.applications}</span>
                    </div>
                    <div className="flex items-center justify-between text-yellow-600">
                      <span>En attente</span>
                      <span className="font-bold">{stats.pendingApplications}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeSection === 'users' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Utilisateurs ({data.length})</h2>
                  <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nom</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Rôle</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="text-sm text-[#1a56db] hover:underline"
                            >
                              {user.isActive ? 'Désactiver' : 'Activer'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Offers */}
            {activeSection === 'offers' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Offres ({data.length})</h2>
                  <div className="flex gap-2">
                    <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8]"
                    >
                      <Plus size={18} />
                      Nouvelle offre
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Titre</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Université</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Pays</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Vues</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.map((offer) => (
                        <tr key={offer.id} className={!offer.isActive ? 'opacity-50' : ''}>
                          <td className="px-4 py-3 font-medium">{offer.title}</td>
                          <td className="px-4 py-3 text-gray-600">{offer.university}</td>
                          <td className="px-4 py-3">{offer.country}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              offer.hasScholarship && !offer.isPartialScholarship ? 'bg-green-100 text-green-700' :
                              offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {offer.hasScholarship && !offer.isPartialScholarship ? 'Bourse complète' :
                               offer.isPartialScholarship ? 'Bourse partielle' : 'Auto-financé'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{offer.views?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(offer.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Messages */}
            {activeSection === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Messages ({data.length})</h2>
                  <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  {data.map((msg) => (
                    <div key={msg.id} className={`border rounded-xl p-4 ${!msg.isRead ? 'border-[#1a56db] bg-blue-50' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{msg.senderName}</span>
                          <span className="text-gray-500 text-sm ml-2">{msg.senderEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="text-xs text-[#1a56db] hover:underline"
                            >
                              Marquer lu
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{msg.subject}</h4>
                      <p className="text-gray-600 text-sm mb-3">{msg.content}</p>
                      
                      {msg.replies && msg.replies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Réponses:</p>
                          {msg.replies.map((reply, i) => (
                            <div key={i} className="bg-green-50 rounded-lg p-3 mb-2">
                              <p className="text-sm">{reply.content}</p>
                              <p className="text-xs text-gray-400 mt-1">{reply.adminName}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {replyingTo === msg.id ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                            rows={3}
                            placeholder="Votre réponse..."
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReply(msg.id)}
                              className="px-4 py-2 bg-[#1a56db] text-white rounded-lg text-sm hover:bg-[#1648b8]"
                            >
                              Envoyer
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(msg.id)}
                          className="mt-2 flex items-center gap-1 text-sm text-[#1a56db] hover:underline"
                        >
                          <Mail size={14} />
                          Répondre
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            {activeSection === 'applications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Candidatures ({data.length})</h2>
                  <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  {data.map((app) => (
                    <div key={app.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.userName}</h4>
                          <p className="text-sm text-gray-500">{app.userEmail}</p>
                          <p className="text-sm text-[#1a56db] mt-1">{app.offerTitle}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Soumis le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(app.status)}
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                            className="text-sm border border-gray-200 rounded px-2 py-1"
                          >
                            <option value="pending">En attente</option>
                            <option value="reviewing">En examen</option>
                            <option value="accepted">Acceptée</option>
                            <option value="rejected">Refusée</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Universities & Housing similar structure */}
            {(activeSection === 'universities' || activeSection === 'housing') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeSection === 'universities' ? 'Universités' : 'Logements'} ({data.length})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
                      <RefreshCw size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8]">
                      <Plus size={18} />
                      Ajouter
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {data.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      {item.image && (
                        <img src={item.image} alt={item.name || item.type} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{item.name || item.type}</h3>
                        <p className="text-sm text-gray-500">{item.city}, {item.country}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

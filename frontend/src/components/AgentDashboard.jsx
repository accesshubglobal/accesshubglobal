import React, { useState, useEffect } from 'react';
import {
  Users, FileText, MessageCircle, BarChart3, Plus, Trash2, Edit3, Eye,
  LogOut, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Send,
  GraduationCap, Heart, Star, Search, X, Loader2, Home, UserCheck, Building2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const AgentDashboard = () => {
  const { user, logout, addToFavorites, removeFromFavorites } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Student form
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', nationality: '', sex: '', passportNumber: '', address: ''
  });

  // Application form
  const [showAppForm, setShowAppForm] = useState(false);
  const [appForm, setAppForm] = useState({ studentId: '', offerId: '', offerTitle: '', termsAccepted: false });

  // Message form
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgForm, setMsgForm] = useState({ subject: '', content: '' });
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Not approved state
  const isApproved = user?.isApproved;

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'students') loadStudents();
    if (activeTab === 'applications') { loadApplications(); loadStudents(); }
    if (activeTab === 'offers') loadOffers();
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API}/agent/dashboard-stats`);
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/agent/students`);
      setStudents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/agent/applications`);
      setApplications(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/offers`);
      setOffers(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/user/favorites`);
      setFavorites(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/agent/messages`);
      setMessages(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Student CRUD
  const resetStudentForm = () => {
    setStudentForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', nationality: '', sex: '', passportNumber: '', address: '' });
    setEditingStudent(null);
    setShowStudentForm(false);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStudent) {
        await axios.put(`${API}/agent/students/${editingStudent.id}`, studentForm);
      } else {
        await axios.post(`${API}/agent/students`, studentForm);
      }
      loadStudents();
      loadStats();
      resetStudentForm();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
    setLoading(false);
  };

  const editStudent = (s) => {
    setStudentForm({
      firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone || '',
      dateOfBirth: s.dateOfBirth || '', nationality: s.nationality || '', sex: s.sex || '',
      passportNumber: s.passportNumber || '', address: s.address || ''
    });
    setEditingStudent(s);
    setShowStudentForm(true);
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Supprimer cet etudiant ?')) return;
    try {
      await axios.delete(`${API}/agent/students/${id}`);
      loadStudents();
      loadStats();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  // Applications
  const handleAppSubmit = async (e) => {
    e.preventDefault();
    if (!appForm.studentId || !appForm.offerId) { alert('Selectionnez un etudiant et une offre'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/agent/applications`, appForm);
      setShowAppForm(false);
      setAppForm({ studentId: '', offerId: '', offerTitle: '', termsAccepted: false });
      loadApplications();
      loadStats();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setLoading(false);
  };

  // Messages
  const handleMsgSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/agent/messages`, msgForm);
      setShowMsgForm(false);
      setMsgForm({ subject: '', content: '' });
      loadMessages();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setLoading(false);
  };

  const toggleFav = async (offerId) => {
    const isFav = user?.favorites?.includes(offerId);
    if (isFav) await removeFromFavorites(offerId);
    else await addToFavorites(offerId);
    if (activeTab === 'favorites') loadFavorites();
  };

  const statusConfig = {
    pending: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    approved: { label: 'Approuve', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    rejected: { label: 'Rejete', color: 'text-red-600 bg-red-50', icon: XCircle },
    processing: { label: 'En cours', color: 'text-blue-600 bg-blue-50', icon: AlertCircle },
    modify: { label: 'A modifier', color: 'text-orange-600 bg-orange-50', icon: AlertCircle },
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'students', label: 'Etudiants', icon: Users },
    { id: 'applications', label: 'Candidatures', icon: FileText },
    { id: 'offers', label: 'Offres', icon: GraduationCap },
    { id: 'favorites', label: 'Favoris', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  // Pending approval screen
  if (user && user.role === 'agent' && !isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center" data-testid="agent-pending-approval">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte en attente d'approbation</h2>
          <p className="text-gray-600 mb-4 text-sm">Votre compte agent est en cours de verification par un administrateur. Vous recevrez l'acces une fois approuve.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Retour au site
            </button>
            <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
              <LogOut size={14} /> Deconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="agent-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Espace Agent</h1>
              <p className="text-[11px] text-gray-500">{user?.firstName} {user?.lastName} {user?.company ? `- ${user.company}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Retour au site">
              <Home size={18} />
            </button>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" data-testid="agent-logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`agent-tab-${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Etudiants', value: stats?.students || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Candidatures', value: stats?.totalApplications || 0, icon: FileText, color: 'from-purple-500 to-purple-600' },
                { label: 'En attente', value: stats?.pendingApplications || 0, icon: Clock, color: 'from-amber-500 to-amber-600' },
                { label: 'Approuvees', value: stats?.approvedApplications || 0, icon: CheckCircle, color: 'from-green-500 to-green-600' },
                { label: 'Rejetees', value: stats?.rejectedApplications || 0, icon: XCircle, color: 'from-red-500 to-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('students')} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-left hover:border-[#1e3a5f]/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="font-medium text-gray-900">Gerer mes etudiants</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f] transition-colors" />
                </div>
              </button>
              <button onClick={() => { setActiveTab('applications'); setShowAppForm(true); loadStudents(); loadOffers(); }} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-left hover:border-[#1e3a5f]/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="font-medium text-gray-900">Nouvelle candidature</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f] transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mes Etudiants ({students.length})</h2>
              <button onClick={() => { resetStudentForm(); setShowStudentForm(true); }} data-testid="add-student-btn"
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus size={16} /> Ajouter
              </button>
            </div>

            {/* Student Form Modal */}
            {showStudentForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => resetStudentForm()}>
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{editingStudent ? 'Modifier' : 'Ajouter'} un etudiant</h3>
                    <button onClick={resetStudentForm} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleStudentSubmit} className="p-5 space-y-3" data-testid="student-form">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Prenom *</label>
                        <input value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="student-firstname" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                        <input value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="student-lastname" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                      <input type="email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="student-email" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Telephone</label>
                        <input value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nationalite</label>
                        <input value={studentForm.nationality} onChange={e => setStudentForm({...studentForm, nationality: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
                        <input type="date" value={studentForm.dateOfBirth} onChange={e => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sexe</label>
                        <select value={studentForm.sex} onChange={e => setStudentForm({...studentForm, sex: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                          <option value="">--</option>
                          <option value="M">Masculin</option>
                          <option value="F">Feminin</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">N Passeport</label>
                        <input value={studentForm.passportNumber} onChange={e => setStudentForm({...studentForm, passportNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Adresse</label>
                        <input value={studentForm.address} onChange={e => setStudentForm({...studentForm, address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={resetStudentForm} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                      <button type="submit" disabled={loading} data-testid="student-submit-btn"
                        className="flex-1 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                        {loading ? 'Enregistrement...' : editingStudent ? 'Modifier' : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Students List */}
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun etudiant enregistre</p>
                <button onClick={() => { resetStudentForm(); setShowStudentForm(true); }}
                  className="mt-3 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm">Ajouter un etudiant</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {students.map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-testid={`student-card-${s.id}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{s.firstName} {s.lastName}</h4>
                        <p className="text-xs text-gray-500">{s.email}</p>
                        {s.nationality && <p className="text-xs text-gray-400 mt-1">{s.nationality} {s.phone ? `| ${s.phone}` : ''}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editStudent(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" data-testid={`edit-student-${s.id}`}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteStudent(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" data-testid={`delete-student-${s.id}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Candidatures ({applications.length})</h2>
              <button onClick={() => { setShowAppForm(true); loadStudents(); loadOffers(); }} data-testid="new-application-btn"
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus size={16} /> Nouvelle candidature
              </button>
            </div>

            {/* Application Form Modal */}
            {showAppForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAppForm(false)}>
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Nouvelle candidature</h3>
                    <button onClick={() => setShowAppForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleAppSubmit} className="p-5 space-y-4" data-testid="application-form">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Etudiant *</label>
                      <select value={appForm.studentId} onChange={e => setAppForm({...appForm, studentId: e.target.value})} required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="app-student-select">
                        <option value="">Selectionnez un etudiant</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.email}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Programme/Offre *</label>
                      <select value={appForm.offerId} onChange={e => {
                        const offer = offers.find(o => o.id === e.target.value);
                        setAppForm({...appForm, offerId: e.target.value, offerTitle: offer?.title || ''});
                      }} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="app-offer-select">
                        <option value="">Selectionnez une offre</option>
                        {offers.map(o => <option key={o.id} value={o.id}>{o.title} - {o.university}</option>)}
                      </select>
                    </div>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={appForm.termsAccepted} onChange={e => setAppForm({...appForm, termsAccepted: e.target.checked})} required
                        className="mt-1" data-testid="app-terms-checkbox" />
                      <span className="text-xs text-gray-600">J'accepte les conditions generales et je confirme que les informations de l'etudiant sont correctes.</span>
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAppForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
                      <button type="submit" disabled={loading} data-testid="app-submit-btn"
                        className="flex-1 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                        {loading ? 'Envoi...' : 'Soumettre'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Applications List */}
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune candidature</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const sc = statusConfig[app.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={app.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-testid={`application-card-${app.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{app.offerTitle}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Etudiant: {app.firstName} {app.lastName}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{new Date(app.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Offres disponibles</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..."
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-64" data-testid="offers-search" />
              </div>
            </div>
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.filter(o => !searchQuery || o.title?.toLowerCase().includes(searchQuery.toLowerCase()) || o.university?.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-testid={`offer-card-${o.id}`}>
                    {o.image && <img src={o.image} alt={o.title} className="w-full h-32 object-cover" />}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{o.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{o.university} - {o.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{o.degree}</span>
                        <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{o.duration}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => toggleFav(o.id)} data-testid={`fav-offer-${o.id}`}
                          className={`p-1.5 rounded-lg transition-colors ${user?.favorites?.includes(o.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                          <Heart size={16} fill={user?.favorites?.includes(o.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={() => { setAppForm({...appForm, offerId: o.id, offerTitle: o.title}); setShowAppForm(true); loadStudents(); }} data-testid={`apply-offer-${o.id}`}
                          className="text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg hover:opacity-90 flex items-center gap-1">
                          <FileText size={12} /> Postuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Mes Favoris ({favorites.length})</h2>
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun favori</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(o => (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {o.image && <img src={o.image} alt={o.title} className="w-full h-32 object-cover" />}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm">{o.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{o.university}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => toggleFav(o.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg">
                          <Heart size={16} fill="currentColor" />
                        </button>
                        <button onClick={() => { setAppForm({...appForm, offerId: o.id, offerTitle: o.title}); setActiveTab('applications'); setShowAppForm(true); loadStudents(); }}
                          className="text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg hover:opacity-90 flex items-center gap-1">
                          <FileText size={12} /> Postuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Messages ({messages.length})</h2>
              <button onClick={() => setShowMsgForm(true)} data-testid="new-message-btn"
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus size={16} /> Nouveau message
              </button>
            </div>

            {/* Message Form Modal */}
            {showMsgForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMsgForm(false)}>
                <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Nouveau message</h3>
                    <button onClick={() => setShowMsgForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleMsgSubmit} className="p-5 space-y-3" data-testid="message-form">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sujet *</label>
                      <input value={msgForm.subject} onChange={e => setMsgForm({...msgForm, subject: e.target.value})} required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" data-testid="msg-subject" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                      <textarea value={msgForm.content} onChange={e => setMsgForm({...msgForm, content: e.target.value})} required rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" data-testid="msg-content" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowMsgForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
                      <button type="submit" disabled={loading} data-testid="msg-submit-btn"
                        className="flex-1 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Send size={14} /> Envoyer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Messages List */}
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun message</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-[#1e3a5f]/20 transition-colors"
                    onClick={() => setSelectedMessage(selectedMessage?.id === m.id ? null : m)} data-testid={`message-card-${m.id}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm">{m.subject}</h4>
                      <span className="text-[11px] text-gray-400">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.content}</p>
                    {selectedMessage?.id === m.id && m.replies?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {m.replies.map((r, i) => (
                          <div key={i} className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-800">{r.adminName || 'Admin'}</p>
                            <p className="text-xs text-blue-700 mt-1">{r.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;

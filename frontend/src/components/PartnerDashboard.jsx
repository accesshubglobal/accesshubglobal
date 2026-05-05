import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, GraduationCap, Plus, Edit2, Trash2, CheckCircle, Clock, Loader2, LogOut, AlertCircle, Handshake, MessageSquare, Send, ArrowLeft, Paperclip, Download, FileText, X, Key, ShieldCheck, Eye, Shield, Upload, Copy, MapPin, Languages, Award } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OfferFormModal from './OfferFormModal';
import UniversityFormModal from './UniversityFormModal';
import DashboardShell, { StatCard, GlassPanel, AccentBtn } from './DashboardShell';
import { fixPdfUrl, downloadFile } from '../utils/fileUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const ACCENT = '#10b981';
const API = `${BACKEND_URL}/api`;

const axiosAuth = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

// ── Activation Code Gate ───────────────────────────────────────────────────────
const PartnerActivationCodeGate = ({ user, onVerified, onLogout }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const tok = localStorage.getItem('token');
      await axios.post(`${API}/partner/verify-login-code`,
        { code: code.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${tok}` } }
      );
      if (tok) sessionStorage.setItem(`partner_code_${tok.slice(-16)}`, 'true');
      onVerified();
    } catch (err) {
      setError(err.response?.data?.detail || "Code incorrect. Vérifiez votre code d'activation.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#050d1a' }}>
      <div className="absolute pointer-events-none inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl animate-pulse" style={{ backgroundColor: '#10b981' }} />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: '#059669', animation: 'pulse 4s ease-in-out 1.5s infinite' }} />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
          <Key size={30} style={{ color: ACCENT }} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Vérification d'identité</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Saisissez votre <strong style={{ color: 'rgba(255,255,255,0.7)' }}>code d'activation partenaire</strong> (format PA-XXXXXXXX).<br />
          C'est le code que l'administrateur vous a fourni lors de votre inscription.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="Ex : PA-XXXXXXXX"
            className="w-full px-4 py-3.5 rounded-2xl text-white text-center text-lg font-mono tracking-widest focus:outline-none transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            autoFocus
            data-testid="partner-activation-code-input"
          />
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={!code.trim() || loading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
            data-testid="partner-verify-code-btn">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Vérification...' : 'Accéder à mon espace'}
          </button>
          <button type="button" onClick={onLogout}
            className="w-full py-2 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ isApproved }) => {
  if (isApproved === true) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
      <CheckCircle size={12} /> Approuvé
    </span>
  );
  if (isApproved === false) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
      <Clock size={12} /> En attente de validation
    </span>
  );
  return null;
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const PartnerDashboard = () => {
  const { user, token, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('university');
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Activation code gate — uses token slice as session key (user?.id is null on first render)
  const [codeVerified, setCodeVerified] = useState(() => {
    const tok = localStorage.getItem('token');
    return !!tok && sessionStorage.getItem(`partner_code_${tok.slice(-16)}`) === 'true';
  });

  // Contract
  const [contractData, setContractData] = useState(null);

  // University state
  const [university, setUniversity] = useState(null);
  const [uniLoading, setUniLoading] = useState(false);
  const [showUniForm, setShowUniForm] = useState(false);
  const [uniError, setUniError] = useState('');

  // Offers state
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerError, setOfferError] = useState('');

  // Messaging state
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [attachedFile, setAttachedFile] = useState(null); // { url, name, type }
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef(null);

  const ax = useCallback(() => axiosAuth(token), [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/'); return; }
    if (user.role !== 'partenaire') { navigate('/'); return; }
    if (user.isApproved) {
      loadStats();
      loadUniversity();
      loadOffers();
      loadUnreadCount();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadStats = async () => {
    try {
      const res = await ax().get(`${API}/partner/stats`);
      setStats(res.data);
    } catch (e) {}
  };

  const loadContract = async () => {
    try {
      const res = await ax().get(`${API}/partner/contract`);
      setContractData(res.data);
    } catch (e) {}
  };

  const loadUniversity = async () => {
    try {
      const res = await ax().get(`${API}/partner/university`);
      setUniversity(res.data);
    } catch (e) {
      if (e.response?.status === 404) setUniversity(null);
    }
  };

  const loadOffers = async () => {
    try {
      const res = await ax().get(`${API}/partner/offers`);
      setOffers(res.data);
    } catch (e) {}
  };

  const loadUnreadCount = async () => {
    try {
      const res = await ax().get(`${API}/partner/messages/unread-count`);
      setUnreadCount(res.data.count || 0);
    } catch (e) {}
  };

  const loadMessages = async () => {
    setMsgLoading(true);
    try {
      const res = await ax().get(`${API}/partner/messages`);
      setMessages(res.data);
      setUnreadCount(0);
    } catch (e) {}
    setMsgLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'messages') loadMessages();
    if (tab === 'contrat') loadContract();
  };

  const handleSaveUniversity = async (data) => {
    setUniLoading(true);
    setUniError('');
    try {
      if (university) {
        await ax().put(`${API}/partner/university/${university.id}`, data);
      } else {
        await ax().post(`${API}/partner/university`, data);
      }
      await loadUniversity();
      await loadStats();
      setShowUniForm(false);
    } catch (e) {
      setUniError(e.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setUniLoading(false);
  };

  const handleSaveOffer = async (data) => {
    setOffersLoading(true);
    setOfferError('');
    try {
      if (editingOffer) {
        await ax().put(`${API}/partner/offers/${editingOffer.id}`, data);
      } else {
        await ax().post(`${API}/partner/offers`, data);
      }
      await loadOffers();
      await loadStats();
      setShowOfferForm(false);
      setEditingOffer(null);
    } catch (e) {
      setOfferError(e.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setOffersLoading(false);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await ax().delete(`${API}/partner/offers/${offerId}`);
      await loadOffers();
      await loadStats();
    } catch (e) {
      alert(e.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleDuplicateOffer = async (offerId) => {
    try {
      await ax().post(`${API}/partner/offers/${offerId}/duplicate`);
      await loadOffers();
      await loadStats();
    } catch (e) {
      alert(e.response?.data?.detail || 'Erreur lors de la duplication');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !attachedFile) return;
    try {
      await ax().post(`${API}/partner/messages`, {
        message: messageText.trim(),
        fileUrl: attachedFile?.url || null,
        fileName: attachedFile?.name || null,
        fileType: attachedFile?.type || null,
      });
      setMessageText('');
      setAttachedFile(null);
      await loadMessages();
    } catch (e) {
      alert("Erreur lors de l'envoi du message");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const authToken = token || localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data?.url) {
        setAttachedFile({ url: data.url, name: file.name, type: file.type });
      } else {
        alert('Erreur lors de l\'upload du fichier');
      }
    } catch {
      alert('Erreur lors de l\'upload du fichier');
    }
    setFileUploading(false);
    e.target.value = '';
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ── Activation code gate ───────────────────────────────────────────────────
  if (!codeVerified) {
    return (
      <PartnerActivationCodeGate
        user={user}
        onVerified={() => setCodeVerified(true)}
        onLogout={handleLogout}
      />
    );
  }

  // ── Auth loading screen ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // ── Email not verified ─────────────────────────────────────────────────────
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email non vérifié</h2>
          <p className="text-gray-600 mb-4">Veuillez vérifier votre adresse email avant d'accéder à votre espace partenaire. Consultez votre boîte de réception.</p>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto">
            <LogOut size={14} /> Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // ── Not approved screen ────────────────────────────────────────────────────
  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte en attente d'approbation</h2>
          <p className="text-gray-600 mb-6">Votre compte partenaire a bien été créé. Un administrateur doit l'approuver avant que vous puissiez accéder au tableau de bord.</p>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 mx-auto">
            <LogOut size={14} /> Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'university', label: 'Mon Université', icon: Building2 },
    { id: 'offers', label: 'Mes Offres', icon: GraduationCap },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'contrat', label: 'Contrat', icon: FileText },
  ];

  return (
    <DashboardShell
      accent={ACCENT} orbA="#059669" orbB="#0891b2"
      roleLabel="Espace Partenaire" roleIcon={Handshake}
      user={user} navItems={tabs}
      activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (tab !== activeTab) handleTabChange(tab); }}
      onLogout={handleLogout}
    >
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Université" value={stats.hasUniversity ? '✓' : '—'} icon={Building2} accent={ACCENT} sub={stats.universityApproved ? 'Approuvée' : (stats.hasUniversity ? 'En attente' : 'Non soumise')} />
          <StatCard label="Offres publiées" value={stats.offersCount} icon={GraduationCap} accent="#3b82f6" />
          <StatCard label="Offres approuvées" value={stats.approvedOffersCount} icon={CheckCircle} accent="#10b981" />
          <StatCard label="En attente" value={stats.offersCount - stats.approvedOffersCount} icon={Clock} accent="#f59e0b" />
        </div>
      )}

        {/* ── University Tab ── */}
        {activeTab === 'university' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mon Université</h3>
              {!university && !showUniForm && (
                <button onClick={() => setShowUniForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  data-testid="add-university-btn">
                  <Plus size={15} /> Soumettre une université
                </button>
              )}
              {university && !showUniForm && (
                <button onClick={() => setShowUniForm(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  data-testid="edit-university-btn">
                  <Edit2 size={14} /> Modifier
                </button>
              )}
            </div>

            {!showUniForm && university && (
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  {university.logo && (
                    <img src={university.logo} alt="" className="w-16 h-16 rounded-xl object-contain border border-gray-100" />
                  )}
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-lg text-gray-900">{university.name}</h4>
                      <StatusBadge isApproved={university.isApproved} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{university.city}, {university.country}</p>
                    {university.ranking && <p className="text-xs text-gray-400 mt-0.5">Classement : {university.ranking}</p>}
                  </div>
                </div>
                {university.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{university.description}</p>
                )}
                {!university.isApproved && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-start gap-2">
                    <Clock size={16} className="flex-shrink-0 mt-0.5" />
                    <span>Votre université est en attente de validation par l'équipe AccessHub Global. Elle sera visible sur le site après approbation.</span>
                  </div>
                )}
              </div>
            )}

            {!showUniForm && !university && (
              <div className="text-center py-12 text-gray-400">
                <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Vous n'avez pas encore soumis d'université.</p>
                <p className="text-xs mt-1">Cliquez sur "Soumettre une université" pour commencer.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Offers Tab ── */}
        {activeTab === 'offers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/* Gate: university must be submitted first */}
            {!university ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 size={28} className="text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Université requise</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                  Vous devez d'abord soumettre votre université avant de pouvoir créer des offres de formation.
                </p>
                <button onClick={() => setActiveTab('university')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                  data-testid="go-to-university-btn">
                  <ArrowLeft size={15} /> Soumettre mon université
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mes Offres ({offers.length})</h3>
                  <button onClick={() => { setEditingOffer(null); setShowOfferForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    data-testid="add-offer-btn">
                    <Plus size={15} /> Nouvelle offre
                  </button>
                </div>

                {offers.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 border-2 border-dashed border-emerald-200 rounded-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-5 flex items-center justify-center shadow-lg">
                      <GraduationCap size={36} className="text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">Aucune offre pour l'instant</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Publiez votre première offre de formation pour attirer les étudiants internationaux.</p>
                    <button onClick={() => { setEditingOffer(null); setShowOfferForm(true); }}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                      <Plus size={15} /> Créer ma première offre
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {offers.map(offer => (
                      <div key={offer.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        data-testid={`offer-item-${offer.id}`}>

                        {/* Top accent bar */}
                        <div className={`h-1.5 ${offer.isApproved ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />

                        {/* Cover image or gradient */}
                        <div className="relative h-32 overflow-hidden">
                          {offer.image ? (
                            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 flex items-center justify-center">
                              <GraduationCap size={42} className="text-white/40" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <StatusBadge isApproved={offer.isApproved} />
                          </div>
                          {offer.hasScholarship && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full shadow flex items-center gap-1">
                              <Award size={10} /> Bourse
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors" title={offer.title}>{offer.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                            <MapPin size={11} className="flex-shrink-0" /> {offer.university} · {offer.city}, {offer.country}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {offer.degree && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full">{offer.degree}</span>
                            )}
                            {offer.duration && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full inline-flex items-center gap-1">
                                <Clock size={9} /> {offer.duration}
                              </span>
                            )}
                            {offer.teachingLanguage && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full inline-flex items-center gap-1">
                                <Languages size={9} /> {offer.teachingLanguage}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-gray-100">
                            <button onClick={() => { setEditingOffer(offer); setShowOfferForm(true); }}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              data-testid={`edit-offer-${offer.id}`} title="Modifier">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => handleDuplicateOffer(offer.id)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              data-testid={`duplicate-offer-${offer.id}`} title="Dupliquer">
                              <Copy size={15} />
                            </button>
                            <button onClick={() => handleDeleteOffer(offer.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              data-testid={`delete-offer-${offer.id}`} title="Supprimer">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={16} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Messagerie AccessHub Global</h3>
                  <p className="text-xs text-gray-500">Communication avec l'équipe admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMessageText('');
                  setAttachedFile(null);
                  setTimeout(() => {
                    document.querySelector('[data-testid="partner-message-input"]')?.focus();
                  }, 50);
                }}
                data-testid="partner-new-message-btn"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus size={15} /> Nouveau message
              </button>
            </div>

            {/* Messages list */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50" data-testid="partner-messages-list">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-2 shadow-md">
                    <MessageSquare size={28} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Aucune conversation pour l'instant</p>
                  <p className="text-xs text-center max-w-xs">Démarrez la conversation avec l'équipe AccessHub Global ! Posez vos questions, signalez un problème ou demandez une révision d'offre.</p>
                  <button
                    type="button"
                    onClick={() => document.querySelector('[data-testid="partner-message-input"]')?.focus()}
                    data-testid="partner-start-conversation-btn"
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Send size={14} /> Démarrer la conversation
                  </button>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromRole === 'partenaire' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.fromRole === 'partenaire'
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.fromRole !== 'partenaire' && (
                        <p className="text-xs font-semibold text-blue-600 mb-1">{msg.fromName || 'AccessHub Admin'}</p>
                      )}
                      {msg.offerTitle && (
                        <p className={`text-xs mb-1 ${msg.fromRole === 'partenaire' ? 'text-emerald-200' : 'text-gray-400'}`}>
                          Re: {msg.offerTitle}
                        </p>
                      )}
                      {msg.message && <p>{msg.message}</p>}
                      {msg.fileUrl && (
                        msg.fileType?.startsWith('image/') ? (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                            <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full max-h-48 rounded-lg object-cover border border-white/20" />
                          </a>
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 ${msg.fromRole === 'partenaire' ? 'bg-emerald-700/60 text-emerald-100' : 'bg-gray-100 text-gray-700'}`}>
                            <FileText size={14} className="flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{msg.fileName || 'Fichier joint'}</span>
                            <Download size={12} className="flex-shrink-0 ml-auto" />
                          </a>
                        )
                      )}
                      <p className={`text-[10px] mt-1 ${msg.fromRole === 'partenaire' ? 'text-emerald-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {/* Attachment preview */}
              {attachedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                  <FileText size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-800 truncate flex-1">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-emerald-600 hover:text-red-500 flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileUploading}
                  className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-40"
                  title="Joindre un fichier"
                  data-testid="partner-attach-file">
                  {fileUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                </button>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez votre message à l'équipe AccessHub..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  rows={2}
                  data-testid="partner-message-input"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() && !attachedFile}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  data-testid="partner-message-send">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Contrat Tab ── */}
        {activeTab === 'contrat' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Mon Contrat</h2>
            {contractData?.contractUrl ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={28} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{contractData.contractName || 'Contrat Partenaire'}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {contractData.contractUploadedAt
                        ? `Mis à jour le ${new Date(contractData.contractUploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Document PDF'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Contrat de partenariat AccessHub Global</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <a href={fixPdfUrl(contractData.contractUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90"
                    data-testid="view-partner-contract-btn">
                    <Eye size={15} /> Visualiser
                  </a>
                  <button onClick={() => downloadFile(contractData.contractUrl, contractData.contractName || 'contrat-partenaire.pdf')}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                    data-testid="download-partner-contract-btn">
                    <Download size={15} /> Télécharger
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-gray-200" />
                </div>
                <p className="text-gray-500 font-medium">Aucun contrat disponible</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Votre contrat sera disponible ici une fois que l'administrateur l'aura téléversé.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Offer Form Modal */}
        {showOfferForm && (
          <OfferFormModal
            offer={editingOffer}
            onSave={handleSaveOffer}
            onClose={() => { setShowOfferForm(false); setEditingOffer(null); setOfferError(''); }}
            loading={offersLoading}
            error={offerError}
            isPartner={true}
          />
        )}

        {/* University Form Modal */}
        {showUniForm && (
          <UniversityFormModal
            university={university}
            onClose={() => { setShowUniForm(false); setUniError(''); }}
            onSave={handleSaveUniversity}
            loading={uniLoading}
            error={uniError}
            isPartner={true}
          />
        )}
    </DashboardShell>
  );
};

export default PartnerDashboard;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, GraduationCap, Plus, Edit2, Trash2, CheckCircle, Clock, Loader2, LogOut, AlertCircle, Handshake, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OfferFormModal from './OfferFormModal';
import UniversityFormModal from './UniversityFormModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const axiosAuth = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

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

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await ax().post(`${API}/partner/messages`, { message: messageText.trim() });
      setMessageText('');
      await loadMessages();
    } catch (e) {
      alert("Erreur lors de l'envoi du message");
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Handshake size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Espace Partenaire</p>
              <p className="text-xs text-gray-500">{user?.firstName} {user?.lastName}{user?.company ? ` — ${user.company}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700 hidden sm:block">Voir le site</a>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition-colors" data-testid="partner-logout">
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Université', value: stats.hasUniversity ? '1' : '0', sub: stats.universityApproved ? 'Approuvée' : (stats.hasUniversity ? 'En attente' : 'Non soumise'), color: 'emerald' },
              { label: 'Offres publiées', value: stats.offersCount, sub: `${stats.approvedOffersCount} approuvée(s)`, color: 'blue' },
              { label: 'Offres en attente', value: stats.offersCount - stats.approvedOffersCount, sub: 'validation admin', color: 'amber' },
              { label: 'Statut compte', value: '✓', sub: 'Partenaire actif', color: 'green' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} data-testid={`partner-tab-${tab.id}`}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
                }`}>
                <Icon size={15} /> {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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

                <div className="space-y-3">
                  {offers.map(offer => (
                    <div key={offer.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                      data-testid={`offer-item-${offer.id}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-gray-900 truncate">{offer.title}</h4>
                            <StatusBadge isApproved={offer.isApproved} />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{offer.university} — {offer.city}, {offer.country}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-400">
                            <span>{offer.degree}</span>
                            <span>·</span>
                            <span>{offer.duration}</span>
                            <span>·</span>
                            <span>{offer.teachingLanguage}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => { setEditingOffer(offer); setShowOfferForm(true); }}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            data-testid={`edit-offer-${offer.id}`} title="Modifier">
                            <Edit2 size={15} />
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
                  {offers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Vous n'avez pas encore soumis d'offres.</p>
                      <p className="text-xs mt-1">Cliquez sur "Nouvelle offre" pour commencer.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={16} className="text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messagerie AccessHub Global</h3>
                <p className="text-xs text-gray-500">Communication avec l'équipe admin</p>
              </div>
            </div>

            {/* Messages list */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50" data-testid="partner-messages-list">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <MessageSquare size={32} className="opacity-30" />
                  <p className="text-sm">Aucun message pour l'instant.</p>
                  <p className="text-xs">L'équipe vous contactera ici pour toute révision d'offre.</p>
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
                      <p>{msg.message}</p>
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
            <div className="p-4 border-t border-gray-100 bg-white flex gap-3 items-end">
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
                disabled={!messageText.trim()}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                data-testid="partner-message-send">
                <Send size={16} />
              </button>
            </div>
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
      </main>
    </div>
  );
};

export default PartnerDashboard;

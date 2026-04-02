import React, { useState, useEffect, useCallback } from 'react';
import { Building2, GraduationCap, Plus, Edit2, Trash2, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Loader2, LogOut, AlertCircle, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const axiosAuth = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

// ── Offer Form ──────────────────────────────────────────────────────────────
const EMPTY_OFFER = {
  title: '', university: '', city: '', country: 'Chine', countryCode: 'CN',
  category: 'engineering', categoryLabel: 'Ingénierie', degree: 'Licence',
  duration: '3 ans', teachingLanguage: 'Anglais', intake: 'Automne 2025',
  deadline: 'Ouvert', description: '', hasScholarship: false,
  isPartialScholarship: false, isSelfFinanced: true, isOnline: false,
  isNew: true, scholarshipType: '', originalTuition: 0, scholarshipTuition: 0,
  currency: 'CNY', serviceFee: 0, badges: [], requiredDocuments: [],
  requirements: {}, scholarshipDetails: {}, fees: {}, admissionConditions: [],
  documentTemplates: [], documents: [], image: null,
};

const OfferForm = ({ offer, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(offer || EMPTY_OFFER);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800">{offer ? 'Modifier l\'offre' : 'Nouvelle offre'}</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Titre *</label>
          <input name="title" value={form.title} onChange={handle} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            data-testid="offer-title" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Université *</label>
          <input name="university" value={form.university} onChange={handle} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            data-testid="offer-university" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Ville</label>
          <input name="city" value={form.city} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Pays</label>
          <select name="countryCode" value={form.countryCode} onChange={(e) => {
            const v = e.target.value;
            setForm(f => ({ ...f, countryCode: v, country: v === 'CN' ? 'Chine' : 'France' }));
          }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
            <option value="CN">Chine</option>
            <option value="FR">France</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Diplôme</label>
          <select name="degree" value={form.degree} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
            {['Licence', 'Master', 'Doctorat', 'Préparatoire', 'Formation courte'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Durée</label>
          <input name="duration" value={form.duration} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Langue d'enseignement</label>
          <input name="teachingLanguage" value={form.teachingLanguage} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Rentrée</label>
          <input name="intake" value={form.intake} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Date limite candidature</label>
          <input name="deadline" value={form.deadline} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Frais de scolarité (CNY/EUR)</label>
          <input name="originalTuition" type="number" value={form.originalTuition} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" name="hasScholarship" checked={form.hasScholarship} onChange={handle} className="accent-emerald-600" />
          Bourse disponible
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" name="isSelfFinanced" checked={form.isSelfFinanced} onChange={handle} className="accent-emerald-600" />
          Auto-financement
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" name="isOnline" checked={form.isOnline} onChange={handle} className="accent-emerald-600" />
          En ligne
        </label>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} disabled={loading || !form.title || !form.university}
          className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          data-testid="offer-save-btn">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Enregistrer et soumettre
        </button>
        <button onClick={onCancel} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  );
};

// ── University Form ─────────────────────────────────────────────────────────
const EMPTY_UNI = {
  name: '', city: '', province: '', country: 'Chine', countryCode: 'CN',
  status: 'public', image: '', coverImage: '', logo: '', ranking: '',
  badges: [], youtubeUrl: '', description: '', foundedYear: '',
  president: '', totalStudents: '', internationalStudents: '',
  website: '', faculties: [], conditions: [], photos: [],
};

const UniversityForm = ({ uni, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(uni || EMPTY_UNI);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800">{uni ? "Modifier l'université" : 'Soumettre une université'}</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Nom de l'université *</label>
          <input name="name" value={form.name} onChange={handle} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            data-testid="uni-name" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Ville *</label>
          <input name="city" value={form.city} onChange={handle} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            data-testid="uni-city" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Province / Région</label>
          <input name="province" value={form.province} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Pays</label>
          <select name="countryCode" value={form.countryCode} onChange={(e) => {
            const v = e.target.value;
            setForm(f => ({ ...f, countryCode: v, country: v === 'CN' ? 'Chine' : 'France' }));
          }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
            <option value="CN">Chine</option>
            <option value="FR">France</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Site web</label>
          <input name="website" type="url" value={form.website} onChange={handle}
            placeholder="https://www.universite.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Classement</label>
          <input name="ranking" value={form.ranking} onChange={handle}
            placeholder="Ex: Top 100 QS"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Année de fondation</label>
          <input name="foundedYear" value={form.foundedYear} onChange={handle}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Nombre d'étudiants</label>
          <input name="totalStudents" value={form.totalStudents} onChange={handle}
            placeholder="Ex: 30 000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">URL Image principale</label>
          <input name="image" value={form.image} onChange={handle}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">URL Logo</label>
          <input name="logo" value={form.logo} onChange={handle}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" />
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} disabled={loading || !form.name || !form.city}
          className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          data-testid="uni-save-btn">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Enregistrer et soumettre
        </button>
        <button onClick={onCancel} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
          Annuler
        </button>
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
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('university');
  const [stats, setStats] = useState(null);

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
  const ax = useCallback(() => axiosAuth(token), [token]);

  useEffect(() => {
    if (!user || user.role !== 'partenaire') { navigate('/'); return; }
    if (!user.isApproved) return;
    loadStats();
    loadUniversity();
    loadOffers();
  }, [user, navigate]);

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

  const handleLogout = () => { logout(); navigate('/'); };

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
              <p className="text-xs text-gray-500">{user?.firstName} {user?.lastName} {user?.company ? `— ${user.company}` : ''}</p>
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
        <div className="flex gap-2">
          {[
            { id: 'university', label: 'Mon Université', icon: Building2 },
            { id: 'offers', label: 'Mes Offres', icon: GraduationCap },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`partner-tab-${tab.id}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
                }`}>
                <Icon size={15} /> {tab.label}
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

            {uniError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={14} /> {uniError}
              </div>
            )}

            {showUniForm && (
              <UniversityForm
                uni={university}
                onSave={handleSaveUniversity}
                onCancel={() => { setShowUniForm(false); setUniError(''); }}
                loading={uniLoading}
              />
            )}

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
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mes Offres ({offers.length})</h3>
              {!showOfferForm && !editingOffer && (
                <button onClick={() => setShowOfferForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  data-testid="add-offer-btn">
                  <Plus size={15} /> Nouvelle offre
                </button>
              )}
            </div>

            {offerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={14} /> {offerError}
              </div>
            )}

            {(showOfferForm || editingOffer) && (
              <OfferForm
                offer={editingOffer}
                onSave={handleSaveOffer}
                onCancel={() => { setShowOfferForm(false); setEditingOffer(null); setOfferError(''); }}
                loading={offersLoading}
              />
            )}

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
                      <button onClick={() => { setEditingOffer(offer); setShowOfferForm(false); }}
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
              {offers.length === 0 && !showOfferForm && (
                <div className="text-center py-12 text-gray-400">
                  <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Vous n'avez pas encore soumis d'offres.</p>
                  <p className="text-xs mt-1">Cliquez sur "Nouvelle offre" pour commencer.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;

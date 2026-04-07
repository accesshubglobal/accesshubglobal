import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase, Building2, LogOut, Home, Plus, Edit3, Trash2, Eye, X,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Loader2,
  BarChart3, Users, FileText, Upload, Globe, Phone, Mail, MapPin,
  Layers, Star, Calendar, TrendingUp, Send, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import DashboardShell, { StatCard, GlassPanel, AccentBtn } from './DashboardShell';

const ACCENT = '#f59e0b';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm";
const sel = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm bg-white";

const statusConfig = {
  pending: { label: 'En attente', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  reviewing: { label: 'En cours', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: AlertCircle },
  accepted: { label: 'Accepté', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
};

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim', 'Temps partiel'];
const SECTORS = ['Technologie', 'Finance', 'Santé', 'Éducation', 'Marketing', 'RH', 'Ingénierie', 'Commerce', 'Juridique', 'Logistique', 'Hôtellerie', 'Agriculture', 'Autre'];
const EDU_LEVELS = ['Aucun requis', 'Bac', 'Bac+2 (BTS/DUT)', 'Bac+3 (Licence)', 'Bac+4', 'Bac+5 (Master)', 'Doctorat'];
const EXP_LEVELS = ['Sans expérience', 'Junior (< 2 ans)', 'Intermédiaire (2–5 ans)', 'Senior (5+ ans)', 'Expert (10+ ans)'];
const REMOTE_OPTIONS = ['Non', 'Hybride', 'Télétravail total'];
const CURRENCIES = ['EUR', 'USD', 'CNY', 'XAF', 'MAD'];
const POSITION_TYPES = ['Temps plein', 'Temps partiel', 'Freelance/Mission', 'Alternance'];
const WORK_MODES = ['Présentiel', 'Télétravail', 'Hybride'];

// ── Employer Dashboard ─────────────────────────────────────────────────────────
const EmployerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'company') loadCompany();
    if (activeTab === 'offers') { loadOffers(); loadStats(); }
    if (activeTab === 'applications') loadApplications();
  }, [activeTab]);

  const loadStats = async () => {
    try { const r = await axios.get(`${API}/employer/stats`); setStats(r.data); } catch {}
  };
  const loadCompany = async () => {
    try { const r = await axios.get(`${API}/employer/company`); setCompany(r.data); } catch { setCompany(null); }
  };
  const loadOffers = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/employer/job-offers`); setOffers(r.data); } catch {}
    setLoading(false);
  };
  const loadApplications = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/employer/applications`); setApplications(r.data); } catch {}
    setLoading(false);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try { await axios.delete(`${API}/employer/job-offers/${id}`); loadOffers(); loadStats(); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleApplicationStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/employer/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      if (selectedApplication?.id === appId) setSelectedApplication(prev => ({ ...prev, status }));
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const isApproved = user?.isApproved;

  if (user && user.role === 'employeur' && !isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center" data-testid="employer-pending-approval">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte en attente de validation</h2>
          <p className="text-gray-600 mb-4 text-sm">Votre compte employeur est en cours de vérification par notre équipe.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Retour au site</button>
            <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'company', label: 'Mon Entreprise', icon: Building2 },
    { id: 'offers', label: 'Mes Offres', icon: Briefcase, badge: offers.length },
    { id: 'applications', label: 'Candidatures', icon: Users, badge: applications.filter(a => a.status === 'pending').length },
  ];

  return (
    <DashboardShell
      accent={ACCENT} orbA="#d97706" orbB="#dc2626"
      roleLabel="Espace Employeur" roleIcon={Briefcase}
      user={user} navItems={tabs}
      activeTab={activeTab} setActiveTab={setActiveTab}
      onLogout={logout}
      data-testid="employer-dashboard"
    >
      {/* Modals */}
      {showCompanyForm && (
        <CompanyFormModal company={company} onClose={() => setShowCompanyForm(false)}
          onSave={async (data) => {
            try {
              const r = await axios.post(`${API}/employer/company`, data);
              setCompany(r.data); setShowCompanyForm(false); loadStats();
            } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
          }} />
      )}
      {showOfferForm && (
        <JobOfferFormModal key={editingOffer?.id || 'new'} offer={editingOffer} onClose={() => { setShowOfferForm(false); setEditingOffer(null); }}
          onSave={async (data) => {
            try {
              if (editingOffer) {
                await axios.put(`${API}/employer/job-offers/${editingOffer.id}`, data);
              } else {
                await axios.post(`${API}/employer/job-offers`, data);
              }
              setShowOfferForm(false); setEditingOffer(null); loadOffers(); loadStats();
            } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de l\'enregistrement'); }
          }} />
      )}
      {selectedApplication && (
        <ApplicationDetailModal app={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={handleApplicationStatus} />
      )}

      {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Offres totales" value={stats?.totalOffers || 0} icon={Briefcase} accent={ACCENT} />
              <StatCard label="Offres actives" value={stats?.approvedOffers || 0} icon={CheckCircle} accent="#10b981" />
              <StatCard label="En attente" value={stats?.pendingOffers || 0} icon={Clock} accent="#f59e0b" />
              <StatCard label="Candidatures" value={stats?.totalApplications || 0} icon={Users} accent="#8b5cf6" />
            </div>

            {stats !== null && !stats?.hasCompany && (
              <div className="rounded-2xl p-5 flex items-center gap-4 border"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}>
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-300">Complétez les informations de votre entreprise</p>
                  <p className="text-sm text-amber-400/70 mt-0.5">Renseignez votre profil entreprise avant de publier des offres.</p>
                </div>
                <button onClick={() => setActiveTab('company')}
                  className="px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap text-white"
                  style={{ backgroundColor: '#f59e0b' }}>
                  Compléter
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Publier une offre', icon: Briefcase, tab: 'offers' },
                { label: 'Voir les candidatures', icon: Users, tab: 'applications' },
              ].map(a => (
                <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                  className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-0.5 text-left group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}>
                      <a.icon size={16} style={{ color: ACCENT }} />
                    </div>
                    <span className="font-semibold text-white">{a.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Company Tab ── */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Informations de l'entreprise</h2>
              <button onClick={() => { loadCompany(); setShowCompanyForm(true); }}
                className="px-4 py-2 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2"
                data-testid="edit-company-btn">
                <Edit3 size={15} /> {company ? 'Modifier' : 'Renseigner'}
              </button>
            </div>
            {company ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {company.coverUrl && (
                  <div className="h-32 w-full overflow-hidden">
                    <img src={company.coverUrl} alt="Couverture" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-5">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 bg-[#1a56db]/10 rounded-xl flex items-center justify-center">
                        <Building2 size={28} className="text-[#1a56db]" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{company.companyName}</h3>
                      <p className="text-sm text-gray-500">{company.sector} · {company.city}, {company.country}</p>
                      {company.foundedYear && <p className="text-xs text-gray-400 mt-0.5">Fondée en {company.foundedYear}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-5 leading-relaxed">{company.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#1a56db] hover:underline">
                        <Globe size={14} /> {company.website.replace('https://', '')}
                      </a>
                    )}
                    {company.phone && <p className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} />{company.phone}</p>}
                    {company.email && <p className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} />{company.email}</p>}
                    {company.employeeCount && <p className="flex items-center gap-2 text-sm text-gray-600"><Users size={14} />{company.employeeCount} employés</p>}
                    {company.address && <p className="flex items-center gap-2 text-sm text-gray-600 col-span-2"><MapPin size={14} />{company.address}</p>}
                  </div>
                  {company.officialDocumentUrl && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Document officiel</p>
                      <a href={company.officialDocumentUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm hover:bg-green-100 transition-colors">
                        <FileText size={15} /> Voir le document officiel
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune information entreprise</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Renseignez les informations de votre entreprise pour publier des offres.</p>
                <button onClick={() => setShowCompanyForm(true)}
                  className="px-5 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">
                  Commencer
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Offers Tab ── */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mes Offres d'emploi ({offers.length})</h2>
              <button onClick={() => { setEditingOffer(null); setShowOfferForm(true); }}
                disabled={!stats?.hasCompany}
                className="px-4 py-2 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-40"
                data-testid="add-offer-btn"
                title={!stats?.hasCompany ? "Renseignez d'abord les infos entreprise" : ''}>
                <Plus size={15} /> Nouvelle offre
              </button>
            </div>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : offers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune offre publiée</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Créez votre première offre d'emploi.</p>
                {!stats?.hasCompany && <p className="text-xs text-amber-600 mb-3">Complétez d'abord les informations de votre entreprise.</p>}
                <button onClick={() => { if (stats?.hasCompany) setShowOfferForm(true); else setActiveTab('company'); }}
                  className="px-5 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">
                  {stats?.hasCompany ? 'Créer une offre' : "Compléter l'entreprise"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                    data-testid={`offer-card-${offer.id}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                            <p className="text-sm text-gray-500 mt-0.5">{offer.contractType} · {offer.location} · {offer.sector}</p>
                          </div>
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${offer.isApproved ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {offer.isApproved ? <><CheckCircle size={12} /> Active</> : <><Clock size={12} /> En validation</>}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{offer.applicationsCount || 0} candidature(s)</span>
                          {offer.deadline && <span>Clôture : {offer.deadline}</span>}
                          {offer.salary && <span>{offer.salary}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button onClick={() => { setEditingOffer(offer); setShowOfferForm(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        data-testid={`edit-offer-${offer.id}`}>
                        <Edit3 size={13} /> Modifier
                      </button>
                      <button onClick={() => handleDeleteOffer(offer.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        data-testid={`delete-offer-${offer.id}`}>
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Candidatures reçues ({applications.length})</h2>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune candidature reçue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const sc = statusConfig[app.status] || statusConfig.pending;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors"
                      onClick={() => setSelectedApplication(app)}
                      data-testid={`application-card-${app.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.applicantName}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">{app.jobTitle}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{app.applicantEmail} · {new Date(app.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 ${sc.color}`}>
                          <sc.icon size={12} /> {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DashboardShell>
  );
};

// ── Company Form Modal ─────────────────────────────────────────────────────────
const CompanyFormModal = ({ company, onClose, onSave }) => {
  const [form, setForm] = useState({
    companyName: company?.companyName || '',
    sector: company?.sector || '',
    description: company?.description || '',
    website: company?.website || '',
    address: company?.address || '',
    city: company?.city || '',
    country: company?.country || '',
    phone: company?.phone || '',
    email: company?.email || '',
    logoUrl: company?.logoUrl || '',
    coverUrl: company?.coverUrl || '',
    officialDocumentUrl: company?.officialDocumentUrl || '',
    foundedYear: company?.foundedYear || '',
    employeeCount: company?.employeeCount || '',
    socialLinkedIn: company?.socialLinkedIn || '',
    socialTwitter: company?.socialTwitter || '',
  });
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (field, file) => {
    setUploading(u => ({ ...u, [field]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd);
      set(field, r.data.url);
    } catch { alert('Erreur lors du téléversement'); }
    setUploading(u => ({ ...u, [field]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.sector || !form.description || !form.address || !form.city || !form.country || !form.phone || !form.email) {
      alert('Veuillez remplir tous les champs obligatoires'); return;
    }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl" style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">Informations de l'entreprise</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Logo + Cover */}
          <div className="grid grid-cols-2 gap-4">
            <UploadField label="Logo de l'entreprise" field="logoUrl" value={form.logoUrl} onUpload={handleUpload} uploading={uploading.logoUrl} accept="image/*" />
            <UploadField label="Image de couverture" field="coverUrl" value={form.coverUrl} onUpload={handleUpload} uploading={uploading.coverUrl} accept="image/*" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Nom de l'entreprise *"><input value={form.companyName} onChange={e => set('companyName', e.target.value)} className={inp} required /></F>
            <F label="Secteur d'activité *">
              <select value={form.sector} onChange={e => set('sector', e.target.value)} className={sel} required>
                <option value="">-- Secteur</option>
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </F>
          </div>

          <F label="Description *">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inp} required placeholder="Décrivez votre entreprise, sa mission, ses valeurs..." />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Adresse *"><input value={form.address} onChange={e => set('address', e.target.value)} className={inp} required /></F>
            <F label="Ville *"><input value={form.city} onChange={e => set('city', e.target.value)} className={inp} required /></F>
            <F label="Pays *"><input value={form.country} onChange={e => set('country', e.target.value)} className={inp} required /></F>
            <F label="Téléphone *"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} required /></F>
            <F label="Email de contact *"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inp} required /></F>
            <F label="Site web"><input value={form.website} onChange={e => set('website', e.target.value)} className={inp} placeholder="https://" /></F>
            <F label="Année de création"><input value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} className={inp} placeholder="2010" /></F>
            <F label="Nombre d'employés">
              <select value={form.employeeCount} onChange={e => set('employeeCount', e.target.value)} className={sel}>
                <option value="">--</option>
                {['1–10', '11–50', '51–200', '201–500', '500+'].map(v => <option key={v}>{v}</option>)}
              </select>
            </F>
          </div>

          {/* Document officiel */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
            <p className="text-sm font-semibold text-[#1a56db] mb-3 flex items-center gap-2"><FileText size={15} /> Document officiel de l'entreprise</p>
            <p className="text-xs text-gray-500 mb-3">KBIS, Registre de commerce, Statuts, ou tout document officiel prouvant l'existence légale de l'entreprise.</p>
            <UploadField label="Téléverser le document" field="officialDocumentUrl" value={form.officialDocumentUrl} onUpload={handleUpload} uploading={uploading.officialDocumentUrl} accept=".pdf,.doc,.docx,image/*" isDoc />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="LinkedIn"><input value={form.socialLinkedIn} onChange={e => set('socialLinkedIn', e.target.value)} className={inp} placeholder="https://linkedin.com/company/..." /></F>
            <F label="Twitter / X"><input value={form.socialTwitter} onChange={e => set('socialTwitter', e.target.value)} className={inp} placeholder="https://twitter.com/..." /></F>
          </div>
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" data-testid="save-company-btn">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

const F = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const UploadField = ({ label, field, value, onUpload, uploading, accept, isDoc }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {value ? (
      <div className="flex items-center gap-2">
        {isDoc ? (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 hover:bg-green-100">
            <FileText size={13} /> Document téléversé
          </a>
        ) : (
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
        )}
        <label className="text-xs text-[#1a56db] cursor-pointer hover:underline">
          Changer <input type="file" accept={accept} onChange={e => e.target.files[0] && onUpload(field, e.target.files[0])} className="hidden" />
        </label>
      </div>
    ) : (
      <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1a56db] transition-colors">
        {uploading ? (
          <><Loader2 size={14} className="animate-spin text-[#1a56db]" /> <span className="text-xs text-gray-500">Téléversement...</span></>
        ) : (
          <><Upload size={14} className="text-gray-400" /> <span className="text-xs text-gray-500">Cliquez pour {isDoc ? 'téléverser le document' : 'ajouter une image'}</span></>
        )}
        <input type="file" accept={accept} onChange={e => e.target.files[0] && onUpload(field, e.target.files[0])} className="hidden" disabled={uploading} />
      </label>
    )}
  </div>
);

// ── Job Offer Form Modal ───────────────────────────────────────────────────────
const JobOfferFormModal = ({ offer, onClose, onSave }) => {
  const defaultForm = {
    title: '', sector: '', contractType: '', location: '', country: '',
    salary: '', salaryMin: '', salaryMax: '', currency: 'EUR',
    description: '', missions: [''], requiredProfile: '',
    requiredSkills: [''], educationLevel: '', experienceRequired: '',
    benefits: [''], deadline: '', startDate: '', numberOfPositions: 1,
    languages: [''], remote: 'Non',
    whyJoinUs: '', workMode: 'Présentiel', workHours: '',
    workDays: '', contractDuration: '', conditions: '', positionType: 'Temps plein',
  };
  const [form, setForm] = useState(() => offer ? {
    ...defaultForm,
    ...offer,
    missions: offer.missions?.length ? offer.missions : [''],
    requiredSkills: offer.requiredSkills?.length ? offer.requiredSkills : [''],
    benefits: offer.benefits?.length ? offer.benefits : [''],
    languages: offer.languages?.length ? offer.languages : [''],
  } : defaultForm);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setArr = (k, i, v) => setForm(f => { const a = [...f[k]]; a[i] = v; return { ...f, [k]: a }; });
  const addArr = (k) => setForm(f => ({ ...f, [k]: [...f[k], ''] }));
  const remArr = (k, i) => setForm(f => ({ ...f, [k]: f[k].filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = {
      ...form,
      missions: form.missions.filter(Boolean),
      requiredSkills: form.requiredSkills.filter(Boolean),
      benefits: form.benefits.filter(Boolean),
      languages: form.languages.filter(Boolean),
      salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
      salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
      numberOfPositions: parseInt(form.numberOfPositions) || 1,
    };
    setLoading(true);
    await onSave(clean);
    setLoading(false);
  };

  const ArrayField = ({ label, k, placeholder }) => (
    <F label={label}>
      <div className="space-y-2">
        {form[k].map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={e => setArr(k, i, e.target.value)} className={inp} placeholder={placeholder} />
            {form[k].length > 1 && <button type="button" onClick={() => remArr(k, i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={14} /></button>}
          </div>
        ))}
        <button type="button" onClick={() => addArr(k)} className="text-xs text-[#1a56db] hover:underline flex items-center gap-1"><Plus size={12} /> Ajouter</button>
      </div>
    </F>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl" style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">{offer ? 'Modifier' : 'Nouvelle'} offre d'emploi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Titre du poste *"><input value={form.title} onChange={e => set('title', e.target.value)} className={inp} required placeholder="Ex: Développeur Full Stack" /></F>
            <F label="Secteur *">
              <select value={form.sector} onChange={e => set('sector', e.target.value)} className={sel} required>
                <option value="">-- Secteur</option>
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </F>
            <F label="Type de contrat *">
              <select value={form.contractType} onChange={e => set('contractType', e.target.value)} className={sel} required>
                <option value="">-- Contrat</option>
                {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </F>
            <F label="Localisation *"><input value={form.location} onChange={e => set('location', e.target.value)} className={inp} required placeholder="Ex: Paris 8e" /></F>
            <F label="Pays *"><input value={form.country} onChange={e => set('country', e.target.value)} className={inp} required placeholder="Ex: France" /></F>
            <F label="Télétravail">
              <select value={form.remote} onChange={e => set('remote', e.target.value)} className={sel}>
                {REMOTE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </F>
            <F label="Nombre de postes"><input type="number" min={1} value={form.numberOfPositions} onChange={e => set('numberOfPositions', parseInt(e.target.value) || 1)} className={inp} /></F>
            <F label="Niveau d'études requis *">
              <select value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)} className={sel} required>
                <option value="">-- Niveau</option>
                {EDU_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </F>
            <F label="Expérience requise *">
              <select value={form.experienceRequired} onChange={e => set('experienceRequired', e.target.value)} className={sel} required>
                <option value="">-- Expérience</option>
                {EXP_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </F>
            <F label="Salaire (texte libre)"><input value={form.salary} onChange={e => set('salary', e.target.value)} className={inp} placeholder="Ex: 2500–3000 € / mois" /></F>
            <F label="Salaire min."><input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} className={inp} placeholder="2500" /></F>
            <F label="Salaire max."><input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} className={inp} placeholder="3000" /></F>
            <F label="Devise">
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={sel}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </F>
            <F label="Date de clôture"><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={inp} /></F>
            <F label="Date de début souhaité"><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inp} /></F>
          </div>

          <F label="Description du poste *">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className={inp} required placeholder="Décrivez le contexte, l'équipe, les enjeux du poste..." />
          </F>

          <F label="Profil recherché *">
            <textarea value={form.requiredProfile} onChange={e => set('requiredProfile', e.target.value)} rows={3} className={inp} required placeholder="Décrivez le profil idéal : formation, personnalité, expérience..." />
          </F>

          <ArrayField label="Missions / Responsabilités" k="missions" placeholder="Ex: Développer les fonctionnalités front-end..." />
          <ArrayField label="Compétences requises" k="requiredSkills" placeholder="Ex: React, Python, Excel..." />
          <ArrayField label="Avantages / Bénéfices" k="benefits" placeholder="Ex: Mutuelle, RTT, télétravail..." />
          <ArrayField label="Langues requises" k="languages" placeholder="Ex: Français (courant), Anglais (B2)..." />

          {/* Section conditions de travail */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-bold text-gray-700 mb-3">Conditions de travail</p>
            <div className="grid grid-cols-2 gap-3">
              <F label="Type de poste">
                <select value={form.positionType} onChange={e => set('positionType', e.target.value)} className={sel}>
                  {POSITION_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </F>
              <F label="Mode de travail">
                <select value={form.workMode} onChange={e => set('workMode', e.target.value)} className={sel}>
                  {WORK_MODES.map(o => <option key={o}>{o}</option>)}
                </select>
              </F>
              <F label="Heures de travail"><input value={form.workHours} onChange={e => set('workHours', e.target.value)} className={inp} placeholder="Ex: 9h–18h (lundi–vendredi)" /></F>
              <F label="Jours de travail"><input value={form.workDays} onChange={e => set('workDays', e.target.value)} className={inp} placeholder="Ex: Lundi au vendredi" /></F>
              <F label="Durée du contrat"><input value={form.contractDuration} onChange={e => set('contractDuration', e.target.value)} className={inp} placeholder="Ex: 6 mois, 1 an, Indéterminé..." /></F>
            </div>
          </div>

          <F label="Pourquoi nous rejoindre ?">
            <textarea value={form.whyJoinUs} onChange={e => set('whyJoinUs', e.target.value)} rows={3} className={inp} placeholder="Décrivez l'ambiance d'équipe, les avantages uniques, la culture d'entreprise..." />
          </F>

          <F label="Conditions et exigences particulières">
            <textarea value={form.conditions} onChange={e => set('conditions', e.target.value)} rows={2} className={inp} placeholder="Ex: Permis de conduire requis, disponibilité immédiate, astreintes..." />
          </F>
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="save-offer-btn">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {offer ? 'Modifier' : 'Publier pour validation'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Application Detail Modal ───────────────────────────────────────────────────
const ApplicationDetailModal = ({ app, onClose, onStatusChange }) => {
  const sc = statusConfig[app.status] || statusConfig.pending;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-[#1a56db] to-[#2a5298] rounded-t-2xl">
          <div className="text-white">
            <h3 className="font-bold">{app.applicantName}</h3>
            <p className="text-blue-200 text-sm">{app.jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${sc.color}`}>
            <sc.icon size={16} /><span className="font-semibold text-sm">{sc.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-400 uppercase mb-0.5">Email</p><p className="font-medium">{app.applicantEmail}</p></div>
            <div><p className="text-xs text-gray-400 uppercase mb-0.5">Téléphone</p><p className="font-medium">{app.applicantPhone || '—'}</p></div>
            {app.availableFrom && <div><p className="text-xs text-gray-400 uppercase mb-0.5">Disponible le</p><p className="font-medium">{app.availableFrom}</p></div>}
            {app.expectedSalary && <div><p className="text-xs text-gray-400 uppercase mb-0.5">Salaire souhaité</p><p className="font-medium">{app.expectedSalary}</p></div>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Lettre de motivation</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{app.coverLetter}</p>
          </div>
          <div className="flex gap-3">
            {app.cvUrl && (
              <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">
                <FileText size={15} /> Voir le CV
              </a>
            )}
            {app.linkedinUrl && (
              <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100">
                <Globe size={15} /> LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={() => onStatusChange(app.id, 'reviewing')}
            className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl">En cours</button>
          <button onClick={() => onStatusChange(app.id, 'accepted')}
            className="flex-1 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-xl" data-testid={`accept-app-${app.id}`}>Accepter</button>
          <button onClick={() => onStatusChange(app.id, 'rejected')}
            className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl" data-testid={`reject-app-${app.id}`}>Rejeter</button>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;

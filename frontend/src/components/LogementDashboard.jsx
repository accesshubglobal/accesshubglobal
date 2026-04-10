import React, { useState, useEffect, useRef } from 'react';
import { Home, Plus, Edit3, Trash2, CheckCircle, Clock, Loader2, X, Upload, MapPin, DollarSign, BedDouble, Maximize, ChevronRight, AlertCircle, Building2, Wifi, Car, Shirt, UtensilsCrossed, Dumbbell, Package, FileText, Key, ShieldCheck, Eye, Download, Copy, MessageSquare, RefreshCw, Send, Phone, Mail, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardShell, { StatCard, AccentBtn } from './DashboardShell';
import { fixPdfUrl, downloadFile } from '../utils/fileUtils';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const ACCENT = '#0891b2';

const PROPERTY_TYPES = ['Studio', 'Appartement', 'Colocation', 'Résidence étudiante', 'Chambre privée', 'Maison'];
const AMENITIES_LIST = [
  { key: 'WiFi', icon: Wifi }, { key: 'Parking', icon: Car }, { key: 'Laverie', icon: Shirt },
  { key: 'Cuisine équipée', icon: UtensilsCrossed }, { key: 'Salle de sport', icon: Dumbbell },
  { key: 'Meublé', icon: Package }, { key: 'Gardien', icon: Building2 },
];

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 text-sm";

// ── Activation Code Gate ───────────────────────────────────────────────────────
const LogementActivationCodeGate = ({ user, onVerified, onLogout }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/logement/verify-login-code`,
        { code: code.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      sessionStorage.setItem(`logement_code_${user?.id}`, 'true');
      onVerified();
    } catch (err) {
      setError(err.response?.data?.detail || "Code incorrect.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#050d1a' }}>
      <div className="absolute pointer-events-none inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl animate-pulse" style={{ backgroundColor: ACCENT }} />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: '#0e7490', animation: 'pulse 4s ease-in-out 1.5s infinite' }} />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(8,145,178,0.15)' }}>
          <Key size={30} style={{ color: ACCENT }} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Vérification d'identité</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Saisissez votre <strong style={{ color: 'rgba(255,255,255,0.7)' }}>code d'activation logement</strong> (format LG-XXXXXXXX).<br />
          Ce code vous a été communiqué par l'administrateur.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="Ex : LG-XXXXXXXX"
            className="w-full px-4 py-3.5 rounded-2xl text-white text-center text-lg font-mono tracking-widest focus:outline-none transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            autoFocus
            data-testid="logement-activation-code-input"
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
            data-testid="logement-verify-code-btn">
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

// ── Property Form Modal ──────────────────────────────────────────────────────
const PropertyFormModal = ({ property, onClose, onSave }) => {
  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '', description: '', propertyType: 'Appartement',
    city: '', country: '', address: '', price: '', pricePeriod: 'mois',
    surface: '', rooms: 1, amenities: [], images: [], availableFrom: '', isAvailable: true,
    ...property,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files); if (!files.length) return;
    setUploading(true);
    const urls = [...form.images];
    for (const file of files) {
      try {
        const fd = new FormData(); fd.append('file', file);
        const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urls.push(r.data.url);
      } catch {}
    }
    set('images', urls); setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.city || !form.price) { alert('Remplissez les champs obligatoires'); return; }
    setSaving(true);
    try { await onSave({ ...form, price: parseFloat(form.price), surface: parseInt(form.surface) || 0, rooms: parseInt(form.rooms) || 1 }); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{property ? 'Modifier la propriété' : 'Ajouter une propriété'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Titre *</label>
            <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Studio meublé proche université" required />
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea className={`${inp} h-20 resize-none`} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Type de logement</label>
              <select className={inp} value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Disponible dès</label>
              <input type="date" className={inp} value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Ville *</label>
              <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Pays</label>
              <input className={inp} value={form.country} onChange={e => set('country', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Pièces</label>
              <input type="number" min="1" className={inp} value={form.rooms} onChange={e => set('rooms', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Prix *</label>
              <input type="number" className={inp} value={form.price} onChange={e => set('price', e.target.value)} required /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Période</label>
              <select className={inp} value={form.pricePeriod} onChange={e => set('pricePeriod', e.target.value)}>
                <option value="mois">/ mois</option><option value="semaine">/ semaine</option><option value="nuit">/ nuit</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Surface (m²)</label>
              <input type="number" className={inp} value={form.surface} onChange={e => set('surface', e.target.value)} /></div>
          </div>
          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Équipements</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(({ key, icon: AIcon }) => (
                <button key={key} type="button" onClick={() => toggleAmenity(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.amenities.includes(key) ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-cyan-300'}`}>
                  <AIcon size={11} /> {key}
                </button>
              ))}
            </div>
          </div>
          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Photos</label>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-cyan-400 text-sm transition-colors">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Ajouter des photos
            </button>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="avail" className="text-sm text-gray-700">Disponible actuellement</label>
          </div>
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button type="button" disabled={saving} onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: ACCENT }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ prop, onEdit, onDelete, onDuplicate }) => (
  <div className="rounded-2xl overflow-hidden border transition-all hover:-translate-y-0.5"
    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
    data-testid={`property-${prop.id}`}>
    {prop.images?.[0] ? (
      <div className="h-36 overflow-hidden"><img src={prop.images[0]} alt="" className="w-full h-full object-cover" /></div>
    ) : (
      <div className="h-36 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(6,182,212,0.1))' }}>
        <Home size={32} className="text-cyan-400/50" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{prop.title}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${prop.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {prop.isApproved ? 'Approuvé' : 'En attente'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/50 mb-3">
        <span className="flex items-center gap-1"><MapPin size={10} />{prop.city}{prop.country ? `, ${prop.country}` : ''}</span>
        <span className="flex items-center gap-1"><DollarSign size={10} />{prop.price} /{prop.pricePeriod}</span>
        {prop.surface > 0 && <span className="flex items-center gap-1"><Maximize size={10} />{prop.surface} m²</span>}
        <span className="flex items-center gap-1"><BedDouble size={10} />{prop.rooms} pièce{prop.rooms > 1 ? 's' : ''}</span>
      </div>
      {prop.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prop.amenities.slice(0, 3).map(a => (
            <span key={a} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(8,145,178,0.15)', color: '#22d3ee' }}>{a}</span>
          ))}
          {prop.amenities.length > 3 && <span className="text-white/30 text-[10px]">+{prop.amenities.length - 3}</span>}
        </div>
      )}
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button onClick={() => onEdit(prop)} className="flex-1 py-1.5 rounded-xl text-xs font-medium text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/10 transition-colors flex items-center justify-center gap-1">
          <Edit3 size={11} /> Modifier
        </button>
        <button onClick={() => onDuplicate(prop.id)} className="flex-1 py-1.5 rounded-xl text-xs font-medium text-purple-400 border border-purple-400/20 hover:bg-purple-400/10 transition-colors flex items-center justify-center gap-1"
          data-testid={`duplicate-property-${prop.id}`}>
          <Copy size={11} /> Dupliquer
        </button>
        <button onClick={() => onDelete(prop.id)} className="py-1.5 px-2 rounded-xl text-xs font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors flex items-center justify-center">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const LogementDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [docUploading, setDocUploading] = useState({});

  // Activation code gate
  const [codeVerified, setCodeVerified] = useState(() =>
    sessionStorage.getItem(`logement_code_${user?.id}`) === 'true'
  );

  const ax = () => axios.create({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Building2 },
    { id: 'properties', label: 'Mes annonces', icon: Home, badge: properties.length },
    { id: 'entreprise', label: 'Mon Entreprise', icon: Building2 },
    { id: 'demandes', label: 'Demandes', icon: MessageSquare, badge: inquiries.filter(i => !i.isRead).length || undefined },
    { id: 'contrat', label: 'Contrat', icon: FileText },
  ];

  const loadStats = async () => {
    try { const r = await ax().get(`${API}/logement/stats`); setStats(r.data); } catch {}
  };
  const loadProperties = async () => {
    try { const r = await ax().get(`${API}/logement/properties`); setProperties(r.data); } catch {}
  };
  const loadContract = async () => {
    try { const r = await ax().get(`${API}/logement/contract`); setContractData(r.data); } catch {}
  };
  const loadInquiries = async () => {
    try { const r = await ax().get(`${API}/logement/inquiries`); setInquiries(r.data); } catch {}
  };
  const loadProfile = async () => {
    try { const r = await ax().get(`${API}/logement/profile`); setProfile(r.data); } catch {}
  };

  useEffect(() => { loadStats(); loadProperties(); loadInquiries(); loadProfile(); }, []);
  useEffect(() => {
    if (activeTab === 'properties') loadProperties();
    if (activeTab === 'dashboard') { loadStats(); loadInquiries(); }
    if (activeTab === 'contrat') loadContract();
    if (activeTab === 'demandes') loadInquiries();
    if (activeTab === 'entreprise') loadProfile();
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!codeVerified) {
    return (
      <LogementActivationCodeGate
        user={user}
        onVerified={() => setCodeVerified(true)}
        onLogout={handleLogout}
      />
    );
  }

  const handleSave = async (data) => {
    if (editingProp) { await ax().put(`${API}/logement/properties/${editingProp.id}`, data); }
    else { await ax().post(`${API}/logement/properties`, data); }
    setShowForm(false); setEditingProp(null); loadProperties(); loadStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette propriété ?')) return;
    await ax().delete(`${API}/logement/properties/${id}`);
    loadProperties(); loadStats();
  };

  const handleDuplicate = async (id) => {
    try {
      await ax().post(`${API}/logement/properties/${id}/duplicate`);
      loadProperties(); loadStats();
    } catch { alert('Erreur lors de la duplication'); }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setProfileSaving(true);
    try {
      await ax().put(`${API}/logement/profile`, profile);
      alert('Informations enregistrées avec succès !');
    } catch { alert('Erreur lors de la sauvegarde'); }
    setProfileSaving(false);
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0]; if (!file) return;
    setDocUploading(d => ({ ...d, [docType]: true }));
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = r.data.url;
      const nameKey = docType === 'officialDocUrl' ? 'officialDocName' : 'idDocName';
      const updated = { ...profile, [docType]: url, [nameKey]: file.name };
      setProfile(updated);
      await ax().put(`${API}/logement/profile`, { [docType]: url, [nameKey]: file.name });
    } catch { alert('Erreur lors du téléchargement'); }
    setDocUploading(d => ({ ...d, [docType]: false }));
  };

  const profileComplete = profile?.companyName && profile?.officialDocUrl && profile?.idDocUrl;

  return (
    <DashboardShell
      accent={ACCENT} orbA="#0891b2" orbB="#0e7490"
      roleLabel="Espace Logement" roleIcon={Home}
      user={user} navItems={tabs}
      activeTab={activeTab} setActiveTab={setActiveTab}
      onLogout={handleLogout}
      data-testid="logement-dashboard">

      {showForm && (
        <PropertyFormModal
          property={editingProp}
          onClose={() => { setShowForm(false); setEditingProp(null); }}
          onSave={handleSave}
        />
      )}

      {/* ── Dashboard Tab ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Profile incomplete warning */}
          {!profileComplete && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
              style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-300 font-semibold text-sm">Informations entreprise incomplètes</p>
                <p className="text-amber-400/70 text-xs mt-0.5">Complétez votre profil entreprise avec les documents obligatoires pour publier des annonces.</p>
              </div>
              <button onClick={() => setActiveTab('entreprise')}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 flex-shrink-0">
                Compléter
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Propriétés" value={stats?.total || 0} icon={Home} accent={ACCENT} />
            <StatCard label="Approuvées" value={stats?.approved || 0} icon={CheckCircle} accent="#10b981" />
            <StatCard label="En attente" value={stats?.pending || 0} icon={Clock} accent="#f59e0b" />
            <StatCard label="Demandes" value={inquiries.length} icon={MessageSquare} accent="#8b5cf6" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Ajouter une annonce', icon: Plus, action: () => { setEditingProp(null); setShowForm(true); } },
              { label: 'Gérer mes annonces', icon: Home, action: () => setActiveTab('properties') },
              { label: 'Voir les demandes', icon: MessageSquare, action: () => setActiveTab('demandes') },
              { label: 'Mon contrat', icon: FileText, action: () => setActiveTab('contrat') },
            ].map((a, i) => (
              <button key={i} onClick={a.action}
                className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-0.5 text-left group"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(8,145,178,0.15)' }}>
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

      {/* ── Properties Tab ── */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-sm">{properties.length} annonce{properties.length !== 1 ? 's' : ''}</p>
            <AccentBtn accent={ACCENT} onClick={() => { setEditingProp(null); setShowForm(true); }} data-testid="add-property-btn">
              <Plus size={15} /> Ajouter
            </AccentBtn>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
              <Home className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-medium">Aucune annonce</p>
              <p className="text-white/25 text-sm mt-1">Ajoutez votre première annonce</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <PropertyCard key={p.id} prop={p}
                  onEdit={(p) => { setEditingProp(p); setShowForm(true); }}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mon Entreprise Tab ── */}
      {activeTab === 'entreprise' && profile !== null && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Mon Entreprise</h2>

          {/* Infos générales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Building2 size={16} className="text-cyan-600" /> Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'companyName', label: 'Nom de l\'entreprise *', placeholder: 'Mon Logement Pro' },
                { key: 'companyAddress', label: 'Adresse', placeholder: '123 rue de la Paix' },
                { key: 'companyCity', label: 'Ville', placeholder: 'Paris' },
                { key: 'companyCountry', label: 'Pays', placeholder: 'France' },
                { key: 'companyWebsite', label: 'Site web', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400"
                    value={profile[key] || ''} onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                    placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none"
                  value={profile.companyDescription || ''} onChange={e => setProfile({ ...profile, companyDescription: e.target.value })}
                  placeholder="Décrivez votre activité..." />
              </div>
            </div>
          </div>

          {/* Documents obligatoires */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <FileText size={16} className="text-cyan-600" /> Documents obligatoires
            </h3>
            <p className="text-xs text-gray-500">Ces documents sont obligatoires pour activer votre compte et publier des annonces.</p>

            {[
              { key: 'officialDocUrl', nameKey: 'officialDocName', label: 'Document officiel d\'activité *', desc: 'Kbis, extrait registre commerce, récépissé, etc.' },
              { key: 'idDocUrl', nameKey: 'idDocName', label: 'Pièce d\'identité *', desc: 'Passeport, carte nationale d\'identité en cours de validité' },
            ].map(({ key, nameKey, label, desc }) => (
              <div key={key} className={`border-2 border-dashed rounded-2xl p-4 transition-colors ${profile[key] ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    {profile[key] && (
                      <a href={profile[key]} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline mt-1 flex items-center gap-1">
                        <Eye size={11} /> {profile[nameKey] || 'Document téléchargé'} — voir
                      </a>
                    )}
                  </div>
                  <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${profile[key] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}`}>
                    {docUploading[key] ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {profile[key] ? 'Remplacer' : 'Téléverser'}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => handleDocUpload(e, key)} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleProfileSave} disabled={profileSaving}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
            data-testid="save-logement-profile-btn">
            {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Enregistrer mes informations
          </button>
        </div>
      )}

      {/* ── Demandes Tab ── */}
      {activeTab === 'demandes' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Demandes de logement ({inquiries.length})</h2>
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune demande reçue</p>
              <p className="text-xs text-gray-400 mt-1">Les demandes de contact pour vos annonces apparaîtront ici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map(inq => (
                <div key={inq.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-cyan-100 transition-colors"
                  data-testid={`inquiry-${inq.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{inq.name}</p>
                        {!inq.isRead && <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-[10px] rounded-full font-bold">Nouveau</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Annonce : <span className="font-medium text-gray-700">{inq.propertyTitle}</span></p>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{inq.message}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                        {inq.email && <span className="flex items-center gap-1"><Mail size={11} />{inq.email}</span>}
                        {inq.phone && <span className="flex items-center gap-1"><Phone size={11} />{inq.phone}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{new Date(inq.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contrat Tab ── */}
      {activeTab === 'contrat' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Mon Contrat</h2>
          {contractData?.contractUrl ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={28} className="text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{contractData.contractName || 'Contrat Logement'}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {contractData.contractUploadedAt
                      ? `Mis à jour le ${new Date(contractData.contractUploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : 'Document PDF'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Contrat de partenariat logement AccessHub Global</p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <a href={fixPdfUrl(contractData.contractUrl)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                  data-testid="view-logement-contract-btn">
                  <Eye size={15} /> Visualiser
                </a>
                <button onClick={() => downloadFile(contractData.contractUrl, contractData.contractName || 'contrat-logement.pdf')}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                  data-testid="download-logement-contract-btn">
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
    </DashboardShell>
  );
};

export default LogementDashboard;

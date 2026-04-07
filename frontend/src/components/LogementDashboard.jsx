import React, { useState, useEffect, useRef } from 'react';
import { Home, Plus, Edit3, Trash2, CheckCircle, Clock, Loader2, X, Upload, MapPin, DollarSign, BedDouble, Maximize, ChevronRight, AlertCircle, Building2, Wifi, Car, Shirt, UtensilsCrossed, Dumbbell, Package } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardShell, { StatCard, AccentBtn } from './DashboardShell';

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
const PropertyCard = ({ prop, onEdit, onDelete }) => (
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
        <button onClick={() => onDelete(prop.id)} className="flex-1 py-1.5 rounded-xl text-xs font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-1">
          <Trash2 size={11} /> Supprimer
        </button>
      </div>
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const LogementDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProp, setEditingProp] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Building2 },
    { id: 'properties', label: 'Mes propriétés', icon: Home, badge: properties.length },
  ];

  const loadStats = async () => {
    try { const r = await axios.get(`${API}/logement/stats`); setStats(r.data); } catch {}
  };
  const loadProperties = async () => {
    try { const r = await axios.get(`${API}/logement/properties`); setProperties(r.data); } catch {}
  };

  useEffect(() => { loadStats(); loadProperties(); }, []);
  useEffect(() => { if (activeTab === 'properties') loadProperties(); if (activeTab === 'dashboard') loadStats(); }, [activeTab]);

  const handleSave = async (data) => {
    if (editingProp) { await axios.put(`${API}/logement/properties/${editingProp.id}`, data); }
    else { await axios.post(`${API}/logement/properties`, data); }
    setShowForm(false); setEditingProp(null); loadProperties(); loadStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette propriété ?')) return;
    await axios.delete(`${API}/logement/properties/${id}`);
    loadProperties(); loadStats();
  };

  return (
    <DashboardShell
      accent={ACCENT} orbA="#0891b2" orbB="#0e7490"
      roleLabel="Espace Logement" roleIcon={Home}
      user={user} navItems={tabs}
      activeTab={activeTab} setActiveTab={setActiveTab}
      onLogout={logout}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Propriétés" value={stats?.total || 0} icon={Home} accent={ACCENT} />
            <StatCard label="Approuvées" value={stats?.approved || 0} icon={CheckCircle} accent="#10b981" />
            <StatCard label="En attente" value={stats?.pending || 0} icon={Clock} accent="#f59e0b" />
            <StatCard label="Disponibles" value={stats?.available || 0} icon={MapPin} accent="#8b5cf6" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Ajouter une propriété', icon: Plus, action: () => { setShowForm(true); } },
              { label: 'Gérer mes annonces', icon: Home, action: () => setActiveTab('properties') },
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
            <p className="text-white/50 text-sm">{properties.length} propriété{properties.length !== 1 ? 's' : ''}</p>
            <AccentBtn accent={ACCENT} onClick={() => { setEditingProp(null); setShowForm(true); }} data-testid="add-property-btn">
              <Plus size={15} /> Ajouter
            </AccentBtn>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
              <Home className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-medium">Aucune propriété</p>
              <p className="text-white/25 text-sm mt-1">Ajoutez votre première annonce</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <PropertyCard key={p.id} prop={p}
                  onEdit={(p) => { setEditingProp(p); setShowForm(true); }}
                  onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
};

export default LogementDashboard;

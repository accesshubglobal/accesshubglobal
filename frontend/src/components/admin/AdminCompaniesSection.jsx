import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Plus, Edit3, Trash2, Globe, MapPin, Phone, Mail,
  Upload, X, Loader2, CheckCircle, Star, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

// ── Image upload helper (same pattern as other admin sections) ──────────────
const ImageUploadField = ({ label, value, onChange, placeholder }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(r.data.url);
    } catch { alert('Erreur upload'); }
    setUploading(false);
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2">
        <input type="text" className={`${inp} flex-1`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'URL de l\'image'} />
        <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 flex-shrink-0 flex items-center gap-1.5 text-sm">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload
        </button>
      </div>
      {value && (
        <img src={value} alt="" className="mt-2 h-16 rounded-xl object-cover border border-gray-100" />
      )}
    </div>
  );
};

// ── Company Form Modal ──────────────────────────────────────────────────────
const CompanyFormModal = ({ company, isMain, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', description: '', logo: '', coverUrl: '',
    website: '', sector: '', city: '', country: '',
    email: '', phone: '', isMain: isMain || false, isActive: true,
    ...company,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Le nom est requis'); return; }
    setSaving(true);
    try { await onSave(form); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {company ? 'Modifier l\'entreprise' : isMain ? 'Configurer AccessHub Global' : 'Ajouter une entreprise'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nom de l'entreprise *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex : AccessHub Global" required />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={`${inp} h-24 resize-none`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Décrivez l'entreprise..." />
          </div>
          <ImageUploadField label="Logo" value={form.logo} onChange={v => set('logo', v)} placeholder="URL du logo" />
          <ImageUploadField label="Image de couverture" value={form.coverUrl} onChange={v => set('coverUrl', v)} placeholder="URL de la couverture" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Secteur</label>
              <input className={inp} value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="Ex : Éducation" />
            </div>
            <div>
              <label className={labelCls}>Site web</label>
              <input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Pays</label>
              <input className={inp} value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Visible sur le site</label>
          </div>
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button type="button" disabled={saving} onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Section ──────────────────────────────────────────────────────
const AdminCompaniesSection = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formIsMain, setFormIsMain] = useState(false);

  const mainCompany = companies.find(c => c.isMain);
  const otherCompanies = companies.filter(c => !c.isMain);

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/admin/featured-companies`);
      setCompanies(r.data);
    } catch {}
    setLoading(false);
  };

  const openForm = (company = null, isMain = false) => {
    setEditingCompany(company);
    setFormIsMain(isMain);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    if (editingCompany) {
      await axios.put(`${API}/admin/featured-companies/${editingCompany.id}`, data);
    } else {
      await axios.post(`${API}/admin/featured-companies`, data);
    }
    setShowForm(false);
    setEditingCompany(null);
    loadCompanies();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette entreprise ?')) return;
    await axios.delete(`${API}/admin/featured-companies/${id}`);
    loadCompanies();
  };

  return (
    <div className="space-y-6" data-testid="admin-companies-section">
      {showForm && (
        <CompanyFormModal
          company={editingCompany}
          isMain={formIsMain}
          onClose={() => { setShowForm(false); setEditingCompany(null); }}
          onSave={handleSave}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { id: 'main', label: 'AccessHub Global', icon: Star },
          { id: 'others', label: 'Autres entreprises', icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-[#1a56db] text-[#1a56db]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#1a56db]" /></div>
      ) : (
        <>
          {/* ── AccessHub Global tab ── */}
          {activeTab === 'main' && (
            <div className="space-y-4">
              {mainCompany ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {mainCompany.coverUrl && (
                    <div className="h-32 w-full overflow-hidden">
                      <img src={mainCompany.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {mainCompany.logo ? (
                        <img src={mainCompany.logo} alt="" className="w-16 h-16 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0">
                          <Building2 size={28} className="text-[#1a56db]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{mainCompany.name}</h3>
                          <span className="px-2 py-0.5 bg-[#1a56db] text-white text-[10px] rounded-full font-bold">Principal</span>
                        </div>
                        {mainCompany.sector && <p className="text-sm text-gray-500 mb-2">{mainCompany.sector}</p>}
                        {mainCompany.description && <p className="text-sm text-gray-600 mb-3">{mainCompany.description}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {mainCompany.city && <span className="flex items-center gap-1"><MapPin size={12} /> {mainCompany.city}, {mainCompany.country}</span>}
                          {mainCompany.website && <a href={mainCompany.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1a56db] hover:underline"><Globe size={12} /> {mainCompany.website}</a>}
                          {mainCompany.email && <span className="flex items-center gap-1"><Mail size={12} /> {mainCompany.email}</span>}
                          {mainCompany.phone && <span className="flex items-center gap-1"><Phone size={12} /> {mainCompany.phone}</span>}
                        </div>
                      </div>
                      <button onClick={() => openForm(mainCompany, true)}
                        className="p-2 text-gray-400 hover:text-[#1a56db] hover:bg-blue-50 rounded-xl transition-colors">
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="font-semibold text-amber-800 mb-1">AccessHub Global n'est pas encore configuré</p>
                  <p className="text-sm text-amber-600 mb-4">Ajoutez les informations de votre entreprise pour qu'elle apparaisse en avant sur le site.</p>
                  <button onClick={() => openForm(null, true)}
                    className="px-5 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:opacity-90"
                    data-testid="configure-main-company-btn">
                    Configurer AccessHub Global
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Other companies tab ── */}
          {activeTab === 'others' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{otherCompanies.length} entreprise{otherCompanies.length !== 1 ? 's' : ''} partenaire{otherCompanies.length !== 1 ? 's' : ''}</p>
                <button onClick={() => openForm(null, false)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:opacity-90"
                  data-testid="add-company-btn">
                  <Plus size={15} /> Ajouter une entreprise
                </button>
              </div>

              {otherCompanies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                  <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucune entreprise partenaire</p>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter" pour afficher des entreprises sur le site.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {otherCompanies.map(company => (
                    <div key={company.id}
                      className={`bg-white rounded-2xl border p-5 flex gap-4 items-start transition-all ${company.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}
                      data-testid={`company-row-${company.id}`}>
                      {company.logo ? (
                        <img src={company.logo} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Building2 size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">{company.name}</p>
                          {!company.isActive && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Masqué</span>}
                        </div>
                        {company.sector && <p className="text-xs text-gray-400">{company.sector}</p>}
                        {company.city && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {company.city}, {company.country}</p>}
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1a56db] hover:underline flex items-center gap-1 mt-0.5">
                            <Globe size={10} /> {company.website}
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openForm(company, false)}
                          className="p-1.5 text-gray-400 hover:text-[#1a56db] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(company.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCompaniesSection;

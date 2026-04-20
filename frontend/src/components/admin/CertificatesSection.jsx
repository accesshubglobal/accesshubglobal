import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Award, GraduationCap, Upload, X, ImageIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const UploadField = ({ label, value, onChange, token }) => {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.post(`${API}/upload`, fd, { headers });
      onChange(data.url || data.secure_url || '');
    } catch {
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {value ? (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Cliquez pour uploader une photo</span>
            </>
          )}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

const AddModal = ({ type, onClose, onSave, token }) => {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', university: '', year: '' });
  const [saving, setSaving] = useState(false);

  const isCert = type === 'certificate';
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.imageUrl) { alert('Titre et image requis'); return; }
    setSaving(true);
    try {
      const ep = isCert ? '/admin/certificates' : '/admin/admissions';
      const { data } = await axios.post(`${API}${ep}`, form, { headers: { Authorization: `Bearer ${token}` } });
      onSave(data);
      onClose();
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {isCert ? 'Ajouter un certificat' : 'Ajouter une admission'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {isCert ? 'Titre du certificat *' : 'Titre de l\'admission *'}
            </label>
            <input value={form.title} onChange={e => setF('title', e.target.value)}
              placeholder={isCert ? 'Certificat d\'excellence académique' : 'Admission — Université de Beijing'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          {!isCert && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Université</label>
                <input value={form.university} onChange={e => setF('university', e.target.value)}
                  placeholder="Université de Paris-Sorbonne"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Année</label>
                <input value={form.year} onChange={e => setF('year', e.target.value)}
                  placeholder="2025"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setF('description', e.target.value)}
              placeholder="Description optionnelle..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          <UploadField
            label="Photo du certificat *"
            value={form.imageUrl}
            onChange={v => setF('imageUrl', v)}
            token={token}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Sauvegarde...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemGrid = ({ items, onDelete, emptyIcon: EmptyIcon, emptyText, isCert }) => (
  <div>
    {items.length === 0 ? (
      <div className="text-center py-16">
        <EmptyIcon size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{emptyText}</p>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {item.imageUrl ? (
              <div className="relative h-44 overflow-hidden bg-gray-50">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain p-2" />
                <button
                  onClick={() => onDelete(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="h-44 bg-gray-50 flex items-center justify-center">
                <ImageIcon size={32} className="text-gray-200" />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{item.title}</h4>
              {!isCert && item.university && (
                <p className="text-xs text-blue-600 font-medium mb-1">{item.university} {item.year && `— ${item.year}`}</p>
              )}
              {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CertificatesSection = ({ token }) => {
  const [tab, setTab] = useState('certificates');
  const [certs, setCerts] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'certificate' | 'admission'

  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        axios.get(`${API}/admin/certificates`, { headers }),
        axios.get(`${API}/admin/admissions`, { headers }),
      ]);
      setCerts(c.data);
      setAdmissions(a.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, type) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      await axios.delete(`${API}/admin/${type === 'cert' ? 'certificates' : 'admissions'}/${id}`, { headers });
      type === 'cert' ? setCerts(c => c.filter(x => x.id !== id)) : setAdmissions(a => a.filter(x => x.id !== id));
    } catch { alert('Erreur lors de la suppression'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Certificats & Admissions</h1>
          <p className="text-gray-500 text-sm">Gérez les certificats d'honneur et les admissions affichés sur la page À propos.</p>
        </div>
        <button
          onClick={() => setShowModal(tab === 'certificates' ? 'certificate' : 'admission')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          data-testid="add-cert-btn"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'certificates', label: 'Certificats', icon: Award, count: certs.length },
          { id: 'admissions', label: 'Admissions', icon: GraduationCap, count: admissions.length },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              data-testid={`tab-${t.id}`}
            >
              <Icon size={14} /> {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'certificates' ? (
        <ItemGrid items={certs} onDelete={id => handleDelete(id, 'cert')} emptyIcon={Award} emptyText="Aucun certificat. Ajoutez votre premier certificat d'honneur." isCert />
      ) : (
        <ItemGrid items={admissions} onDelete={id => handleDelete(id, 'adm')} emptyIcon={GraduationCap} emptyText="Aucune admission. Ajoutez une admission obtenue pour vos étudiants." isCert={false} />
      )}

      {showModal && (
        <AddModal
          type={showModal}
          token={token}
          onClose={() => setShowModal(null)}
          onSave={(item) => {
            showModal === 'certificate' ? setCerts(c => [item, ...c]) : setAdmissions(a => [item, ...a]);
          }}
        />
      )}
    </div>
  );
};

export default CertificatesSection;

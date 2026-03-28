import React, { useState, useEffect } from 'react';
import { FileText, Save, ArrowLeft, Plus, Trash2, Edit, ChevronRight, Building, Shield, ScrollText, Lock, BookOpen } from 'lucide-react';
import axios, { API } from './adminApi';

const PAGE_META = {
  about: { label: 'À propos', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  company: { label: "Informations entreprise", icon: Building, color: 'bg-purple-50 text-purple-600' },
  legal: { label: 'Mentions légales', icon: Shield, color: 'bg-green-50 text-green-600' },
  privacy: { label: 'Politique de confidentialité', icon: Lock, color: 'bg-orange-50 text-orange-600' },
  terms: { label: "Conditions d'utilisation", icon: ScrollText, color: 'bg-red-50 text-red-600' },
};

// ===== ABOUT PAGE EDITOR =====
const AboutEditor = ({ data, onChange }) => {
  const s = data.sections || {};
  const update = (key, val) => onChange({ ...data, sections: { ...s, [key]: val } });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Titre</label><input value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Sous-titre</label><input value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
      </div>

      {/* History */}
      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Histoire</legend>
        <input value={s.history?.title || ''} onChange={e => update('history', { ...s.history, title: e.target.value })} placeholder="Titre" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
        <textarea value={s.history?.content || ''} onChange={e => update('history', { ...s.history, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
      </fieldset>

      {/* Mission */}
      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Mission</legend>
        <input value={s.mission?.title || ''} onChange={e => update('mission', { ...s.mission, title: e.target.value })} placeholder="Titre" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
        <textarea value={s.mission?.content || ''} onChange={e => update('mission', { ...s.mission, content: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none mb-3" />
        <p className="text-xs font-medium text-gray-500 mb-2">Piliers</p>
        {(s.mission?.pillars || []).map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={p.title} onChange={e => { const arr = [...(s.mission?.pillars || [])]; arr[i] = { ...arr[i], title: e.target.value }; update('mission', { ...s.mission, pillars: arr }); }} className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Titre" />
            <input value={p.desc} onChange={e => { const arr = [...(s.mission?.pillars || [])]; arr[i] = { ...arr[i], desc: e.target.value }; update('mission', { ...s.mission, pillars: arr }); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Description" />
            <button onClick={() => update('mission', { ...s.mission, pillars: (s.mission?.pillars || []).filter((_, j) => j !== i) })} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => update('mission', { ...s.mission, pillars: [...(s.mission?.pillars || []), { title: '', desc: '' }] })} className="text-xs text-blue-600 hover:underline">+ Ajouter un pilier</button>
      </fieldset>

      {/* Values */}
      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Valeurs</legend>
        {(s.values || []).map((v, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={v.title} onChange={e => { const arr = [...(s.values || [])]; arr[i] = { ...arr[i], title: e.target.value }; onChange({ ...data, sections: { ...s, values: arr } }); }} className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Titre" />
            <textarea value={v.desc} onChange={e => { const arr = [...(s.values || [])]; arr[i] = { ...arr[i], desc: e.target.value }; onChange({ ...data, sections: { ...s, values: arr } }); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} placeholder="Description" />
            <button onClick={() => onChange({ ...data, sections: { ...s, values: (s.values || []).filter((_, j) => j !== i) } })} className="p-2 text-red-400 hover:text-red-600 self-start"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange({ ...data, sections: { ...s, values: [...(s.values || []), { title: '', desc: '' }] } })} className="text-xs text-blue-600 hover:underline">+ Ajouter une valeur</button>
      </fieldset>

      {/* Team */}
      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Équipe</legend>
        {(s.team || []).map((m, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2 space-y-2">
            <div className="flex gap-2">
              <input value={m.name} onChange={e => { const arr = [...(s.team || [])]; arr[i] = { ...arr[i], name: e.target.value }; update('team', arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nom" />
              <input value={m.role} onChange={e => { const arr = [...(s.team || [])]; arr[i] = { ...arr[i], role: e.target.value }; update('team', arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Rôle" />
              <button onClick={() => update('team', (s.team || []).filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <textarea value={m.desc} onChange={e => { const arr = [...(s.team || [])]; arr[i] = { ...arr[i], desc: e.target.value }; update('team', arr); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} placeholder="Description" />
          </div>
        ))}
        <button onClick={() => update('team', [...(s.team || []), { name: '', role: '', desc: '' }])} className="text-xs text-blue-600 hover:underline">+ Ajouter un membre</button>
      </fieldset>

      {/* Services */}
      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Services</legend>
        {(s.services || []).map((sv, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={sv.title} onChange={e => { const arr = [...(s.services || [])]; arr[i] = { ...arr[i], title: e.target.value }; update('services', arr); }} className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Titre" />
            <textarea value={sv.desc} onChange={e => { const arr = [...(s.services || [])]; arr[i] = { ...arr[i], desc: e.target.value }; update('services', arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} placeholder="Description" />
            <button onClick={() => update('services', (s.services || []).filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600 self-start"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => update('services', [...(s.services || []), { title: '', desc: '' }])} className="text-xs text-blue-600 hover:underline">+ Ajouter un service</button>
      </fieldset>
    </div>
  );
};

// ===== COMPANY PAGE EDITOR =====
const CompanyEditor = ({ data, onChange }) => {
  const s = data.sections || {};
  const updateField = (section, key, val) => onChange({ ...data, sections: { ...s, [section]: { ...(s[section] || {}), [key]: val } } });
  const updateArr = (key, val) => onChange({ ...data, sections: { ...s, [key]: val } });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Titre</label><input value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Sous-titre</label><input value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
      </div>

      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Identification</legend>
        <div className="grid grid-cols-2 gap-3">
          {[['name', 'Raison sociale'], ['registration', "N° d'immatriculation"], ['director', 'Dirigeant'], ['email', 'Email'], ['founded', 'Année de création'], ['sector', "Secteur d'activité"]].map(([k, l]) => (
            <div key={k}><label className="block text-xs font-medium text-gray-500 mb-1">{l}</label><input value={s.identity?.[k] || ''} onChange={e => updateField('identity', k, e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          ))}
        </div>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Sièges</legend>
        {(s.offices || []).map((o, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2 grid grid-cols-2 gap-2">
            <input value={o.country} onChange={e => { const arr = [...(s.offices || [])]; arr[i] = { ...arr[i], country: e.target.value }; updateArr('offices', arr); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Pays" />
            <input value={o.flag || ''} onChange={e => { const arr = [...(s.offices || [])]; arr[i] = { ...arr[i], flag: e.target.value }; updateArr('offices', arr); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Emoji drapeau" />
            <input value={o.address} onChange={e => { const arr = [...(s.offices || [])]; arr[i] = { ...arr[i], address: e.target.value }; updateArr('offices', arr); }} className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Adresse" />
            <input value={o.label || ''} onChange={e => { const arr = [...(s.offices || [])]; arr[i] = { ...arr[i], label: e.target.value }; updateArr('offices', arr); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Label" />
            <button onClick={() => updateArr('offices', (s.offices || []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs text-right">Supprimer</button>
          </div>
        ))}
        <button onClick={() => updateArr('offices', [...(s.offices || []), { country: '', flag: '', address: '', label: '' }])} className="text-xs text-blue-600 hover:underline">+ Ajouter un siège</button>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Départements</legend>
        {(s.departments || []).map((d, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={d.title} onChange={e => { const arr = [...(s.departments || [])]; arr[i] = { ...arr[i], title: e.target.value }; updateArr('departments', arr); }} className="w-1/3 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Titre" />
            <input value={d.desc} onChange={e => { const arr = [...(s.departments || [])]; arr[i] = { ...arr[i], desc: e.target.value }; updateArr('departments', arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Description" />
            <button onClick={() => updateArr('departments', (s.departments || []).filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => updateArr('departments', [...(s.departments || []), { title: '', desc: '' }])} className="text-xs text-blue-600 hover:underline">+ Ajouter</button>
      </fieldset>

      <fieldset className="border border-gray-200 rounded-xl p-5">
        <legend className="text-sm font-semibold text-gray-700 px-2">Chiffres clés</legend>
        {(s.stats || []).map((st, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={st.number} onChange={e => { const arr = [...(s.stats || [])]; arr[i] = { ...arr[i], number: e.target.value }; updateArr('stats', arr); }} className="w-1/4 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nombre" />
            <input value={st.label} onChange={e => { const arr = [...(s.stats || [])]; arr[i] = { ...arr[i], label: e.target.value }; updateArr('stats', arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Label" />
            <button onClick={() => updateArr('stats', (s.stats || []).filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => updateArr('stats', [...(s.stats || []), { number: '', label: '' }])} className="text-xs text-blue-600 hover:underline">+ Ajouter</button>
      </fieldset>

      {/* Clients & Partners as text lists */}
      {['clients', 'partners'].map(listKey => (
        <fieldset key={listKey} className="border border-gray-200 rounded-xl p-5">
          <legend className="text-sm font-semibold text-gray-700 px-2">{listKey === 'clients' ? 'Clients' : 'Partenaires'}</legend>
          {(s[listKey] || []).map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={item} onChange={e => { const arr = [...(s[listKey] || [])]; arr[i] = e.target.value; updateArr(listKey, arr); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button onClick={() => updateArr(listKey, (s[listKey] || []).filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => updateArr(listKey, [...(s[listKey] || []), ''])} className="text-xs text-blue-600 hover:underline">+ Ajouter</button>
        </fieldset>
      ))}
    </div>
  );
};

// ===== LEGAL/PRIVACY/TERMS EDITOR (sections with heading + content) =====
const SectionsEditor = ({ data, onChange }) => {
  const sections = data.sections || [];
  const updateSection = (i, key, val) => {
    const arr = [...sections]; arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, sections: arr });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Titre</label><input value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Sous-titre</label><input value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
      </div>
      {sections.map((sec, i) => (
        <fieldset key={i} className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <input value={sec.heading} onChange={e => updateSection(i, 'heading', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium" placeholder="Titre de section" />
            <button onClick={() => onChange({ ...data, sections: sections.filter((_, j) => j !== i) })} className="ml-2 p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
          <textarea value={sec.content} onChange={e => updateSection(i, 'content', e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" placeholder="Contenu..." />
        </fieldset>
      ))}
      <button onClick={() => onChange({ ...data, sections: [...sections, { heading: '', content: '' }] })} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Plus size={14} /> Ajouter une section</button>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const PagesSection = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { loadPages(); }, []);

  const loadPages = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/pages`); setPages(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const startEditing = (page) => {
    setEditing(page.slug);
    setEditData(JSON.parse(JSON.stringify(page)));
    setSaveMsg('');
  };

  const savePage = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.put(`${API}/admin/pages/${editing}`, editData);
      setSaveMsg('Sauvegardé avec succès');
      loadPages();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveMsg('Erreur lors de la sauvegarde'); console.error(err); }
    setSaving(false);
  };

  if (editing && editData) {
    const meta = PAGE_META[editing];
    const Icon = meta?.icon || FileText;

    return (
      <div className="space-y-4" data-testid="pages-editor">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditing(null); setEditData(null); }} className="p-2 hover:bg-gray-100 rounded-lg" data-testid="pages-back-btn"><ArrowLeft size={20} /></button>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta?.color || 'bg-gray-100 text-gray-600'}`}><Icon size={18} /></div>
            <h3 className="font-semibold text-gray-900">{meta?.label || editing}</h3>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className={`text-sm ${saveMsg.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>{saveMsg}</span>}
            <button onClick={savePage} disabled={saving} data-testid="pages-save-btn" className="flex items-center gap-2 bg-[#1a56db] text-white px-5 py-2 rounded-lg hover:bg-[#1648b8] disabled:opacity-50 transition-colors">
              <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
          {(editing === 'about') && <AboutEditor data={editData} onChange={setEditData} />}
          {(editing === 'company') && <CompanyEditor data={editData} onChange={setEditData} />}
          {['legal', 'privacy', 'terms'].includes(editing) && <SectionsEditor data={editData} onChange={setEditData} />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="pages-admin-section">
      <h3 className="font-semibold text-gray-900 text-lg">Pages Institutionnelles</h3>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PAGE_META).map(([slug, meta]) => {
            const page = pages.find(p => p.slug === slug);
            const Icon = meta.icon;
            return (
              <div key={slug} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#1a56db]/20 hover:shadow-md transition-all cursor-pointer overflow-hidden" onClick={() => startEditing(page || { slug, ...meta })} data-testid={`page-card-${slug}`}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}><Icon size={20} /></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{meta.label}</h4>
                      <p className="text-xs text-gray-400">/{slug}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                  {page?.updatedAt && <p className="text-xs text-gray-400">Modifié le {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PagesSection;

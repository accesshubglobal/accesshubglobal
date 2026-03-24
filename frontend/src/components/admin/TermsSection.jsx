import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import axios from './adminApi';

const TermsSection = () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/payment-settings`); setSettings(res.data); setTerms(res.data.termsConditions || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try { await axios.post(`${API}/admin/payment-settings`, { ...settings, termsConditions: terms }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  if (!settings && loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="terms-conditions-section">
      <div><h3 className="font-semibold text-gray-900">Conditions Générales de Candidature</h3></div>
      <p className="text-sm text-gray-500">Ces conditions seront affichées aux candidats avant de soumettre leur candidature.</p>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Aperçu pour le candidat</p>
          <div className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
            {terms.map((t, i) => <p key={i}><strong>{i + 1}. {t.title || '(sans titre)'}</strong> — {t.content || '(vide)'}</p>)}
            {terms.length === 0 && <p className="text-gray-400 italic">Aucune condition définie</p>}
          </div>
        </div>

        <div className="space-y-3">
          {terms.map((term, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50" data-testid={`term-item-${idx}`}>
              <div className="flex items-start gap-3">
                <span className="text-sm font-bold text-gray-400 mt-2">{idx + 1}.</span>
                <div className="flex-1 space-y-2">
                  <input type="text" value={term.title} onChange={(e) => { const u = [...terms]; u[idx] = { ...u[idx], title: e.target.value }; setTerms(u); }} placeholder="Titre de la condition" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] font-medium text-sm" />
                  <textarea value={term.content} onChange={(e) => { const u = [...terms]; u[idx] = { ...u[idx], content: e.target.value }; setTerms(u); }} placeholder="Contenu de la condition" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] text-sm resize-none" />
                </div>
                <button type="button" onClick={() => setTerms(terms.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setTerms([...terms, { title: '', content: '' }])} data-testid="add-term-btn" className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors flex items-center justify-center gap-2">
          <Plus size={16} /> Ajouter une condition
        </button>

        <button onClick={handleSave} disabled={loading} data-testid="save-terms-btn" className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : saved ? <><Check size={18} /> Enregistré</> : 'Enregistrer les conditions'}
        </button>
      </div>
    </div>
  );
};

export default TermsSection;

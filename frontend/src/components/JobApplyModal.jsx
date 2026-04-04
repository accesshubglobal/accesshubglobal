import React, { useState, useRef } from 'react';
import { Briefcase, Upload, X, Loader2, Send, CheckCircle, FileText, Globe } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const JobApplyModal = ({ offer, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    coverLetter: '',
    cvUrl: '',
    portfolioUrl: '',
    linkedinUrl: '',
    availableFrom: '',
    expectedSalary: '',
  });
  const [uploading, setUploading] = useState(false);
  const [cvFileName, setCvFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [needLogin, setNeedLogin] = useState(!user);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCvUpload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post(`${API}/upload`, fd);
      set('cvUrl', r.data.url);
      setCvFileName(file.name);
    } catch { setError('Erreur lors du téléversement du CV'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cvUrl) { setError('Veuillez téléverser votre CV'); return; }
    if (!form.coverLetter.trim()) { setError('La lettre de motivation est obligatoire'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/job-applications`, {
        jobOfferId: offer.id,
        ...form,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la soumission');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Candidature envoyée !</h3>
          <p className="text-gray-600 text-sm">Votre candidature a été transmise à <strong>{offer.companyName}</strong>. Vous recevrez une réponse dans les meilleurs délais.</p>
          <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">Fermer</button>
        </div>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <Briefcase className="w-12 h-12 text-[#1a56db] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h3>
          <p className="text-gray-600 text-sm mb-5">Vous devez être connecté pour postuler à une offre d'emploi.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
            <button onClick={() => window.location.href = '/'} className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium">Se connecter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-[#1a56db] to-[#2a5298] rounded-t-2xl">
          <div className="text-white">
            <h3 className="font-bold">Postuler</h3>
            <p className="text-blue-200 text-sm">{offer.title} · {offer.companyName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* CV Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">CV *</label>
            {form.cvUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <FileText size={16} className="text-green-600" />
                <span className="text-sm text-green-700 flex-1 truncate">{cvFileName || 'CV téléversé'}</span>
                <button type="button" onClick={() => { set('cvUrl', ''); setCvFileName(''); }} className="text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1a56db] transition-colors">
                {uploading ? (
                  <><Loader2 size={24} className="animate-spin text-[#1a56db]" /><span className="text-sm text-gray-500">Téléversement...</span></>
                ) : (
                  <><Upload size={24} className="text-gray-300" /><span className="text-sm text-gray-500">Cliquez pour téléverser votre CV</span><span className="text-xs text-gray-400">PDF, DOC, DOCX</span></>
                )}
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files[0] && handleCvUpload(e.target.files[0])} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Lettre de motivation *</label>
            <textarea value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)} rows={5} required
              placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm resize-none"
              data-testid="cover-letter-input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
              <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Portfolio</label>
              <input value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Disponible à partir du</label>
              <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salaire souhaité</label>
              <input value={form.expectedSalary} onChange={e => set('expectedSalary', e.target.value)}
                placeholder="Ex: 2500 € / mois"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm" />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        </form>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-[#1a56db] to-[#2a5298] text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="submit-job-application">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Envoyer ma candidature
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobApplyModal;

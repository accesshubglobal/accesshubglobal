import React, { useState, useEffect } from 'react';
import {
  Briefcase, Users, Plus, Key, Trash2, CheckCircle, XCircle, Clock,
  Copy, Building2, FileText, Globe, Eye, EyeOff, RefreshCw, X, Upload, Loader2, Edit2, Search
} from 'lucide-react';
import axios from 'axios';
import { EmployerReviewModal } from './ReviewModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EmployersSection = () => {
  const [employers, setEmployers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('employers');
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [contractModal, setContractModal] = useState(null);
  const [contractUrl, setContractUrl] = useState('');
  const [contractName, setContractName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editCodeModal, setEditCodeModal] = useState(null);
  const [newEmployerCode, setNewEmployerCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [emp, cd] = await Promise.allSettled([
      axios.get(`${API}/admin/employers`),
      axios.get(`${API}/admin/employer-codes`),
    ]);
    if (emp.status === 'fulfilled') setEmployers(emp.value.data);
    if (cd.status === 'fulfilled') setCodes(cd.value.data);
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    try {
      const r = await axios.post(`${API}/admin/employer-codes`);
      setCodes(prev => [r.data, ...prev]);
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm('Supprimer ce code ?')) return;
    try { await axios.delete(`${API}/admin/employer-codes/${codeId}`); setCodes(prev => prev.filter(c => c.id !== codeId)); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleApprove = async (employerId) => {
    try {
      await axios.put(`${API}/admin/employers/${employerId}/approve`);
      setEmployers(prev => prev.map(e => e.id === employerId ? { ...e, isApproved: true, pendingCompanyUpdate: false } : e));
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleReject = async (employerId) => {
    try {
      await axios.put(`${API}/admin/employers/${employerId}/reject`);
      setEmployers(prev => prev.map(e => e.id === employerId ? { ...e, isApproved: false, isActive: false } : e));
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openContractModal = (emp) => {
    setContractModal(emp);
    setContractUrl(emp.contractUrl || '');
    setContractName(emp.contractName || 'Contrat Employeur');
  };

  const handleContractUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContractUrl(r.data.url);
      setContractName(file.name.replace(/\.[^.]+$/, ''));
    } catch { alert('Erreur lors du téléchargement'); }
    setUploading(false);
  };

  const saveContract = async () => {
    if (!contractModal || !contractUrl) return;
    try {
      await axios.put(`${API}/admin/employers/${contractModal.id}/contract`, { contractUrl, contractName });
      setContractModal(null); loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const openEditCode = (emp) => {
    setEditCodeModal(emp);
    setNewEmployerCode(emp.employerCode || '');
  };

  const saveEmployerCode = async () => {
    if (!editCodeModal || !newEmployerCode.trim()) return;
    try {
      const r = await axios.put(`${API}/admin/employers/${editCodeModal.id}/login-code`, { employerCode: newEmployerCode.trim().toUpperCase() });
      setEditCodeModal(null); loadData();
      alert(`Code mis à jour : ${r.data.employerCode}`);
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const pendingEmployers = employers.filter(e => !e.isApproved && e.isActive !== false);

  return (
    <>
    <div className="space-y-6" data-testid="employers-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partenaires d'emploi</h2>
          <p className="text-gray-500 text-sm mt-0.5">{employers.length} employeur(s) · {pendingEmployers.length} en attente</p>
        </div>
        <button onClick={loadData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'employers', label: `Employeurs (${employers.length})`, icon: Users },
          { id: 'codes', label: `Codes d'activation (${codes.length})`, icon: Key },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <t.icon size={15} /> {t.label}
            {t.id === 'employers' && pendingEmployers.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">{pendingEmployers.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Employers Tab */}
      {tab === 'employers' && (
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center"><div className="animate-spin w-6 h-6 border-2 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div></div>
          ) : employers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun employeur</p>
            </div>
          ) : (
            employers.map(emp => (
              <div key={emp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {emp.isApproved ? 'Approuvé' : 'En attente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{emp.email} · {emp.company || emp.companyName}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>{emp.jobOffersCount || 0} offre(s)</span>
                      <span>{emp.approvedOffersCount || 0} active(s)</span>
                      {emp.hasCompanyInfo && <span className="text-green-600 flex items-center gap-1"><Building2 size={11} /> Infos complétées</span>}
                      {emp.pendingCompanyUpdate && <span className="text-amber-600 font-medium">MAJ en attente de validation</span>}
                    </div>
                    {/* Code de connexion */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">Code connexion :</span>
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 rounded text-xs font-mono text-amber-800 font-semibold">
                        {emp.employerCode || '—'}
                      </span>
                      {emp.employerCode && (
                        <button onClick={() => { navigator.clipboard.writeText(emp.employerCode); setCopiedId(emp.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="p-0.5 hover:text-amber-600 transition-colors" title="Copier">
                          {copiedId === emp.id ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400" />}
                        </button>
                      )}
                      <button onClick={() => openEditCode(emp)}
                        className="p-0.5 hover:text-amber-600 transition-colors" title="Modifier le code">
                        <Edit2 size={12} className="text-gray-400 hover:text-amber-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!emp.isApproved && (
                      <button onClick={() => setReviewModal(emp.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-xl"
                        data-testid={`review-employer-${emp.id}`}>
                        <CheckCircle size={13} /> Voir & Approuver
                      </button>
                    )}
                    {emp.isApproved && emp.pendingCompanyUpdate && (
                      <button onClick={() => setReviewModal(emp.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
                        data-testid={`reapprove-employer-${emp.id}`}>
                        <CheckCircle size={13} /> Voir & Re-approuver
                      </button>
                    )}
                    <button onClick={() => openContractModal(emp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl"
                      data-testid={`contract-employer-${emp.id}`}>
                      <FileText size={13} /> {emp.contractUrl ? 'Contrat ✓' : 'Contrat'}
                    </button>
                    <button onClick={() => handleReject(emp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                      data-testid={`reject-employer-${emp.id}`}>
                      <XCircle size={13} /> {emp.isApproved ? 'Désactiver' : 'Rejeter'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Codes Tab */}
      {tab === 'codes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={handleGenerateCode}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90"
              data-testid="generate-employer-code-btn">
              <Plus size={15} /> Générer un code
            </button>
          </div>
          {codes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Key className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun code généré</p>
            </div>
          ) : (
            codes.map(code => (
              <div key={code.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-lg font-bold text-[#1e3a5f] tracking-wider">{code.code}</code>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${code.isUsed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {code.isUsed ? 'Utilisé' : 'Disponible'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Créé le {new Date(code.createdAt).toLocaleDateString('fr-FR')}
                    {code.usedBy && ` · Utilisé par ${code.usedBy.substring(0, 8)}...`}
                    {code.expiresAt && ` · Expire le ${new Date(code.expiresAt).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!code.isUsed && (
                    <button onClick={() => copyCode(code.code)}
                      className="p-2 text-[#1e3a5f] hover:bg-blue-50 rounded-xl"
                      title="Copier le code" data-testid={`copy-employer-code-${code.id}`}>
                      {copiedCode === code.code ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  )}
                  <button onClick={() => handleDeleteCode(code.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                    data-testid={`delete-employer-code-${code.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {/* ── Edit Code Modal ── */}
    {editCodeModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Code de connexion employeur</h3>
              <p className="text-xs text-gray-400 mt-0.5">{editCodeModal.firstName} {editCodeModal.lastName}</p>
            </div>
            <button onClick={() => setEditCodeModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
              <strong>Comment ça marche :</strong> Ce code est demandé à l'employeur à chaque connexion. Modifiez-le si besoin et communiquez-lui le nouveau code.
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nouveau code de connexion</label>
              <div className="flex gap-2">
                <input value={newEmployerCode} onChange={e => setNewEmployerCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-100 uppercase"
                  placeholder="Ex: EMP-NOUVEAU" />
                <button onClick={() => setNewEmployerCode(`EMP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors" title="Générer">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditCodeModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={saveEmployerCode} disabled={!newEmployerCode.trim()}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-40"
                data-testid="save-employer-code-btn">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Contract Modal ── */}
    {contractModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Contrat de {contractModal.firstName} {contractModal.lastName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Téléversez le PDF du contrat employeur</p>
            </div>
            <button onClick={() => setContractModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom du contrat</label>
              <input value={contractName} onChange={e => setContractName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Ex: Contrat partenariat 2025" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fichier PDF *</label>
              <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${contractUrl ? 'border-green-300 bg-green-50 text-green-700' : 'border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
                {uploading ? <Loader2 size={15} className="animate-spin" /> : contractUrl ? <FileText size={15} /> : <Upload size={15} />}
                {contractUrl ? 'PDF téléchargé — Cliquer pour remplacer' : 'Téléverser le contrat (PDF)'}
                <input type="file" className="hidden" onChange={handleContractUpload} accept=".pdf" />
              </label>
              {contractUrl && <a href={contractUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"><FileText size={11} /> Voir le contrat actuel</a>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setContractModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={saveContract} disabled={!contractUrl || uploading}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40"
                data-testid="save-employer-contract-btn">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Review Modal ── */}
    {reviewModal && (
      <EmployerReviewModal
        employerId={reviewModal}
        onClose={() => setReviewModal(null)}
        onApprove={async (id) => { await axios.put(`${API}/admin/employers/${id}/approve`); loadData(); }}
        onReject={async (id) => { await axios.put(`${API}/admin/employers/${id}/reject`); loadData(); }}
      />
    )}
  </>
  );
};

export default EmployersSection;

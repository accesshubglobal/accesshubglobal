import React, { useState, useEffect } from 'react';
import {
  Briefcase, Users, Plus, Key, Trash2, CheckCircle, XCircle, Clock,
  Copy, Building2, FileText, Globe, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const EmployersSection = () => {
  const [employers, setEmployers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('employers');
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);

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
      setEmployers(prev => prev.map(e => e.id === employerId ? { ...e, isApproved: true } : e));
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

  const pendingEmployers = employers.filter(e => !e.isApproved && e.isActive !== false);

  return (
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
                      {emp.hasCompanyInfo && <span className="text-green-600 flex items-center gap-1"><Building2 size={11} /> Infos entreprise complétées</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!emp.isApproved && (
                      <button onClick={() => handleApprove(emp.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-xl"
                        data-testid={`approve-employer-${emp.id}`}>
                        <CheckCircle size={13} /> Approuver
                      </button>
                    )}
                    <button onClick={() => handleReject(emp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                      data-testid={`reject-employer-${emp.id}`}>
                      <XCircle size={13} /> Rejeter
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
  );
};

export default EmployersSection;

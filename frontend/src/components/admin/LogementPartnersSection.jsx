import React, { useState, useEffect, useRef } from 'react';
import { Home, CheckCircle, XCircle, Trash2, Eye, Building2, MapPin, Clock, User, RefreshCw, FileText, Upload, X, Loader2, Copy, Edit2, Key } from 'lucide-react';
import axiosInstance, { API } from './adminApi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Badge = ({ status }) => {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const labels = { approved: 'Approuvé', pending: 'En attente', rejected: 'Refusé' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const LogementPartnersSection = () => {
  const [tab, setTab] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Contract modal
  const [contractModal, setContractModal] = useState(null);
  const [contractUrl, setContractUrl] = useState('');
  const [contractName, setContractName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Code modal
  const [editCodeModal, setEditCodeModal] = useState(null);
  const [newLogementCode, setNewLogementCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, propRes] = await Promise.all([
        axiosInstance.get(`${API}/admin/logement-partners`),
        axiosInstance.get(`${API}/admin/logement-properties`),
      ]);
      setPartners(pRes.data);
      setProperties(propRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const approvePartner = async (id) => {
    await axiosInstance.put(`${API}/admin/logement-partners/${id}/approve`);
    loadData();
  };

  const rejectPartner = async (id) => {
    if (!window.confirm('Refuser ce partenaire ?')) return;
    await axiosInstance.put(`${API}/admin/logement-partners/${id}/reject`);
    loadData();
  };

  const approveProperty = async (id) => {
    await axiosInstance.put(`${API}/admin/logement-properties/${id}/approve`);
    loadData();
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Supprimer cette propriété ?')) return;
    await axiosInstance.delete(`${API}/admin/logement-properties/${id}`);
    loadData();
  };

  // ── Contract handlers ──
  const openContractModal = (partner) => {
    setContractModal(partner);
    setContractUrl(partner.contractUrl || '');
    setContractName(partner.contractName || 'Contrat Logement');
  };

  const handleContractUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axiosInstance.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContractUrl(r.data.url); setContractName(file.name.replace(/\.[^.]+$/, ''));
    } catch { alert('Erreur lors du téléchargement'); }
    setUploading(false);
  };

  const saveContract = async () => {
    if (!contractModal || !contractUrl) return;
    await axiosInstance.put(`${API}/admin/logement-partners/${contractModal.id}/contract`, { contractUrl, contractName });
    setContractModal(null); loadData();
  };

  // ── Code handlers ──
  const openEditCode = (partner) => {
    setEditCodeModal(partner);
    setNewLogementCode(partner.logementCode || '');
  };

  const saveLogementCode = async () => {
    if (!editCodeModal || !newLogementCode.trim()) return;
    const r = await axiosInstance.put(`${API}/admin/logement-partners/${editCodeModal.id}/login-code`, { logementCode: newLogementCode.trim().toUpperCase() });
    setEditCodeModal(null); loadData();
    alert(`Code mis à jour : ${r.data.logementCode}`);
  };

  const pendingCount = partners.filter(p => !p.isApproved).length;
  const pendingProps = properties.filter(p => !p.isApproved).length;

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Partenaires Logement</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les partenaires logement et leurs propriétés</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Rafraîchir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Partenaires total', value: partners.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En attente d\'approbation', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Propriétés à valider', value: pendingProps, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'partners', label: `Partenaires (${partners.length})` },
          { id: 'properties', label: `Propriétés (${properties.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Partners Tab */}
      {tab === 'partners' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {partners.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Home size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucun partenaire logement inscrit</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Partenaire', 'Entreprise', 'Contact', 'Inscrit le', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {partners.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-xs font-bold">
                          {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.companyName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-4 py-3"><Badge status={p.isApproved ? 'approved' : 'pending'} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Code connexion */}
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-cyan-50 border border-cyan-100 rounded text-xs font-mono text-cyan-800 font-semibold">
                            {p.logementCode || '—'}
                          </span>
                          {p.logementCode && (
                            <button onClick={() => { navigator.clipboard.writeText(p.logementCode); setCopiedId(p.id); setTimeout(() => setCopiedId(null), 2000); }}
                              className="p-0.5 hover:text-cyan-600" title="Copier">
                              {copiedId === p.id ? <CheckCircle size={11} className="text-green-500" /> : <Copy size={11} className="text-gray-400" />}
                            </button>
                          )}
                          <button onClick={() => openEditCode(p)} className="p-0.5 hover:text-cyan-600" title="Modifier">
                            <Edit2 size={11} className="text-gray-400" />
                          </button>
                        </div>
                        {!p.isApproved && (
                          <button onClick={() => approvePartner(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                            data-testid={`approve-logement-${p.id}`}>
                            <CheckCircle size={12} /> Approuver
                          </button>
                        )}
                        {p.isApproved && (
                          <>
                            <button onClick={() => openContractModal(p)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                              data-testid={`contract-logement-${p.id}`}>
                              <FileText size={12} /> {p.contractUrl ? 'Contrat ✓' : 'Contrat'}
                            </button>
                            <button onClick={() => rejectPartner(p.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium">
                              <XCircle size={12} /> Révoquer
                            </button>
                          </>
                        )}
                        {p.officialDocUrl && (
                          <a href={p.officialDocUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">
                            <Eye size={12} /> Doc
                          </a>
                        )}
                        {p.companyDoc && (
                          <a href={p.companyDoc} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">
                            <Eye size={12} /> Doc
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Properties Tab */}
      {tab === 'properties' && (
        <div className="grid gap-4">
          {properties.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucune propriété soumise</p>
            </div>
          ) : (
            properties.map(prop => (
              <div key={prop.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                {/* Image */}
                {prop.images?.[0] ? (
                  <img src={prop.images[0]} alt={prop.title} className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-28 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Home size={24} className="text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{prop.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={11} />{prop.city}, {prop.country}</span>
                        <span className="flex items-center gap-1"><User size={11} />{prop.companyName}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{new Date(prop.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-gray-900">{prop.price}€/{prop.pricePeriod}</span>
                        <span className="text-xs text-gray-400">{prop.propertyType}</span>
                        <span className="text-xs text-gray-400">{prop.surface}m² · {prop.rooms} pièce(s)</span>
                      </div>
                    </div>
                    <Badge status={prop.isApproved ? 'approved' : 'pending'} />
                  </div>

                  {prop.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{prop.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {!prop.isApproved && (
                      <button onClick={() => approveProperty(prop.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                        data-testid={`approve-property-${prop.id}`}>
                        <CheckCircle size={12} /> Approuver
                      </button>
                    )}
                    <button onClick={() => deleteProperty(prop.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
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
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Code de connexion logement</h3>
            <button onClick={() => setEditCodeModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500">{editCodeModal.firstName} {editCodeModal.lastName} — {editCodeModal.companyName}</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Code de connexion</label>
              <div className="flex gap-2">
                <input value={newLogementCode} onChange={e => setNewLogementCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-100 uppercase"
                  placeholder="LG-NOUVEAU1" />
                <button onClick={() => setNewLogementCode(`LG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600" title="Générer">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditCodeModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
              <button onClick={saveLogementCode} disabled={!newLogementCode.trim()}
                className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 disabled:opacity-40"
                data-testid="save-logement-code-btn">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Contract Modal ── */}
    {contractModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Contrat — {contractModal.firstName} {contractModal.lastName}</h3>
            <button onClick={() => setContractModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom du contrat</label>
              <input value={contractName} onChange={e => setContractName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-100"
                placeholder="Contrat logement 2025" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fichier PDF *</label>
              <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer text-sm transition-colors ${contractUrl ? 'border-green-300 bg-green-50 text-green-700' : 'border-dashed border-gray-200 text-gray-500 hover:border-cyan-300 hover:text-cyan-500'}`}>
                {uploading ? <Loader2 size={15} className="animate-spin" /> : contractUrl ? <FileText size={15} /> : <Upload size={15} />}
                {contractUrl ? 'PDF téléchargé — Cliquer pour remplacer' : 'Téléverser le contrat (PDF)'}
                <input type="file" className="hidden" onChange={handleContractUpload} accept=".pdf" />
              </label>
              {contractUrl && <a href={contractUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-cyan-600 hover:underline"><FileText size={11} /> Voir le contrat actuel</a>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setContractModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
              <button onClick={saveContract} disabled={!contractUrl || uploading}
                className="flex-1 py-2.5 bg-cyan-700 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40"
                data-testid="save-logement-contract-btn">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default LogementPartnersSection;

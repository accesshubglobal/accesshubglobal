import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Trash2, Key, Copy, UserCheck, FileText, Upload, Loader2 } from 'lucide-react';
import axios, { API } from './adminApi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AgentsSection = ({ onBadgeUpdate }) => {
  const [agents, setAgents] = useState([]);
  const [agentCodes, setAgentCodes] = useState([]);
  const [agentTab, setAgentTab] = useState('agents');
  const [contractModal, setContractModal] = useState(null); // agent being edited
  const [contractUrl, setContractUrl] = useState('');
  const [contractName, setContractName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadAgents(); loadAgentCodes(); }, []);

  const loadAgents = async () => {
    try {
      const res = await axios.get(`${API}/admin/agents`);
      setAgents(res.data);
      onBadgeUpdate?.('pendingAgents', res.data.filter(a => !a.isApproved).length);
    } catch (err) { console.error(err); }
  };

  const loadAgentCodes = async () => {
    try {
      const res = await axios.get(`${API}/admin/agent-codes`);
      setAgentCodes(res.data);
    } catch (err) { console.error(err); }
  };

  const generateAgentCode = async () => {
    try {
      await axios.post(`${API}/admin/agent-codes`);
      loadAgentCodes();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const deleteAgentCode = async (id) => {
    if (!window.confirm('Supprimer ce code ?')) return;
    try {
      await axios.delete(`${API}/admin/agent-codes/${id}`);
      loadAgentCodes();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const approveAgent = async (id) => {
    try {
      await axios.put(`${API}/admin/agents/${id}/approve`);
      loadAgents();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const rejectAgent = async (id) => {
    if (!window.confirm('Rejeter cet agent ?')) return;
    try {
      await axios.put(`${API}/admin/agents/${id}/reject`);
      loadAgents();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const openContractModal = (agent) => {
    setContractModal(agent);
    setContractUrl(agent.contractUrl || '');
    setContractName(agent.contractName || 'Contrat Agent');
  };

  const handleContractUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContractUrl(r.data.url);
      setContractName(file.name.replace(/\.[^.]+$/, ''));
    } catch { alert('Erreur lors du téléchargement du fichier'); }
    setUploading(false);
  };

  const saveContract = async () => {
    if (!contractModal || !contractUrl) return;
    try {
      await axios.put(`${API}/admin/agents/${contractModal.id}/contract`, { contractUrl, contractName });
      setContractModal(null);
      loadAgents();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  return (
    <>
    <div className="space-y-6" data-testid="agents-admin-section">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Gestion des Agents</h3>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'agents', label: 'Agents', count: agents.length },
          { id: 'codes', label: 'Codes d\'activation', count: agentCodes.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setAgentTab(tab.id)} data-testid={`agent-tab-${tab.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              agentTab === tab.id ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {agentTab === 'agents' && (
        <div className="space-y-3">
          {agents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <UserCheck size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Aucun agent inscrit</p>
            </div>
          ) : agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-2xl shadow-sm p-5" data-testid={`agent-card-${agent.id}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                  agent.isApproved ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-amber-500 to-amber-700'
                }`}>
                  {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-sm">{agent.firstName} {agent.lastName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      agent.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {agent.isApproved ? 'Approuve' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{agent.email} {agent.company ? `| ${agent.company}` : ''}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {agent.studentsCount || 0} etudiants | {agent.applicationsCount || 0} candidatures | Code: {agent.agentCode || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!agent.isApproved && (
                    <button onClick={() => approveAgent(agent.id)} data-testid={`approve-agent-${agent.id}`}
                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 flex items-center gap-1">
                      <Check size={14} /> Approuver
                    </button>
                  )}
                  <button onClick={() => openContractModal(agent)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center gap-1"
                    data-testid={`contract-agent-${agent.id}`} title="Gérer le contrat">
                    <FileText size={14} /> {agent.contractUrl ? 'Contrat ✓' : 'Contrat'}
                  </button>
                  <button onClick={() => rejectAgent(agent.id)} data-testid={`reject-agent-${agent.id}`}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                    <X size={14} /> {agent.isApproved ? 'Desactiver' : 'Rejeter'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {agentTab === 'codes' && (
        <div className="space-y-4">
          <button onClick={generateAgentCode} data-testid="generate-agent-code-btn"
            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
            <Key size={16} /> Generer un code
          </button>
          {agentCodes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Key size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Aucun code genere</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agentCodes.map(code => (
                <div key={code.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between" data-testid={`agent-code-${code.id}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${code.isUsed ? 'bg-gray-300' : 'bg-green-400'}`} />
                    <div>
                      <p className="font-mono font-bold text-sm text-gray-900">{code.code}</p>
                      <p className="text-[11px] text-gray-400">
                        Cree le {new Date(code.createdAt).toLocaleDateString('fr-FR')}
                        {code.isUsed ? ` | Utilise` : ` | Expire le ${new Date(code.expiresAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!code.isUsed && (
                      <button onClick={() => { navigator.clipboard.writeText(code.code); alert('Code copie !'); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Copier">
                        <Copy size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteAgentCode(code.id)} data-testid={`delete-code-${code.id}`}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* ── Contract Modal ── */}
    {contractModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Contrat de {contractModal.firstName} {contractModal.lastName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Téléversez le PDF du contrat agent</p>
            </div>
            <button onClick={() => setContractModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom du contrat</label>
              <input value={contractName} onChange={e => setContractName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Ex: Contrat de partenariat 2025" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fichier PDF *</label>
              <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${contractUrl ? 'border-green-300 bg-green-50 text-green-700' : 'border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
                {uploading ? <Loader2 size={15} className="animate-spin" /> : contractUrl ? <FileText size={15} /> : <Upload size={15} />}
                {contractUrl ? 'PDF téléchargé — Cliquer pour remplacer' : 'Téléverser le contrat (PDF)'}
                <input type="file" className="hidden" onChange={handleContractUpload} accept=".pdf" />
              </label>
              {contractUrl && (
                <a href={contractUrl} target="_blank" rel="noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <FileText size={11} /> Voir le contrat actuel
                </a>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setContractModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={saveContract} disabled={!contractUrl || uploading}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40"
                data-testid="save-contract-btn">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AgentsSection;

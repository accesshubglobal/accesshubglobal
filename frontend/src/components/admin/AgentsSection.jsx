import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Key, Copy, UserCheck } from 'lucide-react';
import axios, { API } from './adminApi';

const AgentsSection = ({ onBadgeUpdate }) => {
  const [agents, setAgents] = useState([]);
  const [agentCodes, setAgentCodes] = useState([]);
  const [agentTab, setAgentTab] = useState('agents');

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

  return (
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
  );
};

export default AgentsSection;

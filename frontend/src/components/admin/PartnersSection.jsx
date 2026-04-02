import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Key, Copy, Handshake, Building2, GraduationCap, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import axios, { API } from './adminApi';

const StatusBadge = ({ isApproved }) => {
  if (isApproved === true) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
      <CheckCircle size={10} /> Approuvé
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
      <Clock size={10} /> En attente
    </span>
  );
};

const PartnersSection = ({ onBadgeUpdate }) => {
  const [partners, setPartners] = useState([]);
  const [partnerCodes, setPartnerCodes] = useState([]);
  const [partnerUnis, setPartnerUnis] = useState([]);
  const [partnerOffers, setPartnerOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('partners');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = () => {
    loadPartners();
    loadPartnerCodes();
    loadPartnerUnis();
    loadPartnerOffers();
  };

  const loadPartners = async () => {
    try {
      const res = await axios.get(`${API}/admin/partners`);
      setPartners(res.data);
      const pending = res.data.filter(p => !p.isApproved && p.isActive !== false).length;
      onBadgeUpdate?.('pendingPartners', pending);
    } catch (err) { console.error(err); }
  };

  const loadPartnerCodes = async () => {
    try {
      const res = await axios.get(`${API}/admin/partner-codes`);
      setPartnerCodes(res.data);
    } catch (err) { console.error(err); }
  };

  const loadPartnerUnis = async () => {
    try {
      const res = await axios.get(`${API}/admin/partner-universities`);
      setPartnerUnis(res.data);
      const pending = res.data.filter(u => !u.isApproved).length;
      onBadgeUpdate?.('pendingPartnerUnis', pending);
    } catch (err) { console.error(err); }
  };

  const loadPartnerOffers = async () => {
    try {
      const res = await axios.get(`${API}/admin/partner-offers`);
      setPartnerOffers(res.data);
      const pending = res.data.filter(o => !o.isApproved).length;
      onBadgeUpdate?.('pendingPartnerOffers', pending);
    } catch (err) { console.error(err); }
  };

  const generateCode = async () => {
    try {
      await axios.post(`${API}/admin/partner-codes`);
      loadPartnerCodes();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Supprimer ce code ?')) return;
    try {
      await axios.delete(`${API}/admin/partner-codes/${id}`);
      loadPartnerCodes();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const approvePartner = async (id) => {
    try {
      await axios.put(`${API}/admin/partners/${id}/approve`);
      loadPartners();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const rejectPartner = async (id) => {
    if (!window.confirm('Rejeter ce partenaire ?')) return;
    try {
      await axios.put(`${API}/admin/partners/${id}/reject`);
      loadPartners();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const approveUni = async (id) => {
    try {
      await axios.put(`${API}/admin/partner-universities/${id}/approve`);
      loadPartnerUnis();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const rejectUni = async (id) => {
    if (!window.confirm("Rejeter cette université ?")) return;
    try {
      await axios.put(`${API}/admin/partner-universities/${id}/reject`);
      loadPartnerUnis();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const approveOffer = async (id) => {
    try {
      await axios.put(`${API}/admin/partner-offers/${id}/approve`);
      loadPartnerOffers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const rejectOffer = async (id) => {
    if (!window.confirm("Rejeter cette offre ?")) return;
    try {
      await axios.put(`${API}/admin/partner-offers/${id}/reject`);
      loadPartnerOffers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const pendingUnis = partnerUnis.filter(u => !u.isApproved).length;
  const pendingOffers = partnerOffers.filter(o => !o.isApproved).length;

  const tabs = [
    { id: 'partners', label: 'Partenaires', count: partners.length },
    { id: 'codes', label: "Codes d'activation", count: partnerCodes.length },
    { id: 'universities', label: 'Universités', count: partnerUnis.length, badge: pendingUnis },
    { id: 'offers', label: 'Offres', count: partnerOffers.length, badge: pendingOffers },
  ];

  return (
    <div className="space-y-6" data-testid="partners-admin-section">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Gestion des Partenaires</h3>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`partner-admin-tab-${tab.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}>
            {tab.label}
            {tab.badge > 0 ? (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>
            ) : (
              <span className="text-current opacity-60">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Partners list ── */}
      {activeTab === 'partners' && (
        <div className="space-y-3">
          {partners.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Handshake size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aucun partenaire inscrit</p>
            </div>
          ) : partners.map(partner => (
            <div key={partner.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4"
              data-testid={`partner-row-${partner.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{partner.firstName} {partner.lastName}</p>
                  <StatusBadge isApproved={partner.isApproved} />
                  {partner.isActive === false && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">Rejeté</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{partner.email}</p>
                {partner.company && <p className="text-xs text-gray-400 mt-0.5">{partner.company}</p>}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>{partner.universitiesCount || 0} université(s)</span>
                  <span>·</span>
                  <span>{partner.offersCount || 0} offre(s)</span>
                </div>
              </div>
              {!partner.isApproved && partner.isActive !== false && (
                <div className="flex gap-2">
                  <button onClick={() => approvePartner(partner.id)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Approuver" data-testid={`approve-partner-${partner.id}`}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => rejectPartner(partner.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Rejeter" data-testid={`reject-partner-${partner.id}`}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Codes tab ── */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <button onClick={generateCode} data-testid="generate-partner-code"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Key size={16} /> Générer un code partenaire
          </button>
          <div className="space-y-2">
            {partnerCodes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">Aucun code généré</div>
            ) : partnerCodes.map(code => (
              <div key={code.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <code className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">{code.code}</code>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Créé le {new Date(code.createdAt).toLocaleDateString('fr-FR')}</span>
                    {code.isUsed ? (
                      <span className="text-green-600">Utilisé</span>
                    ) : (
                      <span className="text-amber-600">Disponible</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(code.code); }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Copier">
                    <Copy size={15} />
                  </button>
                  {!code.isUsed && (
                    <button onClick={() => deleteCode(code.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Partner Universities tab ── */}
      {activeTab === 'universities' && (
        <div className="space-y-3">
          {partnerUnis.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aucune université soumise par des partenaires</p>
            </div>
          ) : partnerUnis.map(uni => (
            <div key={uni.id} className="bg-white rounded-2xl p-4 shadow-sm" data-testid={`partner-uni-row-${uni.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{uni.name}</p>
                    <StatusBadge isApproved={uni.isApproved} />
                  </div>
                  <p className="text-sm text-gray-500">{uni.city}, {uni.country}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Soumis par : <span className="font-medium">{uni.partnerName}</span>
                    {uni.partnerCompany && ` (${uni.partnerCompany})`}
                  </p>
                  {uni.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{uni.description}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!uni.isApproved && (
                    <button onClick={() => approveUni(uni.id)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approuver" data-testid={`approve-uni-${uni.id}`}>
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => rejectUni(uni.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Rejeter" data-testid={`reject-uni-${uni.id}`}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Partner Offers tab ── */}
      {activeTab === 'offers' && (
        <div className="space-y-3">
          {partnerOffers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aucune offre soumise par des partenaires</p>
            </div>
          ) : partnerOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-2xl p-4 shadow-sm" data-testid={`partner-offer-row-${offer.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{offer.title}</p>
                    <StatusBadge isApproved={offer.isApproved} />
                  </div>
                  <p className="text-sm text-gray-500">{offer.university} — {offer.city}, {offer.country}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Soumis par : <span className="font-medium">{offer.partnerName}</span>
                    {offer.partnerCompany && ` (${offer.partnerCompany})`}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{offer.degree}</span>
                    <span>·</span>
                    <span>{offer.duration}</span>
                    <span>·</span>
                    <span>{offer.teachingLanguage}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!offer.isApproved && (
                    <button onClick={() => approveOffer(offer.id)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approuver" data-testid={`approve-offer-${offer.id}`}>
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => rejectOffer(offer.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Rejeter" data-testid={`reject-offer-${offer.id}`}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnersSection;

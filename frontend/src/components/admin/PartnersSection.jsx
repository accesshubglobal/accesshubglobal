import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Trash2, Key, Copy, Handshake, Building2, GraduationCap, Clock, CheckCircle, Edit2, MessageSquare, Paperclip, Download, FileText, Loader2, Send, Upload, RefreshCw, Plus, Search } from 'lucide-react';
import axios, { API } from './adminApi';
import OfferFormModal from '../OfferFormModal';
import { PartnerReviewModal } from './ReviewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

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

  const [editingOffer, setEditingOffer] = useState(null);
  const [offerSaveLoading, setOfferSaveLoading] = useState(false);
  const [offerSaveError, setOfferSaveError] = useState('');
  const [approveAfterSave, setApproveAfterSave] = useState(false);

  // Contract modal state
  const [contractModal, setContractModal] = useState(null);
  const [contractUrl, setContractUrl] = useState('');
  const [contractName, setContractName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit code modal state
  const [editCodeModal, setEditCodeModal] = useState(null);
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);

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

  const handleEditAndApprove = (offer, andApprove = false) => {
    setEditingOffer(offer);
    setApproveAfterSave(andApprove);
    setOfferSaveError('');
  };

  // ── Messaging ──
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { url, name, type }
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const openMessages = async (partnerId, partnerName, offerId = null, offerTitle = null) => {
    setMessageModal({ partnerId, partnerName, offerId, offerTitle });
    setMessageText('');
    setAttachedFile(null);
    try {
      const res = await axios.get(`${API}/admin/partner-messages/${partnerId}`);
      setMessages(res.data);
    } catch (e) { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !attachedFile || !messageModal) return;
    setMsgLoading(true);
    try {
      await axios.post(`${API}/admin/partner-messages`, {
        partnerId: messageModal.partnerId,
        message: messageText.trim(),
        offerId: messageModal.offerId,
        offerTitle: messageModal.offerTitle,
        fileUrl: attachedFile?.url || null,
        fileName: attachedFile?.name || null,
        fileType: attachedFile?.type || null,
      });
      const res = await axios.get(`${API}/admin/partner-messages/${messageModal.partnerId}`);
      setMessages(res.data);
      setMessageText('');
      setAttachedFile(null);
    } catch (e) { alert("Erreur lors de l'envoi"); }
    setMsgLoading(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data?.url) {
        setAttachedFile({ url: data.url, name: file.name, type: file.type });
      } else {
        alert("Erreur lors de l'upload du fichier");
      }
    } catch {
      alert("Erreur lors de l'upload du fichier");
    }
    setFileUploading(false);
    e.target.value = '';
  };


  const handleSaveOffer = async (formData) => {
    setOfferSaveLoading(true);
    setOfferSaveError('');
    try {
      await axios.put(`${API}/admin/offers/${editingOffer.id}`, formData);
      if (approveAfterSave) {
        await axios.put(`${API}/admin/partner-offers/${editingOffer.id}/approve`);
      }
      setEditingOffer(null);
      loadPartnerOffers();
    } catch (err) {
      setOfferSaveError(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setOfferSaveLoading(false);
  };

  const rejectOffer = async (id) => {
    if (!window.confirm("Rejeter cette offre ?")) return;
    try {
      await axios.put(`${API}/admin/partner-offers/${id}/reject`);
      loadPartnerOffers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  // ── Contract handlers ──
  const openContractModal = (partner) => {
    setContractModal(partner);
    setContractUrl(partner.contractUrl || '');
    setContractName(partner.contractName || 'Contrat Partenaire');
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
      await axios.put(`${API}/admin/partners/${contractModal.id}/contract`, { contractUrl, contractName });
      setContractModal(null); loadPartners();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  // ── Code handlers ──
  const openEditCode = (partner) => {
    setEditCodeModal(partner);
    setNewPartnerCode(partner.partnerCode || '');
  };

  const savePartnerCode = async () => {
    if (!editCodeModal || !newPartnerCode.trim()) return;
    try {
      const r = await axios.put(`${API}/admin/partners/${editCodeModal.id}/login-code`, { partnerCode: newPartnerCode.trim().toUpperCase() });
      setEditCodeModal(null); loadPartners();
      alert(`Code mis à jour : ${r.data.partnerCode}`);
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
    <>
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
                {/* Code de connexion */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Code connexion :</span>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-xs font-mono text-emerald-800 font-semibold">
                    {partner.partnerCode || '—'}
                  </span>
                  {partner.partnerCode && (
                    <button onClick={() => { navigator.clipboard.writeText(partner.partnerCode); setCopiedId(partner.id); setTimeout(() => setCopiedId(null), 2000); }}
                      className="p-0.5 hover:text-emerald-600 transition-colors" title="Copier">
                      {copiedId === partner.id ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400" />}
                    </button>
                  )}
                  <button onClick={() => openEditCode(partner)}
                    className="p-0.5 hover:text-emerald-600 transition-colors" title="Modifier le code">
                    <Edit2 size={12} className="text-gray-400 hover:text-emerald-500" />
                  </button>
                </div>
              </div>
              {!partner.isApproved && partner.isActive !== false && (
                <div className="flex gap-2">
                  <button onClick={() => setReviewModal(partner.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
                    title="Voir le dossier et approuver" data-testid={`review-partner-${partner.id}`}>
                    <Check size={13} /> Voir & Approuver
                  </button>
                  <button onClick={() => rejectPartner(partner.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Rejeter" data-testid={`reject-partner-${partner.id}`}>
                    <X size={16} />
                  </button>
                </div>
              )}
              {partner.isApproved && (
                <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={() => openContractModal(partner)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl"
                    data-testid={`contract-partner-${partner.id}`}>
                    <FileText size={13} /> {partner.contractUrl ? 'Contrat ✓' : 'Contrat'}
                  </button>
                  <button onClick={() => rejectPartner(partner.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                    data-testid={`reject-partner-${partner.id}`}>
                    <X size={13} /> Désactiver
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
                    {(offer.serviceFee > 0 || offer.fees?.applicationFee > 0) && (
                      <span className="text-emerald-600 font-medium">· Frais de service configurés ✓</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                  {/* Edit button — fees only mode */}
                  <button
                    onClick={() => handleEditAndApprove(offer, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Modifier uniquement les frais de service"
                    data-testid={`edit-partner-offer-${offer.id}`}>
                    <Edit2 size={14} /> Frais
                  </button>
                  {/* Message button */}
                  <button
                    onClick={() => openMessages(offer.partnerId, offer.partnerName, offer.id, offer.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    title="Envoyer un message au partenaire"
                    data-testid={`msg-partner-offer-${offer.id}`}>
                    <MessageSquare size={14} /> Message
                  </button>
                  {/* Approve with edit — sets fees then approves */}
                  {!offer.isApproved && (
                    <button
                      onClick={() => handleEditAndApprove(offer, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      title="Modifier les frais puis approuver"
                      data-testid={`edit-approve-partner-offer-${offer.id}`}>
                      <Check size={14} /> Modifier & Approuver
                    </button>
                  )}
                  {/* Quick approve without editing */}
                  {!offer.isApproved && (
                    <button onClick={() => approveOffer(offer.id)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approuver sans modifier" data-testid={`approve-offer-${offer.id}`}>
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

      {/* Offer edit modal — fees only */}
      {editingOffer && (
        <OfferFormModal
          offer={editingOffer}
          onSave={handleSaveOffer}
          onClose={() => { setEditingOffer(null); setOfferSaveError(''); }}
          loading={offerSaveLoading}
          error={offerSaveError}
          isPartner={false}
          feesOnlyMode={true}
          submitLabel={approveAfterSave ? 'Enregistrer & Approuver' : 'Enregistrer les frais'}
        />
      )}

      {/* Message modal */}
      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMessageModal(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold">Message au partenaire</h3>
                <p className="text-blue-100 text-sm">{messageModal.partnerName}</p>
                {messageModal.offerTitle && <p className="text-blue-200 text-xs mt-0.5">Offre : {messageModal.offerTitle}</p>}
              </div>
              <button onClick={() => setMessageModal(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '200px', maxHeight: '300px' }}>
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Aucun message pour l'instant</p>
              ) : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.fromRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.fromRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                    {msg.offerTitle && (
                      <p className={`text-[10px] mb-0.5 ${msg.fromRole === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>Re: {msg.offerTitle}</p>
                    )}
                    {msg.message && <p>{msg.message}</p>}
                    {msg.fileUrl && (
                      msg.fileType?.startsWith('image/') ? (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                          <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full max-h-36 rounded-lg object-cover" />
                        </a>
                      ) : (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                          className={`flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity ${msg.fromRole === 'admin' ? 'bg-blue-700/50 text-blue-100' : 'bg-gray-100 text-gray-700'}`}>
                          <FileText size={12} className="flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{msg.fileName || 'Fichier joint'}</span>
                          <Download size={11} className="flex-shrink-0 ml-auto" />
                        </a>
                      )
                    )}
                    <p className={`text-[10px] mt-0.5 ${msg.fromRole === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t bg-white space-y-2 flex-shrink-0">
              {attachedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <FileText size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="text-blue-800 truncate flex-1">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-blue-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileUploading}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-40"
                  title="Joindre un fichier"
                  data-testid="admin-attach-file">
                  {fileUploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                </button>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Votre message pour le partenaire..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
                  rows={2}
                  data-testid="admin-message-input"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button onClick={sendMessage} disabled={msgLoading || fileUploading || (!messageText.trim() && !attachedFile)}
                  className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 self-end flex-shrink-0"
                  data-testid="admin-message-send">
                  {msgLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── Edit Code Modal ── */}
    {editCodeModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Code de connexion partenaire</h3>
              <p className="text-xs text-gray-400 mt-0.5">{editCodeModal.firstName} {editCodeModal.lastName}</p>
            </div>
            <button onClick={() => setEditCodeModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 leading-relaxed">
              <strong>Comment ça marche :</strong> Ce code est demandé au partenaire à chaque connexion (format PA-XXXXXXXX). Modifiez-le si besoin et communiquez-lui le nouveau code.
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nouveau code de connexion</label>
              <div className="flex gap-2">
                <input value={newPartnerCode} onChange={e => setNewPartnerCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-100 uppercase"
                  placeholder="Ex: PA-NOUVEAU1" />
                <button onClick={() => setNewPartnerCode(`PA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors" title="Générer">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditCodeModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={savePartnerCode} disabled={!newPartnerCode.trim()}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
                data-testid="save-partner-code-btn">Enregistrer</button>
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
              <p className="text-xs text-gray-400 mt-0.5">Téléversez le PDF du contrat partenaire</p>
            </div>
            <button onClick={() => setContractModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom du contrat</label>
              <input value={contractName} onChange={e => setContractName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Ex: Contrat partenariat 2025" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fichier PDF *</label>
              <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${contractUrl ? 'border-green-300 bg-green-50 text-green-700' : 'border-dashed border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-500'}`}>
                {uploading ? <Loader2 size={15} className="animate-spin" /> : contractUrl ? <FileText size={15} /> : <Upload size={15} />}
                {contractUrl ? 'PDF téléchargé — Cliquer pour remplacer' : 'Téléverser le contrat (PDF)'}
                <input type="file" className="hidden" onChange={handleContractUpload} accept=".pdf" />
              </label>
              {contractUrl && <a href={contractUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-emerald-600 hover:underline"><FileText size={11} /> Voir le contrat actuel</a>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setContractModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={saveContract} disabled={!contractUrl || uploading}
                className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40"
                data-testid="save-partner-contract-btn">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Review Modal ── */}
    {reviewModal && (
      <PartnerReviewModal
        partnerId={reviewModal}
        onClose={() => setReviewModal(null)}
        onApprove={async (id) => { await approvePartner(id); }}
        onReject={async (id) => { await rejectPartner(id); }}
      />
    )}
  </>
  );
};

export default PartnersSection;

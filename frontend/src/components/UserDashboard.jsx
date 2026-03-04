import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Heart, FileText, MessageCircle, LogOut, Clock, CheckCircle, XCircle, 
  AlertCircle, ChevronRight, Star, Eye, Send, Paperclip, X, Plus, 
  MapPin, GraduationCap, Calendar, Award, Trash2, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationFormModal from './ApplicationFormModal';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Messages state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  
  // Application detail state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  
  // Application modal state for favorites
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOfferForApplication, setSelectedOfferForApplication] = useState(null);

  const API = process.env.REACT_APP_API_URL || '/api';
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'applications') loadApplications();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  useEffect(() => {
    const loadOffer = async () => {
      if (!selectedApplication?.offerId) {
        setSelectedOffer(null);
        return;
      }
      setOfferLoading(true);
      try {
        const res = await axios.get(`${API}/offers/${selectedApplication.offerId}`);
        setSelectedOffer(res.data);
      } catch (e) {
        // Offer may have been deleted or ID invalid
        setSelectedOffer(null);
      } finally {
        setOfferLoading(false);
      }
    };
    loadOffer();
  }, [selectedApplication?.offerId]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/user/favorites`);
      setFavorites(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/applications/my`);
      setApplications(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/messages/conversations`);
      setMessages(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (offerId) => {
    try {
      await axios.delete(`${API}/user/favorites/${offerId}`);
      setFavorites(favorites.filter(fav => fav.id !== offerId));
    } catch (err) {
      setError('Erreur lors de la suppression du favori');
    }
  };

  const handleApply = (offer) => {
    setSelectedOfferForApplication(offer);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setSelectedOfferForApplication(null);
    loadApplications();
    loadFavorites();
    setActiveTab('applications');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('conversationId', selectedConversation.id);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${API}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh messages
      loadMessages();
      setNewMessage('');
      setAttachments([]);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approuvée' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejetée' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'En cours d\'examen' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const buildApplicationSummaryText = (app, offer) => {
    const lines = [];
    lines.push('RÉSUMÉ DE CANDIDATURE');
    lines.push('====================');
    lines.push('');
    lines.push(`Programme: ${app?.offerTitle || offer?.title || ''}`);
    if (offer?.university) lines.push(`Université: ${offer.university}`);
    if (offer?.city || offer?.country) lines.push(`Lieu: ${(offer?.city || '')}${offer?.city && offer?.country ? ', ' : ''}${offer?.country || ''}`);
    if (offer?.degree) lines.push(`Diplôme: ${offer.degree}`);
    if (offer?.duration) lines.push(`Durée: ${offer.duration}`);
    if (offer?.teachingLanguage) lines.push(`Langue: ${offer.teachingLanguage}`);
    if (offer?.intake) lines.push(`Rentrée: ${offer.intake}`);
    lines.push('');
    lines.push('Candidat');
    lines.push('-------');
    lines.push(`Nom: ${app?.firstName || user?.firstName || ''} ${app?.lastName || user?.lastName || ''}`.trim());
    lines.push(`Email: ${app?.userEmail || user?.email || ''}`);
    if (app?.phoneNumber) lines.push(`Téléphone: ${app.phoneNumber}`);
    if (app?.nationality) lines.push(`Nationalité: ${app.nationality}`);
    if (app?.sex) lines.push(`Sexe: ${app.sex}`);
    if (app?.passportNumber) lines.push(`Passeport: ${app.passportNumber}`);
    if (app?.dateOfBirth) lines.push(`Date de naissance: ${app.dateOfBirth}`);
    if (app?.address) lines.push(`Adresse: ${app.address}`);
    lines.push('');
    lines.push('Paiement');
    lines.push('-------');
    if (app?.paymentMethod) lines.push(`Méthode: ${app.paymentMethod}`);
    if (typeof app?.paymentAmount !== 'undefined') lines.push(`Montant: ${app.paymentAmount}`);
    if (app?.paymentProof) lines.push(`Justificatif: ${BACKEND_URL}${app.paymentProof}`);
    lines.push('');
    if (Array.isArray(app?.documents) && app.documents.length) {
      lines.push('Documents');
      lines.push('---------');
      app.documents.forEach((d, i) => {
        const label = d?.label || d?.name || d?.type || `Document ${i + 1}`;
        const url = d?.url ? `${BACKEND_URL}${d.url}` : '';
        lines.push(`- ${label}${url ? `: ${url}` : ''}`);
      });
      lines.push('');
    }
    lines.push(`Statut: ${app?.status || ''}`);
    if (app?.createdAt) lines.push(`Soumise le: ${new Date(app.createdAt).toLocaleString('fr-FR')}`);
    return lines.filter(Boolean).join('\n');
  };

  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const escapeHtml = (str) => {
    if (str === null || typeof str === 'undefined') return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const buildPrintableHtml = (app, offer) => {
    const title = app?.offerTitle || offer?.title || 'Candidature';
    const createdAt = app?.createdAt ? new Date(app.createdAt).toLocaleString('fr-FR') : '';
    const location = [offer?.city, offer?.country].filter(Boolean).join(', ');
    const candidateName = `${app?.firstName || user?.firstName || ''} ${app?.lastName || user?.lastName || ''}`.trim();

    const docs = Array.isArray(app?.documents) ? app.documents : [];
    const docsRows = docs.length
      ? docs.map((d, i) => {
          const label = d?.label || d?.name || d?.type || `Document ${i + 1}`;
          const url = d?.url ? `${BACKEND_URL}${d.url}` : '';
          return `
            <tr>
              <td>${escapeHtml(label)}</td>
              <td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>` : '<span class="muted">—</span>'}</td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="2" class="muted">Aucun document</td></tr>`;

    const paymentProofUrl = app?.paymentProof ? `${BACKEND_URL}${app.paymentProof}` : '';

    return `
      <div class="header">
        <div>
          <div class="kicker">Winners Consulting</div>
          <h1>Résumé de candidature</h1>
          <div class="subtitle">${escapeHtml(title)}</div>
        </div>
        <div class="meta">
          <div><span class="muted">Statut</span><div class="pill">${escapeHtml(app?.status || '—')}</div></div>
          <div style="margin-top:8px;"><span class="muted">Soumise le</span><div>${escapeHtml(createdAt || '—')}</div></div>
        </div>
      </div>

      <div class="grid">
        <section class="card">
          <h2>Détails du programme</h2>
          <div class="rows">
            <div class="row"><div class="label">Programme</div><div class="value">${escapeHtml(title)}</div></div>
            <div class="row"><div class="label">Université</div><div class="value">${escapeHtml(offer?.university || '—')}</div></div>
            <div class="row"><div class="label">Lieu</div><div class="value">${escapeHtml(location || '—')}</div></div>
            <div class="row"><div class="label">Diplôme</div><div class="value">${escapeHtml(offer?.degree || '—')}</div></div>
            <div class="row"><div class="label">Durée</div><div class="value">${escapeHtml(offer?.duration || '—')}</div></div>
            <div class="row"><div class="label">Langue</div><div class="value">${escapeHtml(offer?.teachingLanguage || '—')}</div></div>
            <div class="row"><div class="label">Rentrée</div><div class="value">${escapeHtml(offer?.intake || '—')}</div></div>
          </div>
        </section>

        <section class="card">
          <h2>Informations du candidat</h2>
          <div class="rows">
            <div class="row"><div class="label">Nom</div><div class="value">${escapeHtml(candidateName || '—')}</div></div>
            <div class="row"><div class="label">Email</div><div class="value">${escapeHtml(app?.userEmail || user?.email || '—')}</div></div>
            <div class="row"><div class="label">Téléphone</div><div class="value">${escapeHtml(app?.phoneNumber || '—')}</div></div>
            <div class="row"><div class="label">Nationalité</div><div class="value">${escapeHtml(app?.nationality || '—')}</div></div>
            <div class="row"><div class="label">Sexe</div><div class="value">${escapeHtml(app?.sex || '—')}</div></div>
            <div class="row"><div class="label">Passeport</div><div class="value">${escapeHtml(app?.passportNumber || '—')}</div></div>
            <div class="row"><div class="label">Date de naissance</div><div class="value">${escapeHtml(app?.dateOfBirth || '—')}</div></div>
            <div class="row"><div class="label">Adresse</div><div class="value">${escapeHtml(app?.address || '—')}</div></div>
          </div>
        </section>
      </div>

      <section class="card" style="margin-top:14px;">
        <h2>Paiement</h2>
        <div class="rows">
          <div class="row"><div class="label">Méthode</div><div class="value">${escapeHtml(app?.paymentMethod || '—')}</div></div>
          <div class="row"><div class="label">Montant</div><div class="value">${escapeHtml((typeof app?.paymentAmount !== 'undefined' && app?.paymentAmount !== null) ? app.paymentAmount : '—')}</div></div>
          <div class="row"><div class="label">Justificatif</div><div class="value">${paymentProofUrl ? `<a href="${escapeHtml(paymentProofUrl)}" target="_blank" rel="noreferrer">${escapeHtml(paymentProofUrl)}</a>` : '<span class="muted">—</span>'}</div></div>
        </div>
      </section>

      <section class="card" style="margin-top:14px;">
        <h2>Documents</h2>
        <table class="table">
          <thead>
            <tr><th>Nom</th><th>Lien</th></tr>
          </thead>
          <tbody>
            ${docsRows}
          </tbody>
        </table>
      </section>

      <div class="footer muted">
        Généré le ${escapeHtml(new Date().toLocaleString('fr-FR'))}
      </div>
    `;
  };

  const openPrintWindow = (app, offer, options = {}) => {
    const { mode = 'print' } = options; // 'print' | 'pdf'
    const w = window.open('', '_blank');
    if (!w) return;

    const html = buildPrintableHtml(app, offer);

    w.document.write(`
      <html>
        <head>
          <title>Résumé de candidature</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            :root { --border:#e5e7eb; --text:#111827; --muted:#6b7280; }
            * { box-sizing: border-box; }
            body { margin:0; font-family: Arial, sans-serif; color: var(--text); background:#f3f4f6; }
            .page { max-width: 920px; margin: 0 auto; padding: 18px; }
            .toolbar {
              position: sticky; top: 0;
              display:flex; gap:10px; justify-content:flex-end; align-items:center;
              padding: 12px 18px;
              background: rgba(243,244,246,.92);
              backdrop-filter: blur(6px);
              border-bottom: 1px solid var(--border);
              z-index: 10;
            }
            .btn {
              border: 1px solid var(--border);
              background: #fff;
              padding: 8px 12px;
              border-radius: 10px;
              font-size: 14px;
              cursor: pointer;
            }
            .btn.primary { background:#1a56db; border-color:#1a56db; color:#fff; }
            .btn:hover { filter: brightness(0.98); }
            .kicker { font-size:12px; color: var(--muted); letter-spacing:.04em; text-transform: uppercase; }
            h1 { margin:6px 0 4px; font-size: 20px; }
            .subtitle { color: var(--muted); font-size: 14px; margin-top: 2px; }
            .header { display:flex; gap:12px; justify-content:space-between; align-items:flex-start; margin-bottom: 14px; }
            .meta { text-align:right; min-width: 220px; }
            .pill { display:inline-block; padding: 4px 10px; border-radius:999px; border:1px solid var(--border); background:#fff; font-size: 12px; margin-top:4px; }
            .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            .card {
              background:#fff;
              border: 1px solid var(--border);
              border-radius: 14px;
              padding: 14px;
            }
            h2 { margin:0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing:.05em; color:#111827; }
            .rows { display:flex; flex-direction:column; gap:8px; }
            .row { display:flex; gap:12px; justify-content:space-between; border-top: 1px dashed #f0f0f0; padding-top:8px; }
            .row:first-child { border-top:none; padding-top:0; }
            .label { color: var(--muted); width: 38%; font-size: 13px; }
            .value { width: 62%; font-size: 13px; text-align:right; }
            a { color:#1a56db; text-decoration:none; word-break: break-all; }
            a:hover { text-decoration: underline; }
            .muted { color: var(--muted); }
            .table { width:100%; border-collapse: collapse; font-size: 13px; }
            .table th, .table td { text-align:left; padding: 10px 8px; border-top: 1px solid var(--border); vertical-align: top; }
            .table th { color: var(--muted); font-weight: 600; }
            .footer { margin-top: 14px; font-size: 12px; }

            @media (max-width: 820px) {
              .grid { grid-template-columns: 1fr; }
              .meta { text-align:left; }
              .header { flex-direction: column; }
              .value { text-align:left; }
              .label, .value { width: auto; }
            }

            /* Print rules (clean layout: no toolbar, no background) */
            @media print {
              body { background: #fff; }
              .toolbar { display:none !important; }
              .page { max-width: none; padding: 0; }
              .card { break-inside: avoid; page-break-inside: avoid; border-radius: 0; }
              a { color: #111827; text-decoration: none; }
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <button class="btn" onclick="window.close()">Fermer</button>
            <button class="btn" onclick="window.print()">Imprimer</button>
            <button class="btn primary" onclick="window.print()">Télécharger en PDF</button>
          </div>
          <div class="page">
            ${html}
          </div>
          <script>
            (function () {
              const mode = ${JSON.stringify(options.mode || 'print')};
              if (mode === 'pdf') {
                // Trigger print dialog immediately for "Save as PDF"
                setTimeout(() => window.print(), 150);
                window.onafterprint = () => {
                  // Close window after user saves/cancels
                  setTimeout(() => window.close(), 150);
                };
              }
            })();
          </script>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
  };

  const tabs = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'favorites', label: 'Mes Favoris', icon: Heart, count: favorites.length },
    { id: 'applications', label: 'Mes Candidatures', icon: FileText, count: applications.length },
    { id: 'messages', label: 'Mes Messages', icon: MessageCircle, count: messages.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mon Compte</h1>
            <p className="text-sm text-gray-600">Bienvenue, {user?.firstName}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedApplication(null);
                        setSelectedConversation(null);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#1a56db] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {tab.count !== undefined && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-red-800">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
                  <X size={18} />
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                        <p className="text-gray-900">{user?.firstName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                        <p className="text-gray-900">{user?.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                        <p className="text-gray-900 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Mes Favoris</h2>
                      <p className="text-gray-600">{favorites.length} programme(s)</p>
                    </div>

                    {favorites.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
                        <p className="text-gray-600">Ajoutez des programmes en favoris pour les retrouver ici.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {favorites.map(favorite => (
                          <div key={favorite.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{favorite.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  {favorite.university && (
                                    <span className="flex items-center gap-1">
                                      <GraduationCap size={14} />
                                      {favorite.university}
                                    </span>
                                  )}
                                  {(favorite.city || favorite.country) && (
                                    <span className="flex items-center gap-1">
                                      <MapPin size={14} />
                                      {[favorite.city, favorite.country].filter(Boolean).join(', ')}
                                    </span>
                                  )}
                                  {favorite.intake && (
                                    <span className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {favorite.intake}
                                    </span>
                                  )}
                                </div>
                                {favorite.description && (
                                  <p className="text-gray-600 line-clamp-2">{favorite.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFavorite(favorite.id)}
                                className="text-gray-400 hover:text-red-600 p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              <button
                                onClick={() => handleApply(favorite)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors"
                              >
                                <Send size={16} />
                                Postuler
                              </button>
                              <button
                                onClick={() => window.location.href = `/offers/${favorite.id}`}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Voir détails
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Mes Candidatures</h2>
                      <p className="text-gray-600">{applications.length} candidature(s)</p>
                    </div>

                    {selectedApplication ? (
                      // Application Detail View
                      <div>
                        <button
                          onClick={() => setSelectedApplication(null)}
                          className="flex items-center gap-2 text-[#1a56db] mb-6 hover:underline"
                        >
                          <ChevronRight size={16} className="rotate-180" />
                          Retour à la liste
                        </button>
                        
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {selectedApplication.offerTitle}
                              </h3>
                              {getStatusBadge(selectedApplication.status)}
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openPrintWindow(selectedApplication, selectedOffer, { mode: 'print' })}
                                  className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                >
                                  Imprimer
                                </button>
                                <button
                                  onClick={() => openPrintWindow(selectedApplication, selectedOffer, { mode: 'pdf' })}
                                  className="px-3 py-2 text-sm rounded-lg bg-[#111827] text-white hover:bg-black"
                                >
                                  Télécharger en PDF
                                </button>
                                <button
                                  onClick={() => {
                                    const content = buildApplicationSummaryText(selectedApplication, selectedOffer);
                                    downloadTextFile(`resume-candidature-${selectedApplication.id}.txt`, content);
                                  }}
                                  className="px-3 py-2 text-sm rounded-lg bg-[#1a56db] text-white hover:bg-[#1e4db7]"
                                >
                                  Télécharger le résumé
                                </button>
                              </div>
                              <span className="text-sm text-gray-500">
                                Soumise le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          {/* Application Summary */}
                          <div className="bg-white rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Award size={18} className="text-[#1a56db]" />
                              Résumé de la candidature
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Programme</label>
                                <p className="font-medium">{selectedApplication.offerTitle}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Statut</label>
                                <p className="font-medium capitalize">{selectedApplication.status}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">ID de candidature</label>
                                <p className="font-medium">{selectedApplication.id}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Date de soumission</label>
                                <p className="font-medium">
                                  {new Date(selectedApplication.createdAt).toLocaleString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Program details (offer) */}
                          <div className="bg-white rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <GraduationCap size={18} className="text-[#1a56db]" />
                              Détails du programme
                            </h4>

                            {offerLoading ? (
                              <div className="text-gray-500">Chargement des détails du programme…</div>
                            ) : (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Université</label>
                                  <p className="font-medium">{selectedOffer?.university || '—'}</p>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Lieu</label>
                                  <p className="font-medium">
                                    {[selectedOffer?.city, selectedOffer?.country].filter(Boolean).join(', ') || '—'}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Diplôme</label>
                                  <p className="font-medium">{selectedOffer?.degree || '—'}</p>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Durée</label>
                                  <p className="font-medium">{selectedOffer?.duration || '—'}</p>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Langue</label>
                                  <p className="font-medium">{selectedOffer?.teachingLanguage || '—'}</p>
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-500 mb-1">Rentrée</label>
                                  <p className="font-medium">{selectedOffer?.intake || '—'}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Candidate info */}
                          <div className="bg-white rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <User size={18} className="text-[#1a56db]" />
                              Informations du candidat
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Prénom</label>
                                <p className="font-medium">{selectedApplication.firstName || user?.firstName || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Nom</label>
                                <p className="font-medium">{selectedApplication.lastName || user?.lastName || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Email</label>
                                <p className="font-medium">{selectedApplication.userEmail || user?.email || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                                <p className="font-medium">{selectedApplication.phoneNumber || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Nationalité</label>
                                <p className="font-medium">{selectedApplication.nationality || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Sexe</label>
                                <p className="font-medium">{selectedApplication.sex || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">N° Passeport</label>
                                <p className="font-medium">{selectedApplication.passportNumber || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Date de naissance</label>
                                <p className="font-medium">{selectedApplication.dateOfBirth || '—'}</p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-1">Adresse</label>
                                <p className="font-medium">{selectedApplication.address || '—'}</p>
                              </div>
                              {Array.isArray(selectedApplication.additionalPrograms) && selectedApplication.additionalPrograms.length > 0 && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm text-gray-500 mb-1">Programmes additionnels</label>
                                  <p className="font-medium">{selectedApplication.additionalPrograms.join(', ')}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="bg-white rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText size={18} className="text-[#1a56db]" />
                              Documents
                            </h4>

                            {Array.isArray(selectedApplication.documents) && selectedApplication.documents.length > 0 ? (
                              <div className="space-y-3">
                                {selectedApplication.documents.map((doc, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Paperclip size={16} className="text-gray-500" />
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {doc?.label || doc?.name || doc?.type || `Document ${idx + 1}`}
                                        </p>
                                        {doc?.url && (
                                          <a
                                            href={`${BACKEND_URL}${doc.url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-[#1a56db] hover:underline break-all"
                                          >
                                            Ouvrir
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Aucun document</p>
                            )}
                          </div>

                          {/* Payment */}
                          <div className="bg-white rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <ImageIcon size={18} className="text-[#1a56db]" />
                              Paiement
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Méthode</label>
                                <p className="font-medium">{selectedApplication.paymentMethod || '—'}</p>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-500 mb-1">Montant</label>
                                <p className="font-medium">
                                  {typeof selectedApplication.paymentAmount !== 'undefined' ? selectedApplication.paymentAmount : '—'}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-1">Justificatif</label>
                                {selectedApplication.paymentProof ? (
                                  <a
                                    href={`${BACKEND_URL}${selectedApplication.paymentProof}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1a56db] hover:underline break-all"
                                  >
                                    Ouvrir le justificatif
                                  </a>
                                ) : (
                                  <p className="font-medium">—</p>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      // Applications List View
                      <>
                        {applications.length === 0 ? (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune candidature</h3>
                            <p className="text-gray-600">Vous n'avez pas encore postulé à un programme.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {applications.map(application => (
                              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                      {application.offerTitle}
                                    </h3>
                                    <div className="flex items-center gap-4 mb-3">
                                      {getStatusBadge(application.status)}
                                      <span className="text-sm text-gray-500">
                                        Soumise le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedApplication(application)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors"
                                  >
                                    <Eye size={16} />
                                    Voir détails
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid md:grid-cols-3 h-[600px]">
                      {/* Conversations List */}
                      <div className="border-r border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                        </div>
                        <div className="overflow-y-auto h-full">
                          {messages.length === 0 ? (
                            <div className="p-6 text-center">
                              <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
                              <p className="text-gray-500">Aucune conversation</p>
                            </div>
                          ) : (
                            messages.map(conversation => (
                              <button
                                key={conversation.id}
                                onClick={() => setSelectedConversation(conversation)}
                                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{conversation.subject}</p>
                                    <p className="text-sm text-gray-500 line-clamp-1">
                                      {conversation.lastMessage}
                                    </p>
                                  </div>
                                  {conversation.unreadCount > 0 && (
                                    <span className="bg-[#1a56db] text-white text-xs px-2 py-1 rounded-full">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Messages View */}
                      <div className="md:col-span-2 flex flex-col">
                        {selectedConversation ? (
                          <>
                            <div className="p-4 border-b border-gray-200">
                              <h3 className="font-semibold text-gray-900">{selectedConversation.subject}</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                              {selectedConversation.messages?.map(message => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      message.senderId === user?.id
                                        ? 'bg-[#1a56db] text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    <p>{message.content}</p>
                                    {message.attachments?.map((attachment, idx) => (
                                      <a
                                        key={idx}
                                        href={`${BACKEND_URL}${attachment.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`block mt-2 text-sm underline ${
                                          message.senderId === user?.id ? 'text-white' : 'text-[#1a56db]'
                                        }`}
                                      >
                                        {attachment.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="p-4 border-t border-gray-200">
                              {/* Attachments Preview */}
                              {attachments.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                      <span className="text-sm text-gray-700">{file.name}</span>
                                      <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-600">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-end gap-3">
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 text-gray-500 hover:text-[#1a56db] hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Paperclip size={20} />
                                </button>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                                <div className="flex-1">
                                  <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message..."
                                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                                    rows={2}
                                  />
                                </div>
                                <button
                                  onClick={sendMessage}
                                  className="p-3 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors"
                                >
                                  <Send size={20} />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez une conversation</h3>
                              <p className="text-gray-600">Choisissez une conversation pour voir les messages.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedOfferForApplication && (
        <ApplicationFormModal
          offer={selectedOfferForApplication}
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedOfferForApplication(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default UserDashboard;
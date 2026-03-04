import React, { useState, useEffect, useRef } from 'react';
import {
  User, Heart, FileText, MessageCircle, LogOut, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Star, Eye, Send, Paperclip, X, Plus,
  MapPin, GraduationCap, Calendar, Award, Trash2, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from './ApplicationModal';

// ✅ PDF libs (vrai téléchargement sans dialogue)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const UserDashboard = ({ onClose }) => {
  const { user, token, logout, removeFromFavorites } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Message states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Application detail state
  const [selectedApplication, setSelectedApplication] = useState(null);

  // ✅ Offer details for application preview
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);

  // Application modal state for favorites
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOfferForApplication, setSelectedOfferForApplication] = useState(null);

  // ✅ PDF rendering ref
  const pdfRef = useRef(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'applications') loadApplications();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  // ✅ When selecting an application: fetch offer details (best-effort)
  useEffect(() => {
    const fetchOffer = async () => {
      if (!selectedApplication?.offerId) {
        setSelectedOffer(null);
        return;
      }
      setOfferLoading(true);
      try {
        const res = await axios.get(`${API}/offers/${selectedApplication.offerId}`);
        setSelectedOffer(res.data);
      } catch (err) {
        setSelectedOffer(null);
      } finally {
        setOfferLoading(false);
      }
    };
    fetchOffer();
  }, [selectedApplication?.offerId]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/user/favorites`);
      setFavorites(response.data);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
    setLoading(false);
  };

  const loadApplications = async () => {
    setLoading(true);
    try {
      // ✅ On garde ton endpoint d’origine (design/logic d’avant)
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
    setLoading(false);
  };

  // Remove from favorites
  const handleRemoveFavorite = async (offerId) => {
    await removeFromFavorites(offerId);
    loadFavorites();
  };

  // Reply to message
  const handleReplyMessage = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedMessage) return;

    try {
      // Upload attachments first if any
      let attachmentUrls = [];
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await axios.post(`${API}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          attachmentUrls.push(uploadRes.data.url);
        }
      }

      await axios.post(`${API}/messages/${selectedMessage.id}/reply`, {
        content: newReply,
        attachments: attachmentUrls
      });

      setNewReply('');
      setAttachments([]);
      loadMessages();

      // Refresh selected message
      const updatedMessages = await axios.get(`${API}/messages`);
      const updated = updatedMessages.data.find(m => m.id === selectedMessage.id);
      setSelectedMessage(updated);
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  // Send new message
  const handleSendNewMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.subject.trim() || !newMessage.content.trim()) return;

    try {
      // Upload attachments first if any
      let attachmentUrls = [];
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await axios.post(`${API}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          attachmentUrls.push(uploadRes.data.url);
        }
      }

      await axios.post(`${API}/messages`, {
        subject: newMessage.subject,
        content: newMessage.content,
        attachments: attachmentUrls
      });

      setNewMessage({ subject: '', content: '' });
      setAttachments([]);
      setShowNewMessageModal(false);
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approuvée' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejetée' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'En cours d\'examen' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Acceptée' },
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

  const safe = (v) => (v === null || typeof v === 'undefined' || v === '') ? '—' : v;

  const fullName = (app) => {
    const fn = app?.firstName || user?.firstName || '';
    const ln = app?.lastName || user?.lastName || '';
    const n = `${fn} ${ln}`.trim();
    return n || '—';
  };

  // ✅ Clean print window (no header/sidebar)
  const openPrintWindowClean = () => {
    if (!pdfRef.current) return;

    const html = pdfRef.current.outerHTML;

    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Résumé de candidature</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
            .page { padding: 18px; }
            .no-print { display: none !important; }
            @media print {
              body { background: #fff; }
              .page { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page">${html}</div>
          <script>
            setTimeout(() => window.print(), 200);
          </script>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
  };

  // ✅ VRAI téléchargement PDF sans dialogue (html2canvas + jsPDF)
  const downloadPdfDirect = async () => {
    if (!pdfRef.current) return;

    setPdfGenerating(true);
    try {
      const element = pdfRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Image dimensions in PDF units
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 1) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `candidature-${selectedApplication?.id || 'resume'}.pdf`;
      pdf.save(filename);
    } catch (e) {
      console.error('PDF generation error:', e);
      alert("Erreur lors de la génération du PDF. Réessaie après rechargement.");
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header (design d’origine) */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
            <p className="text-sm text-gray-500">Bienvenue, {user?.firstName}</p>
          </div>
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar (design d’origine) */}
          <div className="w-72 border-r border-gray-100 p-4 overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => { setActiveTab('profile'); setSelectedApplication(null); setSelectedMessage(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'profile' ? 'bg-[#1a56db] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <User size={18} />
                <span className="font-medium">Mon Profil</span>
              </button>

              <button
                onClick={() => { setActiveTab('favorites'); setSelectedApplication(null); setSelectedMessage(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'favorites' ? 'bg-[#1a56db] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart size={18} />
                  <span className="font-medium">Mes Favoris</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {favorites.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('applications'); setSelectedMessage(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'applications' ? 'bg-[#1a56db] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <span className="font-medium">Mes Candidatures</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {applications.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('messages'); setSelectedApplication(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'messages' ? 'bg-[#1a56db] text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} />
                  <span className="font-medium">Mes Messages</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {messages.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Prénom</p>
                    <p className="font-semibold text-gray-900">{safe(user?.firstName)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-semibold text-gray-900">{safe(user?.lastName)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{safe(user?.email)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-semibold text-gray-900">{safe(user?.phone)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Tab (design d’origine : pas de "voir plus" ici) */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Mes Favoris ({favorites.length})
                </h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucun favori pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((offer) => (
                      <div key={offer.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <img
                            src={offer.image}
                            alt={offer.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                                  <GraduationCap size={14} />
                                  {offer.university}
                                </p>
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <MapPin size={14} />
                                  {offer.city}, {offer.country}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveFavorite(offer.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Retirer des favoris"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-[#1a56db] font-semibold">
                                {offer.scholarshipTuition === 0 ? 'Gratuit' : `${offer.scholarshipTuition?.toLocaleString()} ${offer.currency}`}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Eye size={12} />
                                {offer.views?.toLocaleString()} vues
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedOfferForApplication(offer);
                                  setShowApplicationModal(true);
                                }}
                                className="ml-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                              >
                                <Send size={16} />
                                Postuler
                              </button>
                            </div>
                          </div>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Mes Candidatures ({applications.length})
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune candidature pour le moment</p>
                    <p className="text-sm text-gray-400 mt-2">Postulez à des programmes pour suivre vos candidatures ici</p>
                  </div>
                ) : (
                  selectedApplication ? (
                    // ✅ Application Detail View (design d’origine + ajout preview complet + print/pdf)
                    <div>
                      <button
                        onClick={() => { setSelectedApplication(null); setSelectedOffer(null); }}
                        className="flex items-center gap-2 text-[#1a56db] mb-6 hover:underline"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                        Retour à la liste
                      </button>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {selectedApplication.offerTitle}
                            </h3>
                            {getStatusBadge(selectedApplication.status)}
                          </div>

                          <div className="flex flex-col items-start md:items-end gap-2">
                            <span className="text-sm text-gray-500">
                              Soumise le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}
                            </span>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={openPrintWindowClean}
                                className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 hover:bg-gray-100"
                              >
                                Imprimer (layout propre)
                              </button>

                              <button
                                onClick={downloadPdfDirect}
                                disabled={pdfGenerating}
                                className="px-3 py-2 text-sm rounded-lg bg-[#111827] text-white hover:bg-black disabled:opacity-60"
                              >
                                {pdfGenerating ? 'Génération PDF…' : 'Télécharger PDF'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Application Summary (origine) */}
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
                              <label className="block text-sm text-gray-500 mb-1">Candidat</label>
                              <p className="font-medium">{fullName(selectedApplication)}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Email</label>
                              <p className="font-medium">{safe(selectedApplication.userEmail || user?.email)}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                              <p className="font-medium">{safe(selectedApplication.phoneNumber || user?.phone)}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Statut actuel</label>
                              {getStatusBadge(selectedApplication.status)}
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Date de soumission</label>
                              <p className="font-medium">
                                {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Timeline (origine) */}
                        <div className="bg-white rounded-lg p-6 mb-6">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-[#1a56db]" />
                            Historique du statut
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${selectedApplication.status !== 'pending' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                              <div>
                                <p className="font-medium">Candidature soumise</p>
                                <p className="text-sm text-gray-500">{new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                            {selectedApplication.status !== 'pending' && (
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  selectedApplication.status === 'accepted' ? 'bg-green-500' :
                                  selectedApplication.status === 'rejected' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}></div>
                                <div>
                                  <p className="font-medium">Traitement en cours</p>
                                  <p className="text-sm text-gray-500">Votre dossier a été examiné</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ✅ Aperçu complet ajouté (infos offre + candidat + documents + paiement) */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Offre */}
                          <div className="bg-white rounded-lg p-6 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <GraduationCap size={18} className="text-[#1a56db]" />
                              Détails de l’offre
                            </h4>

                            {offerLoading ? (
                              <p className="text-sm text-gray-500">Chargement…</p>
                            ) : (
                              <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Université: </span><span className="font-medium">{safe(selectedOffer?.university)}</span></p>
                                <p><span className="text-gray-500">Lieu: </span><span className="font-medium">{safe([selectedOffer?.city, selectedOffer?.country].filter(Boolean).join(', '))}</span></p>
                                <p><span className="text-gray-500">Diplôme: </span><span className="font-medium">{safe(selectedOffer?.degree)}</span></p>
                                <p><span className="text-gray-500">Durée: </span><span className="font-medium">{safe(selectedOffer?.duration)}</span></p>
                                <p><span className="text-gray-500">Langue: </span><span className="font-medium">{safe(selectedOffer?.teachingLanguage)}</span></p>
                                <p><span className="text-gray-500">Rentrée: </span><span className="font-medium">{safe(selectedOffer?.intake)}</span></p>
                              </div>
                            )}

                            {!offerLoading && !selectedOffer && (
                              <p className="text-sm text-gray-400 mt-2">
                                Détails du programme indisponibles (offre supprimée ou non trouvée).
                              </p>
                            )}
                          </div>

                          {/* Candidat */}
                          <div className="bg-white rounded-lg p-6 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <User size={18} className="text-[#1a56db]" />
                              Informations candidat
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-500">Nom: </span><span className="font-medium">{fullName(selectedApplication)}</span></p>
                              <p><span className="text-gray-500">Email: </span><span className="font-medium">{safe(selectedApplication.userEmail || user?.email)}</span></p>
                              <p><span className="text-gray-500">Téléphone: </span><span className="font-medium">{safe(selectedApplication.phoneNumber || user?.phone)}</span></p>
                              <p><span className="text-gray-500">Nationalité: </span><span className="font-medium">{safe(selectedApplication.nationality)}</span></p>
                              <p><span className="text-gray-500">Sexe: </span><span className="font-medium">{safe(selectedApplication.sex)}</span></p>
                              <p><span className="text-gray-500">Passeport: </span><span className="font-medium">{safe(selectedApplication.passportNumber)}</span></p>
                              <p><span className="text-gray-500">Date de naissance: </span><span className="font-medium">{safe(selectedApplication.dateOfBirth)}</span></p>
                              <p><span className="text-gray-500">Adresse: </span><span className="font-medium">{safe(selectedApplication.address)}</span></p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="bg-white rounded-lg p-6 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText size={18} className="text-[#1a56db]" />
                              Documents
                            </h4>

                            {Array.isArray(selectedApplication.documents) && selectedApplication.documents.length > 0 ? (
                              <div className="space-y-3">
                                {selectedApplication.documents.map((doc, idx) => {
                                  const label = doc?.label || doc?.name || doc?.type || `Document ${idx + 1}`;
                                  const url = doc?.url ? `${BACKEND_URL}${doc.url}` : null;
                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Paperclip size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-900">{label}</span>
                                      </div>
                                      {url ? (
                                        <a className="text-sm text-[#1a56db] hover:underline" href={url} target="_blank" rel="noreferrer">
                                          Ouvrir
                                        </a>
                                      ) : (
                                        <span className="text-sm text-gray-400">—</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Aucun document</p>
                            )}
                          </div>

                          {/* Paiement */}
                          <div className="bg-white rounded-lg p-6 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <ImageIcon size={18} className="text-[#1a56db]" />
                              Paiement
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-500">Méthode: </span><span className="font-medium">{safe(selectedApplication.paymentMethod)}</span></p>
                              <p><span className="text-gray-500">Montant: </span><span className="font-medium">{safe(selectedApplication.paymentAmount)}</span></p>
                              <p className="flex items-start gap-2">
                                <span className="text-gray-500">Justificatif: </span>
                                {selectedApplication.paymentProof ? (
                                  <a
                                    className="font-medium text-[#1a56db] hover:underline break-all"
                                    href={`${BACKEND_URL}${selectedApplication.paymentProof}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Ouvrir le justificatif
                                  </a>
                                ) : (
                                  <span className="font-medium">—</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ✅ Zone cachée / dédiée au PDF (sans header/sidebar) */}
                        <div className="absolute -left-[99999px] top-0">
                          <div ref={pdfRef} className="w-[800px] bg-white p-8">
                            <div className="flex items-start justify-between mb-6">
                              <div>
                                <div className="text-xs uppercase tracking-wider text-gray-500">Winners Consulting</div>
                                <h1 className="text-2xl font-bold text-gray-900 mt-1">Résumé de candidature</h1>
                                <p className="text-sm text-gray-600 mt-1">{selectedApplication.offerTitle}</p>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-500">Statut</div>
                                <div className="font-semibold text-gray-900">{safe(selectedApplication.status)}</div>
                                <div className="text-gray-500 mt-2">Soumise le</div>
                                <div className="font-semibold text-gray-900">
                                  {new Date(selectedApplication.createdAt).toLocaleString('fr-FR')}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Programme</h2>
                                <div className="text-sm space-y-2">
                                  <div><span className="text-gray-500">Université: </span><span className="font-medium">{safe(selectedOffer?.university)}</span></div>
                                  <div><span className="text-gray-500">Lieu: </span><span className="font-medium">{safe([selectedOffer?.city, selectedOffer?.country].filter(Boolean).join(', '))}</span></div>
                                  <div><span className="text-gray-500">Diplôme: </span><span className="font-medium">{safe(selectedOffer?.degree)}</span></div>
                                  <div><span className="text-gray-500">Durée: </span><span className="font-medium">{safe(selectedOffer?.duration)}</span></div>
                                  <div><span className="text-gray-500">Langue: </span><span className="font-medium">{safe(selectedOffer?.teachingLanguage)}</span></div>
                                  <div><span className="text-gray-500">Rentrée: </span><span className="font-medium">{safe(selectedOffer?.intake)}</span></div>
                                </div>
                              </div>

                              <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Candidat</h2>
                                <div className="text-sm space-y-2">
                                  <div><span className="text-gray-500">Nom: </span><span className="font-medium">{fullName(selectedApplication)}</span></div>
                                  <div><span className="text-gray-500">Email: </span><span className="font-medium">{safe(selectedApplication.userEmail || user?.email)}</span></div>
                                  <div><span className="text-gray-500">Téléphone: </span><span className="font-medium">{safe(selectedApplication.phoneNumber || user?.phone)}</span></div>
                                  <div><span className="text-gray-500">Nationalité: </span><span className="font-medium">{safe(selectedApplication.nationality)}</span></div>
                                  <div><span className="text-gray-500">Passeport: </span><span className="font-medium">{safe(selectedApplication.passportNumber)}</span></div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-6">
                              <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Paiement</h2>
                                <div className="text-sm space-y-2">
                                  <div><span className="text-gray-500">Méthode: </span><span className="font-medium">{safe(selectedApplication.paymentMethod)}</span></div>
                                  <div><span className="text-gray-500">Montant: </span><span className="font-medium">{safe(selectedApplication.paymentAmount)}</span></div>
                                  <div>
                                    <span className="text-gray-500">Justificatif: </span>
                                    <span className="font-medium">{selectedApplication.paymentProof ? `${BACKEND_URL}${selectedApplication.paymentProof}` : '—'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="border border-gray-200 rounded-xl p-4">
                                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Documents</h2>
                                {Array.isArray(selectedApplication.documents) && selectedApplication.documents.length > 0 ? (
                                  <ul className="text-sm space-y-2">
                                    {selectedApplication.documents.map((doc, idx) => {
                                      const label = doc?.label || doc?.name || doc?.type || `Document ${idx + 1}`;
                                      const url = doc?.url ? `${BACKEND_URL}${doc.url}` : '—';
                                      return (
                                        <li key={idx}>
                                          <div className="font-medium">{label}</div>
                                          <div className="text-gray-600 break-all">{url}</div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <div className="text-sm text-gray-600">Aucun document</div>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 mt-6">
                              Généré le {new Date().toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Applications List View (origine)
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div key={app.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{app.offerTitle}</h3>
                              <div className="flex items-center gap-3 mt-2">
                                {getStatusBadge(app.status)}
                                <span className="text-sm text-gray-500">
                                  {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="px-4 py-2 bg-[#1a56db] text-white text-sm font-medium rounded-lg hover:bg-[#1e4db7] transition-colors flex items-center gap-2"
                            >
                              <Eye size={16} />
                              Voir les détails
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Messages Tab (design d’origine conservé) */}
            {activeTab === 'messages' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Mes Messages</h2>
                    <button
                      onClick={() => { setShowNewMessageModal(true); setSelectedMessage(null); }}
                      className="p-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors"
                      title="Nouveau message"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Aucun message</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className={`w-full text-left p-4 rounded-xl border transition-colors ${
                            selectedMessage?.id === msg.id
                              ? 'border-[#1a56db] bg-blue-50'
                              : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{msg.subject}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{msg.lastMessage || msg.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('fr-FR') : ''}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  {selectedMessage ? (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h3>

                      <div className="mt-4 space-y-3">
                        {(selectedMessage.replies || []).map((rep, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-900">{rep.content}</p>
                            {(rep.attachments || []).length > 0 && (
                              <div className="mt-3 space-y-2">
                                {rep.attachments.map((a, i) => (
                                  <a
                                    key={i}
                                    href={`${BACKEND_URL}${a}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-[#1a56db] hover:underline break-all flex items-center gap-2"
                                  >
                                    <Paperclip size={14} />
                                    {a}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleReplyMessage} className="mt-6">
                        <textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                          rows={3}
                          placeholder="Écrire une réponse..."
                        />

                        {attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full">
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <button type="button" onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-600">
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                              <Paperclip size={16} />
                              Joindre
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors flex items-center gap-2"
                          >
                            <Send size={16} />
                            Envoyer
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center">
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Sélectionnez un message pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New message modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Nouveau message</h3>
                <button
                  onClick={() => { setShowNewMessageModal(false); setNewMessage({ subject: '', content: '' }); setAttachments([]); }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendNewMessage} className="space-y-4">
                <input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  placeholder="Sujet"
                />
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  rows={5}
                  placeholder="Votre message..."
                />

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button type="button" onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Paperclip size={16} />
                    Joindre
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1e4db7] transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedOfferForApplication && (
          <ApplicationModal
            offer={selectedOfferForApplication}
            isOpen={showApplicationModal}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedOfferForApplication(null);
            }}
            onSuccess={() => {
              setShowApplicationModal(false);
              setSelectedOfferForApplication(null);
              loadApplications();
              loadFavorites();
              setActiveTab('applications');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
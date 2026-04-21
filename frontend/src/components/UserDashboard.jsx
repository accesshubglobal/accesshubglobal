import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Heart, FileText, MessageCircle, LogOut, Clock, CheckCircle, XCircle, 
  AlertCircle, ChevronRight, Star, Eye, Send, Paperclip, X, Plus, 
  MapPin, GraduationCap, Calendar, Award, Trash2, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import { generateApplicationPDF } from '../utils/pdfGenerator';

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
  const [applicationOfferDetails, setApplicationOfferDetails] = useState(null);
  const [loadingOfferDetails, setLoadingOfferDetails] = useState(false);
  
  // Re-submission state
  const [resubmitDocs, setResubmitDocs] = useState([]);
  const [uploadingResubmitDoc, setUploadingResubmitDoc] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  
  // Application modal state for favorites
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOfferForApplication, setSelectedOfferForApplication] = useState(null);

  useEffect(() => {
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'applications') loadApplications();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

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

  // Select application and fetch offer details
  const handleSelectApplication = async (app) => {
    setSelectedApplication(app);
    setApplicationOfferDetails(null);
    setLoadingOfferDetails(true);
    setResubmitDocs(app.documents || []);
    try {
      const res = await axios.get(`${API}/offers/${app.offerId}`);
      setApplicationOfferDetails(res.data);
    } catch (err) {
      console.error('Error fetching offer details:', err);
    }
    setLoadingOfferDetails(false);
  };

  // Upload doc for re-submission
  const handleResubmitDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResubmitDoc(true);
    try {
      const sigRes = await axios.get(`${API}/upload/signature`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', api_key);
      formData.append('folder', folder);
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        formData
      );
      const newDoc = { name: file.name, url: uploadRes.data.secure_url, filename: file.name };
      setResubmitDocs(prev => [...prev, newDoc]);
    } catch (err) {
      console.error('Upload error:', err);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await axios.post(`${API}/upload`, formData);
        const newDoc = { name: file.name, url: uploadRes.data.url, filename: file.name };
        setResubmitDocs(prev => [...prev, newDoc]);
      } catch (e2) {
        console.error('Fallback upload error:', e2);
        alert('Erreur lors du téléversement du fichier');
      }
    }
    setUploadingResubmitDoc(false);
    e.target.value = '';
  };

  const removeResubmitDoc = (idx) => {
    setResubmitDocs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleResubmit = async () => {
    if (!selectedApplication) return;
    setResubmitting(true);
    try {
      await axios.put(`${API}/applications/${selectedApplication.id}/documents`, { documents: resubmitDocs });
      await axios.put(`${API}/applications/${selectedApplication.id}/resubmit`);
      setSelectedApplication(prev => ({ ...prev, status: 'pending', modifyReason: null, documents: resubmitDocs }));
      loadApplications();
      alert('Candidature re-soumise avec succès !');
    } catch (err) {
      console.error('Error resubmitting:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la re-soumission');
    }
    setResubmitting(false);
  };

  // Download PDF — branded AccessHub Global letterhead + structured data
  const handleDownloadPDF = async () => {
    if (!selectedApplication) return;
    try {
      await generateApplicationPDF({
        application: selectedApplication,
        offer: applicationOfferDetails,
        user,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
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
      
      setShowNewMessageModal(false);
      setNewMessage({ subject: '', content: '' });
      setAttachments([]);
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
      reviewing: { icon: AlertCircle, color: 'bg-blue-100 text-blue-700', label: 'En cours d\'examen' },
      accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Acceptée' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Refusée' },
      modify: { icon: AlertTriangle, color: 'bg-orange-100 text-orange-700', label: 'À modifier' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'favorites', label: 'Mes Favoris', icon: Heart, count: favorites.length },
    { id: 'applications', label: 'Mes Candidatures', icon: FileText, count: applications.length },
    { id: 'messages', label: 'Mes Messages', icon: MessageCircle, count: messages.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-[#1a56db] font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {tab.label}
                    </span>
                    {tab.count > 0 && (
                      <span className="bg-[#1a56db] text-white text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Informations du Profil</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                      <p className="text-gray-900 font-medium">{user?.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                      <p className="text-gray-900 font-medium">{user?.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                      <p className="text-gray-900 font-medium">{user?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
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
                      <p className="text-sm text-gray-400 mt-2">Ajoutez des programmes à vos favoris pour les retrouver ici</p>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 px-6 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] transition-colors"
                      >
                        Découvrir les programmes
                      </button>
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
                  ) : selectedApplication ? (
                    // Application Detail View - FULL INFO + PDF EXPORT
                    <div data-testid="application-detail-view">
                      {/* Header with Action Buttons */}
                      <div className="flex items-center justify-between mb-6">
                        <button
                          data-testid="back-to-list-btn"
                          onClick={() => { setSelectedApplication(null); setApplicationOfferDetails(null); }}
                          className="flex items-center gap-2 text-[#1a56db] hover:underline"
                        >
                          <ChevronRight size={16} className="rotate-180" />
                          Retour à la liste
                        </button>
                        <div className="flex gap-2">
                          <button
                            data-testid="print-btn"
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimer
                          </button>
                          <button
                            data-testid="download-pdf-btn"
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Télécharger PDF
                          </button>
                        </div>
                      </div>
                      
                      {/* Content - Printable */}
                      <div id="application-detail-content" className="bg-white rounded-xl p-8 shadow-sm space-y-6">
                        {/* Header */}
                        <div className="border-b border-gray-200 pb-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {selectedApplication.offerTitle}
                              </h2>
                              <p className="text-gray-600">{applicationOfferDetails?.university || selectedApplication.university || 'Université'}</p>
                            </div>
                            <div>
                              {getStatusBadge(selectedApplication.status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            Candidature soumise le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">Réf: #{selectedApplication.id?.substring(0, 8) || 'N/A'}</p>
                          
                          {/* Modify reason alert */}
                          {selectedApplication.status === 'modify' && selectedApplication.modifyReason && (
                            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-orange-800 text-sm">Modification demandée</p>
                                  <p className="text-sm text-orange-700 mt-1">{selectedApplication.modifyReason}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Offer Details Section */}
                        {loadingOfferDetails ? (
                          <div className="text-center py-4 text-gray-500 text-sm">Chargement des détails de l'offre...</div>
                        ) : applicationOfferDetails && (
                          <div data-testid="offer-details-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <GraduationCap size={18} className="text-[#1a56db]" />
                              Détails du Programme
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-5 space-y-4 border border-blue-100">
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Université</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.university}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Ville / Pays</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.city}, {applicationOfferDetails.country}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Diplôme</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.degree}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Durée</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.duration}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Langue d'enseignement</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.teachingLanguage || 'Non précisé'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Rentrée</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.intake || 'Non précisé'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Date limite</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.deadline || 'Ouvert'}</p>
                                </div>
                                {applicationOfferDetails.hasScholarship && (
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Type de bourse</label>
                                    <p className="font-medium text-green-700">{applicationOfferDetails.scholarshipType}</p>
                                  </div>
                                )}
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
                                  <p className="font-medium text-gray-900">{applicationOfferDetails.categoryLabel || applicationOfferDetails.category}</p>
                                </div>
                              </div>

                              {applicationOfferDetails.description && (
                                <div className="pt-3 border-t border-blue-200">
                                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicationOfferDetails.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fees Section */}
                        {applicationOfferDetails?.fees && Object.keys(applicationOfferDetails.fees).length > 0 && (
                          <div data-testid="fees-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-[#1a56db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Frais et Tarifs
                            </h3>
                            <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                              <div className="grid md:grid-cols-2 gap-4">
                                {applicationOfferDetails.fees.originalTuition > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Frais de scolarité</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.originalTuition).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.scholarshipTuition > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Scolarité après bourse</span>
                                    <span className="font-bold text-green-700">{Number(applicationOfferDetails.fees.scholarshipTuition).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.accommodationDouble > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Hébergement (double)</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.accommodationDouble).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.accommodationSingle > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Hébergement (single)</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.accommodationSingle).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.registrationFee > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Frais d'inscription</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.registrationFee).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.insuranceFee > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Assurance</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.insuranceFee).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {applicationOfferDetails.fees.applicationFee > 0 && (
                                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">Frais de dossier</span>
                                    <span className="font-bold text-gray-900">{Number(applicationOfferDetails.fees.applicationFee).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                )}
                                {(applicationOfferDetails.fees.otherFees || []).map((fee, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm text-gray-600">{fee.name || fee.label}</span>
                                    <span className="font-bold text-gray-900">{Number(fee.amount).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                  </div>
                                ))}
                              </div>
                              {applicationOfferDetails.serviceFee > 0 && (
                                <div className="mt-3 pt-3 border-t border-amber-200 flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Frais de service AccessHub Global</span>
                                  <span className="font-bold text-[#1a56db]">{Number(applicationOfferDetails.serviceFee).toLocaleString()} {applicationOfferDetails.currency || 'CNY'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Admission Conditions */}
                        {applicationOfferDetails?.admissionConditions && applicationOfferDetails.admissionConditions.length > 0 && (
                          <div data-testid="admission-conditions-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Award size={18} className="text-[#1a56db]" />
                              Conditions d'Admission
                            </h3>
                            <ul className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-2">
                              {applicationOfferDetails.admissionConditions.map((cond, idx) => {
                                let label = '';
                                let detail = '';
                                if (typeof cond === 'string') {
                                  label = cond;
                                } else if (cond && typeof cond === 'object') {
                                  label = cond.condition || cond.title || cond.text || cond.label || '';
                                  detail = cond.description || '';
                                }
                                if (!label && !detail) return null;
                                return (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>
                                      <span className="font-medium">{label}</span>
                                      {detail && <span className="text-gray-500"> — {detail}</span>}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Required Documents from Offer */}
                        {applicationOfferDetails?.requiredDocuments && applicationOfferDetails.requiredDocuments.length > 0 && (
                          <div data-testid="required-docs-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText size={18} className="text-[#1a56db]" />
                              Documents Requis par le Programme
                            </h3>
                            <ul className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-2">
                              {applicationOfferDetails.requiredDocuments.map((doc, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <FileText size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Personal Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-[#1a56db]" />
                            Informations du Candidat
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Nom</label>
                              <p className="font-medium text-gray-900">{selectedApplication.lastName || user?.lastName || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                              <p className="font-medium text-gray-900">{selectedApplication.firstName || user?.firstName || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Email</label>
                              <p className="font-medium text-gray-900">{selectedApplication.userEmail || user?.email}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                              <p className="font-medium text-gray-900">{selectedApplication.phoneNumber || selectedApplication.phone || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Nationalité</label>
                              <p className="font-medium text-gray-900">{selectedApplication.nationality || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Sexe</label>
                              <p className="font-medium text-gray-900">{selectedApplication.sex || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Date de naissance</label>
                              <p className="font-medium text-gray-900">
                                {selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">N° Passeport</label>
                              <p className="font-medium text-gray-900">{selectedApplication.passportNumber || 'Non renseigné'}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                              <p className="font-medium text-gray-900">{selectedApplication.address || 'Non renseigné'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Programs */}
                        {selectedApplication.additionalPrograms && selectedApplication.additionalPrograms.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Star size={18} className="text-[#1a56db]" />
                              Programmes Supplémentaires
                            </h3>
                            <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                              {selectedApplication.additionalPrograms.map((prog, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <ChevronRight size={14} className="text-blue-500" />
                                  {prog}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents Submitted */}
                        {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                          <div data-testid="submitted-docs-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText size={18} className="text-[#1a56db]" />
                              Documents Soumis ({selectedApplication.documents.length})
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                              {selectedApplication.documents.map((doc, idx) => {
                                const docUrl = typeof doc === 'string' ? doc : doc?.url;
                                const docName = typeof doc === 'object' ? doc?.name : `Document ${idx + 1}`;
                                return (
                                  <a
                                    key={idx}
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                  >
                                    <FileText size={20} className="text-blue-600" />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900">{docName}</p>
                                      <p className="text-xs text-gray-500">Cliquez pour voir</p>
                                    </div>
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Payment Info */}
                        {(selectedApplication.paymentMethod || selectedApplication.paymentProof) && (
                          <div data-testid="payment-section">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <svg className="w-5 h-5 text-[#1a56db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Paiement
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-2 gap-4">
                              {selectedApplication.paymentMethod && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Méthode</label>
                                  <p className="font-medium text-gray-900 capitalize">{selectedApplication.paymentMethod.replace(/_/g, ' ')}</p>
                                </div>
                              )}
                              {selectedApplication.paymentAmount > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Montant</label>
                                  <p className="font-medium text-gray-900">{Number(selectedApplication.paymentAmount).toLocaleString()} EUR</p>
                                </div>
                              )}
                              {selectedApplication.paymentStatus && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Statut du paiement</label>
                                  <p className={`font-medium ${selectedApplication.paymentStatus === 'verified' ? 'text-green-600' : selectedApplication.paymentStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
                                    {selectedApplication.paymentStatus === 'pending' && 'En attente'}
                                    {selectedApplication.paymentStatus === 'submitted' && 'Soumis'}
                                    {selectedApplication.paymentStatus === 'verified' && 'Vérifié'}
                                    {selectedApplication.paymentStatus === 'rejected' && 'Rejeté'}
                                  </p>
                                </div>
                              )}
                              {selectedApplication.paymentProof && (
                                <div>
                                  <a
                                    href={selectedApplication.paymentProof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    <Eye size={16} />
                                    Voir justificatif
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status Timeline */}
                        <div data-testid="status-timeline-section">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-[#1a56db]" />
                            Suivi de Candidature
                          </h3>
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                              <div>
                                <p className="font-medium text-sm">Candidature soumise</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            {selectedApplication.status !== 'pending' && (
                              <div className="flex gap-3">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  selectedApplication.status === 'accepted' ? 'bg-green-500' :
                                  selectedApplication.status === 'rejected' ? 'bg-red-500' :
                                  selectedApplication.status === 'modify' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}></div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {selectedApplication.status === 'reviewing' && 'En cours d\'examen'}
                                    {selectedApplication.status === 'accepted' && 'Candidature acceptée'}
                                    {selectedApplication.status === 'rejected' && 'Candidature refusée'}
                                    {selectedApplication.status === 'modify' && 'Modification demandée'}
                                  </p>
                                  {selectedApplication.updatedAt && (
                                    <p className="text-xs text-gray-500">
                                      {new Date(selectedApplication.updatedAt).toLocaleDateString('fr-FR')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {selectedApplication.notes && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.notes}</p>
                            </div>
                          </div>
                        )}

                        {/* Re-submission Section */}
                        {selectedApplication.status === 'modify' && (
                          <div data-testid="resubmit-section" className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50/50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <AlertTriangle size={20} className="text-orange-500" />
                              Corriger et re-soumettre
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Corrigez les erreurs mentionnées ci-dessus, ajoutez ou remplacez vos documents, puis re-soumettez votre candidature.
                            </p>

                            {/* Current documents with remove option */}
                            <div className="space-y-2 mb-4">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Documents actuels</p>
                              {resubmitDocs.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun document</p>
                              ) : (
                                resubmitDocs.map((doc, idx) => {
                                  const docName = typeof doc === 'string' ? doc : (doc?.name || doc?.filename || `Document ${idx + 1}`);
                                  const docUrl = typeof doc === 'string' ? doc : (doc?.url || '');
                                  return (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                      <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 flex-1 truncate">{docName}</span>
                                      {docUrl && (
                                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex-shrink-0">
                                          Voir
                                        </a>
                                      )}
                                      <button
                                        onClick={() => removeResubmitDoc(idx)}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                        data-testid={`remove-resubmit-doc-${idx}`}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Upload new document */}
                            <div className="mb-4">
                              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:bg-orange-100/50 transition-colors">
                                <input
                                  type="file"
                                  onChange={handleResubmitDocUpload}
                                  className="hidden"
                                  data-testid="resubmit-file-input"
                                  disabled={uploadingResubmitDoc}
                                />
                                {uploadingResubmitDoc ? (
                                  <div className="flex items-center gap-2 text-sm text-orange-600">
                                    <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                                    Téléversement en cours...
                                  </div>
                                ) : (
                                  <span className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                                    <Plus size={16} />
                                    Ajouter un document
                                  </span>
                                )}
                              </label>
                            </div>

                            {/* Re-submit button */}
                            <button
                              data-testid="resubmit-btn"
                              onClick={handleResubmit}
                              disabled={resubmitting}
                              className="w-full py-3 bg-[#1a56db] text-white rounded-xl font-semibold hover:bg-[#1648b8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {resubmitting ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Re-soumission en cours...
                                </>
                              ) : (
                                <>
                                  <Send size={16} />
                                  Re-soumettre ma candidature
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                          <p>Référence : #{selectedApplication.id?.substring(0, 8) || 'N/A'}</p>
                          <p className="mt-1">AccessHub Global - Excellence dans l'éducation internationale</p>
                        </div>
                      </div>
                    </div>
                  ) : (

                    // Applications List
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div 
                          key={app.id} 
                          className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectApplication(app)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">{app.offerTitle}</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Soumise le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                              {getStatusBadge(app.status)}
                            </div>
                            <button className="text-[#1a56db] hover:underline text-sm flex items-center gap-1">
                              Voir détails
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Mes Messages ({messages.length})
                    </h2>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] transition-colors"
                    >
                      <Plus size={18} />
                      Nouveau message
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Aucun message pour le moment</p>
                      <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="mt-4 px-6 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] transition-colors"
                      >
                        Démarrer une conversation
                      </button>
                    </div>
                  ) : selectedMessage ? (
                    // Message Detail with Reply
                    <div>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="flex items-center gap-2 text-[#1a56db] mb-4 hover:underline"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                        Retour aux messages
                      </button>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg">{selectedMessage.subject}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>









                        {/* Messages Thread */}
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                          {/* Original Message - User (Left) */}
                          <div className="flex justify-start">
                            <div className="bg-blue-50 rounded-lg p-4 max-w-[75%] border-l-4 border-[#1a56db]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </div>
                                <span className="font-medium text-[#1a56db]">Vous</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(selectedMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-700">{selectedMessage.content}</p>
                              {selectedMessage.attachments?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {selectedMessage.attachments.map((url, idx) => (
                                    <a 
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-[#1a56db] hover:bg-gray-100"
                                    >
                                      <Paperclip size={14} />
                                      Pièce jointe {idx + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Replies - Positioned left (user) or right (admin) */}
                          {selectedMessage.replies?.map((reply, idx) => (
                            <div key={idx} className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`rounded-lg p-4 max-w-[75%] ${
                                reply.isAdmin 
                                  ? 'bg-green-50 border-r-4 border-green-500' 
                                  : 'bg-blue-50 border-l-4 border-[#1a56db]'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    reply.isAdmin ? 'bg-green-600' : 'bg-[#1a56db]'
                                  }`}>
                                    {reply.isAdmin ? 'WC' : user?.firstName?.charAt(0) + user?.lastName?.charAt(0)}
                                  </div>
                                  <span className={`font-medium ${reply.isAdmin ? 'text-green-700' : 'text-[#1a56db]'}`}>
                                    {reply.isAdmin ? (reply.adminName || 'Équipe AccessHub') : 'Vous'}
                                  </span>
                                  {reply.isAdmin && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Admin</span>}
                                  <span className="text-xs text-gray-400">
                                    {new Date(reply.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-gray-700">{reply.content}</p>
                                {reply.attachments?.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {reply.attachments.map((url, aidx) => (
                                      <a 
                                        key={aidx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Paperclip size={14} />
                                        Pièce jointe {aidx + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>












                        

                        {/* Reply Form */}
                        <form onSubmit={handleReplyMessage} className="border-t pt-4">
                          <div className="mb-3">
                            {attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {attachments.map((file, idx) => (
                                  <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-sm">
                                    <Paperclip size={14} />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button 
                                      type="button"
                                      onClick={() => removeAttachment(idx)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              multiple
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-3 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ajouter une pièce jointe"
                            >
                              <Paperclip size={20} />
                            </button>
                            <input
                              type="text"
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              placeholder="Écrivez votre réponse..."
                              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                            />
                            <button
                              type="submit"
                              disabled={!newReply.trim()}
                              className="px-6 py-3 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                              <Send size={18} />
                              Envoyer
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    // Messages List
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                            msg.replies?.length > 0 ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                          }`}
                          onClick={() => setSelectedMessage(msg)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.content}</p>
                              {msg.replies?.length > 0 && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  {msg.replies.length} réponse(s) - Dernière réponse le {new Date(msg.replies[msg.replies.length - 1].createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-400">
                                {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                              <ChevronRight size={16} className="text-gray-400 mt-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNewMessageModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Nouveau message</h3>
                <button onClick={() => setShowNewMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSendNewMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                  placeholder="Sujet de votre message"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none"
                  rows={5}
                  placeholder="Écrivez votre message..."
                  required
                />
              </div>
              
              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pièces jointes</label>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-sm">
                        {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <Paperclip size={14} />}
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
                >
                  <Paperclip size={18} />
                  Ajouter des fichiers
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowNewMessageModal(false); setAttachments([]); }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Application Modal for Favorites */}
      {showApplicationModal && selectedOfferForApplication && (
        <ApplicationModal
          isOpen={showApplicationModal}
          offer={selectedOfferForApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedOfferForApplication(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedOfferForApplication(null);
            // Reload applications to show the new one
            if (activeTab === 'applications') {
              loadApplications();
            }
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;

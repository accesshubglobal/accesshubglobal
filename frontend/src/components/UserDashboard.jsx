import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Heart, FileText, MessageCircle, LogOut, Clock, CheckCircle, XCircle, 
  AlertCircle, ChevronRight, Star, Eye, Send, Paperclip, X, Plus, 
  MapPin, GraduationCap, Calendar, Award, Trash2, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from './ApplicationModal';

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
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Refusée' }
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
                          <span className="text-sm text-gray-500">
                            Soumise le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}
                          </span>
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
                              <label className="block text-sm text-gray-500 mb-1">Candidat</label>
                              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Email</label>
                              <p className="font-medium">{user?.email}</p>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Téléphone</label>
                              <p className="font-medium">{user?.phone || 'Non renseigné'}</p>
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

                        {/* Status Timeline */}
                        <div className="bg-white rounded-lg p-6">
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
                                  <p className="font-medium">
                                    {selectedApplication.status === 'reviewing' && 'En cours d\'examen'}
                                    {selectedApplication.status === 'accepted' && 'Candidature acceptée'}
                                    {selectedApplication.status === 'rejected' && 'Candidature refusée'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
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
                          onClick={() => setSelectedApplication(app)}
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
                                    {reply.isAdmin ? (reply.adminName || 'Équipe Winner\'s') : 'Vous'}
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

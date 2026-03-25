import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Globe, GraduationCap, Calendar, Award, FileText, Check, Download, Heart, MessageCircle, Star, Eye, Loader2, Share2, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ContactModal from './ContactModal';
import ApplicationModal from './ApplicationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const OfferDetailModal = ({ offer, isOpen, onClose, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { user, isAuthenticated, addToFavorites, removeFromFavorites } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deadlineStatus, setDeadlineStatus] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const isFavorite = user?.favorites?.includes(offer?.id);

  // Check deadline status on mount
  useEffect(() => {
    if (isOpen && offer?.id) {
      checkDeadline();
    }
  }, [isOpen, offer?.id]);

  const checkDeadline = async () => {
    if (!offer?.id) return;
    try {
      const response = await axios.get(`${API}/offers/${offer.id}/deadline-status`);
      setDeadlineStatus(response.data);
    } catch (err) {
      // Silently handle 404 - offer might be from mock data
      if (err.response?.status !== 404) {
        console.error('Error checking deadline:', err);
      }
      // Default to open if offer not found
      setDeadlineStatus({ isOpen: true, deadline: '' });
    }
  };

  const formatCurrency = (amount, currency) => {
    if (amount === 0) return '0';
    return `${amount.toLocaleString()} ${currency === 'CNY' ? 'CNY' : '€'}`;
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      onClose();
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setShowApplicationModal(true);
  };

  const handleShare = () => {
    if (!offer?.id) return;
    const url = `${window.location.origin}?offer=${offer.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      onClose();
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    if (!offer?.id) return;

    setFavoriteLoading(true);
    if (isFavorite) {
      await removeFromFavorites(offer.id);
    } else {
      await addToFavorites(offer.id);
    }
    setFavoriteLoading(false);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      onClose();
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setShowContactModal(true);
  };

  // Early return after all hooks
  if (!isOpen || !offer) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            data-testid="close-offer-modal"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header Section */}
            <div className="relative h-64">
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Header Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {offer.badges.map((badge, index) => (
                    <span 
                      key={index}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        badge.includes('Bourse') ? 'bg-green-500 text-white' :
                        badge.includes('Top') || badge.includes('Populaire') ? 'bg-orange-500 text-white' :
                        'bg-[#8b5cf6] text-white'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{offer.title}</h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={16} />
                    {offer.university}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {offer.city}, {offer.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Actions Bar */}
            <div className="bg-gray-50 p-4 border-b flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-500">
                    {formatCurrency(offer.scholarshipTuition, offer.currency)}
                  </span>
                  <span className="text-sm text-gray-400">/ an</span>
                  {offer.scholarshipTuition !== offer.originalTuition && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(offer.originalTuition, offer.currency)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {offer.views?.toLocaleString() || 0} vues
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {offer.rating || 4.5}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {/* Apply Button with deadline check */}
                {deadlineStatus && !deadlineStatus.isOpen ? (
                  <div className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2">
                    <Clock size={18} />
                    Date limite dépassée
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    className="bg-[#1a56db] hover:bg-[#1648b8] text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                    data-testid="apply-button"
                  >
                    <FileText size={18} />
                    Postuler
                  </button>
                )}
                <button 
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
                    isFavorite 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  data-testid="favorite-button"
                >
                  {favoriteLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                  )}
                  {isFavorite ? 'Favori' : 'Ajouter'}
                </button>
                <button 
                  onClick={handleContact}
                  className="border border-gray-300 hover:border-[#1a56db] text-gray-700 hover:text-[#1a56db] px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                  data-testid="contact-button"
                >
                  <MessageCircle size={18} />
                  Contact
                </button>
                {/* Share Button */}
                <button 
                  onClick={handleShare}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    copySuccess 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  data-testid="share-button"
                >
                  {copySuccess ? <Check size={18} /> : <Link2 size={18} />}
                  {copySuccess ? 'Copié!' : 'Partager'}
                </button>
              </div>
            </div>

            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mx-6 mt-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                <span>Connectez-vous pour postuler, sauvegarder ou contacter l'équipe.</span>
                <button 
                  onClick={() => { onClose(); if (onOpenAuth) onOpenAuth('login'); }}
                  className="text-[#1a56db] font-medium hover:underline"
                >
                  Se connecter
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-[#1a56db] border-b-2 border-[#1a56db]'
                      : 'text-gray-600 hover:text-[#1a56db]'
                  }`}
                >
                  Détails du programme
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'text-[#1a56db] border-b-2 border-[#1a56db]'
                      : 'text-gray-600 hover:text-[#1a56db]'
                  }`}
                >
                  Documents requis
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'fees'
                      ? 'text-[#1a56db] border-b-2 border-[#1a56db]'
                      : 'text-gray-600 hover:text-[#1a56db]'
                  }`}
                >
                  Frais
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#1a56db] rounded"></div>
                      Informations de base
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap size={20} className="text-[#1a56db]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Diplôme</p>
                          <p className="font-medium">{offer.degree}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock size={20} className="text-[#1a56db]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Durée</p>
                          <p className="font-medium">{offer.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe size={20} className="text-[#1a56db]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Langue d'enseignement</p>
                          <p className="font-medium">{offer.teachingLanguage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar size={20} className="text-[#1a56db]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rentrée</p>
                          <p className="font-medium">{offer.intake}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:col-span-2">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Calendar size={20} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date limite de candidature</p>
                          <p className="font-medium text-red-500">{offer.deadline}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Information */}
                  {offer.hasScholarship && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-green-500 rounded"></div>
                        Informations sur la bourse
                      </h3>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                          <Award size={20} className="text-green-600" />
                          <span className="font-semibold text-green-700">{offer.scholarshipType}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Check size={16} className={offer.scholarshipDetails.tuitionCovered ? 'text-green-500' : 'text-gray-300'} />
                            <span className={offer.scholarshipDetails.tuitionCovered ? 'text-green-700' : 'text-gray-400'}>
                              Frais de scolarité couverts
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className={offer.scholarshipDetails.accommodationCovered ? 'text-green-500' : 'text-gray-300'} />
                            <span className={offer.scholarshipDetails.accommodationCovered ? 'text-green-700' : 'text-gray-400'}>
                              Logement couvert
                            </span>
                          </div>
                          {offer.scholarshipDetails.monthlyAllowance > 0 && (
                            <div className="flex items-center gap-2">
                              <Check size={16} className="text-green-500" />
                              <span className="text-green-700">
                                Allocation mensuelle: {offer.scholarshipDetails.monthlyAllowance} {offer.currency === 'CNY' ? 'CNY' : '€'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Check size={16} className={offer.scholarshipDetails.insuranceCovered ? 'text-green-500' : 'text-gray-300'} />
                            <span className={offer.scholarshipDetails.insuranceCovered ? 'text-green-700' : 'text-gray-400'}>
                              Assurance couverte
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conditions d'admission - NEW FORMAT */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#1a56db] rounded"></div>
                      Conditions d'admission
                    </h3>
                    {offer.admissionConditions && offer.admissionConditions.length > 0 ? (
                      <div className="bg-purple-50 rounded-xl p-4 space-y-4 border border-purple-100">
                        {offer.admissionConditions.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{item.condition}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Âge requis</span>
                          <span className="font-medium">{offer.requirements?.age || 'Non spécifié'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Diplôme précédent</span>
                          <span className="font-medium text-right max-w-[60%]">{offer.requirements?.previousDegree || 'Non spécifié'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Moyenne requise</span>
                          <span className="font-medium">{offer.requirements?.gpa || 'Non spécifié'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">Exigence linguistique</span>
                          <span className="font-medium text-right max-w-[60%]">{offer.requirements?.language || 'Non spécifié'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#1a56db] rounded"></div>
                      Description du programme
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Required Documents */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#1a56db] rounded"></div>
                      Documents requis pour candidature
                    </h3>
                    {offer.requiredDocuments && offer.requiredDocuments.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {offer.requiredDocuments.map((doc, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                              <Check size={18} />
                            </div>
                            <span className="text-gray-700 flex-1 font-medium">{doc}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Aucun document spécifié pour cette offre</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Document Templates (to download, fill, and re-upload) */}
                  {offer.documentTemplates && offer.documentTemplates.some(t => t.name && t.url) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded"></div>
                        Documents à télécharger, remplir et soumettre
                      </h3>
                      <div className="space-y-3">
                        {offer.documentTemplates.filter(t => t.name && t.url).map((template, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{template.name}</p>
                                <p className="text-xs text-gray-500">Téléchargez, remplissez et soumettez lors de votre candidature</p>
                              </div>
                            </div>
                            <a
                              href={template.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
                            >
                              <Download size={18} />
                              Télécharger
                            </a>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>
                            <strong>Workflow :</strong> 1) Téléchargez ces documents → 2) Remplissez/Signez-les → 3) Uploadez-les dans votre formulaire de candidature
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Note importante :</strong> Tous les documents doivent être traduits en anglais ou en chinois et certifiés conformes à l'original.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="space-y-6">
                  {/* University Fees - Detailed */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-[#1a56db] rounded"></div>
                      Frais universitaires détaillés ({offer.currency || 'CNY'})
                    </h3>
                    <div className="bg-blue-50 rounded-xl overflow-hidden border border-blue-100">
                      <table className="w-full">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Catégorie</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Montant</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {offer.fees?.tuitionFee !== undefined && offer.fees.tuitionFee > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Frais de scolarité</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.tuitionFee, offer.currency)}</td>
                            </tr>
                          )}
                          {offer.fees?.registrationFee !== undefined && offer.fees.registrationFee > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Frais d'inscription</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.registrationFee, offer.currency)}</td>
                            </tr>
                          )}
                          {offer.fees?.accommodationDouble !== undefined && offer.fees.accommodationDouble > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Logement (chambre double)</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.accommodationDouble, offer.currency)}</td>
                            </tr>
                          )}
                          {offer.fees?.accommodationSingle !== undefined && offer.fees.accommodationSingle > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Logement (chambre simple)</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.accommodationSingle, offer.currency)}</td>
                            </tr>
                          )}
                          {offer.fees?.insuranceFee !== undefined && offer.fees.insuranceFee > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Assurance</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.insuranceFee, offer.currency)}</td>
                            </tr>
                          )}
                          {offer.fees?.booksFee !== undefined && offer.fees.booksFee > 0 && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Livres et matériel</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.fees.booksFee, offer.currency)}</td>
                            </tr>
                          )}
                          {/* Other Fees */}
                          {offer.fees?.otherFees && offer.fees.otherFees.length > 0 && offer.fees.otherFees.map((fee, index) => (
                            fee.amount > 0 && (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-700">{fee.name}</td>
                                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(fee.amount, offer.currency)}</td>
                              </tr>
                            )
                          ))}
                          {/* Fallback to old format if no detailed fees */}
                          {(!offer.fees?.tuitionFee && offer.originalTuition > 0) && (
                            <tr className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Frais de scolarité</td>
                              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(offer.originalTuition, offer.currency)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Service Fee */}
                  {offer.serviceFee > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Frais de service AccessHub Global</span>
                        <span className="text-xl font-bold text-green-600">{formatCurrency(offer.serviceFee, offer.currency)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Assistance complète pour votre candidature</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        offer={offer}
      />

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplicationModal}
        offer={offer}
        onClose={() => setShowApplicationModal(false)}
        onSuccess={() => {
          setShowApplicationModal(false);
        }}
      />
    </>
  );
};

export default OfferDetailModal;

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Check, AlertCircle, Loader2, FileText, User, CreditCard, Copy, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const ApplicationModal = ({ offer, isOpen, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [deadlineStatus, setDeadlineStatus] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nationality: '',
    sex: '',
    passportNumber: '',
    dateOfBirth: '',
    phoneNumber: user?.phone || '',
    address: '',
    additionalPrograms: [],
    documents: [],
    termsAccepted: false,
    paymentMethod: '',
    paymentProof: '',
    paymentAmount: 0
  });

  // Uploaded files state
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (isOpen && offer) {
      loadPaymentSettings();
      checkDeadline();
    }
  }, [isOpen, offer]);

  const loadPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(response.data);
      setFormData(prev => ({
        ...prev,
        paymentAmount: response.data.applicationFee || 50
      }));
    } catch (err) {
      console.error('Error loading payment settings:', err);
    }
  };

  const checkDeadline = async () => {
    if (!offer?.id) return;
    try {
      const response = await axios.get(`${API}/offers/${offer.id}/deadline-status`);
      setDeadlineStatus(response.data);
    } catch (err) {
      console.error('Error checking deadline:', err);
    }
  };

  // Upload file: try direct Cloudinary first (avoids Vercel 4.5MB limit), fallback to backend
  const uploadFile = async (file) => {
    try {
      // Get signature from backend
      const sigRes = await axios.get(`${API}/upload/signature`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;

      // Upload directly to Cloudinary using fetch (no Authorization header = no CORS issue)
      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('signature', signature);
      cloudFormData.append('timestamp', String(timestamp));
      cloudFormData.append('api_key', api_key);
      cloudFormData.append('folder', folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        { method: 'POST', body: cloudFormData }
      );
      if (!cloudRes.ok) throw new Error('Cloudinary upload failed');
      const cloudData = await cloudRes.json();
      return { url: cloudData.secure_url, filename: file.name };
    } catch (sigErr) {
      // Fallback: upload via backend
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await axios.post(`${API}/upload`, formDataUpload, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 60000
      });
      return { url: response.data.url, filename: file.name };
    }
  };

  const handleDocUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError(`Le fichier ${docName} est trop volumineux (max 10 Mo)`);
      return;
    }

    setUploadingDoc(docName);
    setError('');

    try {
      const result = await uploadFile(file);

      setUploadedDocs(prev => ({
        ...prev,
        [docName]: { name: file.name, url: result.url }
      }));

      setFormData(prev => {
        const newDocs = prev.documents.filter(d => d.name !== docName);
        newDocs.push({ name: docName, url: result.url, filename: file.name });
        return { ...prev, documents: newDocs };
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || '';
      setError(`Erreur lors du téléchargement de ${docName}. ${detail}`);
    }
    setUploadingDoc(null);
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10 Mo)');
      return;
    }

    setUploadingProof(true);
    setError('');

    try {
      const result = await uploadFile(file);
      setPaymentProofFile({ name: file.name, url: result.url });
      setFormData(prev => ({ ...prev, paymentProof: result.url }));
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || '';
      setError(`Erreur lors du téléchargement du justificatif. ${detail}`);
    }
    setUploadingProof(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/applications/full`, {
        offerId: offer.id,
        offerTitle: offer.title,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la soumission');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const canProceedStep1 = formData.firstName && formData.lastName && formData.nationality && 
    formData.sex && formData.passportNumber && formData.dateOfBirth && formData.phoneNumber && formData.address;

  const requiredDocs = offer?.requiredDocuments?.length > 0 ? offer.requiredDocuments : offer?.documents?.length > 0 ? offer.documents : ['Passeport', 'Diplômes', 'CV'];
  const canProceedStep2 = requiredDocs.length === 0 || formData.documents.length >= 1;

  const canProceedStep3 = formData.termsAccepted;

  const canSubmit = formData.paymentMethod && formData.paymentProof;

  if (!isOpen || !offer) return null;

  // Check if deadline passed
  if (deadlineStatus && !deadlineStatus.isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Date limite dépassée</h3>
          <p className="text-gray-600 mb-6">
            La date limite de candidature pour ce programme était le {deadlineStatus.deadline}. 
            Les candidatures ne sont plus acceptées.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" data-testid="application-modal">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-1">Postuler: {offer.title}</h2>
          <p className="text-white/70 text-sm">{offer.university} • {offer.city}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[
              { num: 1, label: 'Informations', icon: User },
              { num: 2, label: 'Documents', icon: FileText },
              { num: 3, label: 'Conditions', icon: Check },
              { num: 4, label: 'Paiement', icon: CreditCard }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-[#1a56db] text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? 'text-[#1a56db] font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    data-testid="input-lastName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité *</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    placeholder="Ex: Français"
                    data-testid="input-nationality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    data-testid="input-sex"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de passeport *</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({...formData, passportNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    data-testid="input-passport"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    data-testid="input-dob"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                    placeholder="+33 6 12 34 56 78"
                    data-testid="input-phone"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none"
                    rows={2}
                    placeholder="Numéro, rue, code postal, ville, pays"
                    data-testid="input-address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Documents requis</h3>
              <p className="text-sm text-gray-600 mb-6">
                Veuillez télécharger les documents suivants. Tous les documents doivent être en PDF ou image (JPG, PNG).
              </p>
              
              <div className="space-y-3">
                {(offer.requiredDocuments?.length > 0 ? offer.requiredDocuments : offer.documents?.length > 0 ? offer.documents : ['Passeport', 'Diplômes', 'CV']).map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#1a56db]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          uploadedDocs[doc] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {uploadedDocs[doc] ? <Check size={16} /> : <FileText size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc}</p>
                          {uploadedDocs[doc] && (
                            <p className="text-xs text-green-600">{uploadedDocs[doc].name}</p>
                          )}
                        </div>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocUpload(e, doc)}
                          disabled={uploadingDoc === doc}
                        />
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          uploadedDocs[doc]
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-[#1a56db] text-white hover:bg-[#1648b8]'
                        }`}>
                          {uploadingDoc === doc ? (
                            <Loader2 size={16} className="animate-spin inline" />
                          ) : uploadedDocs[doc] ? (
                            'Modifier'
                          ) : (
                            <><Upload size={14} className="inline mr-1" /> Télécharger</>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Vous devez soumettre votre candidature avec les documents              
                  originaux en langue originale et la version traduite en anglais au même moment.
                  Si vous avez besoin d'une traduction contactez-nous depuis votre compte
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Conditions */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Conditions générales</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-gray-600 space-y-4">
                <p><strong>1. Engagement du candidat</strong></p>
                <p>En soumettant cette candidature, je certifie que toutes les informations fournies sont exactes et complètes. Je comprends que toute fausse déclaration peut entraîner le rejet de ma candidature ou l'annulation de mon inscription.</p>
                
                <p><strong>2. Frais de dossier</strong></p>
                <p>Les frais de dossier de {paymentSettings?.applicationFee || 50} {paymentSettings?.currency || 'EUR'} ne sont pas remboursables, quelle que soit l'issue de la candidature.</p>
                
                <p><strong>3. Traitement des données</strong></p>
                <p>J'accepte que mes données personnelles soient traitées par Winner's Consulting dans le cadre de ma candidature et partagées avec l'université concernée.</p>
                
                <p><strong>4. Délais de traitement</strong></p>
                <p>Je comprends que le traitement de ma candidature peut prendre plusieurs semaines et que Winner's Consulting me tiendra informé de l'avancement par email.</p>
                
                <p><strong>5. Responsabilité</strong></p>
                <p>Winner's Consulting agit en tant qu'intermédiaire et ne garantit pas l'acceptation de ma candidature par l'université.</p>
              </div>
              
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#1a56db] transition-colors">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                  className="mt-1 w-5 h-5 text-[#1a56db] rounded"
                  data-testid="checkbox-terms"
                />
                <span className="text-sm text-gray-700">
                  J'ai lu et j'accepte les conditions générales de Winner's Consulting. 
                  Je certifie que les informations fournies sont exactes.
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && paymentSettings && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 mb-4">Paiement des frais de dossier</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Frais de dossier à payer:</span>
                  <span className="text-2xl font-bold text-[#1a56db]">
                    {paymentSettings.applicationFee} {paymentSettings.currency}
                  </span>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choisissez votre méthode de paiement:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'wechat_alipay', label: 'WeChat / Alipay', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'bank_transfer', label: 'Virement bancaire', icon: '🏦' },
                    { id: 'cash', label: 'Espèces', icon: '💵' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: method.id})}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-[#1a56db] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`payment-${method.id}`}
                    >
                      <span className="text-2xl mb-2 block">{method.icon}</span>
                      <span className="font-medium text-gray-900">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Payment Details based on selected method */}
              {formData.paymentMethod && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {formData.paymentMethod === 'wechat_alipay' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="font-medium text-gray-700 mb-2">WeChat Pay</p>
                        <img 
                          src={paymentSettings.wechatQrCode} 
                          alt="WeChat QR" 
                          className="w-48 h-48 mx-auto rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700 mb-2">Alipay</p>
                        <img 
                          src={paymentSettings.alipayQrCode} 
                          alt="Alipay QR" 
                          className="w-48 h-48 mx-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}
                  
                  {formData.paymentMethod === 'paypal' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-3">Envoyez le paiement à:</p>
                      <div className="flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-lg border">
                        <span className="font-mono text-lg">{paymentSettings.paypalEmail}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentSettings.paypalEmail)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {formData.paymentMethod === 'bank_transfer' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Banque:</span>
                          <p className="font-medium">{paymentSettings.bankName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Titulaire:</span>
                          <p className="font-medium">{paymentSettings.bankAccountName}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Numéro de compte:</span>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-medium">{paymentSettings.bankAccountNumber}</p>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(paymentSettings.bankAccountNumber)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Code SWIFT:</span>
                          <p className="font-mono font-medium">{paymentSettings.bankSwiftCode}</p>
                        </div>
                        {paymentSettings.bankIban && (
                          <div>
                            <span className="text-gray-500">IBAN:</span>
                            <p className="font-mono font-medium">{paymentSettings.bankIban}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {formData.paymentMethod === 'cash' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600">
                        Pour un paiement en espèces, veuillez nous contacter directement pour organiser un rendez-vous.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Après le paiement, téléchargez une photo du reçu ci-dessous.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Upload Payment Proof */}
              {formData.paymentMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preuve de paiement *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1a56db] transition-colors">
                    {paymentProofFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <Check size={20} className="text-green-500" />
                        <span className="text-green-600 font-medium">{paymentProofFile.name}</span>
                        <label className="text-[#1a56db] hover:underline cursor-pointer text-sm">
                          Modifier
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handlePaymentProofUpload}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handlePaymentProofUpload}
                          disabled={uploadingProof}
                          data-testid="upload-payment-proof"
                        />
                        {uploadingProof ? (
                          <Loader2 size={32} className="mx-auto text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600">Cliquez pour télécharger votre preuve de paiement</p>
                            <p className="text-sm text-gray-400 mt-1">Screenshot, photo du reçu, confirmation de virement...</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} />
            {currentStep > 1 ? 'Précédent' : 'Annuler'}
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 3 && !canProceedStep3)
              }
              className="flex items-center gap-2 px-6 py-2 bg-[#1a56db] text-white rounded-lg font-medium hover:bg-[#1648b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="next-step-btn"
            >
              Suivant
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-application-btn"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Soumettre la candidature
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;

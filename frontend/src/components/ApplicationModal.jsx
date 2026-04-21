import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Check, AlertCircle, Loader2, FileText, User, CreditCard, Copy, Plus, Trash2, Heart, BookOpen, Briefcase, Users, ClipboardCheck, LogIn, PartyPopper } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { generateApplicationPDF } from '../utils/pdfGenerator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Reusable input component
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] text-sm";
const selectCls = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] text-sm bg-white";

// Section header
const SectionHeader = ({ icon: Icon, title, color = "bg-[#1e3a5f]" }) => (
  <div className={`flex items-center gap-2 px-4 py-2 ${color} text-white rounded-lg mb-4 mt-6 first:mt-0`}>
    {Icon && <Icon size={16} />}
    <span className="font-semibold text-sm">{title}</span>
  </div>
);

const defaultEducation = { instituteName: '', yearsFrom: '', yearsTo: '', fieldOfStudy: '', educationLevel: '' };
const defaultWork = { companyName: '', position: '', industryType: '', yearsFrom: '', yearsTo: '', contactPerson: '', contactPhone: '', contactEmail: '' };
const defaultFamilyMember = { name: '', nationality: '', dob: '', idNo: '', mobile: '', email: '', occupation: '', employer: '' };

const ApplicationModal = ({ offer, isOpen, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [deadlineStatus, setDeadlineStatus] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    sex: '',
    nationality: '',
    countryOfBirth: '',
    nativeLanguage: '',
    religion: '',
    maritalStatus: '',
    dateOfBirth: '',
    placeOfBirth: '',
    highestEducation: '',
    majorInChina: '',
    currentEmployer: '',
    phoneNumber: user?.phone || '',
    personalEmail: user?.email || '',
    occupation: '',
    hobby: '',
    // Home Address
    address: '',
    addressDetailed: '',
    addressPhone: '',
    zipCode: '',
    // Current Address (if different)
    currentAddress: '',
    currentAddressDetailed: '',
    currentAddressPhone: '',
    currentAddressZipCode: '',
    // Health
    bloodGroup: '',
    height: '',
    weight: '',
    // China
    inChinaNow: false,
    chinaSchool: '',
    chinaLearningPeriodStart: '',
    chinaLearningPeriodEnd: '',
    chinaVisaType: '',
    chinaVisaNo: '',
    chinaVisaExpiry: '',
    // Passport
    passportNumber: '',
    passportIssuedDate: '',
    passportExpiryDate: '',
    oldPassportNo: '',
    oldPassportIssuedDate: '',
    oldPassportExpiryDate: '',
    // Education (3 schools)
    educationalBackground: [{ ...defaultEducation }, { ...defaultEducation }, { ...defaultEducation }],
    // Work (2 entries)
    workExperience: [{ ...defaultWork }, { ...defaultWork }],
    // Family
    fatherInfo: { ...defaultFamilyMember },
    motherInfo: { ...defaultFamilyMember },
    spouseInfo: { ...defaultFamilyMember },
    // Financial Sponsor
    financialSponsor: { relationship: '', address: '' },
    // Emergency Contact
    emergencyContact: { name: '', relationship: '', occupation: '', nationality: '', idNo: '', employer: '', addressChina: '', phone: '', email: '' },
    // Application
    additionalPrograms: [],
    documents: [],
    termsAccepted: false,
    paymentMethod: '',
    paymentProof: '',
    paymentAmount: 0
  });

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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
      setFormData(prev => ({ ...prev, paymentAmount: response.data.applicationFee || 50 }));
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

  const uploadFile = async (file) => {
    const fileExt = (file.name || '').split('.').pop().toLowerCase();
    const isPdfOrDoc = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip'].includes(fileExt);

    // PDFs/docs: always route through backend (Cloudinary blocks direct PDF delivery on free plans → 403).
    // Images: try Cloudinary signed direct upload first for bandwidth, fallback to backend on any error.
    if (isPdfOrDoc) {
      const fd = new FormData();
      fd.append('file', file);
      const response = await axios.post(`${API}/upload`, fd, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 60000,
      });
      return { url: response.data.url, filename: file.name };
    }

    let sigData;
    try {
      const sigRes = await axios.get(`${API}/upload/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
      sigData = sigRes.data;
    } catch {
      const fd = new FormData();
      fd.append('file', file);
      const response = await axios.post(`${API}/upload`, fd, { headers: { 'Authorization': `Bearer ${token}` }, timeout: 60000 });
      return { url: response.data.url, filename: file.name };
    }
    const { signature, timestamp, cloud_name, api_key, folder } = sigData;
    if (!api_key || !cloud_name || !signature) {
      const fd = new FormData();
      fd.append('file', file);
      const response = await axios.post(`${API}/upload`, fd, { headers: { 'Authorization': `Bearer ${token}` }, timeout: 60000 });
      return { url: response.data.url, filename: file.name };
    }
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('signature', signature);
    cloudFormData.append('timestamp', String(timestamp));
    cloudFormData.append('api_key', api_key);
    cloudFormData.append('folder', folder);
    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, { method: 'POST', body: cloudFormData });
    if (!cloudRes.ok) {
      // Cloudinary failed (e.g. PDF restriction) → fallback to backend
      const fd = new FormData();
      fd.append('file', file);
      const response = await axios.post(`${API}/upload`, fd, { headers: { 'Authorization': `Bearer ${token}` }, timeout: 60000 });
      return { url: response.data.url, filename: file.name };
    }
    const cloudData = await cloudRes.json();
    return { url: cloudData.secure_url, filename: file.name };
  };

  const handleDocUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError(`Le fichier ${docName} est trop volumineux (max 10 Mo)`); return; }
    setUploadingDoc(docName); setError('');
    try {
      const result = await uploadFile(file);
      setUploadedDocs(prev => ({ ...prev, [docName]: { name: file.name, url: result.url } }));
      setFormData(prev => {
        const newDocs = prev.documents.filter(d => d.name !== docName);
        newDocs.push({ name: docName, url: result.url, filename: file.name });
        return { ...prev, documents: newDocs };
      });
    } catch (err) {
      setError(`Erreur lors du téléchargement de ${docName}. ${err.response?.data?.detail || err.message || ''}`);
    }
    setUploadingDoc(null);
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Le fichier est trop volumineux (max 10 Mo)'); return; }
    setUploadingProof(true); setError('');
    try {
      const result = await uploadFile(file);
      setPaymentProofFile({ name: file.name, url: result.url });
      setFormData(prev => ({ ...prev, paymentProof: result.url }));
    } catch (err) {
      setError(`Erreur lors du téléchargement du justificatif. ${err.response?.data?.detail || err.message || ''}`);
    }
    setUploadingProof(false);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      // Generate PDF summary (base64) to attach to the confirmation email.
      // Failure here must not block submission.
      let pdfBase64 = null;
      try {
        const stagedApp = {
          id: '',
          offerTitle: offer.title,
          createdAt: new Date().toISOString(),
          ...formData,
        };
        pdfBase64 = await generateApplicationPDF({
          application: stagedApp,
          offer,
          user,
          output: 'base64',
        });
      } catch (pdfErr) {
        console.warn('PDF generation failed, submitting without attachment:', pdfErr);
      }

      await axios.post(`${API}/applications/full`, {
        offerId: offer.id,
        offerTitle: offer.title,
        ...formData,
        paymentAmount: offer?.fees?.applicationFee || offer?.serviceFee || paymentSettings?.applicationFee || formData.paymentAmount,
        pdfBase64,
        pdfFilename: `AccessHub-Candidature-${(offer?.id || '').substring(0, 8).toUpperCase() || 'recap'}.pdf`,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (onSuccess) onSuccess();
      setSubmissionSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la soumission');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const setField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const setNestedField = (parent, key, value) => setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
  const setArrayField = (arrayKey, index, field, value) => setFormData(prev => {
    const arr = [...prev[arrayKey]];
    arr[index] = { ...arr[index], [field]: value };
    return { ...prev, [arrayKey]: arr };
  });

  const canProceedStep1 = formData.firstName && formData.lastName && formData.nationality &&
    formData.sex && formData.passportNumber && formData.dateOfBirth && formData.phoneNumber && formData.address;

  const ID_PHOTO_LABEL = "Photo d'identité";
  // Always require an ID photo on top of the offer's document list
  const offerDocs = offer?.requiredDocuments?.length > 0 ? offer.requiredDocuments : offer?.documents?.length > 0 ? offer.documents : ['Passeport', 'Diplômes', 'CV'];
  const requiredDocs = [ID_PHOTO_LABEL, ...offerDocs.filter(d => d !== ID_PHOTO_LABEL)];
  const canProceedStep2 = !!uploadedDocs[ID_PHOTO_LABEL] && formData.documents.length >= 1;
  const canProceedStep3 = formData.termsAccepted;
  const canSubmit = formData.paymentMethod && formData.paymentProof;

  if (!isOpen || !offer) return null;

  // ───── Success Popup ─────
  if (submissionSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="submission-success-modal">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Confetti-like gradient header */}
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
              <PartyPopper size={40} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold mb-1">Candidature envoyée !</h2>
            <p className="text-white/90 text-sm">Félicitations, votre dossier a été soumis avec succès.</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <LogIn size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-blue-900">Suivez l'avancement de votre candidature</p>
                <p className="text-xs text-blue-700 mt-1">
                  Connectez-vous à votre espace personnel pour suivre le statut, recevoir les messages de l'équipe et téléverser de nouveaux documents si nécessaire.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                data-testid="success-close-btn"
                onClick={() => { setSubmissionSuccess(false); onClose(); }}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                data-testid="success-login-btn"
                onClick={() => {
                  setSubmissionSuccess(false);
                  onClose();
                  // Redirect to dashboard if user is logged in, otherwise open login
                  if (user) {
                    window.location.href = '/dashboard';
                  } else {
                    window.location.href = '/?auth=login';
                  }
                }}
                className="px-4 py-3 bg-gradient-to-r from-[#1e3a5f] to-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (deadlineStatus && !deadlineStatus.isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Date limite dépassée</h3>
          <p className="text-gray-600 mb-6">La date limite de candidature pour ce programme était le {deadlineStatus.deadline}. Les candidatures ne sont plus acceptées.</p>
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Fermer</button>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Profil', icon: User },
    { num: 2, label: 'Documents', icon: FileText },
    { num: 3, label: 'Conditions', icon: Check },
    { num: 4, label: 'Paiement', icon: CreditCard },
    { num: 5, label: 'Révision', icon: ClipboardCheck }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col" data-testid="application-modal">

        {/* Header */}
        <div className="bg-[#1e3a5f] text-white px-6 py-4 flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24} /></button>
          <h2 className="text-xl font-bold mb-1">Postuler : {offer.title}</h2>
          <p className="text-white/70 text-sm">{offer.university} • {offer.city}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-[#1a56db] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? 'text-[#1a56db] font-medium' : 'text-gray-500'}`}>{step.label}</span>
                  </div>
                  {index < 4 && <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 flex-shrink-0">
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ===== STEP 1: FULL PROFILE ===== */}
          {currentStep === 1 && (
            <div>
              {/* 1. Personal Information */}
              <SectionHeader icon={User} title="1. Informations Personnelles / Personal Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nom de famille / Family Name" required>
                  <input type="text" value={formData.lastName} onChange={e => setField('lastName', e.target.value)} className={inputCls} data-testid="input-lastName" />
                </Field>
                <Field label="Prénom / Given Name" required>
                  <input type="text" value={formData.firstName} onChange={e => setField('firstName', e.target.value)} className={inputCls} data-testid="input-firstName" />
                </Field>
                <Field label="Genre / Gender" required>
                  <select value={formData.sex} onChange={e => setField('sex', e.target.value)} className={selectCls} data-testid="input-sex">
                    <option value="">Sélectionner</option>
                    <option value="male">Masculin / Male</option>
                    <option value="female">Féminin / Female</option>
                    <option value="other">Autre / Other</option>
                  </select>
                </Field>
                <Field label="Nationalité / Nationality" required>
                  <input type="text" value={formData.nationality} onChange={e => setField('nationality', e.target.value)} className={inputCls} placeholder="Ex: Camerounais(e)" data-testid="input-nationality" />
                </Field>
                <Field label="Pays de naissance / Country of Birth" required>
                  <input type="text" value={formData.countryOfBirth} onChange={e => setField('countryOfBirth', e.target.value)} className={inputCls} data-testid="input-countryOfBirth" />
                </Field>
                <Field label="Langue maternelle / Native Language" required>
                  <input type="text" value={formData.nativeLanguage} onChange={e => setField('nativeLanguage', e.target.value)} className={inputCls} placeholder="Ex: Français, Anglais" data-testid="input-nativeLanguage" />
                </Field>
                <Field label="Religion" required>
                  <select value={formData.religion} onChange={e => setField('religion', e.target.value)} className={selectCls} data-testid="input-religion">
                    <option value="">Sélectionner</option>
                    <option value="christian">Chrétien(ne)</option>
                    <option value="islam">Islam</option>
                    <option value="buddhism">Bouddhisme</option>
                    <option value="hinduism">Hindouisme</option>
                    <option value="other">Autre</option>
                    <option value="none">Aucune</option>
                  </select>
                </Field>
                <Field label="Situation matrimoniale / Marital Status" required>
                  <select value={formData.maritalStatus} onChange={e => setField('maritalStatus', e.target.value)} className={selectCls} data-testid="input-maritalStatus">
                    <option value="">Sélectionner</option>
                    <option value="single">Célibataire / Single</option>
                    <option value="married">Marié(e) / Married</option>
                    <option value="divorced">Divorcé(e) / Divorced</option>
                    <option value="widowed">Veuf/Veuve / Widowed</option>
                  </select>
                </Field>
                <Field label="Date de naissance / Date of Birth" required>
                  <input type="date" value={formData.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} className={inputCls} data-testid="input-dob" />
                </Field>
                <Field label="Lieu de naissance (Ville, Province) / Place of Birth" required>
                  <input type="text" value={formData.placeOfBirth} onChange={e => setField('placeOfBirth', e.target.value)} className={inputCls} placeholder="Ville, Province" data-testid="input-placeOfBirth" />
                </Field>
                <Field label="Niveau d'études / Highest Education" required>
                  <select value={formData.highestEducation} onChange={e => setField('highestEducation', e.target.value)} className={selectCls} data-testid="input-highestEducation">
                    <option value="">Sélectionner</option>
                    <option value="high_school">Lycée / High School</option>
                    <option value="bachelor">Licence / Bachelor's Degree</option>
                    <option value="master">Master / Master's Degree</option>
                    <option value="phd">Doctorat / PhD</option>
                    <option value="other">Autre / Other</option>
                  </select>
                </Field>
                <Field label="Filière souhaitée en Chine / Major in China" required>
                  <input type="text" value={formData.majorInChina} onChange={e => setField('majorInChina', e.target.value)} className={inputCls} placeholder="Ex: Médecine, Ingénierie..." data-testid="input-majorInChina" />
                </Field>
                <Field label="Employeur / Institution actuelle / Current Employer" required>
                  <input type="text" value={formData.currentEmployer} onChange={e => setField('currentEmployer', e.target.value)} className={inputCls} data-testid="input-currentEmployer" />
                </Field>
                <Field label="Téléphone personnel / Personal Mobile" required>
                  <input type="tel" value={formData.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX" data-testid="input-phone" />
                </Field>
                <Field label="Email personnel / Personal Email" required>
                  <input type="email" value={formData.personalEmail} onChange={e => setField('personalEmail', e.target.value)} className={inputCls} data-testid="input-personalEmail" />
                </Field>
                <Field label="Profession / Occupation" required>
                  <input type="text" value={formData.occupation} onChange={e => setField('occupation', e.target.value)} className={inputCls} data-testid="input-occupation" />
                </Field>
                <Field label="Loisirs / Hobby" required>
                  <input type="text" value={formData.hobby} onChange={e => setField('hobby', e.target.value)} className={inputCls} data-testid="input-hobby" />
                </Field>
              </div>

              {/* 2. Home Address */}
              <SectionHeader icon={null} title="2. Adresse Permanente / Home Address" color="bg-slate-600" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Adresse (Rue, Province, Pays)" required>
                  <input type="text" value={formData.address} onChange={e => setField('address', e.target.value)} className={inputCls} placeholder="Numéro, rue, province, pays" data-testid="input-address" />
                </Field>
                <Field label="Adresse détaillée / Detailed Address" required>
                  <input type="text" value={formData.addressDetailed} onChange={e => setField('addressDetailed', e.target.value)} className={inputCls} data-testid="input-addressDetailed" />
                </Field>
                <Field label="Téléphone / Mobile No" required>
                  <input type="tel" value={formData.addressPhone} onChange={e => setField('addressPhone', e.target.value)} className={inputCls} data-testid="input-addressPhone" />
                </Field>
                <Field label="Code postal / Zip Code" required>
                  <input type="text" value={formData.zipCode} onChange={e => setField('zipCode', e.target.value)} className={inputCls} data-testid="input-zipCode" />
                </Field>
              </div>

              {/* 3. Current Address if different */}
              <SectionHeader icon={null} title="3. Adresse Actuelle (si différente) / Current Address" color="bg-slate-600" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Adresse actuelle (Rue, Province, Pays)" required>
                  <input type="text" value={formData.currentAddress} onChange={e => setField('currentAddress', e.target.value)} className={inputCls} data-testid="input-currentAddress" />
                </Field>
                <Field label="Adresse détaillée / Detailed Address" required>
                  <input type="text" value={formData.currentAddressDetailed} onChange={e => setField('currentAddressDetailed', e.target.value)} className={inputCls} data-testid="input-currentAddressDetailed" />
                </Field>
                <Field label="Téléphone / Mobile No" required>
                  <input type="tel" value={formData.currentAddressPhone} onChange={e => setField('currentAddressPhone', e.target.value)} className={inputCls} data-testid="input-currentAddressPhone" />
                </Field>
                <Field label="Code postal / Zip Code" required>
                  <input type="text" value={formData.currentAddressZipCode} onChange={e => setField('currentAddressZipCode', e.target.value)} className={inputCls} data-testid="input-currentAddressZipCode" />
                </Field>
              </div>

              {/* 4. Health Status */}
              <SectionHeader icon={Heart} title="4. État de Santé / Health Status" color="bg-rose-700" />
              <div className="grid grid-cols-3 gap-4">
                <Field label="Groupe sanguin / Blood Group" required>
                  <select value={formData.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)} className={selectCls} data-testid="input-bloodGroup">
                    <option value="">Sélectionner</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </Field>
                <Field label="Taille / Height (cm)" required>
                  <input type="text" value={formData.height} onChange={e => setField('height', e.target.value)} className={inputCls} placeholder="Ex: 175 cm" data-testid="input-height" />
                </Field>
                <Field label="Poids / Weight (kg)" required>
                  <input type="text" value={formData.weight} onChange={e => setField('weight', e.target.value)} className={inputCls} placeholder="Ex: 70 kg" data-testid="input-weight" />
                </Field>
              </div>

              {/* 5. Whether in China */}
              <SectionHeader icon={null} title="5. Êtes-vous actuellement en Chine ? / Currently in China?" color="bg-red-800" />
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  {['yes', 'no'].map(val => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="inChinaNow" value={val} checked={formData.inChinaNow === (val === 'yes')} onChange={() => setField('inChinaNow', val === 'yes')} className="w-4 h-4 text-[#1a56db]" data-testid={`radio-china-${val}`} />
                      <span className="text-sm font-medium text-gray-700">{val === 'yes' ? 'Oui / Yes' : 'Non / No'}</span>
                    </label>
                  ))}
                </div>
                {formData.inChinaNow && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <Field label="École/Organisation in China">
                      <input type="text" value={formData.chinaSchool} onChange={e => setField('chinaSchool', e.target.value)} className={inputCls} data-testid="input-chinaSchool" />
                    </Field>
                    <Field label="Type de visa/type of Visa">
                      <input type="text" value={formData.chinaVisaType} onChange={e => setField('chinaVisaType', e.target.value)} className={inputCls} data-testid="input-chinaVisaType" />
                    </Field>
                    <Field label="Début/From">
                      <input type="date" value={formData.chinaLearningPeriodStart} onChange={e => setField('chinaLearningPeriodStart', e.target.value)} className={inputCls} data-testid="input-chinaStart" />
                    </Field>
                    <Field label="Fin/End">
                      <input type="date" value={formData.chinaLearningPeriodEnd} onChange={e => setField('chinaLearningPeriodEnd', e.target.value)} className={inputCls} data-testid="input-chinaEnd" />
                    </Field>
                    <Field label="Numéro de visa/Visa N°">
                      <input type="text" value={formData.chinaVisaNo} onChange={e => setField('chinaVisaNo', e.target.value)} className={inputCls} data-testid="input-chinaVisaNo" />
                    </Field>
                    <Field label="Date d'expiration du visa/Visa Expiration">
                      <input type="date" value={formData.chinaVisaExpiry} onChange={e => setField('chinaVisaExpiry', e.target.value)} className={inputCls} data-testid="input-chinaVisaExpiry" />
                    </Field>
                  </div>
                )}
              </div>

              {/* 6. Passport Information */}
              <SectionHeader icon={null} title="6. Informations Passeport / Passport Information" color="bg-indigo-700" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Numéro de passeport / Passport No" required>
                  <input type="text" value={formData.passportNumber} onChange={e => setField('passportNumber', e.target.value)} className={inputCls} data-testid="input-passport" />
                </Field>
                <Field label="Date de délivrance / Issued Date" required>
                  <input type="date" value={formData.passportIssuedDate} onChange={e => setField('passportIssuedDate', e.target.value)} className={inputCls} data-testid="input-passportIssuedDate" />
                </Field>
                <Field label="Date d'expiration / Expiry Date" required>
                  <input type="date" value={formData.passportExpiryDate} onChange={e => setField('passportExpiryDate', e.target.value)} className={inputCls} data-testid="input-passportExpiryDate" />
                </Field>
                <Field label="Ancien numéro de passeport (si applicable)">
                  <input type="text" value={formData.oldPassportNo} onChange={e => setField('oldPassportNo', e.target.value)} className={inputCls} data-testid="input-oldPassportNo" />
                </Field>
                <Field label="Date de délivrance (ancien passeport)">
                  <input type="date" value={formData.oldPassportIssuedDate} onChange={e => setField('oldPassportIssuedDate', e.target.value)} className={inputCls} data-testid="input-oldPassportIssuedDate" />
                </Field>
                <Field label="Date d'expiration (ancien passeport)">
                  <input type="date" value={formData.oldPassportExpiryDate} onChange={e => setField('oldPassportExpiryDate', e.target.value)} className={inputCls} data-testid="input-oldPassportExpiryDate" />
                </Field>
              </div>

              {/* 7. Educational Background */}
              <SectionHeader icon={BookOpen} title="7. Formation Académique (3 dernières écoles) / Educational Background" color="bg-teal-700" />
              {formData.educationalBackground.map((edu, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-600 mb-3">École {String.fromCharCode(65 + idx)} / School {String.fromCharCode(65 + idx)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nom de l'établissement / Institute Name">
                      <input type="text" value={edu.instituteName} onChange={e => setArrayField('educationalBackground', idx, 'instituteName', e.target.value)} className={inputCls} data-testid={`edu-${idx}-institute`} />
                    </Field>
                    <Field label="Niveau d'études / Education Level" required>
                      <select value={edu.educationLevel} onChange={e => setArrayField('educationalBackground', idx, 'educationLevel', e.target.value)} className={selectCls} data-testid={`edu-${idx}-level`}>
                        <option value="">Sélectionner</option>
                        <option value="primary">Primaire / Primary</option>
                        <option value="secondary">Secondaire / Secondary</option>
                        <option value="high_school">Lycée / High School</option>
                        <option value="bachelor">Licence / Bachelor</option>
                        <option value="master">Master</option>
                        <option value="phd">Doctorat / PhD</option>
                      </select>
                    </Field>
                    <Field label="Filière / Major / Field of Study" required>
                      <input type="text" value={edu.fieldOfStudy} onChange={e => setArrayField('educationalBackground', idx, 'fieldOfStudy', e.target.value)} className={inputCls} data-testid={`edu-${idx}-field`} />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="De / From" required>
                        <input type="date" value={edu.yearsFrom} onChange={e => setArrayField('educationalBackground', idx, 'yearsFrom', e.target.value)} className={inputCls} data-testid={`edu-${idx}-from`} />
                      </Field>
                      <Field label="À / To" required>
                        <input type="date" value={edu.yearsTo} onChange={e => setArrayField('educationalBackground', idx, 'yearsTo', e.target.value)} className={inputCls} data-testid={`edu-${idx}-to`} />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}

              {/* 8. Work Experience */}
              <SectionHeader icon={Briefcase} title="8. Expérience Professionnelle / Work Experience" color="bg-amber-700" />
              {formData.workExperience.map((work, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Expérience {String.fromCharCode(65 + idx)} / Experience {String.fromCharCode(65 + idx)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Entreprise & Adresse / Company & Address">
                      <input type="text" value={work.companyName} onChange={e => setArrayField('workExperience', idx, 'companyName', e.target.value)} className={inputCls} data-testid={`work-${idx}-company`} />
                    </Field>
                    <Field label="Poste / Position">
                      <input type="text" value={work.position} onChange={e => setArrayField('workExperience', idx, 'position', e.target.value)} className={inputCls} data-testid={`work-${idx}-position`} />
                    </Field>
                    <Field label="Secteur / Industry Type">
                      <input type="text" value={work.industryType} onChange={e => setArrayField('workExperience', idx, 'industryType', e.target.value)} className={inputCls} data-testid={`work-${idx}-industry`} />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="De / From">
                        <input type="date" value={work.yearsFrom} onChange={e => setArrayField('workExperience', idx, 'yearsFrom', e.target.value)} className={inputCls} data-testid={`work-${idx}-from`} />
                      </Field>
                      <Field label="À / To">
                        <input type="date" value={work.yearsTo} onChange={e => setArrayField('workExperience', idx, 'yearsTo', e.target.value)} className={inputCls} data-testid={`work-${idx}-to`} />
                      </Field>
                    </div>
                    <Field label="Personne de contact (référence)">
                      <input type="text" value={work.contactPerson} onChange={e => setArrayField('workExperience', idx, 'contactPerson', e.target.value)} className={inputCls} data-testid={`work-${idx}-contact`} />
                    </Field>
                    <Field label="Téléphone de la référence">
                      <input type="tel" value={work.contactPhone} onChange={e => setArrayField('workExperience', idx, 'contactPhone', e.target.value)} className={inputCls} data-testid={`work-${idx}-phone`} />
                    </Field>
                    <Field label="Email de la référence">
                      <input type="email" value={work.contactEmail} onChange={e => setArrayField('workExperience', idx, 'contactEmail', e.target.value)} className={inputCls} data-testid={`work-${idx}-email`} />
                    </Field>
                  </div>
                </div>
              ))}

              {/* 9. Family Information */}
              <SectionHeader icon={Users} title="9. Informations Familiales / Family Information" color="bg-purple-700" />
              {[
                { key: 'fatherInfo', label: 'A. Père / Father' },
                { key: 'motherInfo', label: 'B. Mère / Mother' },
                { key: 'spouseInfo', label: 'C. Conjoint(e) / Spouse (si marié(e) / if married)' }
              ].map(({ key, label }) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-600 mb-3">{label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nom complet/Full Name" required>
                      <input type="text" value={formData[key].name} onChange={e => setNestedField(key, 'name', e.target.value)} className={inputCls} data-testid={`${key}-name`} />
                    </Field>
                    <Field label="Nationalité / Nationality" required>
                      <input type="text" value={formData[key].nationality} onChange={e => setNestedField(key, 'nationality', e.target.value)} className={inputCls} data-testid={`${key}-nationality`} />
                    </Field>
                    <Field label="Date de naissance / Date of Birth" required>
                      <input type="date" value={formData[key].dob} onChange={e => setNestedField(key, 'dob', e.target.value)} className={inputCls} data-testid={`${key}-dob`} />
                    </Field>
                    <Field label="N° Pièce d'identité / National ID / Passport No" required>
                      <input type="text" value={formData[key].idNo} onChange={e => setNestedField(key, 'idNo', e.target.value)} className={inputCls} data-testid={`${key}-idNo`} />
                    </Field>
                    <Field label="Téléphone / Mobile No" required>
                      <input type="tel" value={formData[key].mobile} onChange={e => setNestedField(key, 'mobile', e.target.value)} className={inputCls} data-testid={`${key}-mobile`} />
                    </Field>
                    <Field label="Email" required>
                      <input type="email" value={formData[key].email} onChange={e => setNestedField(key, 'email', e.target.value)} className={inputCls} data-testid={`${key}-email`} />
                    </Field>
                    <Field label="Profession / Occupation" required>
                      <input type="text" value={formData[key].occupation} onChange={e => setNestedField(key, 'occupation', e.target.value)} className={inputCls} data-testid={`${key}-occupation`} />
                    </Field>
                    <Field label="Employeur / Institution actuelle" required>
                      <input type="text" value={formData[key].employer} onChange={e => setNestedField(key, 'employer', e.target.value)} className={inputCls} data-testid={`${key}-employer`} />
                    </Field>
                  </div>
                </div>
              ))}

              {/* 10. Financial Sponsor */}
              <SectionHeader icon={null} title="10. Garant Financier / Financial Sponsor (Parents recommandés)" color="bg-green-700" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Relation avec l'étudiant / Relationship" required>
                  <input type="text" value={formData.financialSponsor.relationship} onChange={e => setNestedField('financialSponsor', 'relationship', e.target.value)} className={inputCls} placeholder="Ex: Père, Mère..." data-testid="sponsor-relationship" />
                </Field>
                <Field label="Adresse complète / Full Address" required>
                  <input type="text" value={formData.financialSponsor.address} onChange={e => setNestedField('financialSponsor', 'address', e.target.value)} className={inputCls} data-testid="sponsor-address" />
                </Field>
              </div>

              {/* 11. Emergency Contact in China */}
              <SectionHeader icon={null} title="11. Contact d'Urgence en Chine / Emergency Contact in China" color="bg-orange-700" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nom complet/Full Name" required>
                  <input type="text" value={formData.emergencyContact.name} onChange={e => setNestedField('emergencyContact', 'name', e.target.value)} className={inputCls} data-testid="emergency-name" />
                </Field>
                <Field label="Relation avec l'étudiant" required>
                  <input type="text" value={formData.emergencyContact.relationship} onChange={e => setNestedField('emergencyContact', 'relationship', e.target.value)} className={inputCls} data-testid="emergency-relationship" />
                </Field>
                <Field label="Profession / Occupation" required>
                  <input type="text" value={formData.emergencyContact.occupation} onChange={e => setNestedField('emergencyContact', 'occupation', e.target.value)} className={inputCls} data-testid="emergency-occupation" />
                </Field>
                <Field label="Nationalité / Nationality" required>
                  <input type="text" value={formData.emergencyContact.nationality} onChange={e => setNestedField('emergencyContact', 'nationality', e.target.value)} className={inputCls} data-testid="emergency-nationality" />
                </Field>
                <Field label="N° Pièce d'identité / National ID / Passport No" required>
                  <input type="text" value={formData.emergencyContact.idNo} onChange={e => setNestedField('emergencyContact', 'idNo', e.target.value)} className={inputCls} data-testid="emergency-idNo" />
                </Field>
                <Field label="Employeur / Institution actuelle" required>
                  <input type="text" value={formData.emergencyContact.employer} onChange={e => setNestedField('emergencyContact', 'employer', e.target.value)} className={inputCls} data-testid="emergency-employer" />
                </Field>
                <Field label="Adresse en Chine / Address in China (Full)" required>
                  <input type="text" value={formData.emergencyContact.addressChina} onChange={e => setNestedField('emergencyContact', 'addressChina', e.target.value)} className={inputCls} data-testid="emergency-addressChina" />
                </Field>
                <Field label="Téléphone en Chine / Mobile in China" required>
                  <input type="tel" value={formData.emergencyContact.phone} onChange={e => setNestedField('emergencyContact', 'phone', e.target.value)} className={inputCls} data-testid="emergency-phone" />
                </Field>
                <Field label="Email" required>
                  <input type="email" value={formData.emergencyContact.email} onChange={e => setNestedField('emergencyContact', 'email', e.target.value)} className={inputCls} data-testid="emergency-email" />
                </Field>
              </div>

              <p className="text-xs text-gray-400 mt-6 text-center">Les champs marqués <span className="text-red-500">*</span> sont obligatoires pour passer à l'étape suivante.</p>
            </div>
          )}

          {/* ===== STEP 2: DOCUMENTS ===== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Documents requis</h3>
              <p className="text-sm text-gray-600 mb-6">Veuillez télécharger les documents suivants. Tous les documents doivent être en PDF ou image (JPG, PNG).</p>

              {/* Highlighted ID Photo card — always required */}
              <div className={`rounded-xl p-4 border-2 border-dashed transition-all ${uploadedDocs[ID_PHOTO_LABEL] ? 'border-green-300 bg-green-50' : 'border-[#1a56db]/40 bg-blue-50'}`} data-testid="id-photo-card">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {uploadedDocs[ID_PHOTO_LABEL] ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-green-400 shadow-sm bg-white">
                        <img src={uploadedDocs[ID_PHOTO_LABEL].url} alt="Photo d'identité" className="w-full h-full object-cover" data-testid="id-photo-preview" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-white border-2 border-dashed border-[#1a56db]/30 flex items-center justify-center text-[#1a56db]">
                        <User size={36} strokeWidth={1.2} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">Photo d'identité <span className="text-red-500">*</span></p>
                      {uploadedDocs[ID_PHOTO_LABEL] && <Check size={16} className="text-green-600" />}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Photo récente sur fond clair, visage dégagé. Formats : JPG, JPEG, PNG. Taille max : 10 Mo.</p>
                    {uploadedDocs[ID_PHOTO_LABEL] && <p className="text-xs text-green-700 font-medium mb-2 truncate">✓ {uploadedDocs[ID_PHOTO_LABEL].name}</p>}
                    <label className="cursor-pointer inline-block">
                      <input type="file" className="hidden" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleDocUpload(e, ID_PHOTO_LABEL)} disabled={uploadingDoc === ID_PHOTO_LABEL} data-testid="id-photo-input" />
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadedDocs[ID_PHOTO_LABEL] ? 'bg-white border border-green-300 text-green-700 hover:bg-green-50' : 'bg-[#1a56db] text-white hover:bg-[#1648b8]'}`}>
                        {uploadingDoc === ID_PHOTO_LABEL ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadedDocs[ID_PHOTO_LABEL] ? 'Modifier la photo' : 'Téléverser ma photo'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Autres documents requis</p>
                {requiredDocs.filter(d => d !== ID_PHOTO_LABEL).map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#1a56db]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadedDocs[doc] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {uploadedDocs[doc] ? <Check size={16} /> : <FileText size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc}</p>
                          {uploadedDocs[doc] && <p className="text-xs text-green-600">{uploadedDocs[doc].name}</p>}
                        </div>
                      </div>
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocUpload(e, doc)} disabled={uploadingDoc === doc} />
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploadedDocs[doc] ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-[#1a56db] text-white hover:bg-[#1648b8]'}`}>
                          {uploadingDoc === doc ? <Loader2 size={16} className="animate-spin inline" /> : uploadedDocs[doc] ? 'Modifier' : <><Upload size={14} className="inline mr-1" />Télécharger</>}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-yellow-800"><strong>Note :</strong> Vous devez soumettre votre candidature avec les documents originaux en langue originale et la version traduite en anglais au même moment. Si vous avez besoin d'une traduction, contactez-nous depuis votre compte.</p>
              </div>
            </div>
          )}

          {/* ===== STEP 3: TERMS ===== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Conditions générales/ General Terms</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-gray-600 space-y-4">
                {paymentSettings?.termsConditions?.length > 0 ? (
                  paymentSettings.termsConditions.map((term, idx) => (
                    <div key={idx}><p><strong>{idx + 1}. {term.title}</strong></p><p>{term.content}</p></div>
                  ))
                ) : (
                  <>
                    <p><strong>1. Engagement du candidat</strong></p>
                    <p>En soumettant cette candidature, je certifie que toutes les informations fournies sont exactes et complètes.</p>
                    <p><strong>2. Frais de dossier</strong></p>
                    <p>Les frais de dossier ne sont pas remboursables, quelle que soit l'issue de la candidature.</p>
                  </>
                )}
              </div>
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#1a56db] transition-colors">
                <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => setField('termsAccepted', e.target.checked)} className="mt-1 w-5 h-5 text-[#1a56db] rounded" data-testid="checkbox-terms" />
                <span className="text-sm text-gray-700">J'ai lu et j'accepte les conditions générales d'AccessHub Global. Je certifie que les informations fournies sont exactes.</span>
              </label>
            </div>
          )}

          {/* ===== STEP 4: PAYMENT ===== */}
          {currentStep === 4 && paymentSettings && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 mb-4">Paiement des frais de dossier/Application Fees</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Frais de dossier à payer :/Payment</span>
                  <span className="text-2xl font-bold text-[#1a56db]">{offer?.fees?.applicationFee || offer?.serviceFee || paymentSettings?.applicationFee || 0} {offer?.currency || paymentSettings?.currency || 'EUR'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choisissez votre méthode de paiement :</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'wechat_alipay', label: 'WeChat / Alipay', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'bank_transfer', label: 'Virement bancaire/Bank', icon: '🏦' },
                    { id: 'cash', label: 'Espèces/Cash', icon: '💵' }
                  ].map((method) => (
                    <button key={method.id} type="button" onClick={() => setField('paymentMethod', method.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${formData.paymentMethod === method.id ? 'border-[#1a56db] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      data-testid={`payment-${method.id}`}>
                      <span className="text-2xl mb-2 block">{method.icon}</span>
                      <span className="font-medium text-gray-900">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {formData.paymentMethod && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {formData.paymentMethod === 'wechat_alipay' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center"><p className="font-medium text-gray-700 mb-2">WeChat Pay</p><img src={paymentSettings.wechatQrCode} alt="WeChat QR" className="w-48 h-48 mx-auto rounded-lg border border-gray-200" /></div>
                      <div className="text-center"><p className="font-medium text-gray-700 mb-2">Alipay</p><img src={paymentSettings.alipayQrCode} alt="Alipay QR" className="w-48 h-48 mx-auto rounded-lg border border-gray-200" /></div>
                    </div>
                  )}
                  {formData.paymentMethod === 'paypal' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-3">Envoyez le paiement à / Send the payment to:</p>
                      <div className="flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-lg border">
                        <span className="font-mono text-lg">{paymentSettings.paypalEmail}</span>
                        <button type="button" onClick={() => copyToClipboard(paymentSettings.paypalEmail)} className="p-1 hover:bg-gray-100 rounded"><Copy size={16} className="text-gray-500" /></button>
                      </div>
                    </div>
                  )}
                  {formData.paymentMethod === 'bank_transfer' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Banque/Bank :</span><p className="font-medium">{paymentSettings.bankName}</p></div>
                        <div><span className="text-gray-500">Titulaire/Owner :</span><p className="font-medium">{paymentSettings.bankAccountName}</p></div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Numéro de compte/Account Number:</span>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-medium">{paymentSettings.bankAccountNumber}</p>
                            <button type="button" onClick={() => copyToClipboard(paymentSettings.bankAccountNumber)} className="p-1 hover:bg-gray-200 rounded"><Copy size={14} className="text-gray-500" /></button>
                          </div>
                        </div>
                        <div><span className="text-gray-500">Code SWIFT :</span><p className="font-mono font-medium">{paymentSettings.bankSwiftCode}</p></div>
                        {paymentSettings.bankIban && <div><span className="text-gray-500">IBAN :</span><p className="font-mono font-medium">{paymentSettings.bankIban}</p></div>}
                      </div>
                    </div>
                  )}
                  {formData.paymentMethod === 'cash' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600">Pour un paiement en espèces, veuillez nous contacter directement pour organiser un rendez-vous.</p>
                      <p className="text-sm text-gray-500 mt-2">Après le paiement, téléchargez une photo du reçu ci-dessous.</p>
                    </div>
                  )}
                </div>
              )}
              {formData.paymentMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preuve de paiement/Proof of Payment *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1a56db] transition-colors">
                    {paymentProofFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <Check size={20} className="text-green-500" />
                        <span className="text-green-600 font-medium">{paymentProofFile.name}</span>
                        <label className="text-[#1a56db] hover:underline cursor-pointer text-sm">Modifier/Modify<input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePaymentProofUpload} /></label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handlePaymentProofUpload} disabled={uploadingProof} data-testid="upload-payment-proof" />
                        {uploadingProof ? <Loader2 size={32} className="mx-auto text-gray-400 animate-spin" /> : (
                          <><Upload size={32} className="mx-auto text-gray-400 mb-2" /><p className="text-gray-600">Cliquez pour télécharger votre preuve de paiement/Download Proof</p><p className="text-sm text-gray-400 mt-1">Screenshot, photo du reçu, confirmation de virement...</p></>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 5: REVIEW ===== */}
          {currentStep === 5 && (
            <div className="space-y-4" data-testid="review-step">
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1a56db] text-white rounded-xl p-5 mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <ClipboardCheck size={24} />
                  <h3 className="text-lg font-bold">Révision finale / Final Review</h3>
                </div>
                <p className="text-white/80 text-sm">Vérifiez attentivement toutes les informations avant de soumettre votre candidature. Cliquez sur "Précédent" pour corriger une section.</p>
              </div>

              {/* Programme */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#1e3a5f] text-white px-4 py-2 font-semibold text-sm">📘 Programme</div>
                <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Offre :</span><p className="font-medium">{offer.title}</p></div>
                  <div><span className="text-gray-500 text-xs">Université :</span><p className="font-medium">{offer.university || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Ville :</span><p className="font-medium">{offer.city || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Frais de dossier :</span><p className="font-medium text-[#1a56db]">{offer?.fees?.applicationFee || offer?.serviceFee || paymentSettings?.applicationFee || 0} {offer?.currency || paymentSettings?.currency || 'EUR'}</p></div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-slate-700 text-white px-4 py-2 font-semibold text-sm">👤 Informations personnelles</div>
                <div className="p-4 text-sm">
                  {uploadedDocs[ID_PHOTO_LABEL] && (
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <img src={uploadedDocs[ID_PHOTO_LABEL].url} alt="Photo d'identité" className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm" data-testid="review-id-photo" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                        <p className="text-xs text-gray-500">Photo d'identité téléversée</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500 text-xs">Nom :</span><p className="font-medium">{formData.lastName || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Prénom :</span><p className="font-medium">{formData.firstName || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Sexe :</span><p className="font-medium">{formData.sex || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Nationalité :</span><p className="font-medium">{formData.nationality || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Date de naissance :</span><p className="font-medium">{formData.dateOfBirth || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Lieu de naissance :</span><p className="font-medium">{formData.placeOfBirth || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Pays de naissance :</span><p className="font-medium">{formData.countryOfBirth || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Langue maternelle :</span><p className="font-medium">{formData.nativeLanguage || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Téléphone :</span><p className="font-medium">{formData.phoneNumber || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Email :</span><p className="font-medium">{formData.personalEmail || '—'}</p></div>
                  <div className="col-span-2"><span className="text-gray-500 text-xs">Adresse :</span><p className="font-medium">{formData.address || '—'} {formData.addressDetailed && `, ${formData.addressDetailed}`}</p></div>
                  </div>
                </div>
              </div>

              {/* Passeport */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-indigo-700 text-white px-4 py-2 font-semibold text-sm">🛂 Passeport</div>
                <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Numéro :</span><p className="font-medium">{formData.passportNumber || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Délivrance :</span><p className="font-medium">{formData.passportIssuedDate || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Expiration :</span><p className="font-medium">{formData.passportExpiryDate || '—'}</p></div>
                </div>
              </div>

              {/* Éducation */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-teal-700 text-white px-4 py-2 font-semibold text-sm">🎓 Formation académique</div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-gray-500 text-xs">Niveau le plus élevé :</span><p className="font-medium">{formData.highestEducation || '—'}</p></div>
                    <div><span className="text-gray-500 text-xs">Filière souhaitée :</span><p className="font-medium">{formData.majorInChina || '—'}</p></div>
                  </div>
                  {formData.educationalBackground.filter(e => e.instituteName).map((edu, i) => (
                    <div key={i} className="bg-gray-50 rounded p-2 text-xs">
                      <strong>{edu.instituteName}</strong> · {edu.educationLevel} · {edu.fieldOfStudy} ({edu.yearsFrom} → {edu.yearsTo})
                    </div>
                  ))}
                </div>
              </div>

              {/* Famille */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-purple-700 text-white px-4 py-2 font-semibold text-sm">👨‍👩‍👧 Famille</div>
                <div className="p-4 space-y-2 text-sm">
                  {[['Père', formData.fatherInfo], ['Mère', formData.motherInfo], ['Conjoint(e)', formData.spouseInfo]].filter(([, info]) => info.name).map(([label, info], i) => (
                    <div key={i} className="bg-gray-50 rounded p-2 text-xs">
                      <strong>{label}:</strong> {info.name} · {info.mobile || '—'} · {info.email || '—'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact urgence */}
              {formData.emergencyContact.name && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-700 text-white px-4 py-2 font-semibold text-sm">🚨 Contact d'urgence</div>
                  <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500 text-xs">Nom :</span><p className="font-medium">{formData.emergencyContact.name}</p></div>
                    <div><span className="text-gray-500 text-xs">Relation :</span><p className="font-medium">{formData.emergencyContact.relationship || '—'}</p></div>
                    <div><span className="text-gray-500 text-xs">Téléphone :</span><p className="font-medium">{formData.emergencyContact.phone || '—'}</p></div>
                    <div><span className="text-gray-500 text-xs">Email :</span><p className="font-medium">{formData.emergencyContact.email || '—'}</p></div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-blue-700 text-white px-4 py-2 font-semibold text-sm">📄 Documents soumis ({formData.documents.length})</div>
                <div className="p-4 space-y-1 text-sm">
                  {formData.documents.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun document téléversé</p>
                  ) : (
                    formData.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check size={14} className="text-green-500" />
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-gray-400">· {doc.filename}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Paiement */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-green-700 text-white px-4 py-2 font-semibold text-sm">💳 Paiement</div>
                <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Méthode :</span><p className="font-medium capitalize">{formData.paymentMethod.replace('_', ' ') || '—'}</p></div>
                  <div><span className="text-gray-500 text-xs">Montant :</span><p className="font-medium text-[#1a56db]">{offer?.fees?.applicationFee || offer?.serviceFee || paymentSettings?.applicationFee || 0} {offer?.currency || paymentSettings?.currency || 'EUR'}</p></div>
                  <div className="col-span-2"><span className="text-gray-500 text-xs">Preuve de paiement :</span><p className="font-medium text-green-700 text-xs">{paymentProofFile?.name || '—'}</p></div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ <strong>Important :</strong> Une fois soumise, votre candidature ne pourra être modifiée que sur demande. Assurez-vous que toutes les informations sont correctes.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button type="button" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} />
            {currentStep > 1 ? 'Précédent' : 'Annuler'}
          </button>
          {currentStep < 5 ? (
            <button type="button" onClick={() => setCurrentStep(currentStep + 1)}
              disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2) || (currentStep === 3 && !canProceedStep3) || (currentStep === 4 && !canSubmit)}
              className="flex items-center gap-2 px-6 py-2 bg-[#1a56db] text-white rounded-lg font-medium hover:bg-[#1648b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="next-step-btn">
              Suivant <ChevronRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!canSubmit || loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-application-btn">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Soumettre la candidature/Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;

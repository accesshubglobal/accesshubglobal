import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Search, ArrowLeft, User, Mail, Phone, MapPin, Calendar, CreditCard,
  Paperclip, Eye, Download, ExternalLink, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, MessageCircle, Send, X, ClipboardList, ChevronRight,
  Heart, BookOpen, Briefcase, Users, Globe, Printer
} from 'lucide-react';
import axios, { API, BACKEND_URL } from './adminApi';

const getStatusBadge = (status) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
    reviewing: { color: 'bg-blue-100 text-blue-700', label: 'En examen' },
    accepted: { color: 'bg-green-100 text-green-700', label: 'Acceptée' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Refusée' },
    modify: { color: 'bg-orange-100 text-orange-700', label: 'À modifier' }
  };
  const c = config[status] || config.pending;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
};

const InfoRow = ({ label, value }) => (
  value ? (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
    </div>
  ) : null
);

const SectionBlock = ({ title, icon: Icon, color = 'text-[#1e3a5f]', children }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        {Icon && <Icon size={18} className={color} />}
        {title}
      </h4>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const ApplicationsSection = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyReason, setModifyReason] = useState('');
  const [modifyAppId, setModifyAppId] = useState(null);
  const [appMessage, setAppMessage] = useState('');
  const [appMessages, setAppMessages] = useState([]);
  const [sendingAppMessage, setSendingAppMessage] = useState(false);
  const [appMsgAttachments, setAppMsgAttachments] = useState([]);
  const [uploadingAppMsgFile, setUploadingAppMsgFile] = useState(false);
  const appMsgFileRef = useRef(null);

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/applications`); setApplications(res.data); }
    catch (err) { console.error('Error loading applications:', err); }
    setLoading(false);
  };

  const updateApplicationStatus = async (appId, status, reason = null) => {
    try {
      let url = `${API}/admin/applications/${appId}/status?status=${status}`;
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      await axios.put(url);
      loadApplications();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status, ...(reason ? { modifyReason: reason } : {}) }));
      }
    } catch (err) { console.error('Error updating status:', err); }
  };

  const handleModifyStatus = (appId) => { setModifyAppId(appId); setModifyReason(''); setShowModifyModal(true); };

  const submitModifyStatus = async () => {
    if (!modifyReason.trim()) return;
    await updateApplicationStatus(modifyAppId, 'modify', modifyReason);
    setShowModifyModal(false); setModifyReason(''); setModifyAppId(null);
  };

  const sendApplicationMessage = async (appId) => {
    if (!appMessage.trim() && appMsgAttachments.length === 0) return;
    setSendingAppMessage(true);
    try {
      const res = await axios.post(`${API}/admin/applications/${appId}/message`, { content: appMessage, attachments: appMsgAttachments });
      setAppMessages(prev => [...prev, res.data.data]);
      setAppMessage(''); setAppMsgAttachments([]);
    } catch (err) { console.error('Error sending message:', err); }
    setSendingAppMessage(false);
  };

  const handleAppMsgFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAppMsgFile(true);
    try {
      const sigRes = await axios.get(`${API}/upload/signature`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;
      const formData = new FormData();
      formData.append('file', file); formData.append('signature', signature);
      formData.append('timestamp', timestamp); formData.append('api_key', api_key);
      formData.append('folder', folder);
      const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, formData);
      setAppMsgAttachments(prev => [...prev, uploadRes.data.secure_url]);
    } catch (err) {
      try {
        const formData = new FormData(); formData.append('file', file);
        const uploadRes = await axios.post(`${API}/upload`, formData);
        setAppMsgAttachments(prev => [...prev, uploadRes.data.url]);
      } catch (e2) { console.error('Upload error:', e2); }
    }
    setUploadingAppMsgFile(false);
    e.target.value = '';
  };

  const loadAppMessages = async (appId) => {
    try { const res = await axios.get(`${API}/admin/applications/${appId}/messages`); setAppMessages(res.data); }
    catch (err) { setAppMessages([]); }
  };

  const openApplicationDetail = (app) => { setSelectedApp(app); loadAppMessages(app.id); };

  // PDF Download
  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('admin-application-detail-content');
    const opt = {
      margin: 8,
      filename: `candidature-${selectedApp.firstName}-${selectedApp.lastName}-${selectedApp.id?.substring(0, 8)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = appSearchQuery === '' ||
        (app.firstName + ' ' + app.lastName).toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        app.userEmail?.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        app.offerTitle?.toLowerCase().includes(appSearchQuery.toLowerCase());
      const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const val = (v) => v || '—';

  return (
    <div data-testid="applications-admin-section">
      {/* Modify Reason Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="modify-modal">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2"><AlertTriangle size={20} /> Demander une modification</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-3">Indiquez la raison pour laquelle le candidat doit modifier sa candidature :</p>
              <textarea data-testid="modify-reason-input" value={modifyReason} onChange={(e) => setModifyReason(e.target.value)} placeholder="Ex: Le passeport soumis est illisible..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-32" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowModifyModal(false); setModifyReason(''); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button data-testid="modify-submit-btn" onClick={submitModifyStatus} disabled={!modifyReason.trim()} className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed">Envoyer la demande</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedApp ? (
        /* Application Detail View */
        <div className="space-y-6" data-testid="application-detail-view">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button data-testid="back-to-list-btn" onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"><ArrowLeft size={20} /></button>
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedApp.firstName} {selectedApp.lastName}</h3>
                  <p className="text-blue-200 text-sm">{selectedApp.offerTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {getStatusBadge(selectedApp.status)}
                <span className="text-blue-200 text-xs">{new Date(selectedApp.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {/* PDF Download Button */}
                <button
                  data-testid="download-pdf-btn"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all"
                >
                  <Download size={16} />
                  Télécharger PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all"
                >
                  <Printer size={16} />
                  Imprimer
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Full Application Content (PDF target) */}
            <div className="lg:col-span-2 space-y-6" id="admin-application-detail-content">

              {/* Application Header for PDF */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-[#1e3a5f]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedApp.offerTitle}</h2>
                    <p className="text-gray-500 text-sm mt-1">Réf : #{selectedApp.id?.substring(0, 8)}</p>
                    <p className="text-gray-500 text-sm">Soumis le {new Date(selectedApp.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {/* 1. Personal Information */}
              <SectionBlock title="1. Informations Personnelles" icon={User}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Nom de famille" value={val(selectedApp.lastName)} />
                  <InfoRow label="Prénom" value={val(selectedApp.firstName)} />
                  <InfoRow label="Genre" value={selectedApp.sex === 'male' ? 'Masculin' : selectedApp.sex === 'female' ? 'Féminin' : val(selectedApp.sex)} />
                  <InfoRow label="Nationalité" value={val(selectedApp.nationality)} />
                  <InfoRow label="Pays de naissance" value={val(selectedApp.countryOfBirth)} />
                  <InfoRow label="Langue maternelle" value={val(selectedApp.nativeLanguage)} />
                  <InfoRow label="Religion" value={val(selectedApp.religion)} />
                  <InfoRow label="Situation matrimoniale" value={val(selectedApp.maritalStatus)} />
                  <InfoRow label="Date de naissance" value={formatDate(selectedApp.dateOfBirth)} />
                  <InfoRow label="Lieu de naissance" value={val(selectedApp.placeOfBirth)} />
                  <InfoRow label="Niveau d'études" value={val(selectedApp.highestEducation)} />
                  <InfoRow label="Filière souhaitée (Chine)" value={val(selectedApp.majorInChina)} />
                  <InfoRow label="Employeur/Institution" value={val(selectedApp.currentEmployer)} />
                  <InfoRow label="Téléphone" value={val(selectedApp.phoneNumber)} />
                  <InfoRow label="Email personnel" value={val(selectedApp.personalEmail || selectedApp.userEmail)} />
                  <InfoRow label="Profession" value={val(selectedApp.occupation)} />
                  <InfoRow label="Loisirs" value={val(selectedApp.hobby)} />
                </div>
              </SectionBlock>

              {/* 2. Adresse permanente */}
              <SectionBlock title="2. Adresse Permanente" icon={MapPin}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Adresse" value={val(selectedApp.address)} />
                  <InfoRow label="Adresse détaillée" value={val(selectedApp.addressDetailed)} />
                  <InfoRow label="Téléphone" value={val(selectedApp.addressPhone)} />
                  <InfoRow label="Code postal" value={val(selectedApp.zipCode)} />
                </div>
                {(selectedApp.currentAddress) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Adresse actuelle (si différente)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <InfoRow label="Adresse" value={val(selectedApp.currentAddress)} />
                      <InfoRow label="Adresse détaillée" value={val(selectedApp.currentAddressDetailed)} />
                      <InfoRow label="Téléphone" value={val(selectedApp.currentAddressPhone)} />
                      <InfoRow label="Code postal" value={val(selectedApp.currentAddressZipCode)} />
                    </div>
                  </div>
                )}
              </SectionBlock>

              {/* 3. Health Status */}
              <SectionBlock title="3. État de Santé" icon={Heart} color="text-rose-600">
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Groupe sanguin" value={val(selectedApp.bloodGroup)} />
                  <InfoRow label="Taille" value={val(selectedApp.height)} />
                  <InfoRow label="Poids" value={val(selectedApp.weight)} />
                </div>
              </SectionBlock>

              {/* 4. China Status */}
              <SectionBlock title="4. Situation en Chine" icon={Globe} color="text-red-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Actuellement en Chine" value={selectedApp.inChinaNow ? 'Oui' : 'Non'} />
                  {selectedApp.inChinaNow && <>
                    <InfoRow label="École / Organisation" value={val(selectedApp.chinaSchool)} />
                    <InfoRow label="Période (début)" value={formatDate(selectedApp.chinaLearningPeriodStart)} />
                    <InfoRow label="Période (fin)" value={formatDate(selectedApp.chinaLearningPeriodEnd)} />
                    <InfoRow label="Type de visa" value={val(selectedApp.chinaVisaType)} />
                    <InfoRow label="N° de visa" value={val(selectedApp.chinaVisaNo)} />
                    <InfoRow label="Expiration visa" value={formatDate(selectedApp.chinaVisaExpiry)} />
                  </>}
                </div>
              </SectionBlock>

              {/* 5. Passport */}
              <SectionBlock title="5. Informations Passeport" icon={FileText} color="text-indigo-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="N° Passeport" value={val(selectedApp.passportNumber)} />
                  <InfoRow label="Date de délivrance" value={formatDate(selectedApp.passportIssuedDate)} />
                  <InfoRow label="Date d'expiration" value={formatDate(selectedApp.passportExpiryDate)} />
                  <InfoRow label="Ancien N° Passeport" value={val(selectedApp.oldPassportNo)} />
                  <InfoRow label="Délivrance (ancien)" value={formatDate(selectedApp.oldPassportIssuedDate)} />
                  <InfoRow label="Expiration (ancien)" value={formatDate(selectedApp.oldPassportExpiryDate)} />
                </div>
              </SectionBlock>

              {/* 6. Educational Background */}
              {selectedApp.educationalBackground?.some(e => e.instituteName) && (
                <SectionBlock title="6. Formation Académique" icon={BookOpen} color="text-teal-700">
                  <div className="space-y-4">
                    {selectedApp.educationalBackground.filter(e => e.instituteName).map((edu, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">École {String.fromCharCode(65 + idx)}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <InfoRow label="Établissement" value={val(edu.instituteName)} />
                          <InfoRow label="Filière" value={val(edu.fieldOfStudy)} />
                          <InfoRow label="Niveau" value={val(edu.educationLevel)} />
                          <InfoRow label="De" value={formatDate(edu.yearsFrom)} />
                          <InfoRow label="À" value={formatDate(edu.yearsTo)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* 7. Work Experience */}
              {selectedApp.workExperience?.some(w => w.companyName) && (
                <SectionBlock title="7. Expérience Professionnelle" icon={Briefcase} color="text-amber-700">
                  <div className="space-y-4">
                    {selectedApp.workExperience.filter(w => w.companyName).map((work, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Expérience {String.fromCharCode(65 + idx)}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <InfoRow label="Entreprise" value={val(work.companyName)} />
                          <InfoRow label="Poste" value={val(work.position)} />
                          <InfoRow label="Secteur" value={val(work.industryType)} />
                          <InfoRow label="De" value={formatDate(work.yearsFrom)} />
                          <InfoRow label="À" value={formatDate(work.yearsTo)} />
                          <InfoRow label="Personne de contact" value={val(work.contactPerson)} />
                          <InfoRow label="Tél. contact" value={val(work.contactPhone)} />
                          <InfoRow label="Email contact" value={val(work.contactEmail)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* 8. Family Information */}
              <SectionBlock title="8. Informations Familiales" icon={Users} color="text-purple-700">
                <div className="space-y-4">
                  {[
                    { key: 'fatherInfo', label: 'Père' },
                    { key: 'motherInfo', label: 'Mère' },
                    { key: 'spouseInfo', label: 'Conjoint(e)' }
                  ].map(({ key, label }) => selectedApp[key]?.name && (
                    <div key={key} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{label}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <InfoRow label="Nom" value={val(selectedApp[key].name)} />
                        <InfoRow label="Nationalité" value={val(selectedApp[key].nationality)} />
                        <InfoRow label="Date de naissance" value={formatDate(selectedApp[key].dob)} />
                        <InfoRow label="N° Pièce d'identité" value={val(selectedApp[key].idNo)} />
                        <InfoRow label="Téléphone" value={val(selectedApp[key].mobile)} />
                        <InfoRow label="Email" value={val(selectedApp[key].email)} />
                        <InfoRow label="Profession" value={val(selectedApp[key].occupation)} />
                        <InfoRow label="Employeur" value={val(selectedApp[key].employer)} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              {/* 9. Financial Sponsor */}
              {selectedApp.financialSponsor?.relationship && (
                <SectionBlock title="9. Garant Financier" icon={CreditCard} color="text-green-700">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Relation" value={val(selectedApp.financialSponsor.relationship)} />
                    <InfoRow label="Adresse complète" value={val(selectedApp.financialSponsor.address)} />
                  </div>
                </SectionBlock>
              )}

              {/* 10. Emergency Contact */}
              {selectedApp.emergencyContact?.name && (
                <SectionBlock title="10. Contact d'Urgence en Chine" icon={Phone} color="text-orange-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoRow label="Nom" value={val(selectedApp.emergencyContact.name)} />
                    <InfoRow label="Relation" value={val(selectedApp.emergencyContact.relationship)} />
                    <InfoRow label="Profession" value={val(selectedApp.emergencyContact.occupation)} />
                    <InfoRow label="Nationalité" value={val(selectedApp.emergencyContact.nationality)} />
                    <InfoRow label="N° Pièce d'identité" value={val(selectedApp.emergencyContact.idNo)} />
                    <InfoRow label="Employeur" value={val(selectedApp.emergencyContact.employer)} />
                    <InfoRow label="Adresse en Chine" value={val(selectedApp.emergencyContact.addressChina)} />
                    <InfoRow label="Téléphone" value={val(selectedApp.emergencyContact.phone)} />
                    <InfoRow label="Email" value={val(selectedApp.emergencyContact.email)} />
                  </div>
                </SectionBlock>
              )}

              {/* Documents */}
              <SectionBlock title="Documents soumis" icon={Paperclip}>
                {selectedApp.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedApp.documents.map((doc, i) => {
                      const docName = typeof doc === 'string' ? doc : (doc.name || doc.label || `Document ${i + 1}`);
                      const docUrl = typeof doc === 'string' ? doc : (doc.url || doc.file || doc);
                      const isImage = typeof docUrl === 'string' && /\.(jpg|jpeg|png|gif|webp)/i.test(docUrl);
                      return (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-[#1e3a5f]/30 hover:shadow-sm transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-50 group-hover:bg-blue-100"><FileText size={18} className="text-[#1e3a5f]" /></div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{docName}</p></div>
                          </div>
                          {typeof docUrl === 'string' && docUrl.startsWith('http') && (
                            <div className="flex gap-2 mt-3">
                              <a href={docUrl} target="_blank" rel="noopener noreferrer" data-testid={`view-doc-${i}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700"><Eye size={14} /> Voir</a>
                              <a href={docUrl} download data-testid={`download-doc-${i}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 rounded-lg text-xs font-medium text-[#1e3a5f]"><Download size={14} /> Télécharger</a>
                            </div>
                          )}
                          {isImage && typeof docUrl === 'string' && <div className="mt-3 rounded-lg overflow-hidden border border-gray-100"><img src={docUrl} alt={docName} className="w-full h-32 object-cover" /></div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8"><FileText size={32} className="mx-auto text-gray-200 mb-2" /><p className="text-sm text-gray-400">Aucun document</p></div>
                )}
                {selectedApp.paymentProof && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Preuve de paiement</p>
                    <div className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-green-50"><CreditCard size={18} className="text-green-600" /></div>
                      <div className="flex-1"><p className="text-sm font-medium text-gray-800">{selectedApp.paymentMethod || 'Preuve de paiement'}</p></div>
                      <a href={selectedApp.paymentProof.startsWith('http') ? selectedApp.paymentProof : `${BACKEND_URL}${selectedApp.paymentProof}`} target="_blank" rel="noopener noreferrer" data-testid="view-payment-proof" className="px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-medium text-green-700 flex items-center gap-1.5"><ExternalLink size={14} /> Voir</a>
                    </div>
                  </div>
                )}
              </SectionBlock>

              {selectedApp.status === 'modify' && selectedApp.modifyReason && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5" data-testid="modify-reason-display">
                  <div className="flex items-start gap-3"><AlertTriangle size={20} className="text-orange-500 mt-0.5" /><div><p className="font-semibold text-orange-800 text-sm">Modification demandée</p><p className="text-sm text-orange-700 mt-1">{selectedApp.modifyReason}</p></div></div>
                </div>
              )}
            </div>

            {/* Right column: Actions & Messaging */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h4 className="font-semibold text-gray-900 text-sm">Actions rapides</h4></div>
                <div className="p-4 space-y-2">
                  {[
                    { status: 'reviewing', label: 'En examen', icon: Eye, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                    { status: 'accepted', label: 'Accepter', icon: CheckCircle, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                    { status: 'rejected', label: 'Refuser', icon: XCircle, color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                  ].map(action => (
                    <button key={action.status} data-testid={`action-${action.status}`} onClick={() => updateApplicationStatus(selectedApp.id, action.status)} disabled={selectedApp.status === action.status}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${action.color} disabled:opacity-40 disabled:cursor-not-allowed`}>
                      <action.icon size={16} /> {action.label}
                    </button>
                  ))}
                  <button data-testid="action-modify" onClick={() => handleModifyStatus(selectedApp.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100"><RefreshCw size={16} /> Demander modification</button>
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 px-1">Statut paiement</p>
                    <select data-testid="payment-status-select" value={selectedApp.paymentStatus || 'pending'} onChange={async (e) => {
                      try { await axios.put(`${API}/admin/applications/${selectedApp.id}/payment-status?payment_status=${e.target.value}`); setSelectedApp(prev => ({ ...prev, paymentStatus: e.target.value })); loadApplications(); }
                      catch (err) { console.error(err); }
                    }} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20">
                      <option value="pending">En attente</option><option value="submitted">Soumis</option><option value="verified">Vérifié</option><option value="rejected">Rejeté</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messaging */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid="application-messaging">
                <div className="px-6 py-4 border-b border-gray-100"><h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><MessageCircle size={16} className="text-[#1e3a5f]" /> Messages au candidat</h4></div>
                <div className="flex flex-col" style={{ maxHeight: '450px' }}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '120px', maxHeight: '300px' }}>
                    {appMessages.length === 0 ? (
                      <div className="text-center py-6"><MessageCircle size={24} className="mx-auto text-gray-200 mb-2" /><p className="text-xs text-gray-400">Aucun message envoyé</p></div>
                    ) : appMessages.map((msg, i) => (
                      <div key={msg.id || i} className="bg-[#1e3a5f]/5 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-[#1e3a5f]">{msg.adminName || 'Admin'}</p>
                          <p className="text-[10px] text-gray-400">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                        {msg.content && <p className="text-sm text-gray-700">{msg.content}</p>}
                        {msg.attachments?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{msg.attachments.map((att, j) => <a key={j} href={att} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-[10px] text-[#1e3a5f] border border-[#1e3a5f]/20"><Paperclip size={10} /> Fichier {j + 1}</a>)}</div>}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 space-y-2">
                    {appMsgAttachments.length > 0 && <div className="flex flex-wrap gap-1.5">{appMsgAttachments.map((att, i) => <div key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg text-[10px] text-blue-700 border border-blue-200"><Paperclip size={10} /> Fichier {i + 1}<button onClick={() => setAppMsgAttachments(prev => prev.filter((_, j) => j !== i))} className="ml-1 hover:text-red-500"><X size={10} /></button></div>)}</div>}
                    <div className="flex gap-2">
                      <button data-testid="app-msg-attach-btn" onClick={() => appMsgFileRef.current?.click()} disabled={uploadingAppMsgFile} className="p-2.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-50 rounded-xl disabled:opacity-40">
                        {uploadingAppMsgFile ? <div className="animate-spin w-4 h-4 border-2 border-[#1e3a5f] border-t-transparent rounded-full"></div> : <Paperclip size={16} />}
                      </button>
                      <input ref={appMsgFileRef} type="file" className="hidden" onChange={handleAppMsgFileUpload} />
                      <input data-testid="app-message-input" value={appMessage} onChange={(e) => setAppMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendApplicationMessage(selectedApp.id)} placeholder="Écrire un message..." className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
                      <button data-testid="send-app-message-btn" onClick={() => sendApplicationMessage(selectedApp.id)} disabled={(!appMessage.trim() && appMsgAttachments.length === 0) || sendingAppMessage} className="p-2.5 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2a5298] disabled:opacity-40"><Send size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Applications List View */
        <div className="space-y-4" data-testid="applications-list-view">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-gray-900 text-lg">Candidatures <span className="text-gray-400 font-normal text-base">({applications.length})</span></h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input data-testid="app-search-input" value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} placeholder="Rechercher un candidat..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
                </div>
                <select data-testid="app-status-filter" value={appStatusFilter} onChange={(e) => setAppStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20">
                  <option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="reviewing">En examen</option><option value="accepted">Acceptée</option><option value="rejected">Refusée</option><option value="modify">À modifier</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { status: 'pending', label: 'En attente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                { status: 'reviewing', label: 'En examen', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { status: 'accepted', label: 'Acceptées', color: 'bg-green-50 text-green-700 border-green-200' },
                { status: 'rejected', label: 'Refusées', color: 'bg-red-50 text-red-700 border-red-200' },
                { status: 'modify', label: 'À modifier', color: 'bg-orange-50 text-orange-700 border-orange-200' },
              ].map(pill => (
                <button key={pill.status} onClick={() => setAppStatusFilter(prev => prev === pill.status ? 'all' : pill.status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${appStatusFilter === pill.status ? pill.color + ' ring-2 ring-offset-1 ring-current/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                  {pill.label} ({applications.filter(a => a.status === pill.status).length})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div></div>
          ) : getFilteredApplications().length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center"><FileText size={48} className="mx-auto text-gray-200 mb-3" /><p className="text-gray-500">{applications.length === 0 ? 'Aucune candidature' : 'Aucun résultat'}</p></div>
          ) : (
            <div className="space-y-3">
              {getFilteredApplications().map((app) => (
                <div key={app.id} data-testid={`application-card-${app.id}`} onClick={() => openApplicationDetail(app)} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[#1e3a5f]/10 overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {(app.firstName?.[0] || '?').toUpperCase()}{(app.lastName?.[0] || '').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm">{app.firstName || app.userName?.split(' ')[0]} {app.lastName || app.userName?.split(' ')[1] || ''}</h4>
                        {getStatusBadge(app.status)}
                        {app.status === 'modify' && <span className="text-orange-500"><AlertTriangle size={14} /></span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{app.offerTitle}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Mail size={12} /> {app.userEmail}</span>
                        {app.nationality && <span className="flex items-center gap-1"><MapPin size={12} /> {app.nationality}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        {app.documents?.length > 0 && <p className="text-xs text-[#1e3a5f] font-medium mt-0.5">{app.documents.length} doc{app.documents.length > 1 ? 's' : ''}</p>}
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
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

export default ApplicationsSection;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GraduationCap, X } from 'lucide-react';
import axios, { API } from './adminApi';

const OfferFormModal = ({ offer, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(offer || {
    title: '', university: '', city: '', country: 'Chine', countryCode: 'CN',
    category: 'engineering', categoryLabel: 'Ingénierie', degree: 'Master',
    duration: '2 ans', teachingLanguage: 'Anglais', intake: 'Automne 2025',
    deadline: '', image: '', originalTuition: 0, scholarshipTuition: 0, currency: 'CNY',
    scholarshipType: '', hasScholarship: false, isPartialScholarship: false,
    isSelfFinanced: true, isOnline: false, isNew: true, badges: [], description: '',
    requirements: { age: '', previousDegree: '', gpa: '', language: '', otherRequirements: [] },
    scholarshipDetails: { tuitionCovered: false, accommodationCovered: false, monthlyAllowance: 0, insuranceCovered: false },
    fees: { originalTuition: 0, scholarshipTuition: 0, accommodationDouble: 0, accommodationSingle: 0, registrationFee: 0, insuranceFee: 0, applicationFee: 0, booksFee: 0, otherFees: [] },
    admissionConditions: [], requiredDocuments: [],
    documentTemplates: [{}, {}, {}], documents: [], serviceFee: 0
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        ...offer,
        admissionConditions: offer.admissionConditions || [],
        requiredDocuments: offer.requiredDocuments || [],
        documentTemplates: offer.documentTemplates || [{}, {}, {}],
        fees: { ...offer.fees, otherFees: offer.fees?.otherFees || [] }
      });
    }
  }, [offer]);

  const categoryMap = {
    'engineering': 'Ingénierie', 'medicine': 'Médecine', 'business': 'Gestion',
    'economics': 'Économie', 'science': 'Sciences', 'law': 'Droit',
    'arts': 'Arts & Design', 'literature': 'Littérature',
    'chinese': 'Langue Chinoise', 'french': 'Langue Française'
  };

  const standardDocs = [
    'Passeport', "Photo d'identité", 'Diplôme de baccalauréat', 'Relevé de notes',
    'Certificat de langue (IELTS/TOEFL/HSK)', 'Lettre de motivation', 'CV / Curriculum Vitae',
    'Lettres de recommandation (2)', 'Certificat de naissance', 'Certificat médical',
    'Preuve de ressources financières', 'Portfolio (pour arts/design)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (offer) { await axios.put(`${API}/admin/offers/${offer.id}`, formData); }
      else { await axios.post(`${API}/admin/offers`, formData); }
      onSuccess();
    } catch (err) { console.error('Error saving offer:', err); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">{offer ? "Modifier l'offre" : 'Nouvelle offre'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université</label>
              <input type="text" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select value={formData.countryCode} onChange={(e) => setFormData({...formData, countryCode: e.target.value, country: e.target.value === 'CN' ? 'Chine' : 'France', currency: e.target.value === 'CN' ? 'CNY' : 'EUR'})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
              <select value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                <option value="Licence">Licence</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
                <option value="MBA">MBA</option>
                <option value="Certificat">Certificat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, categoryLabel: categoryMap[e.target.value] || e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {Object.entries(categoryMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Ex: 2 ans" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue d'enseignement</label>
              <select value={formData.teachingLanguage || 'Anglais'} onChange={(e) => setFormData({...formData, teachingLanguage: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                <option value="Anglais">Anglais</option>
                <option value="Français">Français</option>
                <option value="Chinois">Chinois</option>
                <option value="Bilingue (Anglais/Chinois)">Bilingue (Anglais/Chinois)</option>
                <option value="Bilingue (Français/Anglais)">Bilingue (Français/Anglais)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentrée</label>
              <select value={formData.intake || 'Automne 2025'} onChange={(e) => setFormData({...formData, intake: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Automne 2025','Printemps 2025','Automne 2026','Printemps 2026','Septembre 2025','Février 2025','Septembre 2026','Février 2026'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
              <input type="date" value={formData.deadline || ''} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais originaux</label>
              <input type="number" value={formData.originalTuition} onChange={(e) => setFormData({...formData, originalTuition: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais après bourse</label>
              <input type="number" value={formData.scholarshipTuition} onChange={(e) => setFormData({...formData, scholarshipTuition: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} />
          </div>

          {/* University Fees */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-3">Frais Universitaires ({formData.currency || 'CNY'})</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Frais de scolarité', key: 'tuitionFee', fallback: formData.originalTuition },
                { label: "Frais d'inscription", key: 'registrationFee' },
                { label: 'Logement (double)', key: 'accommodationDouble' },
                { label: 'Logement (simple)', key: 'accommodationSingle' },
                { label: 'Assurance', key: 'insuranceFee' },
                { label: 'Livres et matériels', key: 'booksFee' },
              ].map(({ label, key, fallback }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type="number" value={formData.fees?.[key] || fallback || 0}
                    onChange={(e) => setFormData({...formData, fees: {...(formData.fees || {}), [key]: Number(e.target.value)}})}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="0" />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Autres frais (optionnel)</label>
                <button type="button" onClick={() => setFormData({...formData, fees: {...(formData.fees || {}), otherFees: [...(formData.fees?.otherFees || []), { name: '', amount: 0 }]}})} className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">+ Ajouter</button>
              </div>
              {(formData.fees?.otherFees || []).map((fee, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={fee.name} onChange={(e) => { const otherFees = [...(formData.fees?.otherFees || [])]; otherFees[index] = { ...otherFees[index], name: e.target.value }; setFormData({...formData, fees: {...(formData.fees || {}), otherFees}}); }} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du frais" />
                  <input type="number" value={fee.amount} onChange={(e) => { const otherFees = [...(formData.fees?.otherFees || [])]; otherFees[index] = { ...otherFees[index], amount: Number(e.target.value) }; setFormData({...formData, fees: {...(formData.fees || {}), otherFees}}); }} className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Montant" />
                  <button type="button" onClick={() => setFormData({...formData, fees: {...(formData.fees || {}), otherFees: (formData.fees?.otherFees || []).filter((_, i) => i !== index)}})} className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded-lg">x</button>
                </div>
              ))}
            </div>
          </div>

          {/* Service Fees */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h4 className="font-medium text-gray-900 mb-3">Frais de service Winner's Consulting</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de dossier ({formData.currency})</label>
                <input type="number" value={formData.fees?.applicationFee || 0} onChange={(e) => setFormData({...formData, fees: {...formData.fees, applicationFee: Number(e.target.value)}})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frais de service ({formData.currency})</label>
                <input type="number" value={formData.serviceFee || 0} onChange={(e) => setFormData({...formData, serviceFee: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
              </div>
            </div>
          </div>

          {/* Admission Conditions */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Conditions d'Admission</h4>
              <button type="button" onClick={() => setFormData({...formData, admissionConditions: [...(formData.admissionConditions || []), { condition: '', description: '' }]})} className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600">+ Ajouter</button>
            </div>
            {(formData.admissionConditions || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucune condition d'admission ajoutée.</p>
            ) : (
              <div className="space-y-3">
                {(formData.admissionConditions || []).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={item.condition} onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], condition: e.target.value }; setFormData({...formData, admissionConditions: ac}); }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Ex: Diplôme de baccalauréat" />
                        <textarea value={item.description} onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], description: e.target.value }; setFormData({...formData, admissionConditions: ac}); }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none" rows={2} placeholder="Description..." />
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, admissionConditions: (formData.admissionConditions || []).filter((_, i) => i !== index)})} className="self-start p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions courantes :</p>
              <div className="flex flex-wrap gap-2">
                {['Diplôme requis','Niveau de langue','Âge minimum/maximum','Expérience professionnelle','Tests standardisés (IELTS, TOEFL, HSK)','Lettre de motivation'].map((s, idx) => (
                  <button key={idx} type="button" onClick={() => { const ac = formData.admissionConditions || []; if (!ac.some(c => c.condition === s)) setFormData({...formData, admissionConditions: [...ac, { condition: s, description: '' }]}); }} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+ {s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <h4 className="font-medium text-gray-900 mb-3">Documents Requis pour Candidature</h4>
            <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Documents standards :</p>
              <div className="grid grid-cols-2 gap-2">
                {standardDocs.map((doc, idx) => (
                  <label key={idx} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={(formData.requiredDocuments || []).includes(doc)}
                      onChange={(e) => {
                        const docs = formData.requiredDocuments || [];
                        setFormData({...formData, requiredDocuments: e.target.checked ? [...docs, doc] : docs.filter(d => d !== doc)});
                      }} className="mt-0.5 rounded border-gray-300" />
                    <span className="text-gray-700">{doc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Documents personnalisés :</p>
                <button type="button" onClick={() => { const customDoc = prompt('Nom du document personnalisé :'); if (customDoc?.trim()) { const docs = formData.requiredDocuments || []; if (!docs.includes(customDoc.trim())) setFormData({...formData, requiredDocuments: [...docs, customDoc.trim()]}); } }} className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">+ Ajouter</button>
              </div>
              {(formData.requiredDocuments || []).filter(doc => !standardDocs.includes(doc)).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 bg-green-50 rounded mb-1">
                  <span className="text-sm text-gray-700">{doc}</span>
                  <button type="button" onClick={() => setFormData({...formData, requiredDocuments: (formData.requiredDocuments || []).filter(d => d !== doc)})} className="text-red-500 text-xs">x</button>
                </div>
              ))}
            </div>

            {/* Document Templates */}
            <div className="border-t border-green-200 pt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Templates de Documents</h5>
              <p className="text-xs text-gray-500 mb-3">Uploadez jusqu'à 3 documents templates que les étudiants devront télécharger, remplir/signer et re-uploader.</p>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-green-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Template {index + 1}</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.documentTemplates?.[index]?.name || ''} onChange={(e) => { const t = formData.documentTemplates || [{}, {}, {}]; t[index] = { ...t[index], name: e.target.value }; setFormData({...formData, documentTemplates: t}); }} className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du document" />
                      <input type="url" value={formData.documentTemplates?.[index]?.url || ''} onChange={(e) => { const t = formData.documentTemplates || [{}, {}, {}]; t[index] = { ...t[index], url: e.target.value }; setFormData({...formData, documentTemplates: t}); }} className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="URL du fichier" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.hasScholarship} onChange={(e) => setFormData({...formData, hasScholarship: e.target.checked, isSelfFinanced: !e.target.checked, scholarshipType: e.target.checked ? 'Bourse Complète' : '', badges: e.target.checked ? ['Bourse Complète'] : []})} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Bourse disponible</span>
            </label>
            {formData.hasScholarship && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isPartialScholarship} onChange={(e) => setFormData({...formData, isPartialScholarship: e.target.checked, scholarshipType: e.target.checked ? 'Bourse Partielle' : 'Bourse Complète', badges: [e.target.checked ? 'Bourse Partielle' : 'Bourse Complète']})} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Bourse Partielle</span>
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isOnline} onChange={(e) => setFormData({...formData, isOnline: e.target.checked})} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Cours en ligne</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({...formData, isNew: e.target.checked})} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Nouveauté</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/offers`); setOffers(res.data); }
    catch (err) { console.error('Error loading offers:', err); }
    setLoading(false);
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) return;
    try { await axios.delete(`${API}/admin/offers/${offerId}`); loadOffers(); }
    catch (err) { console.error('Error deleting offer:', err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Offres de programmes ({offers.length})</h3>
        <button onClick={() => { setEditingItem(null); setShowOfferModal(true); }} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouvelle offre
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center"><GraduationCap size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune offre pour le moment</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Université</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={offer.image} alt={offer.title} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="font-medium text-gray-900">{offer.title}</p>
                        <p className="text-xs text-gray-500">{offer.degree} - {offer.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.university}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.hasScholarship && !offer.isPartialScholarship ? 'bg-green-100 text-green-700' : offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {offer.hasScholarship && !offer.isPartialScholarship ? 'Bourse Complète' : offer.isPartialScholarship ? 'Bourse Partielle' : 'Auto-financé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.views?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingItem(offer); setShowOfferModal(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => deleteOffer(offer.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showOfferModal && (
        <OfferFormModal
          offer={editingItem}
          onClose={() => { setShowOfferModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowOfferModal(false); setEditingItem(null); loadOffers(); }}
        />
      )}
    </div>
  );
};

export default OffersSection;

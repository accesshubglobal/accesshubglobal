import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

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

const defaultFormData = {
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
};

/**
 * Shared offer form modal.
 * @param {object}   offer      - Offer to edit, null for new
 * @param {function} onSave     - Called with formData when user submits
 * @param {function} onClose    - Called to close the modal
 * @param {boolean}  loading    - Disable submit button while saving
 * @param {string}   error      - Error message to display
 * @param {boolean}  isPartner    - Hides AccessHub service-fee section for partners
 * @param {string}   submitLabel  - Custom label for the submit button
 * @param {boolean}  feesOnlyMode - Admin reviewing partner offer: only fees section is editable
 */
const OfferFormModal = ({ offer, onSave, onClose, loading = false, error = '', isPartner = false, submitLabel, feesOnlyMode = false }) => {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (offer) {
      setFormData({
        ...defaultFormData,
        ...offer,
        admissionConditions: offer.admissionConditions || [],
        requiredDocuments: offer.requiredDocuments || [],
        documentTemplates: offer.documentTemplates || [{}, {}, {}],
        fees: { ...defaultFormData.fees, ...(offer.fees || {}), otherFees: offer.fees?.otherFees || [] }
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [offer]);

  const set = (patch) => setFormData(f => ({ ...f, ...patch }));
  const setFee = (key, val) => set({ fees: { ...formData.fees, [key]: val } });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{offer ? "Modifier l'offre" : 'Nouvelle offre'}</h3>
            {feesOnlyMode && (
              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                ⚠ Mode révision — seule la section "Frais de service" est modifiable
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          {/* Basic Info */}
          <fieldset disabled={feesOnlyMode} className={feesOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={formData.title} onChange={(e) => set({ title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université *</label>
              <input type="text" value={formData.university} onChange={(e) => set({ university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-university" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input type="text" value={formData.city} onChange={(e) => set({ city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-city" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select value={formData.countryCode}
                onChange={(e) => set({ countryCode: e.target.value, country: e.target.value === 'CN' ? 'Chine' : 'France', currency: e.target.value === 'CN' ? 'CNY' : 'EUR' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                data-testid="offer-form-country">
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
              <select value={formData.degree} onChange={(e) => set({ degree: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Licence', 'Master', 'Doctorat', 'MBA', 'Certificat'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={formData.category}
                onChange={(e) => set({ category: e.target.value, categoryLabel: categoryMap[e.target.value] || e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {Object.entries(categoryMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <input type="text" value={formData.duration} onChange={(e) => set({ duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="Ex: 2 ans" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue d'enseignement</label>
              <select value={formData.teachingLanguage || 'Anglais'} onChange={(e) => set({ teachingLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Anglais', 'Français', 'Chinois', 'Bilingue (Anglais/Chinois)', 'Bilingue (Français/Anglais)'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentrée</label>
              <select value={formData.intake || 'Automne 2025'} onChange={(e) => set({ intake: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Automne 2025','Printemps 2025','Automne 2026','Printemps 2026','Septembre 2025','Février 2025','Septembre 2026','Février 2026'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
              <input type="date" value={formData.deadline || ''} onChange={(e) => set({ deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais originaux ({formData.currency})</label>
              <input type="number" value={formData.originalTuition} onChange={(e) => set({ originalTuition: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais après bourse ({formData.currency})</label>
              <input type="number" value={formData.scholarshipTuition} onChange={(e) => set({ scholarshipTuition: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={formData.image || ''} onChange={(e) => set({ image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description || ''} onChange={(e) => set({ description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} />
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
                    onChange={(e) => setFee(key, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="0" />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Autres frais (optionnel)</label>
                <button type="button"
                  onClick={() => setFee('otherFees', [...(formData.fees?.otherFees || []), { name: '', amount: 0 }])}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">+ Ajouter</button>
              </div>
              {(formData.fees?.otherFees || []).map((fee, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={fee.name}
                    onChange={(e) => { const o = [...(formData.fees?.otherFees || [])]; o[index] = { ...o[index], name: e.target.value }; setFee('otherFees', o); }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du frais" />
                  <input type="number" value={fee.amount}
                    onChange={(e) => { const o = [...(formData.fees?.otherFees || [])]; o[index] = { ...o[index], amount: Number(e.target.value) }; setFee('otherFees', o); }}
                    className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Montant" />
                  <button type="button"
                    onClick={() => setFee('otherFees', (formData.fees?.otherFees || []).filter((_, i) => i !== index))}
                    className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded-lg">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Admission Conditions */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Conditions d'Admission</h4>
              <button type="button"
                onClick={() => set({ admissionConditions: [...(formData.admissionConditions || []), { condition: '', description: '' }] })}
                className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600">+ Ajouter</button>
            </div>
            {(formData.admissionConditions || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucune condition d'admission ajoutée.</p>
            ) : (
              <div className="space-y-3">
                {(formData.admissionConditions || []).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={item.condition}
                          onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], condition: e.target.value }; set({ admissionConditions: ac }); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Ex: Diplôme de baccalauréat" />
                        <textarea value={item.description}
                          onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], description: e.target.value }; set({ admissionConditions: ac }); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none" rows={2} placeholder="Description..." />
                      </div>
                      <button type="button"
                        onClick={() => set({ admissionConditions: (formData.admissionConditions || []).filter((_, i) => i !== index) })}
                        className="self-start p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions courantes :</p>
              <div className="flex flex-wrap gap-2">
                {['Diplôme requis','Niveau de langue','Âge minimum/maximum','Expérience professionnelle','Tests standardisés (IELTS, TOEFL, HSK)','Lettre de motivation'].map((s, idx) => (
                  <button key={idx} type="button"
                    onClick={() => { const ac = formData.admissionConditions || []; if (!ac.some(c => c.condition === s)) set({ admissionConditions: [...ac, { condition: s, description: '' }] }); }}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+ {s}</button>
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
                        set({ requiredDocuments: e.target.checked ? [...docs, doc] : docs.filter(d => d !== doc) });
                      }} className="mt-0.5 rounded border-gray-300" />
                    <span className="text-gray-700">{doc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Documents personnalisés :</p>
                <button type="button"
                  onClick={() => { const customDoc = prompt('Nom du document personnalisé :'); if (customDoc?.trim()) { const docs = formData.requiredDocuments || []; if (!docs.includes(customDoc.trim())) set({ requiredDocuments: [...docs, customDoc.trim()] }); } }}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">+ Ajouter</button>
              </div>
              {(formData.requiredDocuments || []).filter(doc => !standardDocs.includes(doc)).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 bg-green-50 rounded mb-1">
                  <span className="text-sm text-gray-700">{doc}</span>
                  <button type="button"
                    onClick={() => set({ requiredDocuments: (formData.requiredDocuments || []).filter(d => d !== doc) })}
                    className="text-red-500 text-xs">×</button>
                </div>
              ))}
            </div>
            <div className="border-t border-green-200 pt-3">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Templates de Documents</h5>
              <p className="text-xs text-gray-500 mb-3">Uploadez jusqu'à 3 documents templates que les étudiants devront télécharger, remplir/signer et re-uploader.</p>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-green-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Template {index + 1}</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.documentTemplates?.[index]?.name || ''}
                        onChange={(e) => { const t = [...(formData.documentTemplates || [{}, {}, {}])]; t[index] = { ...t[index], name: e.target.value }; set({ documentTemplates: t }); }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du document" />
                      <input type="url" value={formData.documentTemplates?.[index]?.url || ''}
                        onChange={(e) => { const t = [...(formData.documentTemplates || [{}, {}, {}])]; t[index] = { ...t[index], url: e.target.value }; set({ documentTemplates: t }); }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="URL du fichier" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.hasScholarship}
                onChange={(e) => set({ hasScholarship: e.target.checked, isSelfFinanced: !e.target.checked, scholarshipType: e.target.checked ? 'Bourse Complète' : '', badges: e.target.checked ? ['Bourse Complète'] : [] })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Bourse disponible</span>
            </label>
            {formData.hasScholarship && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isPartialScholarship}
                  onChange={(e) => set({ isPartialScholarship: e.target.checked, scholarshipType: e.target.checked ? 'Bourse Partielle' : 'Bourse Complète', badges: [e.target.checked ? 'Bourse Partielle' : 'Bourse Complète'] })}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Bourse Partielle</span>
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isOnline}
                onChange={(e) => set({ isOnline: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Cours en ligne</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isNew}
                onChange={(e) => set({ isNew: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Nouveauté</span>
            </label>
          </div>
          </fieldset>

          {/* Service Fees — hidden for partners, always editable for admin */}
          {!isPartner && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-1">Frais de service AccessHub Global</h4>
              {feesOnlyMode && <p className="text-xs text-amber-700 mb-3">✏ Seule cette section est modifiable dans ce mode révision</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais de dossier ({formData.currency})</label>
                  <input type="number" value={formData.fees?.applicationFee || 0}
                    onChange={(e) => setFee('applicationFee', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais de service ({formData.currency})</label>
                  <input type="number" value={formData.serviceFee || 0}
                    onChange={(e) => set({ serviceFee: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                </div>
              </div>
            </div>
          )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={formData.title} onChange={(e) => set({ title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Université *</label>
              <input type="text" value={formData.university} onChange={(e) => set({ university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-university" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input type="text" value={formData.city} onChange={(e) => set({ city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required
                data-testid="offer-form-city" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select value={formData.countryCode}
                onChange={(e) => set({ countryCode: e.target.value, country: e.target.value === 'CN' ? 'Chine' : 'France', currency: e.target.value === 'CN' ? 'CNY' : 'EUR' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                data-testid="offer-form-country">
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
              <select value={formData.degree} onChange={(e) => set({ degree: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Licence', 'Master', 'Doctorat', 'MBA', 'Certificat'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={formData.category}
                onChange={(e) => set({ category: e.target.value, categoryLabel: categoryMap[e.target.value] || e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {Object.entries(categoryMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <input type="text" value={formData.duration} onChange={(e) => set({ duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
                placeholder="Ex: 2 ans" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue d'enseignement</label>
              <select value={formData.teachingLanguage || 'Anglais'} onChange={(e) => set({ teachingLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Anglais', 'Français', 'Chinois', 'Bilingue (Anglais/Chinois)', 'Bilingue (Français/Anglais)'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentrée</label>
              <select value={formData.intake || 'Automne 2025'} onChange={(e) => set({ intake: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                {['Automne 2025','Printemps 2025','Automne 2026','Printemps 2026','Septembre 2025','Février 2025','Septembre 2026','Février 2026'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite de candidature</label>
              <input type="date" value={formData.deadline || ''} onChange={(e) => set({ deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais originaux ({formData.currency})</label>
              <input type="number" value={formData.originalTuition} onChange={(e) => set({ originalTuition: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais après bourse ({formData.currency})</label>
              <input type="number" value={formData.scholarshipTuition} onChange={(e) => set({ scholarshipTuition: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={formData.image || ''} onChange={(e) => set({ image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]"
              placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description || ''} onChange={(e) => set({ description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} />
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
                    onChange={(e) => setFee(key, Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" placeholder="0" />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Autres frais (optionnel)</label>
                <button type="button"
                  onClick={() => setFee('otherFees', [...(formData.fees?.otherFees || []), { name: '', amount: 0 }])}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">+ Ajouter</button>
              </div>
              {(formData.fees?.otherFees || []).map((fee, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={fee.name}
                    onChange={(e) => { const o = [...(formData.fees?.otherFees || [])]; o[index] = { ...o[index], name: e.target.value }; setFee('otherFees', o); }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du frais" />
                  <input type="number" value={fee.amount}
                    onChange={(e) => { const o = [...(formData.fees?.otherFees || [])]; o[index] = { ...o[index], amount: Number(e.target.value) }; setFee('otherFees', o); }}
                    className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Montant" />
                  <button type="button"
                    onClick={() => setFee('otherFees', (formData.fees?.otherFees || []).filter((_, i) => i !== index))}
                    className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded-lg">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Service Fees — hidden for partners */}
          {!isPartner && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h4 className="font-medium text-gray-900 mb-3">Frais de service AccessHub Global</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais de dossier ({formData.currency})</label>
                  <input type="number" value={formData.fees?.applicationFee || 0}
                    onChange={(e) => setFee('applicationFee', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frais de service ({formData.currency})</label>
                  <input type="number" value={formData.serviceFee || 0}
                    onChange={(e) => set({ serviceFee: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                </div>
              </div>
            </div>
          )}

          {/* Admission Conditions */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Conditions d'Admission</h4>
              <button type="button"
                onClick={() => set({ admissionConditions: [...(formData.admissionConditions || []), { condition: '', description: '' }] })}
                className="text-sm px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600">+ Ajouter</button>
            </div>
            {(formData.admissionConditions || []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucune condition d'admission ajoutée.</p>
            ) : (
              <div className="space-y-3">
                {(formData.admissionConditions || []).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={item.condition}
                          onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], condition: e.target.value }; set({ admissionConditions: ac }); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Ex: Diplôme de baccalauréat" />
                        <textarea value={item.description}
                          onChange={(e) => { const ac = [...(formData.admissionConditions || [])]; ac[index] = { ...ac[index], description: e.target.value }; set({ admissionConditions: ac }); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none" rows={2} placeholder="Description..." />
                      </div>
                      <button type="button"
                        onClick={() => set({ admissionConditions: (formData.admissionConditions || []).filter((_, i) => i !== index) })}
                        className="self-start p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-gray-500 mb-2">Suggestions courantes :</p>
              <div className="flex flex-wrap gap-2">
                {['Diplôme requis','Niveau de langue','Âge minimum/maximum','Expérience professionnelle','Tests standardisés (IELTS, TOEFL, HSK)','Lettre de motivation'].map((s, idx) => (
                  <button key={idx} type="button"
                    onClick={() => { const ac = formData.admissionConditions || []; if (!ac.some(c => c.condition === s)) set({ admissionConditions: [...ac, { condition: s, description: '' }] }); }}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+ {s}</button>
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
                        set({ requiredDocuments: e.target.checked ? [...docs, doc] : docs.filter(d => d !== doc) });
                      }} className="mt-0.5 rounded border-gray-300" />
                    <span className="text-gray-700">{doc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Documents personnalisés :</p>
                <button type="button"
                  onClick={() => { const customDoc = prompt('Nom du document personnalisé :'); if (customDoc?.trim()) { const docs = formData.requiredDocuments || []; if (!docs.includes(customDoc.trim())) set({ requiredDocuments: [...docs, customDoc.trim()] }); } }}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">+ Ajouter</button>
              </div>
              {(formData.requiredDocuments || []).filter(doc => !standardDocs.includes(doc)).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 bg-green-50 rounded mb-1">
                  <span className="text-sm text-gray-700">{doc}</span>
                  <button type="button"
                    onClick={() => set({ requiredDocuments: (formData.requiredDocuments || []).filter(d => d !== doc) })}
                    className="text-red-500 text-xs">×</button>
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
                      <input type="text" value={formData.documentTemplates?.[index]?.name || ''}
                        onChange={(e) => { const t = [...(formData.documentTemplates || [{}, {}, {}])]; t[index] = { ...t[index], name: e.target.value }; set({ documentTemplates: t }); }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="Nom du document" />
                      <input type="url" value={formData.documentTemplates?.[index]?.url || ''}
                        onChange={(e) => { const t = [...(formData.documentTemplates || [{}, {}, {}])]; t[index] = { ...t[index], url: e.target.value }; set({ documentTemplates: t }); }}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg" placeholder="URL du fichier" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.hasScholarship}
                onChange={(e) => set({ hasScholarship: e.target.checked, isSelfFinanced: !e.target.checked, scholarshipType: e.target.checked ? 'Bourse Complète' : '', badges: e.target.checked ? ['Bourse Complète'] : [] })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Bourse disponible</span>
            </label>
            {formData.hasScholarship && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isPartialScholarship}
                  onChange={(e) => set({ isPartialScholarship: e.target.checked, scholarshipType: e.target.checked ? 'Bourse Partielle' : 'Bourse Complète', badges: [e.target.checked ? 'Bourse Partielle' : 'Bourse Complète'] })}
                  className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Bourse Partielle</span>
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isOnline}
                onChange={(e) => set({ isOnline: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Cours en ligne</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isNew}
                onChange={(e) => set({ isNew: e.target.checked })}
                className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Nouveauté</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
              data-testid="offer-form-submit">
              {loading ? 'Enregistrement...' : (submitLabel || (isPartner ? 'Soumettre pour validation' : 'Enregistrer'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferFormModal;

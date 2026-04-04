import React, { useState, useEffect } from 'react';
import {
  Briefcase, CheckCircle, XCircle, Clock, Eye, Trash2, Building2,
  MapPin, Calendar, RefreshCw, Award, Users, Globe
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const JobOffersAdminSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/admin/job-offers`); setOffers(r.data); }
    catch {}
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/admin/job-offers/${id}/approve`);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, isApproved: true } : o));
      if (selectedOffer?.id === id) setSelectedOffer(o => ({ ...o, isApproved: true }));
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API}/admin/job-offers/${id}/reject`);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, isApproved: false } : o));
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await axios.delete(`${API}/admin/job-offers/${id}`);
      setOffers(prev => prev.filter(o => o.id !== id));
      if (selectedOffer?.id === id) setSelectedOffer(null);
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const pending = offers.filter(o => !o.isApproved);
  const approved = offers.filter(o => o.isApproved);
  const displayed = activeFilter === 'pending' ? pending : activeFilter === 'approved' ? approved : offers;

  return (
    <div className="space-y-6" data-testid="job-offers-admin-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offres d'emploi</h2>
          <p className="text-gray-500 text-sm mt-0.5">{offers.length} offre(s) · {pending.length} en attente de validation</p>
        </div>
        <button onClick={loadOffers} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl"><RefreshCw size={16} /></button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `Toutes (${offers.length})` },
          { id: 'pending', label: `En attente (${pending.length})` },
          { id: 'approved', label: `Approuvées (${approved.length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === f.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {f.label}
            {f.id === 'pending' && pending.length > 0 && activeFilter !== 'pending' && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px]">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center"><div className="animate-spin w-6 h-6 border-2 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div></div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune offre dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(offer => (
            <div key={offer.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {offer.companyName || offer.employerName} · {offer.contractType} · {offer.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold border flex-shrink-0 flex items-center gap-1.5 ${
                      offer.isApproved ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {offer.isApproved ? <><CheckCircle size={12} /> Active</> : <><Clock size={12} /> En validation</>}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={11} />{offer.country}</span>
                    <span className="flex items-center gap-1"><Award size={11} />{offer.educationLevel}</span>
                    {offer.deadline && <span className="flex items-center gap-1"><Calendar size={11} />{offer.deadline}</span>}
                    {offer.salary && <span>{offer.salary}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => setSelectedOffer(offer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  data-testid={`view-job-${offer.id}`}>
                  <Eye size={13} /> Voir détails
                </button>
                {!offer.isApproved && (
                  <button onClick={() => handleApprove(offer.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
                    data-testid={`approve-job-${offer.id}`}>
                    <CheckCircle size={13} /> Approuver
                  </button>
                )}
                {offer.isApproved && (
                  <button onClick={() => handleReject(offer.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg">
                    <XCircle size={13} /> Désactiver
                  </button>
                )}
                <button onClick={() => handleDelete(offer.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                  data-testid={`delete-job-admin-${offer.id}`}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col" style={{ maxHeight: '88vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">{selectedOffer.title}</h3>
                <p className="text-sm text-gray-500">{selectedOffer.companyName}</p>
              </div>
              <button onClick={() => setSelectedOffer(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Secteur', value: selectedOffer.sector },
                  { label: 'Contrat', value: selectedOffer.contractType },
                  { label: 'Localisation', value: `${selectedOffer.location}, ${selectedOffer.country}` },
                  { label: 'Expérience', value: selectedOffer.experienceRequired },
                  { label: 'Niveau études', value: selectedOffer.educationLevel },
                  { label: 'Postes', value: selectedOffer.numberOfPositions },
                  { label: 'Télétravail', value: selectedOffer.remote },
                  { label: 'Salaire', value: selectedOffer.salary || '—' },
                  { label: 'Date limite', value: selectedOffer.deadline || '—' },
                  { label: 'Démarrage', value: selectedOffer.startDate || '—' },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase">{f.label}</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Description</p>
                <p className="text-gray-600 leading-relaxed">{selectedOffer.description}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Profil requis</p>
                <p className="text-gray-600">{selectedOffer.requiredProfile}</p>
              </div>
              {(selectedOffer.requiredSkills || []).length > 0 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Compétences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOffer.requiredSkills.filter(Boolean).map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setSelectedOffer(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Fermer</button>
              {!selectedOffer.isApproved ? (
                <button onClick={() => handleApprove(selectedOffer.id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  data-testid={`approve-job-detail-${selectedOffer.id}`}>
                  <CheckCircle size={15} /> Approuver l'offre
                </button>
              ) : (
                <button onClick={() => handleDelete(selectedOffer.id)}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <Trash2 size={15} /> Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOffersAdminSection;

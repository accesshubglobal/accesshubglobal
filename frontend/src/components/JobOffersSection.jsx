import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, ChevronRight, TrendingUp, Award, Users,
  Search, Filter, X, Loader2, Building2, Globe, Calendar, Star,
  ArrowRight, Sparkles, Target, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import JobApplyModal from './JobApplyModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const contractColors = {
  CDI: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CDD: 'bg-blue-100 text-blue-700 border-blue-200',
  Stage: 'bg-violet-100 text-violet-700 border-violet-200',
  Alternance: 'bg-orange-100 text-orange-700 border-orange-200',
  Freelance: 'bg-pink-100 text-pink-700 border-pink-200',
  Intérim: 'bg-amber-100 text-amber-700 border-amber-200',
  default: 'bg-gray-100 text-gray-600 border-gray-200',
};

const JobOffersSection = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyOffer, setApplyOffer] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/job-offers`)
      .then(r => setOffers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const contractTypes = ['all', ...new Set(offers.map(o => o.contractType))];
  const filtered = activeFilter === 'all' ? offers : offers.filter(o => o.contractType === activeFilter);
  const displayed = filtered.slice(0, 6);

  if (!loading && offers.length === 0) return null;

  return (
    <section id="emploi" className="py-20 bg-gradient-to-b from-[#0a0f1e] to-[#0f1a30] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iIzFhNTZkYiIgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-4">
              <Sparkles size={14} />
              <span>Opportunités de carrière</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Offres d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">emploi</span>
            </h2>
            <p className="text-gray-400 mt-3 text-base max-w-lg">
              Des employeurs internationaux recrutent nos talents. Postulez directement depuis la plateforme.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">
              <TrendingUp size={14} className="text-blue-400" />
              <span><strong className="text-white">{offers.length}</strong> offre{offers.length > 1 ? 's' : ''} active{offers.length > 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => navigate('/emploi')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
              data-testid="see-all-jobs-btn">
              Toutes les offres <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {contractTypes.length > 2 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {contractTypes.map(ct => (
              <button key={ct} onClick={() => setActiveFilter(ct)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === ct
                    ? 'bg-[#1a56db] text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                }`}>
                {ct === 'all' ? 'Tous' : ct}
              </button>
            ))}
          </div>
        )}

        {/* Offers Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((offer, i) => (
                <JobOfferCard key={offer.id} offer={offer} index={i}
                  onView={() => setSelectedOffer(offer)}
                  onApply={() => { setApplyOffer(offer); setShowApplyModal(true); }} />
              ))}
            </div>

            {filtered.length > 6 && (
              <div className="text-center mt-10">
                <button onClick={() => navigate('/emploi')}
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:border-[#1a56db] hover:bg-[#1a56db]/10 transition-all font-medium">
                  Voir toutes les offres ({filtered.length}) <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <JobDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)}
          onApply={() => { setApplyOffer(selectedOffer); setShowApplyModal(true); setSelectedOffer(null); }} />
      )}

      {/* Apply Modal */}
      {showApplyModal && applyOffer && (
        <JobApplyModal offer={applyOffer} onClose={() => { setShowApplyModal(false); setApplyOffer(null); }} />
      )}
    </section>
  );
};

export const JobOfferCard = ({ offer, index, onView, onApply, light }) => {
  const cc = contractColors[offer.contractType] || contractColors.default;
  return (
    <div
      className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
        light
          ? 'bg-white border border-gray-100 hover:border-[#1a56db]/30 hover:shadow-lg'
          : 'bg-white/5 border border-white/8 hover:border-blue-500/40 hover:bg-white/8 backdrop-blur-sm'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
      data-testid={`job-card-${offer.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {offer.companyLogoUrl ? (
            <img src={offer.companyLogoUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 border border-white/10">
              <Building2 size={18} className={light ? 'text-[#1a56db]' : 'text-blue-400'} />
            </div>
          )}
          <div className="min-w-0">
            <p className={`text-xs truncate ${light ? 'text-gray-500' : 'text-gray-400'}`}>{offer.companyName}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ${cc}`}>
          {offer.contractType}
        </span>
      </div>

      <h3 className={`font-bold text-base mb-2 line-clamp-2 group-hover:text-[#1a56db] transition-colors ${light ? 'text-gray-900' : 'text-white'}`}>
        {offer.title}
      </h3>
      <p className={`text-sm line-clamp-2 mb-4 leading-relaxed ${light ? 'text-gray-500' : 'text-gray-400'}`}>
        {offer.sector} · {offer.educationLevel}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`flex items-center gap-1 text-xs ${light ? 'text-gray-500' : 'text-gray-400'}`}>
          <MapPin size={12} /> {offer.location}
        </span>
        {offer.remote && offer.remote !== 'Non' && (
          <span className="flex items-center gap-1 text-xs text-blue-400">
            <Globe size={12} /> {offer.remote}
          </span>
        )}
        {offer.salary && (
          <span className={`flex items-center gap-1 text-xs font-medium ${light ? 'text-emerald-600' : 'text-emerald-400'}`}>
            <Award size={12} /> {offer.salary}
          </span>
        )}
        {offer.deadline && (
          <span className={`flex items-center gap-1 text-xs ${light ? 'text-gray-400' : 'text-gray-500'}`}>
            <Calendar size={12} /> {offer.deadline}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-white/8">
        <button onClick={onView} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${light ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
          Détails
        </button>
        <button onClick={onApply}
          className="flex-1 py-2 bg-[#1a56db] text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
          data-testid={`apply-job-${offer.id}`}>
          Postuler <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export const JobDetailModal = ({ offer, onClose, onApply }) => {
  const cc = contractColors[offer.contractType] || contractColors.default;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start gap-4">
            {offer.companyLogoUrl ? (
              <img src={offer.companyLogoUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={26} className="text-[#1a56db]" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{offer.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{offer.companyName}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${cc}`}>{offer.contractType}</span>
                {offer.remote && offer.remote !== 'Non' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{offer.remote}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Quick info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: MapPin, label: 'Localisation', value: `${offer.location}, ${offer.country}` },
              { icon: Briefcase, label: 'Expérience', value: offer.experienceRequired },
              { icon: Award, label: 'Niveau d\'études', value: offer.educationLevel },
              { icon: Users, label: 'Postes', value: `${offer.numberOfPositions} poste(s)` },
              ...(offer.salary ? [{ icon: TrendingUp, label: 'Rémunération', value: offer.salary }] : []),
              ...(offer.deadline ? [{ icon: Calendar, label: 'Date limite', value: offer.deadline }] : []),
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <item.icon size={15} className="text-[#1a56db] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Target size={16} className="text-[#1a56db]" /> Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
          </div>

          {(offer.missions || []).filter(Boolean).length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Missions</h4>
              <ul className="space-y-1.5">
                {offer.missions.filter(Boolean).map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Profil recherché</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{offer.requiredProfile}</p>
          </div>

          {(offer.requiredSkills || []).filter(Boolean).length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Compétences requises</h4>
              <div className="flex flex-wrap gap-2">
                {offer.requiredSkills.filter(Boolean).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-[#1a56db]/8 text-[#1a56db] rounded-lg text-xs font-medium border border-[#1a56db]/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {(offer.benefits || []).filter(Boolean).length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Avantages</h4>
              <div className="flex flex-wrap gap-2">
                {offer.benefits.filter(Boolean).map((b, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
          <button onClick={onApply}
            className="flex-1 py-3 bg-gradient-to-r from-[#1a56db] to-[#2a5298] text-white rounded-xl font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2"
            data-testid={`apply-job-detail-${offer.id}`}>
            <Briefcase size={16} /> Postuler maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobOffersSection;

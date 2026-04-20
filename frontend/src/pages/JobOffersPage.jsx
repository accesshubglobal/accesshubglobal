import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase, Search, Filter, X, MapPin, Award, Calendar, TrendingUp,
  Building2, Globe, ChevronDown, Loader2, ArrowLeft, Sparkles, Users, Target
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { JobOfferCard, JobDetailModal } from '../components/JobOffersSection';
import JobApplyModal from '../components/JobApplyModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim'];
const SECTORS = ['Technologie', 'Finance', 'Santé', 'Éducation', 'Marketing', 'RH', 'Ingénierie', 'Commerce', 'Juridique', 'Logistique'];
const REMOTE_OPTIONS = ['Hybride', 'Télétravail total'];

const JobOffersPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [applyOffer, setApplyOffer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ contractType: '', sector: '', country: '', remote: '' });

  useEffect(() => {
    axios.get(`${API}/job-offers`)
      .then(r => setOffers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = offers.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !search || o.title?.toLowerCase().includes(q) || o.companyName?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q) || o.sector?.toLowerCase().includes(q) || o.id?.substring(0, 8).toLowerCase().includes(q);
    const matchContract = !filters.contractType || o.contractType === filters.contractType;
    const matchSector = !filters.sector || o.sector === filters.sector;
    const matchCountry = !filters.country || o.country?.toLowerCase().includes(filters.country.toLowerCase());
    const matchRemote = !filters.remote || o.remote === filters.remote;
    return matchSearch && matchContract && matchSector && matchCountry && matchRemote;
  });

  const hasFilters = Object.values(filters).some(Boolean) || search;
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060c1a] to-[#0d1a33]">
      <Header />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5357824/pexels-photo-5357824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060c1a]/80 to-[#060c1a]"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-16 left-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-8 right-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-5">
              <Sparkles size={14} /> Emplois internationaux
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight">
              Offres d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">emploi</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">Des employeurs internationaux recrutent nos talents. Trouvez votre prochain défi professionnel.</p>

            {/* Search bar */}
            <div className="flex gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Titre, entreprise, localisation..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm backdrop-blur-sm"
                  data-testid="job-search-input" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3.5 rounded-2xl border text-sm font-medium flex items-center gap-2 transition-all ${showFilters ? 'bg-[#1a56db] border-[#1a56db] text-white' : 'bg-white/8 border-white/15 text-gray-300 hover:border-white/30'}`}>
                <Filter size={15} /> Filtres
                {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-2xl mx-auto">
                {[
                  { k: 'contractType', label: 'Contrat', opts: CONTRACT_TYPES },
                  { k: 'sector', label: 'Secteur', opts: SECTORS },
                ].map(({ k, label, opts }) => (
                  <div key={k}>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">{label}</label>
                    <select value={filters[k]} onChange={e => setF(k, e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500">
                      <option value="">Tous</option>
                      {opts.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase">Pays</label>
                  <input value={filters.country} onChange={e => setF('country', e.target.value)} placeholder="Ex: France"
                    className="w-full bg-white/10 border border-white/15 rounded-xl text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase">Télétravail</label>
                  <select value={filters.remote} onChange={e => setF('remote', e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500">
                    <option value="" className="bg-gray-900">Tous</option>
                    {REMOTE_OPTIONS.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                  </select>
                </div>
                {hasFilters && (
                  <button onClick={() => { setFilters({ contractType: '', sector: '', country: '', remote: '' }); setSearch(''); }}
                    className="col-span-2 md:col-span-4 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 justify-center mt-1">
                    <X size={12} /> Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10 flex-wrap">
            {[
              { label: 'Offres actives', value: offers.length, icon: Briefcase },
              { label: 'Entreprises', value: new Set(offers.map(o => o.companyName).filter(Boolean)).size, icon: Building2 },
              { label: 'Pays', value: new Set(offers.map(o => o.country).filter(Boolean)).size, icon: Globe },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <s.icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">
            {filtered.length} offre{filtered.length > 1 ? 's' : ''}{search || hasFilters ? ' trouvée(s)' : ' disponible(s)'}
          </p>
          {hasFilters && (
            <button onClick={() => { setFilters({ contractType: '', sector: '', country: '', remote: '' }); setSearch(''); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <X size={12} /> Effacer filtres
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Aucune offre trouvée</p>
            <p className="text-gray-600 text-sm mt-1">Essayez d'élargir vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((offer, i) => (
              <JobOfferCard key={offer.id} offer={offer} index={i}
                onView={() => setSelectedOffer(offer)}
                onApply={() => setApplyOffer(offer)} />
            ))}
          </div>
        )}
      </div>

      {selectedOffer && (
        <JobDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)}
          onApply={() => { setApplyOffer(selectedOffer); setSelectedOffer(null); }} />
      )}
      {applyOffer && (
        <JobApplyModal offer={applyOffer} onClose={() => setApplyOffer(null)} />
      )}
      <Footer />
    </div>
  );
};

export default JobOffersPage;

import React, { useState, useEffect } from 'react';
import {
  MapPin, BedDouble, Maximize, DollarSign, Search, X, Home,
  Loader2, ArrowLeft, Send, Phone, Mail, User, CheckCircle,
  Wifi, Car, Shirt, UtensilsCrossed, Dumbbell, Package, Building2,
  SlidersHorizontal, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const AMENITY_ICONS = {
  WiFi: Wifi, Parking: Car, Laverie: Shirt,
  'Cuisine équipée': UtensilsCrossed, 'Salle de sport': Dumbbell,
  Meublé: Package, Gardien: Building2,
};

const PROPERTY_TYPES = ['Tous', 'Studio', 'Appartement', 'Colocation', 'Résidence étudiante', 'Chambre privée', 'Maison'];

// ── Inquiry Modal ────────────────────────────────────────────────────────────
const InquiryModal = ({ property, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    try {
      await axios.post(`${API}/housing-inquiry`, {
        propertyId: property.id,
        ...form,
      });
      setSent(true);
    } catch {
      alert('Erreur lors de l\'envoi. Réessayez.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1a56db, #1e3a8a)' }}>
          <div>
            <h3 className="font-bold text-white text-base">Contacter le propriétaire</h3>
            <p className="text-blue-200 text-xs mt-0.5 line-clamp-1">{property.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">Message envoyé !</h4>
            <p className="text-gray-500 text-sm mb-6">Le propriétaire vous contactera dans les plus brefs délais.</p>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Jean Dupont" data-testid="inquiry-name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    placeholder="+33 6 00 00 00 00" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="jean@email.com" data-testid="inquiry-email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Bonjour, je suis intéressé(e) par votre logement. Pourriez-vous me donner plus d'informations ?"
                data-testid="inquiry-message" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#1a56db] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              data-testid="inquiry-submit-btn">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ property, onContact }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    data-testid={`public-property-${property.id}`}>
    {/* Image */}
    {property.images?.[0] ? (
      <div className="relative h-52 overflow-hidden">
        <img src={property.images[0]} alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Disponible</span>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    ) : (
      <div className="relative h-52 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Home className="w-14 h-14 text-blue-200" />
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Disponible</span>
        </div>
      </div>
    )}
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{property.propertyType}</span>
        {property.rooms > 0 && (
          <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><BedDouble size={10} /> {property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
        )}
        {property.surface > 0 && (
          <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><Maximize size={10} /> {property.surface} m²</span>
        )}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 leading-tight">{property.title}</h3>
      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
        <MapPin size={13} className="flex-shrink-0" />
        <span className="line-clamp-1">{property.city}{property.country ? `, ${property.country}` : ''}</span>
      </div>

      {/* Description */}
      {property.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{property.description}</p>
      )}

      {/* Amenities */}
      {property.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.amenities.slice(0, 4).map(a => {
            const Icon = AMENITY_ICONS[a];
            return (
              <span key={a} className="flex items-center gap-1 text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                {Icon && <Icon size={9} />} {a}
              </span>
            );
          })}
          {property.amenities.length > 4 && (
            <span className="text-[11px] text-gray-400">+{property.amenities.length - 4}</span>
          )}
        </div>
      )}

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xl font-black text-[#1a56db]">{property.price} €</p>
          <p className="text-xs text-gray-400">/ {property.pricePeriod || 'mois'}</p>
        </div>
        <button
          onClick={() => onContact(property)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          data-testid={`contact-property-${property.id}`}>
          <Send size={13} /> Contacter
        </button>
      </div>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
const LogementsPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [inquiryModal, setInquiryModal] = useState(null);

  useEffect(() => {
    axios.get(`${API}/housing-partner`).then(r => {
      setProperties(r.data);
      setFiltered(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...properties];
    if (searchCity.trim()) {
      const q = searchCity.toLowerCase();
      result = result.filter(p =>
        p.city?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'Tous') {
      result = result.filter(p => p.propertyType === selectedType);
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= parseFloat(maxPrice));
    }
    setFiltered(result);
  }, [searchCity, selectedType, maxPrice, properties]);

  const clearFilters = () => { setSearchCity(''); setSelectedType('Tous'); setMaxPrice(''); };
  const hasFilters = searchCity || selectedType !== 'Tous' || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <button onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Logements Étudiants
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Des annonces vérifiées proposées par nos partenaires logement. Trouvez le logement idéal près de votre université.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  placeholder="Rechercher par ville, pays ou titre..."
                  className="flex-1 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                  data-testid="logements-search"
                />
                {searchCity && (
                  <button onClick={() => setSearchCity('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-[#1a56db] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                data-testid="toggle-filters-btn">
                <SlidersHorizontal size={14} /> Filtres {hasFilters && <span className="w-1.5 h-1.5 bg-current rounded-full" />}
              </button>
            </div>

            {/* Filters drawer */}
            {showFilters && (
              <div className="bg-white rounded-2xl mt-2 p-4 shadow-xl grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type de logement</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:border-blue-400 bg-white"
                      data-testid="filter-type">
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix max (€/mois)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Ex : 800"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    data-testid="filter-price"
                  />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="col-span-2 text-center text-xs text-red-500 hover:text-red-700 font-medium py-1">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-10">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Chargement...' : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
            </h2>
            {hasFilters && !loading && (
              <p className="text-xs text-gray-500 mt-0.5">Filtres actifs — <button onClick={clearFilters} className="text-blue-600 hover:underline">effacer</button></p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Chargement des annonces...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Home className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {hasFilters
                ? 'Essayez de modifier vos filtres ou d\'élargir votre recherche.'
                : 'Aucune annonce n\'est disponible pour le moment. Revenez bientôt !'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} onContact={setInquiryModal} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Inquiry modal */}
      {inquiryModal && (
        <InquiryModal
          property={inquiryModal}
          onClose={() => setInquiryModal(null)}
        />
      )}
    </div>
  );
};

export default LogementsPage;

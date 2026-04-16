import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, BedDouble, Maximize, Search, X, Home,
  Loader2, ArrowLeft, Send, Phone, Mail, User, CheckCircle,
  Wifi, Car, Shirt, UtensilsCrossed, Dumbbell, Package, Building2,
  SlidersHorizontal, ChevronDown, Map, LayoutGrid
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

/* ── Fix Leaflet default icon ──────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Custom map pin icon ───────────────────────────────────────────────── */
const makePin = (active = false) => L.divIcon({
  className: '',
  html: `<div style="
    position:relative;width:32px;height:32px;
    background:${active ? '#ef4444' : '#1a56db'};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 3px 10px rgba(0,0,0,0.35);
    transition:all 0.2s;
  "><div style="
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    transform:rotate(45deg);color:white;font-size:13px;font-weight:800;
  ">⌂</div></div>`,
  iconSize:    [32, 32],
  iconAnchor:  [16, 32],
  popupAnchor: [0, -38],
});

const AMENITY_ICONS = {
  WiFi: Wifi, Parking: Car, Laverie: Shirt,
  'Cuisine équipée': UtensilsCrossed, 'Salle de sport': Dumbbell,
  Meublé: Package, Gardien: Building2,
};

const PROPERTY_TYPES = ['Tous', 'Studio', 'Appartement', 'Colocation', 'Résidence étudiante', 'Chambre privée', 'Maison'];

/* ── Bounds fitter (react-leaflet hook component) ─────────────────────── */
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 11);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [60, 60], maxZoom: 13 });
    }
  }, [map, positions]);
  return null;
};

/* ── Inquiry Modal ────────────────────────────────────────────────────── */
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
      await axios.post(`${API}/housing-inquiry`, { propertyId: property.id, ...form });
      setSent(true);
    } catch { alert("Erreur lors de l'envoi. Réessayez."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1a56db] to-[#1e3a8a] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium mb-0.5">Demande de contact</p>
              <h3 className="text-white font-bold text-base line-clamp-1">{property.title}</h3>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Demande envoyée !</h4>
              <p className="text-gray-500 text-sm">Le partenaire logement vous contactera rapidement.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-[#1a56db] text-white rounded-xl text-sm font-semibold hover:opacity-90">Fermer</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.name} onChange={e => set('name', e.target.value)} required className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="Jean Dupont" data-testid="inquiry-name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                  <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="+33..." />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="jean@email.com" data-testid="inquiry-email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="Bonjour, je suis intéressé(e) par votre logement..." data-testid="inquiry-message" />
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
    </div>
  );
};

/* ── Property Card ─────────────────────────────────────────────────────── */
const PropertyCard = ({ property, onContact, highlighted }) => (
  <div
    id={`property-${property.id}`}
    className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all group ${highlighted ? 'border-[#1a56db] shadow-lg ring-2 ring-[#1a56db]/20' : 'border-gray-100 hover:shadow-lg hover:-translate-y-0.5'}`}
    data-testid={`public-property-${property.id}`}
  >
    {property.images?.[0] ? (
      <div className="relative h-48 overflow-hidden">
        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Disponible</span>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    ) : (
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Home className="w-12 h-12 text-blue-200" />
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Disponible</span>
        </div>
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{property.propertyType || property.title}</span>
        {property.rooms > 0 && <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><BedDouble size={10} /> {property.rooms}p</span>}
        {property.surface > 0 && <span className="text-[11px] text-gray-500 flex items-center gap-0.5"><Maximize size={10} /> {property.surface}m²</span>}
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">{property.title}</h3>
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
        <MapPin size={11} className="flex-shrink-0 text-[#1a56db]" />
        <span className="line-clamp-1">{property.city}{property.country ? `, ${property.country}` : ''}</span>
      </div>
      {property.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities.slice(0, 3).map(a => {
            const Icon = AMENITY_ICONS[a];
            return (
              <span key={a} className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                {Icon && <Icon size={8} />} {a}
              </span>
            );
          })}
          {property.amenities.length > 3 && <span className="text-[10px] text-gray-400">+{property.amenities.length - 3}</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          {property.price
            ? <><p className="text-lg font-black text-[#1a56db]">{property.price} €</p><p className="text-[10px] text-gray-400">/ {property.pricePeriod || 'mois'}</p></>
            : property.priceRange
            ? <p className="text-sm font-bold text-[#1a56db] leading-tight">{property.priceRange}</p>
            : <p className="text-xs font-medium text-gray-400">Prix sur demande</p>
          }
        </div>
        <button onClick={() => onContact(property)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1a56db] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
          data-testid={`contact-property-${property.id}`}>
          <Send size={11} /> Contacter
        </button>
      </div>
    </div>
  </div>
);

/* ── Map popup mini-card ───────────────────────────────────────────────── */
const MapPopupCard = ({ property, onContact }) => (
  <div style={{ width: 220, fontFamily: 'inherit' }}>
    {property.images?.[0] ? (
      <img src={property.images[0]} alt={property.title} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: '8px 8px 0 0', display: 'block' }} />
    ) : (
      <div style={{ width: '100%', height: 80, background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: 28, color: '#93c5fd' }}>⌂</span>
      </div>
    )}
    <div style={{ padding: '10px 12px 12px' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', borderRadius: 99, padding: '2px 8px', display: 'inline-block', marginBottom: 5 }}>
        {property.propertyType || 'Logement'}
      </span>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', margin: '0 0 4px', lineHeight: 1.35 }}>{property.title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b', marginBottom: 8 }}>
        <span>📍</span>
        <span>{property.city}{property.country ? `, ${property.country}` : ''}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {property.price
            ? <span style={{ fontWeight: 800, fontSize: 15, color: '#1a56db' }}>{property.price} €<span style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>/{property.pricePeriod || 'mois'}</span></span>
            : property.priceRange
            ? <span style={{ fontWeight: 700, fontSize: 12, color: '#1a56db' }}>{property.priceRange}</span>
            : <span style={{ fontSize: 11, color: '#94a3b8' }}>Sur demande</span>
          }
        </div>
        <button
          onClick={() => onContact(property)}
          style={{ padding: '5px 12px', background: '#1a56db', color: 'white', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Contacter
        </button>
      </div>
    </div>
  </div>
);

/* ── Map View Component ────────────────────────────────────────────────── */
const MapView = ({ properties, onContact, activeId, setActiveId }) => {
  const [geoCoords, setGeoCoords] = useState({});
  const [geocoding, setGeocoding] = useState(false);
  const coordsCache = useRef({});

  useEffect(() => {
    if (properties.length === 0) return;
    const toGeocode = properties.filter(p => p.city && !coordsCache.current[`${p.city},${p.country || ''}`]);
    if (toGeocode.length === 0) {
      // All cached – just build the map
      const result = {};
      properties.forEach(p => {
        const key = `${p.city},${p.country || ''}`;
        if (coordsCache.current[key]) result[p.id] = coordsCache.current[key];
      });
      setGeoCoords(result);
      return;
    }

    setGeocoding(true);
    const run = async () => {
      const result = { ...geoCoords };
      for (const p of properties) {
        if (!p.city) continue;
        const key = `${p.city},${p.country || ''}`.trim();
        if (coordsCache.current[key]) {
          result[p.id] = coordsCache.current[key];
          continue;
        }
        try {
          await new Promise(r => setTimeout(r, 180));
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await res.json();
          if (data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            coordsCache.current[key] = coords;
            result[p.id] = coords;
          }
        } catch {}
      }
      setGeoCoords(result);
      setGeocoding(false);
    };
    run();
  }, [properties]);

  const positions = Object.values(geoCoords);
  const defaultCenter = positions.length > 0 ? positions[0] : [30, 105];

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
      {geocoding && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'white', borderRadius: 99, padding: '8px 18px',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          fontSize: 12, fontWeight: 600, color: '#475569',
        }}>
          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          Géolocalisation en cours...
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={positions.length === 1 ? 11 : 3}
        style={{ height: 520, width: '100%' }}
        data-testid="housing-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {positions.length > 0 && <FitBounds positions={positions} />}

        {properties.map(p => {
          const coords = geoCoords[p.id];
          if (!coords) return null;
          return (
            <Marker
              key={p.id}
              position={coords}
              icon={makePin(activeId === p.id)}
              eventHandlers={{
                click: () => setActiveId(p.id === activeId ? null : p.id),
                mouseover: (e) => e.target.openPopup(),
              }}
            >
              <Popup>
                <MapPopupCard property={p} onContact={onContact} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        background: 'white', borderRadius: 12, padding: '8px 14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)', fontSize: 11,
        fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 10, height: 10, background: '#1a56db', borderRadius: '50%', display: 'inline-block' }} />
        {Object.keys(geoCoords).length} logement{Object.keys(geoCoords).length !== 1 ? 's' : ''} sur la carte
      </div>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────── */
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
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    axios.get(`${API}/housing-all`).then(r => {
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
      result = result.filter(p => !p.price || p.price <= parseFloat(maxPrice));
    }
    setFiltered(result);
  }, [searchCity, selectedType, maxPrice, properties]);

  // When clicking a map marker, scroll to the card in list view
  const handleActiveId = useCallback((id) => {
    setActiveId(id);
    if (id && viewMode === 'map') {
      const el = document.getElementById(`property-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [viewMode]);

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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Logements Étudiants</h1>
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
                  <button onClick={() => setSearchCity('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-[#1a56db] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                data-testid="toggle-filters-btn">
                <SlidersHorizontal size={14} /> Filtres {hasFilters && <span className="w-1.5 h-1.5 bg-current rounded-full" />}
              </button>
            </div>

            {showFilters && (
              <div className="bg-white rounded-2xl mt-2 p-4 shadow-xl grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type de logement</label>
                  <div className="relative">
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:border-blue-400 bg-white"
                      data-testid="filter-type">
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix max (€/mois)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Ex : 800"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    data-testid="filter-price" />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="col-span-2 text-center text-xs text-red-500 hover:text-red-700 font-medium py-1">
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

        {/* Results header with view toggle */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Chargement...' : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
            </h2>
            {hasFilters && !loading && (
              <p className="text-xs text-gray-500 mt-0.5">Filtres actifs — <button onClick={clearFilters} className="text-blue-600 hover:underline">effacer</button></p>
            )}
          </div>

          {/* View mode toggle */}
          {!loading && filtered.length > 0 && (
            <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-1 shadow-sm" data-testid="view-mode-toggle">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-[#1a56db] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="view-list-btn">
                <LayoutGrid size={15} /> Liste
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'map' ? 'bg-[#1a56db] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                data-testid="view-map-btn">
                <Map size={15} /> Carte
              </button>
            </div>
          )}
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
              {hasFilters ? "Essayez de modifier vos filtres ou d'élargir votre recherche." : "Aucune annonce n'est disponible pour le moment."}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-[#1a56db] text-white rounded-xl text-sm font-medium hover:opacity-90">Effacer les filtres</button>
            )}
          </div>
        ) : viewMode === 'map' ? (
          /* ── MAP VIEW ── */
          <div>
            {/* Map */}
            <MapView
              properties={filtered}
              onContact={setInquiryModal}
              activeId={activeId}
              setActiveId={handleActiveId}
            />

            {/* Mini-list below map */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Toutes les annonces</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => (
                  <PropertyCard key={p.id} property={p} onContact={setInquiryModal} highlighted={activeId === p.id} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} onContact={setInquiryModal} highlighted={activeId === p.id} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {inquiryModal && (
        <InquiryModal property={inquiryModal} onClose={() => setInquiryModal(null)} />
      )}
    </div>
  );
};

export default LogementsPage;

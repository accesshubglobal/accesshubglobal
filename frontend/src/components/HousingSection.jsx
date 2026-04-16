import React, { useState, useEffect } from 'react';
import { MapPin, BedDouble, DollarSign, ArrowRight, Loader2, Home, Wifi, Car, Shirt, UtensilsCrossed, Dumbbell, Package, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Laverie: Shirt, 'Cuisine équipée': UtensilsCrossed, 'Salle de sport': Dumbbell, Meublé: Package, Gardien: Building2 };

const HousingSection = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/housing-all`).then(r => {
      setProperties(r.data.slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section id="housing" className="py-20 bg-gradient-to-br from-[#1a56db] to-[#1e3a8a]">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-blue-200 font-semibold text-sm uppercase tracking-wider">Logement</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
            Trouvez Votre Logement Idéal
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Des logements vérifiés et abordables, proches de votre université, proposés par nos partenaires.
          </p>
        </div>

        {/* Properties grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 font-medium">Aucune annonce disponible pour le moment</p>
            <p className="text-blue-200/60 text-sm mt-1">Revenez bientôt — nos partenaires ajoutent de nouvelles annonces régulièrement.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map(p => (
              <div key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer hover:-translate-y-1"
                onClick={() => navigate('/logements')}
                data-testid={`housing-card-${p.id}`}>
                {/* Image */}
                {p.images?.[0] ? (
                  <div className="relative h-48 overflow-hidden">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {p.isAvailable && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Disponible</div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                    <Home className="w-12 h-12 text-blue-300" />
                    {p.isAvailable && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Disponible</div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{p.propertyType}</span>
                  <h3 className="font-semibold text-gray-900 text-base mt-2 mb-1 line-clamp-2">{p.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                    <MapPin size={13} />
                    <span>{p.city}{p.country ? `, ${p.country}` : ''}</span>
                  </div>
                  <div className="text-[#1a56db] font-bold text-lg mb-3">
                    {p.price ? `${p.price} € / ${p.pricePeriod || 'mois'}` : p.priceRange || 'Sur demande'}
                  </div>
                  {/* Amenities */}
                  {p.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {p.amenities.slice(0, 3).map(a => {
                        const Icon = AMENITY_ICONS[a];
                        return (
                          <span key={a} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
                            {Icon && <Icon size={10} />} {a}
                          </span>
                        );
                      })}
                      {p.amenities.length > 3 && <span className="text-xs text-gray-400">+{p.amenities.length - 3}</span>}
                    </div>
                  )}
                  <button className="w-full bg-gray-100 hover:bg-[#1a56db] text-gray-700 hover:text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                    Voir l'annonce <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-blue-100 mb-4">
            {properties.length > 0 ? `${properties.length} annonce${properties.length > 1 ? 's' : ''} affichée${properties.length > 1 ? 's' : ''} — voir toutes les offres` : 'Besoin d\'aide pour trouver un logement ?'}
          </p>
          <button
            onClick={() => navigate('/logements')}
            className="bg-white text-[#1a56db] px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Voir tous les logements <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HousingSection;

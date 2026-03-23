import React from 'react';
import { housingOptions } from '../data/siteContent';
import { MapPin, Check, ArrowRight } from 'lucide-react';

const HousingSection = () => {
  return (
    <section id="housing" className="py-20 bg-gradient-to-br from-[#1a56db] to-[#1e3a8a]">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-blue-200 font-semibold text-sm uppercase tracking-wider">Logement</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
            Trouvez Votre Logement Idéal
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Nous vous aidons à trouver un logement confortable et abordable près de votre université.
          </p>
        </div>

        {/* Housing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {housingOptions.map((housing) => (
            <div 
              key={housing.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={housing.image}
                  alt={housing.type}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {housing.available && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Disponible
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {housing.type}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin size={14} />
                  <span>{housing.location}</span>
                </div>
                <div className="text-[#1a56db] font-bold text-lg mb-4">
                  {housing.priceRange}
                </div>
                <div className="space-y-2 mb-4">
                  {housing.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-gray-100 hover:bg-[#1a56db] text-gray-700 hover:text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  Voir les offres
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-blue-100 mb-4">Besoin d'aide pour trouver un logement?</p>
          <button className="bg-white text-[#1a56db] px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
            Consultation Logement Gratuite
          </button>
        </div>
      </div>
    </section>
  );
};

export default HousingSection;

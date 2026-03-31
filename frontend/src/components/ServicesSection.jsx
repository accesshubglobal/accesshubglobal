import React, { useState, useEffect } from 'react';
import { services } from '../data/siteContent';
import { GraduationCap, FileText, Home, Stamp, Users, Globe, CheckCircle, ChevronRight, X, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const iconMap = {
  GraduationCap,
  FileText,
  Home,
  Stamp,
  Users,
  Globe,
  FaCheckCircle: ShieldCheck,
  ShoppingBag,
};

const ServiceDetailModal = ({ service, isOpen, onClose }) => {
  if (!isOpen || !service) return null;
  const details = service.details || {};
  const IconComp = iconMap[service.icon] || GraduationCap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className={`${service.color} p-6 text-white flex-shrink-0`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <IconComp size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{service.title}</h2>
              <p className="text-white/80 mt-1">{service.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Intro */}
          {details.intro && (
            <p className="text-gray-700 mb-6 leading-relaxed">{details.intro}</p>
          )}

          {/* Countries (Études) */}
          {details.countries && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pays disponibles</h3>
              <div className="grid gap-3">
                {details.countries.map((country, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="text-2xl flex-shrink-0">{country.flag}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{country.name}</h4>
                      <p className="text-sm text-gray-600">{country.programs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visa Types */}
          {details.visaTypes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Types de visa</h3>
              <div className="space-y-3">
                {details.visaTypes.map((visa, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900">{visa.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{visa.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Types (Traduction) */}
          {details.documentTypes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents traduits</h3>
              <div className="grid grid-cols-2 gap-2">
                {details.documentTypes.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
              {details.languages && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.languages.map((lang, i) => (
                    <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium">{lang}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Housing Options */}
          {details.options && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Types de logement</h3>
              <div className="grid grid-cols-2 gap-3">
                {details.options.map((opt, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 text-sm">{opt.type}</h4>
                    <p className="text-xs text-gray-600 mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services List (Guide Achat) */}
          {details.servicesList && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nos prestations</h3>
              <div className="space-y-3">
                {details.servicesList.map((svc, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900">{svc.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language Courses */}
          {details.languages && !details.documentTypes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Langues proposées</h3>
              <div className="space-y-3">
                {details.languages.map((lang, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900">{lang.lang}</h4>
                    <p className="text-sm text-gray-600 mt-1">{lang.levels}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {details.features && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ce que nous offrons</h3>
              <div className="space-y-2">
                {details.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#1a56db] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); onClose(); setTimeout(() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 300); }}
              className={`w-full inline-flex items-center justify-center gap-2 ${service.color} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity`}
              data-testid="service-detail-contact-btn"
            >
              Nous contacter pour ce service
              <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const handleOpenServiceModal = (e) => {
      const { serviceId } = e.detail;
      const svc = services.find(s => s.id === serviceId);
      if (svc) setSelectedService(svc);
    };
    window.addEventListener('openServiceModal', handleOpenServiceModal);
    return () => window.removeEventListener('openServiceModal', handleOpenServiceModal);
  }, []);

  return (
    <section className="py-20 bg-white" id="services">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">
            Nos Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Nos Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Un accompagnement complet pour votre projet d'études, vos démarches administratives et vos achats en Chine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const IconComp = iconMap[service.icon] || GraduationCap;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setSelectedService(service)}
                data-testid={`service-card-${service.id}`}
              >
                <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComp size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <span className="text-[#1a56db] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  En savoir plus <ChevronRight size={16} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ServiceDetailModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
};

export default ServicesSection;

import React from 'react';
import { services } from '../data/mockData';
import { GraduationCap, Flag, Stamp, Home, FileText, Users, Globe, ArrowRight } from 'lucide-react';
import { FaCheckCircle } from "react-icons/fa";

const iconMap = {
  GraduationCap,
  Flag,
  Stamp,
  FaCheckCircle,
  Home,
  FileText,
  Users,
  Globe
};

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Nos Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Un Accompagnement Complet
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            De la candidature jusqu'à votre installation, nous sommes à vos côtés pour garantir votre réussite académique à l'international.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div 
                key={service.id}
                className="group bg-gray-50 hover:bg-[#1a56db] rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#1a56db] hover:shadow-xl"
              >
                <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors`}>
                  <IconComponent size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-3 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 group-hover:text-blue-100 mb-4 transition-colors">
                  {service.description}
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#1a56db] group-hover:text-white font-medium transition-colors">
                  En savoir plus
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

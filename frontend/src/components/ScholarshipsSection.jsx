import React, { useState } from 'react';
import { scholarshipPrograms } from '../data/mockData';
import { Calendar, MapPin, Award, CheckCircle, ArrowRight } from 'lucide-react';

const ScholarshipsSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredPrograms = activeFilter === 'all' 
    ? scholarshipPrograms 
    : scholarshipPrograms.filter(p => p.country.toLowerCase() === activeFilter);

  return (
    <section id="scholarships" className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Bourses d'Études</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Opportunités de Financement
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les bourses disponibles pour financer vos études en Chine et en France.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-3 mb-10">
          {['all', 'chine', 'france'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[#1a56db] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'Toutes' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Scholarships Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPrograms.map((scholarship) => (
            <div 
              key={scholarship.id}
              className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all group border border-gray-100"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                  <img
                    src={scholarship.image}
                    alt={scholarship.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-white text-xs px-3 py-1 rounded-full font-medium ${
                      scholarship.country === 'Chine' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {scholarship.country}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-[#1a56db]" />
                    <span className="text-[#1a56db] font-semibold text-sm">{scholarship.coverage}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {scholarship.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{scholarship.university}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Date limite: {scholarship.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{scholarship.level}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {scholarship.benefits.slice(0, 3).map((benefit, index) => (
                      <span key={index} className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                        <CheckCircle size={12} className="text-green-500" />
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <button className="text-[#1a56db] font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    Postuler maintenant
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScholarshipsSection;

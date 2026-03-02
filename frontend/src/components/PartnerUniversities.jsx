import React from 'react';
import { partnerUniversities } from '../data/mockData';
import { Eye } from 'lucide-react';

const PartnerUniversities = () => {
  return (
    <section className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Partner Universities</h2>
        <button className="px-4 py-1.5 border border-gray-300 rounded-full text-sm text-gray-600 hover:border-[#7b5acd] hover:text-[#7b5acd] transition-colors">
          All &gt;
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {partnerUniversities.map((university) => (
          <div
            key={university.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group cursor-pointer"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={university.image}
                alt={university.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {university.badges.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {university.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="bg-[#7b5acd] text-white text-[10px] px-2 py-0.5 rounded"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#7b5acd] transition-colors">
                {university.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>City: {university.city}</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {university.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnerUniversities;

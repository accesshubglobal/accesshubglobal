import React from 'react';
import { quickFilters } from '../data/siteContent';

const QuickFilters = () => {
  return (
    <div className="flex items-center gap-6 py-2 px-4 max-w-[1400px] mx-auto text-sm">
      {quickFilters.map((filter, index) => (
        <a
          key={index}
          href="#"
          className={`hover:text-[#7b5acd] transition-colors whitespace-nowrap ${
            filter.isNew ? 'text-[#f7941d] font-medium flex items-center gap-1' : 'text-gray-600'
          }`}
        >
          {filter.label}
          {filter.isNew && <span className="text-[#f7941d]">🔥</span>}
        </a>
      ))}
    </div>
  );
};

export default QuickFilters;

import React, { useState, useRef } from 'react';
import { scholarshipPrograms, programFilters } from '../data/mockData';
import { ChevronLeft, ChevronRight, MapPin, GraduationCap, Globe } from 'lucide-react';

const ProgramCard = ({ program }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer min-w-[280px] flex-shrink-0">
    <div className="relative h-40 overflow-hidden">
      <img
        src={program.image}
        alt={program.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {program.badges && program.badges.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
          {program.badges.slice(0, 3).map((badge, index) => (
            <span
              key={index}
              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                badge === 'New' ? 'bg-red-500 text-white' :
                badge === 'Full Scholarship' ? 'bg-green-500 text-white' :
                badge === "EDUPRCHINA's Choice" ? 'bg-[#f7941d] text-white' :
                badge === 'Hot City' ? 'bg-pink-500 text-white' :
                'bg-[#7b5acd] text-white'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
      {program.isIssp && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-medium">
          ISSP
        </div>
      )}
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#7b5acd] transition-colors">
        {program.title}
      </h3>
      <p className="text-xs text-gray-500 mb-2">Program ID: {program.programId}{program.expired && ' (EXPIRED)'}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xs text-gray-500">Tuition: RMB/year</span>
      </div>
      <div className="flex items-baseline gap-2">
        {program.originalTuition && (
          <span className="text-gray-400 line-through text-sm">{program.originalTuition}</span>
        )}
        <span className="text-red-500 font-bold text-lg">{'0'}<span className="text-sm">{program.tuition}</span></span>
      </div>
      <div className="mt-3 space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-gray-400" />
          City: {program.city}
        </div>
        <div className="flex items-center gap-1">
          <GraduationCap size={12} className="text-gray-400" />
          Degree: {program.degree}
        </div>
        <div className="flex items-center gap-1">
          <Globe size={12} className="text-gray-400" />
          Teaching language: {program.teachingLanguage}
        </div>
      </div>
    </div>
  </div>
);

const ScholarshipPrograms = () => {
  const [activeFilter, setActiveFilter] = useState('Best Seller');
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <img 
          src="https://center.istudyedu.com/uploads/images/9f641000231deaac9f150f53df84d5b8.jpg" 
          alt="Recommended" 
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recommended by EDUPRCHINA</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-100 pb-2">
        {programFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              activeFilter === filter
                ? 'text-[#7b5acd] border-[#7b5acd] font-medium'
                : 'text-gray-600 border-transparent hover:text-[#7b5acd]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Programs Carousel */}
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {scholarshipPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    </section>
  );
};

export default ScholarshipPrograms;

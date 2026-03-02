import React from 'react';
import { onlineExhibitions } from '../data/mockData';
import { Play } from 'lucide-react';

const OnlineExhibition = () => {
  return (
    <section className="max-w-[1400px] mx-auto px-4 py-8 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Online Exhibition</h2>
        <button className="text-[#7b5acd] text-sm hover:underline flex items-center gap-1">
          More &gt;&gt;
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {onlineExhibitions.map((exhibition, index) => (
          <div
            key={exhibition.id}
            className={`relative rounded-lg overflow-hidden group cursor-pointer ${
              index === 0 ? 'col-span-2 row-span-2 h-[320px]' : 'h-[150px]'
            }`}
          >
            <img
              src={exhibition.image}
              alt={exhibition.university}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className={`text-white font-semibold mb-1 ${index === 0 ? 'text-lg' : 'text-xs'}`}>
                  {exhibition.university}
                </h3>
                <p className={`text-white/80 ${index === 0 ? 'text-sm' : 'text-[10px]'}`}>
                  {exhibition.title}
                </p>
                {index === 0 && (
                  <button className="mt-3 bg-[#7b5acd] hover:bg-[#6a4bbb] text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                    <Play size={14} fill="white" />
                    Enter
                  </button>
                )}
              </div>
            </div>
            {index !== 0 && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-[#7b5acd] hover:bg-[#6a4bbb] text-white px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 transition-colors">
                  Enter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default OnlineExhibition;

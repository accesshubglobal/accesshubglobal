import React, { useState } from 'react';
import { Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const DestinationsSection = () => {
  const [activeTab, setActiveTab] = useState('china');
  
  // Universities data with view counts stored in state
  const [universitiesChina, setUniversitiesChina] = useState([
    {
      id: 1,
      name: 'Université de Pékin',
      city: 'Beijing',
      image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400',
      views: 15580,
      rating: 4.9,
      badges: ['Projet 985', 'Double First Class']
    },
    {
      id: 2,
      name: 'Université Tsinghua',
      city: 'Beijing',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
      views: 14786,
      rating: 4.9,
      badges: ['Projet 985', 'Projet 211']
    },
    {
      id: 3,
      name: 'Université Fudan',
      city: 'Shanghai',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
      views: 12450,
      rating: 4.8,
      badges: ['Projet 985']
    },
    {
      id: 4,
      name: 'Université Zhejiang',
      city: 'Hangzhou',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
      views: 11230,
      rating: 4.7,
      badges: ['Double First Class']
    },
    {
      id: 5,
      name: 'Université Jiaotong de Shanghai',
      city: 'Shanghai',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400',
      views: 43868,
      rating: 4.8,
      badges: ['Projet 985', 'Projet 211']
    },
    {
      id: 6,
      name: 'Université de Nanjing',
      city: 'Nanjing',
      image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400',
      views: 9750,
      rating: 4.6,
      badges: []
    },
    {
      id: 7,
      name: 'Université de Wuhan',
      city: 'Wuhan',
      image: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400',
      views: 38742,
      rating: 4.7,
      badges: ['Projet 985']
    },
    {
      id: 8,
      name: 'Université Sun Yat-sen',
      city: 'Guangzhou',
      image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400',
      views: 16406,
      rating: 4.6,
      badges: []
    }
  ]);

  const [universitiesFrance, setUniversitiesFrance] = useState([
    {
      id: 1,
      name: 'Sorbonne Université',
      city: 'Paris',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
      views: 12340,
      rating: 4.8,
      badges: ['Excellence']
    },
    {
      id: 2,
      name: 'École Polytechnique',
      city: 'Palaiseau',
      image: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400',
      views: 9870,
      rating: 4.9,
      badges: ['Grande École']
    },
    {
      id: 3,
      name: 'Université PSL',
      city: 'Paris',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
      views: 8540,
      rating: 4.8,
      badges: ['Top 30 Mondial']
    },
    {
      id: 4,
      name: 'Sciences Po Paris',
      city: 'Paris',
      image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400',
      views: 7650,
      rating: 4.7,
      badges: ['Sciences Politiques']
    },
    {
      id: 5,
      name: 'HEC Paris',
      city: 'Jouy-en-Josas',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400',
      views: 11200,
      rating: 4.9,
      badges: ['Grande École', 'Business']
    },
    {
      id: 6,
      name: 'Université de Lyon',
      city: 'Lyon',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      views: 6890,
      rating: 4.5,
      badges: []
    },
    {
      id: 7,
      name: 'Université de Bordeaux',
      city: 'Bordeaux',
      image: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400',
      views: 5430,
      rating: 4.4,
      badges: []
    },
    {
      id: 8,
      name: 'Université de Strasbourg',
      city: 'Strasbourg',
      image: 'https://images.unsplash.com/photo-1555990538-1e6c0c631c1f?w=400',
      views: 4980,
      rating: 4.5,
      badges: ['Prix Nobel']
    }
  ]);

  const universities = activeTab === 'china' ? universitiesChina : universitiesFrance;
  const setUniversities = activeTab === 'china' ? setUniversitiesChina : setUniversitiesFrance;

  // Handle view increment
  const handleView = (id) => {
    setUniversities(prev => 
      prev.map(uni => 
        uni.id === id ? { ...uni, views: uni.views + 1 } : uni
      )
    );
  };

  return (
    <section id="destinations" className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Universités Partenaires</h2>
          <button className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors flex items-center gap-1">
            Tout voir
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Country Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('china')}
            className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'china'
                ? 'bg-[#1a56db] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">🇨🇳</span>
            Chine
          </button>
          <button
            onClick={() => setActiveTab('france')}
            className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'france'
                ? 'bg-[#1a56db] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">🇫🇷</span>
            France
          </button>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {universities.map((uni) => (
            <div 
              key={uni.id}
              onClick={() => handleView(uni.id)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={uni.image}
                  alt={uni.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                {uni.badges.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {uni.badges.map((badge, index) => (
                      <span 
                        key={index} 
                        className="bg-[#8b5cf6] text-white text-[10px] px-2 py-1 rounded font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* University Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8b5cf6]/90 to-transparent p-3">
                  <span className="text-white text-xs font-semibold uppercase tracking-wide">
                    {uni.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#1a56db] transition-colors line-clamp-2">
                  {uni.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">City: {uni.city}</p>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={14} className="text-gray-400" />
                    <span>{uni.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-yellow-600 font-medium">{uni.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#1a56db] hover:text-[#1a56db] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#1a56db] hover:text-[#1a56db] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;

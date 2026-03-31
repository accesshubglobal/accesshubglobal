import React, { useState, useEffect, useRef } from 'react';
import { Eye, Star, ChevronLeft, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const DestinationsSection = () => {
  const [activeTab, setActiveTab] = useState('CN');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    loadUniversities();
  }, [activeTab]);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/universities?country=${activeTab}`);
      setUniversities(res.data);
      setPage(0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const totalPages = Math.ceil(universities.length / ITEMS_PER_PAGE);
  const visible = universities.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const goNext = () => { if (page < totalPages - 1) setPage(page + 1); };
  const goPrev = () => { if (page > 0) setPage(page - 1); };

  const handleClick = (uni) => {
    navigate(`/universities/${uni.id}`);
  };

  return (
    <section id="destinations" className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Universites Partenaires</h2>
          <button onClick={() => navigate('/universities')}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors flex items-center gap-1"
            data-testid="universities-see-all">
            Tout voir
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Country Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          {[
            { code: 'CN', label: 'Chine', flag: '\u{1F1E8}\u{1F1F3}' },
            { code: 'FR', label: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
          ].map(tab => (
            <button key={tab.code}
              onClick={() => setActiveTab(tab.code)}
              data-testid={`tab-${tab.code}`}
              className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.code
                  ? 'bg-[#1a56db] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              <span className="text-xl">{tab.flag}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Universities Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : universities.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Aucune universite pour ce pays</div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map((uni) => (
              <div
                key={uni.id}
                onClick={() => handleClick(uni)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer border border-gray-100"
                data-testid={`uni-card-${uni.id}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={uni.image || uni.coverImage || 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'}
                    alt={uni.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {uni.badges?.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {uni.badges.slice(0, 2).map((badge, index) => (
                        <span key={index} className="bg-[#1e3a5f]/90 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  {uni.logo && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-white shadow-sm overflow-hidden">
                      <img src={uni.logo} alt="" className="w-full h-full object-contain p-0.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#1a56db] transition-colors line-clamp-2">
                    {uni.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{uni.city}, {uni.country}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-gray-400" />
                      <span>{(uni.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-gray-400" />
                        <span>{(uni.likes || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-600 font-medium">{uni.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={goPrev} disabled={page === 0} data-testid="uni-prev"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#1a56db] hover:text-[#1a56db] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <button onClick={goNext} disabled={page >= totalPages - 1} data-testid="uni-next"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#1a56db] hover:text-[#1a56db] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationsSection;

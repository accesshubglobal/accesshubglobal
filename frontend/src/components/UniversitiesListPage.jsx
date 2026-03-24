import React, { useState, useEffect } from 'react';
import { Eye, Star, Heart, ChevronRight, Search, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const UniversitiesListPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/universities`);
      setUniversities(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = universities.filter(u => {
    const matchFilter = filter === 'all' || u.countryCode === filter;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.city?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50" data-testid="universities-list-page">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-gray-900">Toutes les Universites</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1e3a5f]" data-testid="uni-search" />
          </div>
          {['all', 'CN', 'FR'].map(f => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {f === 'all' ? 'Toutes' : f === 'CN' ? 'Chine' : 'France'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(uni => (
              <div key={uni.id} onClick={() => navigate(`/universities/${uni.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer border border-gray-100" data-testid={`uni-item-${uni.id}`}>
                <div className="relative h-44 overflow-hidden">
                  <img src={uni.image || uni.coverImage || 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'}
                    alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {uni.badges?.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {uni.badges.slice(0, 2).map((b, i) => (
                        <span key={i} className="bg-[#1e3a5f]/90 text-white text-[10px] px-2 py-0.5 rounded font-medium">{b}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#1a56db] transition-colors line-clamp-2">{uni.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{uni.city}, {uni.country}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Eye size={14} className="text-gray-400" /><span>{(uni.views || 0).toLocaleString()}</span></div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><Heart size={14} className="text-gray-400" /><span>{(uni.likes || 0).toLocaleString()}</span></div>
                      <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-yellow-600 font-medium">{uni.rating || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">Aucune universite trouvee</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UniversitiesListPage;

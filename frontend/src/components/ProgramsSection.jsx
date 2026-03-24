import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft, Award, Wifi, BookOpen, Users, MessageCircle, Eye, Star, Sparkles, Percent, CreditCard, Loader2, Heart, Send, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OfferDetailModal from './OfferDetailModal';
import ContactModal from './ContactModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const categories = [
  { id: 'chinese', name: 'Langue Chinoise', icon: '\u{1F1E8}\u{1F1F3}' },
  { id: 'french', name: 'Langue Fran\u00E7aise', icon: '\u{1F1EB}\u{1F1F7}' },
  { id: 'economics', name: '\u00C9conomie', icon: '\u{1F4CA}' },
  { id: 'business', name: 'Gestion', icon: '\u{1F4BC}' },
  { id: 'engineering', name: 'Ing\u00E9nierie', icon: '\u2699\uFE0F' },
  { id: 'science', name: 'Sciences', icon: '\u{1F52C}' },
  { id: 'medicine', name: 'M\u00E9decine', icon: '\u{1F3E5}' },
  { id: 'literature', name: 'Litt\u00E9rature', icon: '\u{1F4DA}' },
  { id: 'law', name: 'Droit', icon: '\u2696\uFE0F' },
  { id: 'arts', name: 'Arts & Design', icon: '\u{1F3A8}' },
  { id: 'preparatory', name: 'Cours Pr\u00E9paratoires', icon: '\u270F\uFE0F' }
];

const quickFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'new', label: 'Nouveaut\u00E9' },
  { id: 'fullScholarship', label: 'Bourse Compl\u00E8te' },
  { id: 'partialScholarship', label: 'Bourse Partielle' },
  { id: 'selfFinanced', label: 'Auto-financement' },
  { id: 'online', label: 'Cours en Ligne' }
];

const defaultBannerSlides = [
  { id: '1', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', title: 'Bourses CSC 2025', subtitle: 'Postulez maintenant pour les bourses du gouvernement chinois' },
  { id: '2', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', title: '\u00C9tudes en France', subtitle: 'D\u00E9couvrez les programmes Campus France et Bourse Eiffel' },
  { id: '3', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800', title: 'MBBS en Chine', subtitle: 'Programmes de m\u00E9decine enseign\u00E9s en anglais' },
  { id: '4', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800', title: 'Rentr\u00E9e 2025', subtitle: 'Inscriptions ouvertes - Places limit\u00E9es' }
];

// Publish Needs Modal
const PublishNeedsModal = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studyField: '',
    level: '',
    country: '',
    budget: '',
    description: ''
  });

  if (!isOpen || !isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const content = [
        `Domaine d'\u00E9tudes: ${formData.studyField}`,
        `Niveau: ${formData.level}`,
        `Pays souhait\u00E9: ${formData.country}`,
        `Budget: ${formData.budget}`,
        `Description: ${formData.description}`
      ].join('\n');
      await axios.post(`${API}/messages`, {
        subject: 'Publication de besoins - Recherche de programme',
        content
      });
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setFormData({ studyField: '', level: '', country: '', budget: '', description: '' }); }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#1a56db] to-[#3b82f6] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24} /></button>
          <h2 className="text-2xl font-bold">Publiez vos besoins</h2>
          <p className="text-blue-100 mt-1">D\u00E9crivez votre projet et recevez des propositions personnalis\u00E9es.</p>
        </div>
        {success ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Send className="text-green-600" size={28} /></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Besoins publi\u00E9s !</h3>
            <p className="text-gray-600">Notre \u00E9quipe vous contactera avec des propositions adapt\u00E9es.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domaine d'\u00E9tudes souhait\u00E9</label>
              <input type="text" value={formData.studyField} onChange={(e) => setFormData({...formData, studyField: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20" placeholder="Ex: Informatique, M\u00E9decine, Gestion..." required data-testid="publish-needs-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required data-testid="publish-needs-level">
                  <option value="">S\u00E9lectionner</option>
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                  <option value="Formation courte">Formation courte</option>
                  <option value="Langue">Cours de langue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays souhait\u00E9</label>
                <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required data-testid="publish-needs-country">
                  <option value="">S\u00E9lectionner</option>
                  <option value="Chine">Chine</option>
                  <option value="France">France</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget approximatif</label>
              <input type="text" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20" placeholder="Ex: 5000 EUR / an" data-testid="publish-needs-budget" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description de votre projet</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 resize-none" rows={4} placeholder="D\u00E9crivez votre projet d'\u00E9tudes, vos pr\u00E9f\u00E9rences..." required data-testid="publish-needs-description" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a56db] hover:bg-[#1648b8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50" data-testid="publish-needs-submit">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} />Publier mes besoins</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ProgramsSection = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allOffers, setAllOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerSlides, setBannerSlides] = useState(defaultBannerSlides);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const filterIcons = {
    all: null,
    new: <Sparkles size={14} className="text-orange-500" />,
    fullScholarship: <Award size={14} className="text-green-500" />,
    partialScholarship: <Percent size={14} className="text-blue-500" />,
    selfFinanced: <CreditCard size={14} className="text-purple-500" />,
    online: <Wifi size={14} className="text-teal-500" />
  };

  useEffect(() => {
    loadOffers();
    loadBanners();
  }, []);

  useEffect(() => {
    const handleFilterProgram = (e) => {
      const { filter } = e.detail;
      setActiveFilter(filter);
      setShowAllResults(true);
    };
    window.addEventListener('filterProgram', handleFilterProgram);
    return () => window.removeEventListener('filterProgram', handleFilterProgram);
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/offers`);
      setAllOffers(response.data);
      setFilteredOffers(response.data);
    } catch (err) {
      console.error('Error loading offers:', err);
      setAllOffers([]);
      setFilteredOffers([]);
    }
    setLoading(false);
  };

  const loadBanners = async () => {
    try {
      const response = await axios.get(`${API}/site-settings/banners`);
      if (response.data.slides && response.data.slides.length > 0) {
        setBannerSlides(response.data.slides);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    }
  };

  const filterOffers = (offers, query, category, filter) => {
    let results = [...offers];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(o =>
        o.title?.toLowerCase().includes(q) ||
        o.university?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q)
      );
    }
    if (category) results = results.filter(o => o.category === category);
    if (filter !== 'all') {
      switch (filter) {
        case 'new': results = results.filter(o => o.isNew); break;
        case 'fullScholarship': results = results.filter(o => o.hasScholarship && !o.isPartialScholarship); break;
        case 'partialScholarship': results = results.filter(o => o.isPartialScholarship); break;
        case 'selfFinanced': results = results.filter(o => o.isSelfFinanced); break;
        case 'online': results = results.filter(o => o.isOnline); break;
        default: break;
      }
    }
    return results;
  };

  useEffect(() => {
    const results = filterOffers(allOffers, searchQuery, activeCategory, activeFilter);
    setFilteredOffers(results);
    if (activeFilter !== 'all') setShowAllResults(true);
  }, [searchQuery, activeCategory, activeFilter, allOffers]);

  useEffect(() => {
    if (showAllResults) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerSlides.length, showAllResults]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

  const handleSearch = (e) => {
    e.preventDefault();
    filterOffers(allOffers, searchQuery, activeCategory, activeFilter);
    if (searchQuery.trim()) setShowAllResults(true);
  };

  const handleCategoryClick = (categoryId) => {
    const newCategory = categoryId === activeCategory ? null : categoryId;
    setActiveCategory(newCategory);
    if (newCategory) setShowAllResults(true);
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (filterId === 'all') setShowAllResults(false);
    else setShowAllResults(true);
  };

  const handleOfferClick = (offer) => { setSelectedOffer(offer); setIsModalOpen(true); };
  const handleViewAll = () => setShowAllResults(true);
  const handleBackToHome = () => { setShowAllResults(false); setActiveFilter('all'); setActiveCategory(null); setSearchQuery(''); setFilteredOffers(allOffers); };

  const handleBannerLearnMore = () => setShowAllResults(true);

  const handleContactClick = () => {
    if (!isAuthenticated) { onOpenAuth('login'); return; }
    setShowContactModal(true);
  };

  const handlePublishClick = () => {
    if (!isAuthenticated) { onOpenAuth('login'); return; }
    setShowPublishModal(true);
  };

  const formatPrice = (offer) => {
    const currency = offer.currency === 'CNY' ? 'CNY' : '\u20AC';
    const price = offer.scholarshipTuition ?? offer.originalTuition ?? 0;
    if (price === 0) return <span className="text-green-600 font-bold">Gratuit</span>;
    return <span className="font-bold">{price.toLocaleString()} {currency}</span>;
  };

  const getFilterTitle = () => {
    if (activeCategory) return categories.find(c => c.id === activeCategory)?.name || 'Programmes';
    const filter = quickFilters.find(f => f.id === activeFilter);
    if (filter && activeFilter !== 'all') return filter.label;
    return 'Tous les Programmes';
  };

  const displayOffers = showAllResults ? filteredOffers : filteredOffers.slice(0, 6);
  const suggestedPrograms = allOffers.slice(0, 4).map(offer => ({ id: offer.id, title: offer.title, category: offer.categoryLabel || offer.category }));

  return (
    <section className="py-8 bg-gray-50" id="programs">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher un programme, une universit\u00E9, une sp\u00E9cialit\u00E9..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 text-sm" data-testid="programs-search-input" />
            </div>
            <button type="submit" className="bg-[#1a56db] hover:bg-[#1648b8] text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" data-testid="programs-search-button">
              <Search size={18} />Rechercher
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            {quickFilters.map((filter) => (
              <button key={filter.id} type="button" onClick={() => handleFilterClick(filter.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter.id ? 'bg-[#1a56db] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} data-testid={`filter-${filter.id}`}>
                {filterIcons[filter.id]}{filter.label}
              </button>
            ))}
          </div>
        </form>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#1a56db] text-white px-4 py-3 font-semibold flex items-center gap-2"><BookOpen size={18} />Programmes</div>
              <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <button key={category.id} onClick={() => handleCategoryClick(category.id)} className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${activeCategory === category.id ? 'bg-blue-50 text-[#1a56db] font-medium' : 'text-gray-700 hover:bg-gray-50'}`} data-testid={`category-${category.id}`}>
                    <span className="flex items-center gap-2"><span>{category.icon}</span>{category.name}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Card - Nous contacter */}
            <div className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] rounded-xl p-5 mt-4 text-white">
              <h4 className="font-semibold mb-2">Besoin d'aide?</h4>
              <p className="text-sm text-blue-100 mb-4">Nos conseillers sont disponibles pour vous guider</p>
              <button onClick={handleContactClick} className="w-full bg-white text-[#1a56db] py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2" data-testid="contact-sidebar-button">
                <MessageCircle size={16} />Nous contacter
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Image Carousel Banner */}
            {!showAllResults && bannerSlides.length > 0 && (
              <div className="relative rounded-xl overflow-hidden mb-6 h-[280px] group">
                {bannerSlides.map((slide, index) => (
                  <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent">
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{slide.title}</h3>
                        <p className="text-white/80">{slide.subtitle}</p>
                        <button onClick={handleBannerLearnMore} className="mt-4 bg-[#1a56db] hover:bg-[#1648b8] text-white px-6 py-2 rounded-lg font-medium transition-colors" data-testid="banner-learn-more">
                          En savoir plus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {bannerSlides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {showAllResults && (
                  <button onClick={handleBackToHome} className="text-[#1a56db] hover:text-[#1648b8] flex items-center gap-1 text-sm" data-testid="back-to-home"><ChevronLeft size={16} />Retour</button>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{getFilterTitle()}<span className="text-sm font-normal text-gray-500 ml-2">({filteredOffers.length} r\u00E9sultats)</span></h3>
              </div>
              {!showAllResults && filteredOffers.length > 6 && (
                <button onClick={handleViewAll} className="text-[#1a56db] hover:text-[#1648b8] font-medium text-sm flex items-center gap-1" data-testid="view-all-button">Voir tout<ChevronRight size={16} /></button>
              )}
            </div>

            {/* Offers Grid */}
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center"><Loader2 size={40} className="animate-spin text-[#1a56db] mx-auto mb-4" /><p className="text-gray-500">Chargement des programmes...</p></div>
            ) : displayOffers.length > 0 ? (
              <div className={`grid gap-4 ${showAllResults ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
                {displayOffers.map((offer) => (
                  <div key={offer.id} onClick={() => handleOfferClick(offer)} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer border border-gray-100" data-testid={`offer-card-${offer.id}`}>
                    <div className="relative h-36 overflow-hidden">
                      <img src={offer.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600'} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {(offer.badges || []).slice(0, 2).map((badge, index) => (
                          <span key={index} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.includes('Compl\u00E8te') ? 'bg-green-500 text-white' : badge.includes('Partielle') ? 'bg-blue-500 text-white' : badge.includes('Auto') ? 'bg-purple-500 text-white' : badge.includes('Ligne') ? 'bg-teal-500 text-white' : badge.includes('Populaire') || badge.includes('Top') || badge.includes('CSC') ? 'bg-orange-500 text-white' : 'bg-[#8b5cf6] text-white'}`}>{badge}</span>
                        ))}
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                        {offer.isOnline ? '\u{1F4BB} En ligne' : `${offer.country === 'Chine' ? '\u{1F1E8}\u{1F1F3}' : '\u{1F1EB}\u{1F1F7}'} ${offer.country || ''}`}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-[#1a56db] transition-colors line-clamp-2">{offer.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{offer.university}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><span>{offer.degree}</span><span>•</span><span>{offer.duration}</span></div>
                      <div className="flex items-center justify-between">
                        <div className="text-[#1a56db]">{formatPrice(offer)}<span className="text-gray-400 text-xs">/an</span></div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye size={12} />{(offer.views || 0).toLocaleString()}</span>
                          {offer.favoritesCount > 0 && <span className="flex items-center gap-1"><Heart size={12} className="text-red-400 fill-red-400" />{offer.favoritesCount}</span>}
                          <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{offer.rating || 4.0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">{'\u{1F50D}'}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun r\u00E9sultat trouv\u00E9</h3>
                <p className="text-gray-500">Essayez avec d'autres mots-cl\u00E9s ou filtres</p>
              </div>
            )}

            {/* View More Button */}
            {!showAllResults && filteredOffers.length > 6 && (
              <div className="text-center mt-6">
                <button onClick={handleViewAll} className="bg-[#1a56db] hover:bg-[#1648b8] text-white px-8 py-3 rounded-lg font-medium transition-colors" data-testid="view-more-button">Voir tout ({filteredOffers.length} programmes)</button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          {!showAllResults && (
            <div className="hidden xl:block w-[220px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users size={16} className="text-[#1a56db]" />Vous aimerez aussi</h4>
                <div className="space-y-3">
                  {suggestedPrograms.map((program) => (
                    <a key={program.id} href="#" onClick={(e) => { e.preventDefault(); const offer = allOffers.find(o => o.id === program.id); if (offer) handleOfferClick(offer); }} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="w-12 h-12 bg-[#1a56db] rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">WC</span></div>
                      <div><h5 className="text-sm font-medium text-gray-900 group-hover:text-[#1a56db] transition-colors">{program.title}</h5><p className="text-xs text-gray-500">{program.category}</p></div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Publish Requirements CTA */}
              <div className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] rounded-xl p-4 mt-4 text-white text-center">
                <div className="text-3xl mb-2">{'\u{1F4CB}'}</div>
                <h4 className="font-bold mb-1">Publiez vos besoins</h4>
                <p className="text-xs text-blue-200 mb-3">Recevez des propositions personnalis\u00E9es</p>
                <button onClick={handlePublishClick} className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors" data-testid="publish-needs-button">
                  Commencer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OfferDetailModal offer={selectedOffer} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedOffer(null); }} onOpenAuth={onOpenAuth} />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      <PublishNeedsModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} />
    </section>
  );
};

export default ProgramsSection;

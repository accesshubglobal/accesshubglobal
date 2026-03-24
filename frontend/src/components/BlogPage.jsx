import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, ArrowRight, Search, Tag, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'etudes', label: 'Études' },
  { id: 'visa', label: 'Visa' },
  { id: 'bourses', label: 'Bourses' },
  { id: 'vie-etudiante', label: 'Vie étudiante' },
  { id: 'conseils', label: 'Conseils' },
  { id: 'actualites', label: 'Actualités' },
];

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadPosts(); }, [category]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/blog`, { params: { category: category !== 'all' ? category : undefined } });
      setPosts(res.data.posts);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = posts.filter(p =>
    searchQuery === '' ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenAuth={() => setShowAuth(true)} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#2a5298] pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Notre Blog</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Découvrez nos articles sur les études à l'étranger, les bourses, et la vie étudiante
          </p>
          <div className="mt-8 max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              data-testid="blog-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              data-testid={`blog-cat-${cat.id}`}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-[#1e3a5f] text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">Aucun article trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                data-testid={`blog-card-${post.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] overflow-hidden">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-white/10">{post.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium">
                      {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{post.authorName}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </div>
  );
};

export default BlogPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Eye, Search, Plus, Pin, User, Clock, X, Send, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CATEGORIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'etudes', label: 'Études' },
  { id: 'visa', label: 'Visa & Démarches' },
  { id: 'vie-etudiante', label: 'Vie étudiante' },
  { id: 'bourses', label: 'Bourses' },
  { id: 'conseils', label: 'Conseils' },
  { id: 'experiences', label: 'Expériences' },
];

const CommunityPage = () => {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('etudes');
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { loadPosts(); }, [category]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/community`, { params: { category: category !== 'all' ? category : undefined } });
      setPosts(res.data.posts);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/community`, { title: newTitle, content: newContent, category: newCategory });
      setShowNewPost(false);
      setNewTitle('');
      setNewContent('');
      loadPosts();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    if (!isAuthenticated) { setShowAuth(true); return; }
    try {
      const res = await axios.post(`${API}/community/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: res.data.likeCount, likes: res.data.liked ? [...(p.likes || []), user?.id] : (p.likes || []).filter(l => l !== user?.id) } : p));
    } catch (err) { console.error(err); }
  };

  const filtered = posts.filter(p =>
    searchQuery === '' ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Header onOpenAuth={() => setShowAuth(true)} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#2a5298] pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Communauté</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Partagez vos expériences, posez vos questions et entraidez-vous entre étudiants
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                data-testid="community-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              data-testid="new-discussion-btn"
              onClick={() => isAuthenticated ? setShowNewPost(true) : setShowAuth(true)}
              className="px-6 py-3.5 bg-white text-[#1e3a5f] rounded-2xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} /> Nouvelle discussion
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              data-testid={`community-cat-${cat.id}`}
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

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" data-testid="new-post-modal">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">Nouvelle discussion</h3>
              <button onClick={() => setShowNewPost(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input
                data-testid="new-post-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de votre discussion"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                data-testid="new-post-category"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <textarea
                data-testid="new-post-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Partagez votre expérience, posez une question..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none"
              />
              <button
                data-testid="submit-post-btn"
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newContent.trim() || submitting}
                className="w-full py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2a5298] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> : <Send size={16} />}
                Publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <MessageCircle size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">Aucune discussion trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Soyez le premier à lancer une discussion !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => {
              const isLiked = post.likes?.includes(user?.id);
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/community/${post.id}`)}
                  data-testid={`community-post-${post.id}`}
                  className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-transparent transition-all cursor-pointer overflow-hidden"
                >
                  <div className="p-5 flex gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {post.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {post.pinned && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-medium flex items-center gap-1">
                            <Pin size={10} /> Épinglé
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                          {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User size={12} /> {post.userName}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        <button
                          onClick={(e) => handleLike(e, post.id)}
                          className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
                        >
                          <ThumbsUp size={12} /> {post.likeCount || 0}
                        </button>
                        <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.replyCount || 0}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 self-center flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </div>
  );
};

export default CommunityPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Eye, ArrowLeft, Tag, User } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await axios.get(`${API}/blog/${id}`);
        setPost(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    loadPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full"></div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-white">
      <Header onOpenAuth={() => setShowAuth(true)} />
      <div className="pt-28 text-center py-20">
        <p className="text-gray-500 text-lg">Article non trouvé</p>
        <button onClick={() => navigate('/blog')} className="mt-4 text-[#1e3a5f] hover:underline">Retour au blog</button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenAuth={() => setShowAuth(true)} />

      {/* Cover */}
      <div className="bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#2a5298] pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft size={16} /> Retour au blog
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/10 text-blue-200 rounded-full text-xs font-medium">
              {post.category}
            </span>
            <span className="text-blue-300/60 text-xs flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-blue-300/60 text-xs flex items-center gap-1">
              <Eye size={12} /> {post.views || 0} vues
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 mt-6">
            <div className="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-white text-sm font-bold">
              {post.authorName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{post.authorName}</p>
              <p className="text-blue-300/60 text-xs">Auteur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 -mt-4">
          <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl shadow-xl max-h-[400px] object-cover" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
        >
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                <Tag size={12} /> {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <Footer />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </div>
  );
};

export default BlogDetailPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle, Clock, User, Eye, Send, Pin, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CommunityPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { loadPost(); }, [id]);

  const loadPost = async () => {
    try {
      const res = await axios.get(`${API}/community/${id}`);
      setPost(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) { setShowAuth(true); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/community/${id}/reply`, { content: replyContent });
      setReplyContent('');
      loadPost();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleLikePost = async () => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    try {
      const res = await axios.post(`${API}/community/${id}/like`);
      setPost(prev => ({ ...prev, likeCount: res.data.likeCount, likes: res.data.liked ? [...(prev.likes || []), user?.id] : (prev.likes || []).filter(l => l !== user?.id) }));
    } catch (err) { console.error(err); }
  };

  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    try {
      const res = await axios.post(`${API}/community/replies/${replyId}/like`);
      setPost(prev => ({
        ...prev,
        replies: prev.replies.map(r => r.id === replyId ? { ...r, likeCount: res.data.likeCount, likes: res.data.liked ? [...(r.likes || []), user?.id] : (r.likes || []).filter(l => l !== user?.id) } : r)
      }));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full"></div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Header onOpenAuth={() => setShowAuth(true)} />
      <div className="pt-28 text-center py-20">
        <p className="text-gray-500">Discussion non trouvée</p>
        <button onClick={() => navigate('/community')} className="mt-4 text-[#1e3a5f] hover:underline">Retour à la communauté</button>
      </div>
      <Footer />
    </div>
  );

  const isPostLiked = post.likes?.includes(user?.id);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Header onOpenAuth={() => setShowAuth(true)} />

      <div className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back */}
          <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] mb-6 transition-colors text-sm">
            <ArrowLeft size={16} /> Retour à la communauté
          </button>

          {/* Post */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white font-bold text-sm">
                  {post.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{post.userName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {post.pinned && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-medium flex items-center gap-1"><Pin size={10} /> Épinglé</span>}
                  </p>
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleLikePost}
                  data-testid="like-post-btn"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                    isPostLiked ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp size={16} /> {post.likeCount || 0} J'aime
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-400"><MessageCircle size={16} /> {post.replies?.length || 0} réponses</span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400"><Eye size={16} /> {post.views || 0} vues</span>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">{post.replies?.length || 0} Réponses</h3>
            {post.replies?.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <MessageCircle size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Aucune réponse pour l'instant. Soyez le premier !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {post.replies?.map(reply => {
                  const isReplyLiked = reply.likes?.includes(user?.id);
                  return (
                    <div key={reply.id} className="bg-white rounded-2xl p-5" data-testid={`reply-${reply.id}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                          {reply.userName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{reply.userName}</p>
                          <p className="text-[11px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{reply.content}</p>
                      <button
                        onClick={() => handleLikeReply(reply.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          isReplyLiked ? 'text-blue-600 font-medium' : 'text-gray-400 hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp size={13} /> {reply.likeCount || 0}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3">Votre réponse</h4>
            <textarea
              data-testid="reply-input"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={isAuthenticated ? "Partagez votre avis ou répondez à cette discussion..." : "Connectez-vous pour répondre"}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none"
              disabled={!isAuthenticated}
            />
            <div className="flex justify-end mt-3">
              <button
                data-testid="submit-reply-btn"
                onClick={handleReply}
                disabled={!replyContent.trim() || submitting || !isAuthenticated}
                className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#2a5298] transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {submitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> : <Send size={14} />}
                Répondre
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </div>
  );
};

export default CommunityPostPage;

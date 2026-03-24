import React, { useState, useEffect } from 'react';
import { MessageSquare, MessageCircle, Eye, ThumbsUp, Pin, Trash2 } from 'lucide-react';
import axios, { API } from './adminApi';

const CommunitySection = ({ onBadgeUpdate }) => {
  const [communityPosts, setCommunityPosts] = useState([]);

  useEffect(() => { loadCommunityPosts(); }, []);

  const loadCommunityPosts = async () => {
    try {
      const res = await axios.get(`${API}/admin/community`);
      setCommunityPosts(res.data);
      onBadgeUpdate?.('community', res.data.filter(p => !p.deleted).length);
    } catch (err) { console.error(err); }
  };

  const togglePinCommunityPost = async (id) => {
    try {
      await axios.put(`${API}/admin/community/${id}/pin`);
      loadCommunityPosts();
    } catch (err) { console.error(err); }
  };

  const deleteCommunityPost = async (id) => {
    if (!window.confirm('Supprimer cette discussion ?')) return;
    try {
      await axios.delete(`${API}/admin/community/${id}`);
      loadCommunityPosts();
    } catch (err) { console.error(err); }
  };

  const activePosts = communityPosts.filter(p => !p.deleted);

  return (
    <div className="space-y-6" data-testid="community-admin-section">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Discussions Communauté ({activePosts.length})</h3>
      </div>

      {activePosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">Aucune discussion dans la communauté</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activePosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm p-5" data-testid={`admin-community-${post.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {post.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-sm">{post.title}</h4>
                    {post.pinned && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-medium flex items-center gap-1"><Pin size={10} /> Épinglé</span>}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">{post.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span>{post.userName}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {post.likeCount || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.replyCount || 0}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {post.views || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePinCommunityPost(post.id)}
                    data-testid={`pin-community-${post.id}`}
                    className={`p-2 rounded-lg transition-colors ${post.pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                    title={post.pinned ? 'Désépingler' : 'Épingler'}
                  ><Pin size={16} /></button>
                  <button
                    onClick={() => deleteCommunityPost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  ><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunitySection;

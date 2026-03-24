import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, BookOpen, X } from 'lucide-react';
import axios, { API } from './adminApi';

const BlogSection = ({ onBadgeUpdate }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', coverImage: '', category: 'etudes', tags: [], published: false });

  useEffect(() => { loadBlogPosts(); }, []);

  const loadBlogPosts = async () => {
    try {
      const res = await axios.get(`${API}/admin/blog`);
      setBlogPosts(res.data);
      onBadgeUpdate?.('blog', res.data.length);
    } catch (err) { console.error(err); }
  };

  const saveBlogPost = async () => {
    try {
      if (editingBlog) {
        await axios.put(`${API}/admin/blog/${editingBlog.id}`, blogForm);
      } else {
        await axios.post(`${API}/admin/blog`, blogForm);
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      setBlogForm({ title: '', content: '', excerpt: '', coverImage: '', category: 'etudes', tags: [], published: false });
      loadBlogPosts();
    } catch (err) { console.error(err); }
  };

  const deleteBlogPost = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await axios.delete(`${API}/admin/blog/${id}`);
      loadBlogPosts();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6" data-testid="blog-admin-section">
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-white font-semibold">{editingBlog ? 'Modifier l\'article' : 'Nouvel article'}</h3>
              <button onClick={() => { setShowBlogModal(false); setEditingBlog(null); }} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Titre</label>
                <input data-testid="blog-form-title" value={blogForm.title} onChange={(e) => setBlogForm(f => ({ ...f, title: e.target.value }))} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" placeholder="Titre de l'article" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Résumé</label>
                <input data-testid="blog-form-excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" placeholder="Court résumé de l'article" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Catégorie</label>
                  <select value={blogForm.category} onChange={(e) => setBlogForm(f => ({ ...f, category: e.target.value }))} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20">
                    <option value="etudes">Études</option>
                    <option value="visa">Visa</option>
                    <option value="bourses">Bourses</option>
                    <option value="vie-etudiante">Vie étudiante</option>
                    <option value="conseils">Conseils</option>
                    <option value="actualites">Actualités</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Image de couverture (URL)</label>
                  <input value={blogForm.coverImage} onChange={(e) => setBlogForm(f => ({ ...f, coverImage: e.target.value }))} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contenu</label>
                <textarea data-testid="blog-form-content" value={blogForm.content} onChange={(e) => setBlogForm(f => ({ ...f, content: e.target.value }))} rows={10} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none" placeholder="Contenu de l'article..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tags (séparés par des virgules)</label>
                <input value={(blogForm.tags || []).join(', ')} onChange={(e) => setBlogForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" placeholder="chine, bourse, études" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={blogForm.published} onChange={(e) => setBlogForm(f => ({ ...f, published: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]" />
                  <span className="text-sm text-gray-700 font-medium">Publier immédiatement</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowBlogModal(false); setEditingBlog(null); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button data-testid="blog-form-save" onClick={saveBlogPost} disabled={!blogForm.title.trim() || !blogForm.content.trim()} className="flex-1 py-3 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#2a5298] disabled:opacity-40">
                  {editingBlog ? 'Mettre à jour' : 'Créer l\'article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">Articles de Blog ({blogPosts.length})</h3>
        <button data-testid="new-blog-btn" onClick={() => { setBlogForm({ title: '', content: '', excerpt: '', coverImage: '', category: 'etudes', tags: [], published: false }); setEditingBlog(null); setShowBlogModal(true); }} className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2a5298] flex items-center gap-2">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {blogPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">Aucun article pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4" data-testid={`admin-blog-${post.id}`}>
              {post.coverImage ? (
                <img src={post.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{post.title[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{post.excerpt || post.content?.substring(0, 100)}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  <span>{post.category}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span><Eye size={11} className="inline" /> {post.views || 0}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setEditingBlog(post); setBlogForm({ title: post.title, content: post.content, excerpt: post.excerpt || '', coverImage: post.coverImage || '', category: post.category, tags: post.tags || [], published: post.published }); setShowBlogModal(true); }} className="p-2 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                <button onClick={() => deleteBlogPost(post.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSection;

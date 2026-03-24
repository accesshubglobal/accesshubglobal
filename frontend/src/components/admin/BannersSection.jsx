import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image, X, Check } from 'lucide-react';
import axios from './adminApi';
import { useAuth } from '../../context/AuthContext';

const BannersSection = () => {
  const { token } = useAuth();
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [localSlides, setLocalSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSlide, setNewSlide] = useState({ image: '', title: '', subtitle: '' });

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/site-settings/banners`); setLocalSlides(res.data.slides || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const saveBanners = async (slides) => {
    try { await axios.post(`${API}/admin/site-settings/banners`, { slides }); setLocalSlides(slides); }
    catch (err) { console.error(err); }
  };

  const handleUploadImage = async (file) => {
    setUploading(true);
    try {
      const sigRes = await fetch(`${API}/upload/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!sigRes.ok) throw new Error('Signature failed');
      const sigData = await sigRes.json();
      const formData = new FormData();
      formData.append('file', file); formData.append('api_key', sigData.api_key); formData.append('timestamp', sigData.timestamp); formData.append('signature', sigData.signature); formData.append('folder', sigData.folder);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.secure_url) return uploadData.secure_url;
      throw new Error('Upload failed');
    } catch (err) { console.error(err); alert('Erreur lors du téléversement'); return null; }
    finally { setUploading(false); }
  };

  const handleAddSlide = async () => {
    if (!newSlide.image) return;
    const slide = { id: Date.now().toString(), ...newSlide };
    const updated = [...localSlides, slide];
    setLocalSlides(updated); await saveBanners(updated);
    setNewSlide({ image: '', title: '', subtitle: '' }); setShowAddForm(false);
  };

  const handleUpdateSlide = async () => {
    if (!editingSlide) return;
    const updated = localSlides.map(s => s.id === editingSlide.id ? editingSlide : s);
    setLocalSlides(updated); await saveBanners(updated); setEditingSlide(null);
  };

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Supprimer cette bannière ?')) return;
    const updated = localSlides.filter(s => s.id !== slideId);
    setLocalSlides(updated); await saveBanners(updated);
  };

  const handleFileInput = async (e, target) => {
    const file = e.target.files[0]; if (!file) return;
    const url = await handleUploadImage(file);
    if (url) {
      if (target === 'new') setNewSlide({ ...newSlide, image: url });
      else if (editingSlide) setEditingSlide({ ...editingSlide, image: url });
    }
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="banners-section">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold text-gray-900">Bannières défilantes</h3><p className="text-sm text-gray-500 mt-1">Gérez les images du carrousel dans la section des offres</p></div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors text-sm" data-testid="add-banner-btn"><Plus size={18} />Ajouter</button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-[#1a56db]/20">
          <h4 className="font-medium text-gray-900 mb-4">Nouvelle bannière</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="flex gap-3">
                <input type="text" placeholder="URL de l'image ou téléverser ci-dessous" value={newSlide.image} onChange={(e) => setNewSlide({...newSlide, image: e.target.value})} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" data-testid="banner-image-url" />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Image size={16} />{uploading ? 'Envoi...' : 'Téléverser'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, 'new')} disabled={uploading} />
                </label>
              </div>
              {newSlide.image && <img src={newSlide.image} alt="Aperçu" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Titre</label><input type="text" value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Titre de la bannière" data-testid="banner-title-input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label><input type="text" value={newSlide.subtitle} onChange={(e) => setNewSlide({...newSlide, subtitle: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Description courte" data-testid="banner-subtitle-input" /></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAddForm(false); setNewSlide({ image: '', title: '', subtitle: '' }); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
              <button onClick={handleAddSlide} disabled={!newSlide.image} className="bg-[#1a56db] text-white px-6 py-2 rounded-lg hover:bg-[#1648b8] transition-colors disabled:opacity-50" data-testid="save-banner-btn">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {editingSlide && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Modifier la bannière</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div className="flex gap-3">
                <input type="text" value={editingSlide.image} onChange={(e) => setEditingSlide({...editingSlide, image: e.target.value})} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" />
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${uploading ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  <Image size={16} />{uploading ? 'Envoi...' : 'Changer'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, 'edit')} disabled={uploading} />
                </label>
              </div>
              {editingSlide.image && <img src={editingSlide.image} alt="Aperçu" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Titre</label><input type="text" value={editingSlide.title} onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label><input type="text" value={editingSlide.subtitle} onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" /></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingSlide(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
              <button onClick={handleUpdateSlide} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">Mettre à jour</button>
            </div>
          </div>
        </div>
      )}

      {localSlides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center"><Image size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune bannière configurée</p><p className="text-sm text-gray-400 mt-2">Les images par défaut seront utilisées</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {localSlides.map((slide, idx) => (
            <div key={slide.id} className="bg-white rounded-xl shadow-sm overflow-hidden group" data-testid={`banner-item-${idx}`}>
              <div className="relative h-40">
                <img src={slide.image} alt={slide.title || `Bannière ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-3 left-3"><p className="text-white font-semibold text-sm">{slide.title || 'Sans titre'}</p><p className="text-white/70 text-xs">{slide.subtitle || ''}</p></div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingSlide({...slide})} className="bg-white/90 p-1.5 rounded-lg hover:bg-white transition-colors" data-testid={`edit-banner-${idx}`}><Edit size={14} className="text-gray-700" /></button>
                  <button onClick={() => handleDeleteSlide(slide.id)} className="bg-white/90 p-1.5 rounded-lg hover:bg-white transition-colors" data-testid={`delete-banner-${idx}`}><Trash2 size={14} className="text-red-500" /></button>
                </div>
                <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">#{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersSection;

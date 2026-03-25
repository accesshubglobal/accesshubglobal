import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import axios, { API } from './adminApi';
import { useAuth } from '../../context/AuthContext';

const UniversityFormModal = ({ university, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(university || {
    name: '', city: '', province: '', country: 'Chine', countryCode: 'CN', status: 'public',
    image: '', coverImage: '', logo: '', ranking: '', badges: [],
    youtubeUrl: '', description: '', foundedYear: '', president: '',
    totalStudents: '', internationalStudents: '', website: '',
    faculties: [], conditions: [], photos: []
  });
  const [newBadge, setNewBadge] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      // Try client-side Cloudinary upload first
      const authToken = token || localStorage.getItem('token');
      const sigRes = await fetch(`${API}/upload/signature`, { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (!sigRes.ok) throw new Error('Signature failed: ' + sigRes.status);
      const sigData = await sigRes.json();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sigData.api_key);
      fd.append('timestamp', String(sigData.timestamp));
      fd.append('signature', sigData.signature);
      fd.append('folder', sigData.folder);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/auto/upload`, { method: 'POST', body: fd });
      const data = await uploadRes.json();
      if (data.secure_url) return data.secure_url;
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    } catch (err) {
      console.error('Client upload failed, trying server fallback:', err);
      // Fallback: server-side upload
      try {
        const authToken = token || localStorage.getItem('token');
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post(`${API}/upload`, fd, {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        });
        if (res.data?.url) return res.data.url;
        throw new Error('Server upload failed');
      } catch (fallbackErr) {
        console.error('Server fallback also failed:', fallbackErr);
        alert('Erreur upload: vérifiez votre connexion et réessayez');
        return null;
      }
    } finally { setUploading(false); }
  };

  const handleFileChange = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData({...formData, [field]: url});
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData({...formData, photos: [...(formData.photos || []), url]});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (university) { await axios.put(`${API}/admin/universities/${university.id}`, formData); }
      else { await axios.post(`${API}/admin/universities`, formData); }
      onSuccess();
    } catch (err) { console.error('Error saving university:', err); }
    setLoading(false);
  };

  const addToList = (field, value, setter) => {
    if (!value.trim()) return;
    setFormData({...formData, [field]: [...(formData[field] || []), value.trim()]});
    setter('');
  };

  const removeFromList = (field, index) => {
    const updated = [...(formData[field] || [])];
    updated.splice(index, 1);
    setFormData({...formData, [field]: updated});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">{university ? "Modifier l'universite" : 'Nouvelle universite'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ville *</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
              <input type="text" value={formData.province || ''} onChange={(e) => setFormData({...formData, province: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pays *</label>
              <select value={formData.countryCode} onChange={(e) => setFormData({...formData, countryCode: e.target.value, country: e.target.value === 'CN' ? 'Chine' : 'France'})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="CN">Chine</option><option value="FR">France</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
              <select value={formData.status || 'public'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="public">Publique</option><option value="private">Privee</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Classement</label>
              <input type="text" value={formData.ranking || ''} onChange={(e) => setFormData({...formData, ranking: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Ex: Top 100 QS" />
            </div>
          </div>

          {/* Images */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Images</p>
            <div className="grid grid-cols-1 gap-3">
              {[{ label: 'Photo de couverture', field: 'coverImage' }, { label: 'Logo', field: 'logo' }, { label: 'Image principale (liste)', field: 'image' }].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    {formData[field] && <img src={formData[field]} alt="" className="w-12 h-12 rounded-lg object-cover border" />}
                    <label className="flex-1 relative cursor-pointer">
                      <div className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1e3a5f] text-center">{uploading ? 'Upload...' : formData[field] ? 'Changer' : 'Choisir une image'}</div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(field, e)} disabled={uploading} />
                    </label>
                    {formData[field] && <button type="button" onClick={() => setFormData({...formData, [field]: ''})} className="text-xs text-red-500 hover:underline">Suppr.</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video + Website */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Medias & Liens</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lien video YouTube</label>
                <input type="text" value={formData.youtubeUrl || ''} onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Site web</label>
                <input type="text" value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Presentation */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Presentation</p>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Annee de creation</label><input type="text" value={formData.foundedYear || ''} onChange={(e) => setFormData({...formData, foundedYear: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1956" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">President / Recteur</label><input type="text" value={formData.president || ''} onChange={(e) => setFormData({...formData, president: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Nombre d'etudiants total</label><input type="text" value={formData.totalStudents || ''} onChange={(e) => setFormData({...formData, totalStudents: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="35 000" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Etudiants etrangers</label><input type="text" value={formData.internationalStudents || ''} onChange={(e) => setFormData({...formData, internationalStudents: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="5 000" /></div>
            </div>
          </div>

          {/* Badges */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Badges</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newBadge} onChange={e => setNewBadge(e.target.value)} placeholder="Ex: Top 100" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('badges', newBadge, setNewBadge))} />
              <button type="button" onClick={() => addToList('badges', newBadge, setNewBadge)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">{(formData.badges || []).map((b, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1">{b}<button type="button" onClick={() => removeFromList('badges', i)} className="text-blue-400 hover:text-red-500 ml-0.5">&times;</button></span>
            ))}</div>
          </div>

          {/* Faculties */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Facultes</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newFaculty} onChange={e => setNewFaculty(e.target.value)} placeholder="Ex: Faculte des Sciences" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('faculties', newFaculty, setNewFaculty))} />
              <button type="button" onClick={() => addToList('faculties', newFaculty, setNewFaculty)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="space-y-1">{(formData.faculties || []).map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg text-sm"><span>{f}</span><button type="button" onClick={() => removeFromList('faculties', i)} className="text-gray-400 hover:text-red-500">&times;</button></div>
            ))}</div>
          </div>

          {/* Conditions */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Conditions d'admission</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newCondition} onChange={e => setNewCondition(e.target.value)} placeholder="Ex: Bac + 2 minimum" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('conditions', newCondition, setNewCondition))} />
              <button type="button" onClick={() => addToList('conditions', newCondition, setNewCondition)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="space-y-1">{(formData.conditions || []).map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-lg text-sm"><span>{c}</span><button type="button" onClick={() => removeFromList('conditions', i)} className="text-gray-400 hover:text-red-500">&times;</button></div>
            ))}</div>
          </div>

          {/* Photos */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Photos</p>
            <label className="block cursor-pointer mb-3">
              <div className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1e3a5f] text-center">{uploading ? 'Upload en cours...' : '+ Ajouter une photo'}</div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={uploading} />
            </label>
            <div className="grid grid-cols-4 gap-2">{(formData.photos || []).map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFromList('photos', i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&times;</button>
              </div>
            ))}</div>
          </div>

          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading || uploading} className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UniversitiesSection = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { loadUniversities(); }, []);

  const loadUniversities = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/universities`); setUniversities(res.data); }
    catch (err) { console.error('Error loading universities:', err); }
    setLoading(false);
  };

  const deleteUniversity = async (uniId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette université?')) return;
    try { await axios.delete(`${API}/admin/universities/${uniId}`); loadUniversities(); }
    catch (err) { console.error('Error deleting university:', err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Universités partenaires ({universities.length})</h3>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouvelle université
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
        ) : universities.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl p-12 text-center"><Building size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune université pour le moment</p></div>
        ) : (
          universities.map((uni) => (
            <div key={uni.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-32 bg-gray-100">{uni.image && <img src={uni.image} alt={uni.name} className="w-full h-full object-cover" />}</div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900">{uni.name}</h4>
                <p className="text-sm text-gray-500">{uni.city}, {uni.country}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">{uni.views || 0} vues</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(uni); setShowModal(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteUniversity(uni.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <UniversityFormModal
          university={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowModal(false); setEditingItem(null); loadUniversities(); }}
        />
      )}
    </div>
  );
};

export default UniversitiesSection;

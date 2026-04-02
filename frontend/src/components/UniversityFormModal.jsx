import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Upload, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const EMPTY_FORM = {
  name: '', city: '', province: '', country: 'Chine', countryCode: 'CN', status: 'public',
  image: '', coverImage: '', logo: '', ranking: '', badges: [],
  youtubeUrl: '', description: '', foundedYear: '', president: '',
  totalStudents: '', internationalStudents: '', website: '',
  faculties: [], conditions: [], photos: []
};

/**
 * Shared University form modal.
 * @param {object}   university  - University to edit, null for new
 * @param {function} onClose     - Close callback
 * @param {function} onSave      - Called with formData when user submits
 * @param {boolean}  loading     - Disable submit button while saving
 * @param {string}   error       - External error message
 * @param {boolean}  isPartner   - Enforces strict validation (5 photos min, video required, all fields required)
 * @param {string}   submitLabel - Custom label for the submit button
 */
const UniversityFormModal = ({ university, onClose, onSave, loading = false, error: externalError = '', isPartner = false, submitLabel }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    setFormData(university ? { ...EMPTY_FORM, ...university } : EMPTY_FORM);
    setLocalError('');
  }, [university]);

  const error = localError || externalError;

  // ── Upload image ─────────────────────────────────────────────────────────────
  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const authToken = token || localStorage.getItem('token');
      const sigRes = await fetch(`${API_BASE}/upload/signature`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!sigRes.ok) throw new Error('Signature failed');
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
      throw new Error(data.error?.message || 'Upload failed');
    } catch (err) {
      // Server fallback
      try {
        const authToken = token || localStorage.getItem('token');
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: fd,
        });
        const data = await res.json();
        if (data?.url) return data.url;
        throw new Error('Server upload failed');
      } catch {
        alert('Erreur upload. Vérifiez votre connexion et réessayez.');
        return null;
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFieldUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData(f => ({ ...f, [field]: url }));
  };

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormData(f => ({ ...f, photos: [...(f.photos || []), url] }));
  };

  const removePhoto = (index) => {
    setFormData(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const addToList = (field, value, setter) => {
    if (!value.trim()) return;
    setFormData(f => ({ ...f, [field]: [...(f[field] || []), value.trim()] }));
    setter('');
  };

  const removeFromList = (field, index) => {
    setFormData(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (isPartner) {
      if (!formData.name || !formData.city) {
        setLocalError('Le nom et la ville sont obligatoires.');
        return;
      }
      if (!formData.description) {
        setLocalError('La description est obligatoire pour les partenaires.');
        return;
      }
      if (!formData.youtubeUrl) {
        setLocalError('La vidéo YouTube est obligatoire (au moins 1 vidéo requise).');
        return;
      }
      if ((formData.photos || []).length < 5) {
        setLocalError(`Au minimum 5 photos sont requises. Vous en avez ${(formData.photos || []).length}.`);
        return;
      }
    }

    onSave(formData);
  };

  const photoCount = (formData.photos || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-5 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {university ? "Modifier l'université" : (isPartner ? 'Soumettre mon université' : 'Nouvelle université')}
            </h3>
            {isPartner && (
              <p className="text-xs text-amber-600 mt-0.5">
                Requis : tous les champs marqués *, min. 5 photos et 1 vidéo YouTube
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required
              data-testid="uni-name" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ville *</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required
                data-testid="uni-city" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
              <input type="text" value={formData.province || ''} onChange={(e) => setFormData(f => ({ ...f, province: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pays *</label>
              <select value={formData.countryCode}
                onChange={(e) => setFormData(f => ({ ...f, countryCode: e.target.value, country: e.target.value === 'CN' ? 'Chine' : 'France' }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="CN">Chine</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
              <select value={formData.status || 'public'} onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="public">Publique</option>
                <option value="private">Privée</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Classement</label>
              <input type="text" value={formData.ranking || ''} onChange={(e) => setFormData(f => ({ ...f, ranking: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Ex: Top 100 QS" />
            </div>
          </div>

          {/* Images */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Images</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Photo de couverture', field: 'coverImage' },
                { label: 'Logo', field: 'logo' },
                { label: 'Image principale (liste)', field: 'image' }
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    {formData[field] && <img src={formData[field]} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />}
                    <label className="flex-1 relative cursor-pointer">
                      <div className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-emerald-400 text-center flex items-center justify-center gap-1.5">
                        <Upload size={13} />
                        {uploading ? 'Upload...' : formData[field] ? 'Changer' : 'Choisir une image'}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFieldUpload(field, e)} disabled={uploading} />
                    </label>
                    {formData[field] && (
                      <button type="button" onClick={() => setFormData(f => ({ ...f, [field]: '' }))}
                        className="text-xs text-red-500 hover:underline">Suppr.</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video + Website */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Médias & Liens</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Video size={11} />
                  Lien vidéo YouTube {isPartner && <span className="text-red-500">*</span>}
                </label>
                <input type="text" value={formData.youtubeUrl || ''}
                  onChange={(e) => setFormData(f => ({ ...f, youtubeUrl: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isPartner && !formData.youtubeUrl ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}
                  placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Site web {isPartner && <span className="text-red-500">*</span>}
                </label>
                <input type="text" value={formData.website || ''}
                  onChange={(e) => setFormData(f => ({ ...f, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Presentation */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Présentation</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Description {isPartner && <span className="text-red-500">*</span>}
              </label>
              <textarea value={formData.description || ''} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Année de création</label>
                <input type="text" value={formData.foundedYear || ''} onChange={(e) => setFormData(f => ({ ...f, foundedYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1956" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Président / Recteur</label>
                <input type="text" value={formData.president || ''} onChange={(e) => setFormData(f => ({ ...f, president: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre d'étudiants total</label>
                <input type="text" value={formData.totalStudents || ''} onChange={(e) => setFormData(f => ({ ...f, totalStudents: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="35 000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Étudiants étrangers</label>
                <input type="text" value={formData.internationalStudents || ''} onChange={(e) => setFormData(f => ({ ...f, internationalStudents: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="5 000" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Badges</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newBadge} onChange={e => setNewBadge(e.target.value)} placeholder="Ex: Top 100"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('badges', newBadge, setNewBadge))} />
              <button type="button" onClick={() => addToList('badges', newBadge, setNewBadge)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.badges || []).map((b, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  {b}
                  <button type="button" onClick={() => removeFromList('badges', i)} className="text-blue-400 hover:text-red-500 ml-0.5">&times;</button>
                </span>
              ))}
            </div>
          </div>

          {/* Faculties */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Facultés</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newFaculty} onChange={e => setNewFaculty(e.target.value)} placeholder="Ex: Faculté des Sciences"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('faculties', newFaculty, setNewFaculty))} />
              <button type="button" onClick={() => addToList('faculties', newFaculty, setNewFaculty)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="space-y-1">
              {(formData.faculties || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                  <span>{f}</span>
                  <button type="button" onClick={() => removeFromList('faculties', i)} className="text-gray-400 hover:text-red-500">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Conditions d'admission</p>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newCondition} onChange={e => setNewCondition(e.target.value)} placeholder="Ex: Bac + 2 minimum"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('conditions', newCondition, setNewCondition))} />
              <button type="button" onClick={() => addToList('conditions', newCondition, setNewCondition)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
            <div className="space-y-1">
              {(formData.conditions || []).map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-lg text-sm">
                  <span>{c}</span>
                  <button type="button" onClick={() => removeFromList('conditions', i)} className="text-gray-400 hover:text-red-500">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Photos {isPartner && <span className="text-red-500">*</span>}
              </p>
              {isPartner && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${photoCount >= 5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {photoCount}/5 minimum
                </span>
              )}
            </div>
            {isPartner && photoCount < 5 && (
              <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-center gap-2">
                <AlertCircle size={13} />
                Vous devez ajouter au moins {5 - photoCount} photo(s) supplémentaire(s).
              </div>
            )}
            <label className="block cursor-pointer mb-3">
              <div className={`px-3 py-2 border border-dashed rounded-lg text-sm text-gray-500 text-center flex items-center justify-center gap-1.5 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-400'} ${isPartner && photoCount < 5 ? 'border-amber-300' : 'border-gray-300'}`}>
                <Upload size={13} />
                {uploading ? 'Upload en cours...' : '+ Ajouter une photo'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} disabled={uploading} />
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(formData.photos || []).map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white py-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50"
              data-testid="uni-save-btn">
              {loading ? 'Enregistrement...' : (submitLabel || (isPartner ? 'Soumettre pour validation' : 'Enregistrer'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UniversityFormModal;

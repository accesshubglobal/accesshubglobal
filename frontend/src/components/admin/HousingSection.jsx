import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home, X, Copy } from 'lucide-react';
import axios, { API } from './adminApi';

const HousingFormModal = ({ housing, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(housing || {
    type: '', location: '', city: '', country: 'Chine', priceRange: '', priceMin: 0, priceMax: 0, currency: 'CNY', image: '', features: [], amenities: [], description: ''
  });
  const [amenityInput, setAmenityInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (housing) { await axios.put(`${API}/admin/housing/${housing.id}`, formData); }
      else { await axios.post(`${API}/admin/housing`, formData); }
      onSuccess();
    } catch (err) { console.error('Error saving housing:', err); }
    setLoading(false);
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({ ...formData, features: [...(formData.features || formData.amenities || []), amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">{housing ? 'Modifier le logement' : 'Nouveau logement'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de logement</label>
            <input type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Ex: Studio meublé, Chambre universitaire" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Ex: Campus, Quartier" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value, currency: e.target.value === 'Chine' ? 'CNY' : 'EUR' })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]">
                <option value="Chine">Chine</option>
                <option value="France">France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fourchette de prix</label>
              <input type="text" value={formData.priceRange} onChange={(e) => setFormData({...formData, priceRange: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Ex: 3000-5000 CNY/mois" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Équipements</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="WiFi, Cuisine équipée..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} />
              <button type="button" onClick={addAmenity} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Ajouter</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.features || formData.amenities || []).map((amenity, index) => (
                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  {amenity}
                  <button type="button" onClick={() => setFormData({ ...formData, features: (formData.features || formData.amenities || []).filter((_, i) => i !== index) })} className="hover:text-blue-900"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[#1a56db] text-white rounded-lg hover:bg-[#1648b8] disabled:opacity-50">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HousingSection = () => {
  const [housing, setHousing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => { loadHousing(); }, []);

  const loadHousing = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/housing`);
      setHousing(response.data);
    } catch (err) { console.error('Error loading housing:', err); }
    setLoading(false);
  };

  const duplicateHousing = async (id) => {
    setDuplicating(id);
    try {
      await axios.post(`${API}/admin/housing/${id}/duplicate`);
      loadHousing();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de la duplication'); }
    setDuplicating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Logements ({housing.length})</h3>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouveau logement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
        ) : housing.length === 0 ? (
          <div className="p-12 text-center"><Home size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucun logement pour le moment</p></div>
        ) : (
          <div className="grid grid-cols-3 gap-6 p-6">
            {housing.map((h) => (
              <div key={h.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gray-100">{h.image && <img src={h.image} alt={h.type} className="w-full h-full object-cover" />}</div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900">{h.type}</h4>
                  <p className="text-sm text-gray-500">{h.location}, {h.city}</p>
                  <p className="text-[#1a56db] font-medium mt-2">{h.priceRange}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditingItem(h); setShowModal(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => duplicateHousing(h.id)} disabled={duplicating === h.id} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors" title="Dupliquer" data-testid={`duplicate-housing-${h.id}`}>
                      {duplicating === h.id ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Copy size={16} />}
                    </button>
                    <button onClick={async () => { if (window.confirm('Supprimer ce logement?')) { await axios.delete(`${API}/admin/housing/${h.id}`); loadHousing(); }}} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <HousingFormModal
          housing={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowModal(false); setEditingItem(null); loadHousing(); }}
        />
      )}
    </div>
  );
};

export default HousingSection;

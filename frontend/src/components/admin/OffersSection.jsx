import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GraduationCap, Copy } from 'lucide-react';
import axios, { API } from './adminApi';
import OfferFormModal from '../OfferFormModal';

const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/offers`); setOffers(res.data); }
    catch (err) { console.error('Error loading offers:', err); }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editingItem) { await axios.put(`${API}/admin/offers/${editingItem.id}`, formData); }
      else { await axios.post(`${API}/admin/offers`, formData); }
      setShowOfferModal(false);
      setEditingItem(null);
      loadOffers();
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setSaveLoading(false);
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) return;
    try { await axios.delete(`${API}/admin/offers/${offerId}`); loadOffers(); }
    catch (err) { console.error('Error deleting offer:', err); }
  };

  const duplicateOffer = async (offerId) => {
    setDuplicating(offerId);
    try {
      await axios.post(`${API}/admin/offers/${offerId}/duplicate`);
      loadOffers();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de la duplication'); }
    setDuplicating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Offres de programmes ({offers.length})</h3>
        <button onClick={() => { setEditingItem(null); setShowOfferModal(true); }} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouvelle offre
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center"><GraduationCap size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune offre pour le moment</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Université</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={offer.image || undefined} alt={offer.title} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                      <div>
                        <p className="font-medium text-gray-900">{offer.title}</p>
                        <p className="text-xs text-gray-500">{offer.degree} - {offer.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.university}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.hasScholarship && !offer.isPartialScholarship ? 'bg-green-100 text-green-700' : offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {offer.hasScholarship && !offer.isPartialScholarship ? 'Bourse Complète' : offer.isPartialScholarship ? 'Bourse Partielle' : 'Auto-financé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.views?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingItem(offer); setShowOfferModal(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Modifier"><Edit size={16} /></button>
                      <button onClick={() => duplicateOffer(offer.id)} disabled={duplicating === offer.id} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors" title="Dupliquer" data-testid={`duplicate-offer-${offer.id}`}>
                        {duplicating === offer.id ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Copy size={16} />}
                      </button>
                      <button onClick={() => deleteOffer(offer.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showOfferModal && (
        <OfferFormModal
          offer={editingItem}
          onSave={handleSave}
          onClose={() => { setShowOfferModal(false); setEditingItem(null); setSaveError(''); }}
          loading={saveLoading}
          error={saveError}
        />
      )}
    </div>
  );
};

export default OffersSection;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Copy } from 'lucide-react';
import axios, { API } from './adminApi';

const ScholarshipsSection = ({ onNavigate }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => { loadOffers(); }, []);

  const loadOffers = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/offers`); setOffers(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) return;
    try { await axios.delete(`${API}/admin/offers/${offerId}`); loadOffers(); }
    catch (err) { console.error(err); }
  };

  const duplicateOffer = async (offerId) => {
    setDuplicating(offerId);
    try { await axios.post(`${API}/admin/offers/${offerId}/duplicate`); loadOffers(); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur duplication'); }
    setDuplicating(null);
  };

  const scholarshipOffers = offers.filter(o => o.hasScholarship);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Bourses & Opportunités de Financement</h3>
        <button onClick={() => onNavigate?.('offers', { openModal: true })} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouvelle Bourse
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800"><strong>Note:</strong> Les bourses sont gérées via les offres. Pour ajouter une nouvelle bourse, créez une offre avec le type "Bourse Complète" ou "Bourse Partielle".</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b"><h4 className="font-medium text-gray-900">Offres avec bourses ({scholarshipOffers.length})</h4></div>
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>
        ) : scholarshipOffers.length === 0 ? (
          <div className="p-12 text-center"><Award size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune offre avec bourse</p><p className="text-sm text-gray-400">Créez une offre avec l'option "Bourse" activée</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Université</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couverture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {scholarshipOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={offer.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100'} alt="" className="w-10 h-10 rounded object-cover" />
                      <div><p className="font-medium text-gray-900">{offer.title}</p><p className="text-xs text-gray-500">{offer.degree} - {offer.duration}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.university}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.isPartialScholarship ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{offer.isPartialScholarship ? 'Bourse Partielle' : 'Bourse Complète'}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{offer.scholarshipTuition === 0 ? 'Frais: 100%' : `Frais réduits: ${offer.scholarshipTuition?.toLocaleString() || 0}`}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => onNavigate?.('offers', { editOffer: offer })} className="p-2 text-gray-500 hover:text-[#1a56db] hover:bg-blue-50 rounded-lg transition-colors" title="Modifier"><Edit size={16} /></button>
                      <button onClick={() => duplicateOffer(offer.id)} disabled={duplicating === offer.id} className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Dupliquer" data-testid={`duplicate-scholarship-${offer.id}`}>
                        {duplicating === offer.id ? <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /> : <Copy size={16} />}
                      </button>
                      <button onClick={() => deleteOffer(offer.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScholarshipsSection;

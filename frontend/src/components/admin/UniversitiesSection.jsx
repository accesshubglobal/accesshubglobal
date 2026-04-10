import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Copy } from 'lucide-react';
import axios, { API } from './adminApi';
import UniversityFormModal from '../UniversityFormModal';

const UniversitiesSection = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => { loadUniversities(); }, []);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/universities`);
      setUniversities(res.data);
    } catch (err) {
      console.error('Error loading universities:', err);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    setSaveLoading(true);
    setSaveError('');
    try {
      if (editingItem) {
        await axios.put(`${API}/admin/universities/${editingItem.id}`, formData);
      } else {
        await axios.post(`${API}/admin/universities`, formData);
      }
      setShowModal(false);
      setEditingItem(null);
      loadUniversities();
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setSaveLoading(false);
  };

  const deleteUniversity = async (uniId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette université?')) return;
    try {
      await axios.delete(`${API}/admin/universities/${uniId}`);
      loadUniversities();
    } catch (err) {
      console.error('Error deleting university:', err);
    }
  };

  const duplicateUniversity = async (uniId) => {
    setDuplicating(uniId);
    try {
      await axios.post(`${API}/admin/universities/${uniId}/duplicate`);
      loadUniversities();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de la duplication'); }
    setDuplicating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Universités partenaires ({universities.length})</h3>
        <button onClick={() => { setEditingItem(null); setSaveError(''); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors">
          <Plus size={18} /> Nouvelle université
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : universities.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl p-12 text-center">
            <Building size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune université pour le moment</p>
          </div>
        ) : (
          universities.map((uni) => (
            <div key={uni.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-32 bg-gray-100">
                {uni.image && <img src={uni.image} alt={uni.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900">{uni.name}</h4>
                <p className="text-sm text-gray-500">{uni.city}, {uni.country}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">{uni.views || 0} vues</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(uni); setSaveError(''); setShowModal(true); }}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Modifier">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => duplicateUniversity(uni.id)} disabled={duplicating === uni.id}
                      className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors" title="Dupliquer"
                      data-testid={`duplicate-uni-${uni.id}`}>
                      {duplicating === uni.id ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => deleteUniversity(uni.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
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
          onClose={() => { setShowModal(false); setEditingItem(null); setSaveError(''); }}
          onSave={handleSave}
          loading={saveLoading}
          error={saveError}
          isPartner={false}
        />
      )}
    </div>
  );
};

export default UniversitiesSection;

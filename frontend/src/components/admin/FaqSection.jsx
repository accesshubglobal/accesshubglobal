import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import axios from './adminApi';

const FaqSection = () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [localFaqs, setLocalFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  useEffect(() => { loadFaqs(); }, []);

  const loadFaqs = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/faqs`); setLocalFaqs(res.data.faqs || []); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const saveFaqs = async (faqs) => {
    try { await axios.post(`${API}/admin/faqs`, { faqs }); setLocalFaqs(faqs); }
    catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    const faq = { id: Date.now().toString(), ...newFaq };
    const updated = [...localFaqs, faq];
    setLocalFaqs(updated); await saveFaqs(updated);
    setNewFaq({ question: '', answer: '' }); setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (!editingFaq) return;
    const updated = localFaqs.map(f => f.id === editingFaq.id ? editingFaq : f);
    setLocalFaqs(updated); await saveFaqs(updated); setEditingFaq(null);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('Supprimer cette question ?')) return;
    const updated = localFaqs.filter(f => f.id !== faqId);
    setLocalFaqs(updated); await saveFaqs(updated);
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="faq-admin-section">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold text-gray-900">Questions Fréquentes ({localFaqs.length})</h3><p className="text-sm text-gray-500 mt-1">Gérez les FAQ affichées sur le site</p></div>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-[#1648b8] transition-colors text-sm" data-testid="add-faq-btn"><Plus size={18} />Ajouter</button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-[#1a56db]/20">
          <h4 className="font-medium text-gray-900 mb-4">Nouvelle question</h4>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Question</label><input type="text" value={newFaq.question} onChange={(e) => setNewFaq({...newFaq, question: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" placeholder="Saisissez la question..." data-testid="faq-question-input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Réponse</label><textarea value={newFaq.answer} onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} placeholder="Saisissez la réponse..." data-testid="faq-answer-input" /></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAddForm(false); setNewFaq({ question: '', answer: '' }); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
              <button onClick={handleAdd} disabled={!newFaq.question || !newFaq.answer} className="bg-[#1a56db] text-white px-6 py-2 rounded-lg hover:bg-[#1648b8] disabled:opacity-50" data-testid="save-faq-btn">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {editingFaq && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <h4 className="font-medium text-gray-900 mb-4">Modifier la question</h4>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Question</label><input type="text" value={editingFaq.question} onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Réponse</label><textarea value={editingFaq.answer} onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] resize-none" rows={3} /></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingFaq(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
              <button onClick={handleUpdate} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">Mettre à jour</button>
            </div>
          </div>
        </div>
      )}

      {localFaqs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center"><HelpCircle size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucune FAQ configurée</p><p className="text-sm text-gray-400 mt-2">Les FAQ par défaut seront utilisées</p></div>
      ) : (
        <div className="space-y-3">
          {localFaqs.map((faq, idx) => (
            <div key={faq.id || idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 group" data-testid={`faq-admin-item-${idx}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4"><h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4><p className="text-sm text-gray-600">{faq.answer}</p></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditingFaq({...faq})} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" data-testid={`edit-faq-${idx}`}><Edit size={14} className="text-gray-700" /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 bg-gray-100 rounded-lg hover:bg-red-100" data-testid={`delete-faq-${idx}`}><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqSection;

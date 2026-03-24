import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import axios from './adminApi';

const TestimonialsSection = () => {
  const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTestimonials(); }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/admin/testimonials`); setTestimonials(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id) => { try { await axios.put(`${API}/admin/testimonials/${id}/approve`); loadTestimonials(); } catch (err) { console.error(err); } };
  const handleReject = async (id) => { try { await axios.put(`${API}/admin/testimonials/${id}/reject`); loadTestimonials(); } catch (err) { console.error(err); } };
  const handleDelete = async (id) => { if (!window.confirm('Supprimer ce témoignage ?')) return; try { await axios.delete(`${API}/admin/testimonials/${id}`); loadTestimonials(); } catch (err) { console.error(err); } };

  const statusBadge = (status) => {
    const map = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || map.pending}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="bg-white rounded-xl p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div className="space-y-6" data-testid="testimonials-admin-section">
      <div><h3 className="font-semibold text-gray-900">Témoignages ({testimonials.length})</h3><p className="text-sm text-gray-500 mt-1">Validez ou rejetez les témoignages soumis par les utilisateurs</p></div>
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center"><Star size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Aucun témoignage pour le moment</p></div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100" data-testid={`testimonial-admin-${t.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a56db] rounded-full flex items-center justify-center text-white font-bold">{(t.userName || '?')[0]}</div>
                  <div><h4 className="font-medium text-gray-900">{t.userName}</h4><p className="text-xs text-gray-500">{t.program}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(t.status)}
                  <div className="flex gap-1">{[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />)}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2">
                {t.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors" data-testid={`approve-${t.id}`}><Check size={14} />Approuver</button>
                    <button onClick={() => handleReject(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors" data-testid={`reject-${t.id}`}><X size={14} />Rejeter</button>
                  </>
                )}
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors ml-auto" data-testid={`delete-testimonial-${t.id}`}><Trash2 size={14} />Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsSection;

import React, { useState, useEffect } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import axios, { API } from './adminApi';

const NewsletterSection = ({ onBadgeUpdate }) => {
  const [newsletterSubs, setNewsletterSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadNewsletter(); }, []);

  const loadNewsletter = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/newsletter`);
      setNewsletterSubs(response.data);
      onBadgeUpdate?.('newsletter', response.data.length);
    } catch (err) { console.error('Error loading newsletter:', err); }
    setLoading(false);
  };

  const deleteNewsletterSub = async (email) => {
    if (!window.confirm(`Supprimer ${email} de la newsletter ?`)) return;
    try {
      await axios.delete(`${API}/admin/newsletter/${encodeURIComponent(email)}`);
      setNewsletterSubs(prev => prev.filter(s => s.email !== email));
    } catch (err) { console.error('Error deleting subscriber:', err); }
  };

  return (
    <div className="space-y-6" data-testid="newsletter-admin-section">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Abonnés Newsletter ({newsletterSubs.length})</h3>
        {newsletterSubs.length > 0 && (
          <button
            onClick={() => {
              const csv = "Email,Date d'inscription\n" + newsletterSubs.map(s => `${s.email},${s.subscribedAt}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'newsletter_abonnes.csv'; a.click();
              URL.revokeObjectURL(url);
            }}
            data-testid="newsletter-export-btn"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Exporter CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : newsletterSubs.length === 0 ? (
          <div className="p-12 text-center">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun abonné pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">Les visiteurs peuvent s'inscrire via le formulaire en bas de page</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {newsletterSubs.map((sub, idx) => (
                <tr key={sub.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteNewsletterSub(sub.email)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      data-testid={`newsletter-delete-${idx}`}
                    >
                      <Trash2 size={16} />
                    </button>
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

export default NewsletterSection;

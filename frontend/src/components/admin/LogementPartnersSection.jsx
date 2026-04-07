import React, { useState, useEffect } from 'react';
import { Home, CheckCircle, XCircle, Trash2, Eye, Building2, MapPin, Clock, User, RefreshCw } from 'lucide-react';
import axiosInstance, { API } from './adminApi';

const Badge = ({ status }) => {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const labels = { approved: 'Approuvé', pending: 'En attente', rejected: 'Refusé' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const LogementPartnersSection = () => {
  const [tab, setTab] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, propRes] = await Promise.all([
        axiosInstance.get(`${API}/admin/logement-partners`),
        axiosInstance.get(`${API}/admin/logement-properties`),
      ]);
      setPartners(pRes.data);
      setProperties(propRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const approvePartner = async (id) => {
    await axiosInstance.put(`${API}/admin/logement-partners/${id}/approve`);
    loadData();
  };

  const rejectPartner = async (id) => {
    if (!window.confirm('Refuser ce partenaire ?')) return;
    await axiosInstance.put(`${API}/admin/logement-partners/${id}/reject`);
    loadData();
  };

  const approveProperty = async (id) => {
    await axiosInstance.put(`${API}/admin/logement-properties/${id}/approve`);
    loadData();
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Supprimer cette propriété ?')) return;
    await axiosInstance.delete(`${API}/admin/logement-properties/${id}`);
    loadData();
  };

  const pendingCount = partners.filter(p => !p.isApproved).length;
  const pendingProps = properties.filter(p => !p.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Partenaires Logement</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les partenaires logement et leurs propriétés</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Rafraîchir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Partenaires total', value: partners.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En attente d\'approbation', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Propriétés à valider', value: pendingProps, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'partners', label: `Partenaires (${partners.length})` },
          { id: 'properties', label: `Propriétés (${properties.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Partners Tab */}
      {tab === 'partners' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {partners.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Home size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucun partenaire logement inscrit</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Partenaire', 'Entreprise', 'Contact', 'Inscrit le', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {partners.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-xs font-bold">
                          {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.companyName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge status={p.isApproved ? 'approved' : 'pending'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!p.isApproved && (
                          <button onClick={() => approvePartner(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                            data-testid={`approve-logement-${p.id}`}>
                            <CheckCircle size={12} /> Approuver
                          </button>
                        )}
                        {p.isApproved && (
                          <button onClick={() => rejectPartner(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                            <XCircle size={12} /> Révoquer
                          </button>
                        )}
                        {p.companyDoc && (
                          <a href={p.companyDoc} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                            <Eye size={12} /> Doc
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Properties Tab */}
      {tab === 'properties' && (
        <div className="grid gap-4">
          {properties.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucune propriété soumise</p>
            </div>
          ) : (
            properties.map(prop => (
              <div key={prop.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                {/* Image */}
                {prop.images?.[0] ? (
                  <img src={prop.images[0]} alt={prop.title} className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-28 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Home size={24} className="text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{prop.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={11} />{prop.city}, {prop.country}</span>
                        <span className="flex items-center gap-1"><User size={11} />{prop.companyName}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{new Date(prop.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-gray-900">{prop.price}€/{prop.pricePeriod}</span>
                        <span className="text-xs text-gray-400">{prop.propertyType}</span>
                        <span className="text-xs text-gray-400">{prop.surface}m² · {prop.rooms} pièce(s)</span>
                      </div>
                    </div>
                    <Badge status={prop.isApproved ? 'approved' : 'pending'} />
                  </div>

                  {prop.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{prop.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {!prop.isApproved && (
                      <button onClick={() => approveProperty(prop.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                        data-testid={`approve-property-${prop.id}`}>
                        <CheckCircle size={12} /> Approuver
                      </button>
                    )}
                    <button onClick={() => deleteProperty(prop.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogementPartnersSection;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { UserX, Mail, Trash2, RefreshCw, AlertTriangle, Clock, Filter, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const ROLE_LABELS = {
  user: 'Utilisateur',
  agent: 'Agent',
  employeur: "Partenaire d'emploi",
  partenaire: 'Partenaire universitaire',
  partenaire_logement: 'Partenaire logement',
};

const ROLE_COLORS = {
  user: 'bg-blue-100 text-blue-700',
  agent: 'bg-emerald-100 text-emerald-700',
  employeur: 'bg-amber-100 text-amber-700',
  partenaire: 'bg-purple-100 text-purple-700',
  partenaire_logement: 'bg-pink-100 text-pink-700',
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const daysAgo = (iso) => {
  if (!iso) return null;
  try {
    const d = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(d);
  } catch {
    return null;
  }
};

export default function InactiveUsersSection() {
  const { token } = useAuth();
  const [data, setData] = useState({ count: 0, users: [], thresholdDays: 210, cutoff: null });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/inactive-users/preview`, { headers });
      setData(res.data);
    } catch (err) {
      toast.error('Erreur de chargement', { description: err.response?.data?.detail || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleSendWarnings = async () => {
    setActing('warn');
    try {
      const res = await axios.post(`${API}/admin/inactive-users/send-warnings`, {}, { headers });
      toast.success(`${res.data.sent} email(s) d'avertissement envoyé(s)`, {
        description: `Fenêtre : ${res.data.warningWindowDays} jours avant suppression`,
      });
      await load();
    } catch (err) {
      toast.error('Échec', { description: err.response?.data?.detail || err.message });
    } finally {
      setActing(null);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm(`Confirmer la suppression définitive de ${data.count} compte(s) inactif(s) ? Cette action est irréversible.`)) return;
    setActing('purge');
    try {
      const res = await axios.post(`${API}/admin/inactive-users/purge`, {}, { headers });
      toast.success(`${res.data.deleted} compte(s) supprimé(s)`, {
        description: `Tous les comptes inactifs > ${res.data.thresholdDays} jours ont été purgés.`,
      });
      await load();
    } catch (err) {
      toast.error('Échec', { description: err.response?.data?.detail || err.message });
    } finally {
      setActing(null);
    }
  };

  const filteredUsers = roleFilter === 'all'
    ? data.users
    : data.users.filter((u) => (u.role || 'user') === roleFilter);

  const roleStats = data.users.reduce((acc, u) => {
    const r = u.role || 'user';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto" data-testid="inactive-users-section">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <UserX size={22} className="text-red-600" />
            </span>
            Comptes inactifs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion automatique des comptes inactifs depuis plus de {data.thresholdDays} jours (~7 mois).
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          data-testid="refresh-inactive-btn"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Rafraîchir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total inactifs</span>
            <UserX size={16} className="text-red-500" />
          </div>
          <p className="text-3xl font-black text-gray-900" data-testid="inactive-count">{data.count}</p>
          <p className="text-xs text-gray-500 mt-1">Éligibles à la suppression</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seuil</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{data.thresholdDays}</p>
          <p className="text-xs text-gray-500 mt-1">jours d'inactivité</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avant cutoff</span>
            <AlertTriangle size={16} className="text-orange-500" />
          </div>
          <p className="text-sm font-bold text-gray-900">{fmtDate(data.cutoff)}</p>
          <p className="text-xs text-gray-500 mt-1">Comptes plus anciens que cette date</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email avertissement</span>
            <Mail size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">14</p>
          <p className="text-xs text-gray-500 mt-1">jours avant suppression</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-orange-200 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-900">Actions manuelles</p>
            <p className="text-xs text-orange-800 mt-1">
              La purge automatique tourne déjà tous les jours en arrière-plan. Utilisez ces boutons uniquement pour un déclenchement immédiat
              (ex : nettoyage initial après mise en production).
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSendWarnings}
            disabled={acting !== null}
            data-testid="send-warnings-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {acting === 'warn' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Envoyer les avertissements (14j)
          </button>
          <button
            type="button"
            onClick={handlePurge}
            disabled={acting !== null || data.count === 0}
            data-testid="purge-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acting === 'purge' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Purger maintenant ({data.count})
          </button>
        </div>
      </div>

      {/* Role filter */}
      {data.users.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Filter size={12} /> Filtrer
          </span>
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${roleFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Tous ({data.users.length})
          </button>
          {Object.entries(roleStats).map(([role, count]) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                roleFilter === role ? 'bg-gray-900 text-white' : `${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'} hover:opacity-80`
              }`}
            >
              {ROLE_LABELS[role] || role} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 size={28} className="animate-spin mx-auto mb-3 text-gray-400" />
            Chargement…
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center" data-testid="empty-state">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <UserX size={28} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Aucun compte inactif</p>
            <p className="text-xs text-gray-500 mt-1">
              {roleFilter === 'all'
                ? "Tous vos utilisateurs ont été actifs au cours des 7 derniers mois. 🎉"
                : "Aucun compte de ce rôle n'est inactif."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dernière activité</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Inactif depuis</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const ref = u.lastActiveAt || u.createdAt;
                const days = daysAgo(ref);
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors" data-testid={`inactive-row-${u.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.firstName || ''} {u.lastName || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${ROLE_COLORS[u.role || 'user'] || 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[u.role || 'user'] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {u.lastActiveAt ? fmtDate(u.lastActiveAt) : (
                        <span className="italic text-gray-400">jamais (créé le {fmtDate(u.createdAt)})</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${days >= 210 ? 'text-red-600' : 'text-orange-600'}`}>
                        {days != null ? `${days} jours` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Users, GraduationCap, FileText, MessageCircle, Plus, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <TrendingUp size={20} className="text-green-500" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

const DashboardSection = ({ stats, onNavigate }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Utilisateurs" value={stats.users} icon={Users} color="blue" />
        <StatCard title="Offres actives" value={stats.offers} icon={GraduationCap} color="green" />
        <StatCard title="Candidatures" value={stats.applications} icon={FileText} color="purple" subtitle={`${stats.pendingApplications} en attente`} />
        <StatCard title="Messages" value={stats.messages} icon={MessageCircle} color="orange" subtitle={`${stats.unreadMessages} non lus`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('offers', { openModal: true })}
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={18} />
              Nouvelle offre
            </button>
            <button
              onClick={() => onNavigate('universities', { openModal: true })}
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus size={18} />
              Nouvelle université
            </button>
            <button
              onClick={() => onNavigate('applications')}
              className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText size={18} />
              Voir candidatures
            </button>
            <button
              onClick={() => onNavigate('messages')}
              className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <MessageCircle size={18} />
              Voir messages
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Statistiques globales</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Universités partenaires</span>
              <span className="font-semibold">{stats.universities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Logements disponibles</span>
              <span className="font-semibold">{stats.housing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux d'acceptation</span>
              <span className="font-semibold text-green-600">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;

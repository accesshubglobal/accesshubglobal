import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MENU_LABELS = {
  dashboard: { group: 'Tableau de bord', label: 'Vue d\'ensemble' },
  offers: { group: 'Programmes', label: 'Offres' },
  universities: { group: 'Programmes', label: 'Universités' },
  scholarships: { group: 'Programmes', label: 'Bourses' },
  users: { group: 'Gestion', label: 'Utilisateurs' },
  agents: { group: 'Gestion', label: 'Agents' },
  applications: { group: 'Gestion', label: 'Candidatures' },
  housing: { group: 'Gestion', label: 'Logements' },
  messages: { group: 'Communication', label: 'Messages' },
  chats: { group: 'Communication', label: 'Chat en direct' },
  contacts: { group: 'Communication', label: 'Contacts' },
  newsletter: { group: 'Communication', label: 'Newsletter' },
  blog: { group: 'Contenu', label: 'Blog' },
  banners: { group: 'Contenu', label: 'Bannières' },
  testimonials: { group: 'Contenu', label: 'Témoignages' },
  faqs: { group: 'Contenu', label: 'FAQ' },
  community: { group: 'Communauté', label: 'Discussions' },
  'payment-settings': { group: 'Paramètres', label: 'Paiements' },
  'terms-conditions': { group: 'Paramètres', label: 'Conditions' },
};

const AdminHeader = ({ activeSection, stats }) => {
  const { user } = useAuth();
  const menuInfo = MENU_LABELS[activeSection] || { group: '', label: '' };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-8 py-4 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{menuInfo.group}</span>
          <ChevronRight size={14} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {menuInfo.label}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          {stats?.unreadMessages > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
              {stats.unreadMessages}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-gray-400">Administrateur</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

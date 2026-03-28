import React from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Building, Home, MessageCircle, FileText,
  LogOut, Award, Mail, Image, Star, MessageSquare, HelpCircle, PhoneCall,
  CreditCard, ChevronLeft, ChevronRight, ChevronDown,
  Layers, Megaphone, Wrench, FolderOpen, BookOpen, MessageSquarePlus, UserCheck, Headphones
} from 'lucide-react';

const AdminSidebar = ({
  user, isPrincipalAdmin, sidebarCollapsed, setSidebarCollapsed,
  activeSection, expandedGroup, setExpandedGroup, onSectionClick, onLogout,
  stats, badges
}) => {
  const allMenuGroups = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      items: [{ id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard }],
    },
    {
      id: 'programs',
      label: 'Programmes',
      icon: GraduationCap,
      items: [
        { id: 'offers', label: 'Offres', icon: GraduationCap, badge: stats?.offers },
        { id: 'universities', label: 'Universités', icon: Building, badge: stats?.universities },
        { id: 'scholarships', label: 'Bourses', icon: Award },
      ],
    },
    {
      id: 'management',
      label: 'Gestion',
      icon: FolderOpen,
      items: [
        ...(isPrincipalAdmin ? [{ id: 'users', label: 'Utilisateurs', icon: Users, badge: stats?.users }] : []),
        ...(isPrincipalAdmin ? [{ id: 'agents', label: 'Agents', icon: UserCheck, badge: badges?.pendingAgents || null }] : []),
        { id: 'applications', label: 'Candidatures', icon: FileText, badge: stats?.pendingApplications },
        { id: 'housing', label: 'Logements', icon: Home, badge: stats?.housing },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: Megaphone,
      items: [
        { id: 'messages', label: 'Messages', icon: MessageCircle, badge: stats?.unreadMessages },
        { id: 'chats', label: 'Chat en direct', icon: Headphones, badge: badges?.chats || null },
        { id: 'contacts', label: 'Contacts', icon: PhoneCall },
        { id: 'newsletter', label: 'Newsletter', icon: Mail, badge: badges?.newsletter || null },
      ],
    },
    {
      id: 'content',
      label: 'Contenu',
      icon: Layers,
      items: [
        { id: 'blog', label: 'Blog', icon: BookOpen, badge: badges?.blog || null },
        ...(isPrincipalAdmin ? [{ id: 'banners', label: 'Bannières', icon: Image }] : []),
        { id: 'testimonials', label: 'Témoignages', icon: Star },
        { id: 'faqs', label: 'FAQ', icon: HelpCircle },
      ],
    },
    {
      id: 'social',
      label: 'Communauté',
      icon: MessageSquarePlus,
      items: [
        { id: 'community', label: 'Discussions', icon: MessageSquare, badge: badges?.community || null },
      ],
    },
    ...(isPrincipalAdmin ? [{
      id: 'settings',
      label: 'Paramètres',
      icon: Wrench,
      items: [
        { id: 'payment-settings', label: 'Paiements', icon: CreditCard },
        { id: 'terms-conditions', label: 'Conditions', icon: FileText },
        { id: 'pages', label: 'Pages du site', icon: Layers },
      ],
    }] : []),
  ];

  const menuGroups = allMenuGroups.filter(g => g.items.length > 0);

  const findGroupForSection = (sectionId) => {
    return menuGroups.find(g => g.items.some(i => i.id === sectionId))?.id || 'dashboard';
  };

  const handleSectionClick = (sectionId) => {
    onSectionClick(sectionId);
    setExpandedGroup(findGroupForSection(sectionId));
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-[72px]' : 'w-64'} bg-[#0f1d2f] text-white flex flex-col transition-all duration-300 flex-shrink-0 h-screen`}>
      {/* Logo */}
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-5'} py-5 border-b border-white/[0.06]`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold">W</div>
            <div>
              <p className="text-sm font-semibold leading-tight">AccessHub CMS</p>
              <p className="text-[10px] text-blue-300/60">Administration</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-gray-400 hover:text-white"
          data-testid="sidebar-toggle"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroup === group.id;
          const isSingle = group.items.length === 1;
          const hasActiveBadge = group.items.some(i => i.badge > 0);
          const isGroupActive = group.items.some(i => i.id === activeSection);

          if (sidebarCollapsed) {
            return (
              <div key={group.id} className="px-2 mb-1">
                <button
                  onClick={() => {
                    if (isSingle) {
                      handleSectionClick(group.items[0].id);
                    } else {
                      setExpandedGroup(isExpanded ? null : group.id);
                      if (!isGroupActive) handleSectionClick(group.items[0].id);
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-center relative transition-all ${
                    isGroupActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
                  }`}
                  title={group.label}
                >
                  <GroupIcon size={18} />
                  {hasActiveBadge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
                  )}
                </button>
              </div>
            );
          }

          return (
            <div key={group.id} className="mb-0.5">
              <button
                onClick={() => {
                  if (isSingle) {
                    handleSectionClick(group.items[0].id);
                  } else {
                    setExpandedGroup(isExpanded ? null : group.id);
                  }
                }}
                data-testid={`sidebar-group-${group.id}`}
                className={`w-full flex items-center justify-between px-5 py-2.5 text-left transition-all ${
                  isGroupActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <GroupIcon size={17} className={isGroupActive ? 'text-blue-400' : ''} />
                  <span className="text-[13px] font-medium">{group.label}</span>
                </span>
                <span className="flex items-center gap-2">
                  {hasActiveBadge && (
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  )}
                  {!isSingle && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </span>
              </button>

              {!isSingle && (
                <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionClick(item.id)}
                        data-testid={`sidebar-item-${item.id}`}
                        className={`w-full flex items-center justify-between pl-12 pr-5 py-2 text-left transition-all ${
                          activeSection === item.id
                            ? 'text-white bg-blue-500/15 border-r-2 border-blue-400'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={15} />
                          <span className="text-[13px]">{item.label}</span>
                        </span>
                        {item.badge > 0 && (
                          <span className="min-w-[20px] px-1.5 py-0.5 bg-red-500/80 text-[10px] font-medium text-white rounded-full text-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-white/[0.06] ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[11px] font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-200 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-500">Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-3'} py-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-[13px]`}
          data-testid="sidebar-logout"
        >
          <LogOut size={16} />
          {!sidebarCollapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

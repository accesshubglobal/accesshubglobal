import React from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Building, Home, MessageCircle, FileText,
  LogOut, Award, Mail, Image, Star, MessageSquare, HelpCircle, PhoneCall,
  CreditCard, ChevronLeft, ChevronRight, ChevronDown,
  Layers, Megaphone, Wrench, FolderOpen, BookOpen, MessageSquarePlus, UserCheck, Headphones, Handshake, Briefcase,
  Shield, Zap, UserX
} from 'lucide-react';

/* ─── Theme tokens ───────────────────────────────────────────────────── */
const PRINCIPAL = {
  sidebar:     '#08080f',
  border:      'rgba(245,158,11,0.12)',
  groupText:   'rgba(255,255,255,0.35)',
  itemText:    'rgba(255,255,255,0.55)',
  itemHoverBg: 'rgba(245,158,11,0.06)',
  activeBg:    'rgba(245,158,11,0.1)',
  activeBorder:'#f59e0b',
  activeText:  '#fbbf24',
  badge:       { bg:'rgba(245,158,11,0.2)', text:'#fbbf24' },
  dot:         '#f59e0b',
  accent:      '#f59e0b',
  roleLabel:   'Admin Principal',
  roleColor:   '#f59e0b',
  logoBg:      'linear-gradient(135deg,#f59e0b,#d97706)',
  logoLetter:  'A',
};
const SECONDARY = {
  sidebar:     '#0f172a',
  border:      'rgba(20,184,166,0.15)',
  groupText:   'rgba(148,163,184,0.7)',
  itemText:    'rgba(148,163,184,0.85)',
  itemHoverBg: 'rgba(20,184,166,0.07)',
  activeBg:    'rgba(20,184,166,0.1)',
  activeBorder:'#2dd4bf',
  activeText:  '#2dd4bf',
  badge:       { bg:'rgba(20,184,166,0.2)', text:'#2dd4bf' },
  dot:         '#14b8a6',
  accent:      '#14b8a6',
  roleLabel:   'Admin Secondaire',
  roleColor:   '#2dd4bf',
  logoBg:      'linear-gradient(135deg,#14b8a6,#0891b2)',
  logoLetter:  'A',
};

const AdminSidebar = ({
  user, isPrincipalAdmin, sidebarCollapsed, setSidebarCollapsed,
  activeSection, expandedGroup, setExpandedGroup, onSectionClick, onLogout,
  stats, badges
}) => {
  const T = isPrincipalAdmin ? PRINCIPAL : SECONDARY;

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
        ...(isPrincipalAdmin ? [{ id: 'partners', label: 'Partenaires Univ.', icon: Handshake, badge: (badges?.pendingPartners || 0) + (badges?.pendingPartnerUnis || 0) + (badges?.pendingPartnerOffers || 0) || null }] : []),
        ...(isPrincipalAdmin ? [{ id: 'employers', label: 'Partenaires d\'emploi', icon: Briefcase, badge: badges?.pendingEmployers || null }] : []),
        ...(isPrincipalAdmin ? [{ id: 'logement-partners', label: 'Partenaires logement', icon: Home, badge: badges?.pendingLogement || null }] : []),
        ...(isPrincipalAdmin ? [{ id: 'job-offers-admin', label: 'Offres d\'emploi', icon: Briefcase, badge: badges?.pendingJobOffers || null }] : []),
        ...(isPrincipalAdmin ? [{ id: 'companies-admin', label: 'Entreprises', icon: Building }] : []),
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
        { id: 'certificates', label: 'Certificats & Admissions', icon: Award },
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
        { id: 'inactive-users', label: 'Comptes inactifs', icon: UserX, badge: badges?.inactiveUsers || null },
      ],
    }] : []),
  ];

  const menuGroups = allMenuGroups.filter(g => g.items.length > 0);

  const findGroupForSection = (sectionId) =>
    menuGroups.find(g => g.items.some(i => i.id === sectionId))?.id || 'dashboard';

  const handleSectionClick = (sectionId) => {
    onSectionClick(sectionId);
    setExpandedGroup(findGroupForSection(sectionId));
  };

  return (
    <div
      style={{
        background: T.sidebar,
        borderRight: `1px solid ${T.border}`,
        width: sidebarCollapsed ? 72 : 256,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="admin-sidebar"
    >
      {/* Subtle noise overlay for Principal */}
      {isPrincipalAdmin && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
          background:'radial-gradient(ellipse at 20% 0%, rgba(245,158,11,0.06) 0%, transparent 50%)',
        }} />
      )}

      {/* Logo / Brand */}
      <div style={{
        display:'flex', alignItems:'center',
        padding: sidebarCollapsed ? '20px 10px' : '20px 20px',
        borderBottom: `1px solid ${T.border}`,
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        position: 'relative', zIndex: 1, flexShrink: 0,
      }}>
        {!sidebarCollapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
            <div style={{
              width:36, height:36, borderRadius:10, display:'flex', alignItems:'center',
              justifyContent:'center', fontWeight:800, fontSize:15, color:'#fff',
              background: T.logoBg, flexShrink:0,
              boxShadow: isPrincipalAdmin ? '0 4px 12px rgba(245,158,11,0.3)' : '0 4px 12px rgba(20,184,166,0.25)',
            }}>
              {T.logoLetter}
            </div>
            <div>
              <p style={{ color:'#fff', fontSize:13, fontWeight:700, margin:0, letterSpacing:'-0.01em' }}>AccessHub CMS</p>
              <p style={{ color: T.accent, fontSize:10, fontWeight:600, margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                {T.roleLabel}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            width:30, height:30, borderRadius:8, border:`1px solid ${T.border}`,
            background:'transparent', cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', color: T.groupText, transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.itemHoverBg; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.groupText; }}
          data-testid="sidebar-toggle"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'10px 0', position:'relative', zIndex:1 }}
        className="scrollbar-thin">
        {menuGroups.map((group, groupIdx) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroup === group.id;
          const isSingle = group.items.length === 1;
          const hasActiveBadge = group.items.some(i => i.badge > 0);
          const isGroupActive = group.items.some(i => i.id === activeSection);

          if (sidebarCollapsed) {
            return (
              <div key={group.id} style={{ padding:'2px 8px' }}>
                <button
                  onClick={() => {
                    if (isSingle) handleSectionClick(group.items[0].id);
                    else { setExpandedGroup(isExpanded ? null : group.id); if (!isGroupActive) handleSectionClick(group.items[0].id); }
                  }}
                  style={{
                    width:'100%', padding:'10px', borderRadius:10, border:'none',
                    background: isGroupActive ? T.activeBg : 'transparent', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
                    color: isGroupActive ? T.activeText : T.itemText,
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { if(!isGroupActive){ e.currentTarget.style.background = T.itemHoverBg; e.currentTarget.style.color='#fff'; }}}
                  onMouseLeave={e => { if(!isGroupActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.itemText; }}}
                  title={group.label}
                >
                  <GroupIcon size={17} />
                  {hasActiveBadge && (
                    <span style={{
                      position:'absolute', top:6, right:6, width:7, height:7,
                      background: T.dot, borderRadius:'50%',
                    }} />
                  )}
                </button>
              </div>
            );
          }

          return (
            <div key={group.id} style={{ marginBottom:2 }}>
              {/* Group header */}
              <button
                onClick={() => {
                  if (isSingle) handleSectionClick(group.items[0].id);
                  else setExpandedGroup(isExpanded ? null : group.id);
                }}
                data-testid={`sidebar-group-${group.id}`}
                style={{
                  width:'100%', padding:'8px 18px', border:'none', background:'transparent',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
                  color: isGroupActive ? '#fff' : T.groupText,
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { if(!isGroupActive) e.currentTarget.style.color = T.itemText; }}
                onMouseLeave={e => { if(!isGroupActive) e.currentTarget.style.color = T.groupText; }}
              >
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <GroupIcon size={13} style={{ color: isGroupActive ? T.accent : T.groupText }} />
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {group.label}
                  </span>
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {hasActiveBadge && (
                    <span style={{ width:6, height:6, background: T.dot, borderRadius:'50%' }} />
                  )}
                  {!isSingle && (
                    <ChevronDown size={12} style={{ transition:'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', color: T.groupText }} />
                  )}
                </span>
              </button>

              {/* Group items */}
              {!isSingle && (
                <div style={{
                  overflow:'hidden', transition:'max-height 0.25s ease, opacity 0.2s',
                  maxHeight: isExpanded ? '500px' : 0, opacity: isExpanded ? 1 : 0,
                }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionClick(item.id)}
                        data-testid={`sidebar-item-${item.id}`}
                        style={{
                          width:'100%', padding:'8px 18px 8px 36px', border:'none', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          background: isActive ? T.activeBg : 'transparent',
                          borderLeft: isActive ? `2px solid ${T.activeBorder}` : '2px solid transparent',
                          color: isActive ? T.activeText : T.itemText,
                          transition:'all 0.15s',
                        }}
                        onMouseEnter={e => { if(!isActive){ e.currentTarget.style.background = T.itemHoverBg; e.currentTarget.style.color = '#fff'; }}}
                        onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.itemText; }}}
                      >
                        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Icon size={14} />
                          <span style={{ fontSize:13, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                        </span>
                        {item.badge > 0 && (
                          <span style={{
                            minWidth:20, padding:'1px 6px', borderRadius:9999, fontSize:10,
                            fontWeight:700, textAlign:'center',
                            background: T.badge.bg, color: T.badge.text,
                          }}>
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

      {/* ── Role badge strip (only when expanded) ── */}
      {!sidebarCollapsed && (
        <div style={{
          margin:'0 14px 10px', borderRadius:10, padding:'8px 12px',
          background: isPrincipalAdmin ? 'rgba(245,158,11,0.08)' : 'rgba(20,184,166,0.08)',
          border: `1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8, zIndex:1, position:'relative',
        }}>
          {isPrincipalAdmin
            ? <Shield size={13} style={{ color: T.accent, flexShrink:0 }} />
            : <Zap size={13} style={{ color: T.accent, flexShrink:0 }} />
          }
          <span style={{ fontSize:11, fontWeight:600, color: T.accent, letterSpacing:'0.03em' }}>
            {T.roleLabel}
          </span>
        </div>
      )}

      {/* User + Logout */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: sidebarCollapsed ? '12px 8px' : '14px 14px',
        position:'relative', zIndex:1,
      }}>
        {!sidebarCollapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'0 4px' }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0, overflow:'hidden',
              background: T.logoBg, display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: `0 0 0 2px ${T.border}`,
            }}>
              <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontSize:12, fontWeight:600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ color: T.accent, fontSize:10, fontWeight:600, margin:0, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                {T.roleLabel}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
            borderRadius:8, border:'none', background:'transparent', cursor:'pointer',
            color: 'rgba(255,80,80,0.65)', fontSize:13, transition:'all 0.2s',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.1)'; e.currentTarget.style.color = '#fc7070'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,80,80,0.65)'; }}
          data-testid="sidebar-logout"
        >
          <LogOut size={15} />
          {!sidebarCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

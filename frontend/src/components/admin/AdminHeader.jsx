import React from 'react';
import { Bell, ChevronRight, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MENU_LABELS = {
  dashboard: { group: 'Tableau de bord', label: 'Vue d\'ensemble' },
  offers: { group: 'Programmes', label: 'Offres' },
  universities: { group: 'Programmes', label: 'Universités' },
  scholarships: { group: 'Programmes', label: 'Bourses' },
  users: { group: 'Gestion', label: 'Utilisateurs' },
  agents: { group: 'Gestion', label: 'Agents' },
  partners: { group: 'Gestion', label: 'Partenaires Universitaires' },
  employers: { group: 'Gestion', label: 'Partenaires d\'emploi' },
  'logement-partners': { group: 'Gestion', label: 'Partenaires logement' },
  'job-offers-admin': { group: 'Gestion', label: 'Offres d\'emploi' },
  'companies-admin': { group: 'Gestion', label: 'Entreprises' },
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
  pages: { group: 'Paramètres', label: 'Pages du site' },
};

const AdminHeader = ({ activeSection, stats, isPrincipalAdmin }) => {
  const { user } = useAuth();
  const menuInfo = MENU_LABELS[activeSection] || { group: '', label: '' };

  const accent = isPrincipalAdmin ? '#d97706' : '#0d9488';
  const roleLabel = isPrincipalAdmin ? 'Admin Principal' : 'Admin Secondaire';
  const roleBg = isPrincipalAdmin ? 'rgba(245,158,11,0.09)' : 'rgba(20,184,166,0.09)';
  const roleBorder = isPrincipalAdmin ? 'rgba(245,158,11,0.22)' : 'rgba(20,184,166,0.22)';
  const roleColor = isPrincipalAdmin ? '#d97706' : '#0d9488';
  const bellBg = isPrincipalAdmin ? 'rgba(245,158,11,0.12)' : 'rgba(20,184,166,0.12)';
  const bellColor = isPrincipalAdmin ? '#f59e0b' : '#14b8a6';
  const avatarBg = isPrincipalAdmin
    ? 'linear-gradient(135deg,#f59e0b,#d97706)'
    : 'linear-gradient(135deg,#14b8a6,#0891b2)';

  return (
    <header
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0 32px',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}
      data-testid="admin-header"
    >
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:12, color:'rgba(0,0,0,0.35)', fontWeight:500 }}>{menuInfo.group}</span>
        {menuInfo.group && <ChevronRight size={13} style={{ color:'rgba(0,0,0,0.25)' }} />}
        <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:0, letterSpacing:'-0.01em' }}>
          {menuInfo.label}
        </h2>
        {/* Role pill */}
        <span style={{
          marginLeft:6, padding:'3px 10px', borderRadius:20,
          fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
          background: roleBg, border:`1px solid ${roleBorder}`, color: roleColor,
          display:'flex', alignItems:'center', gap:5,
        }}>
          {isPrincipalAdmin
            ? <Shield size={9} />
            : <Zap size={9} />
          }
          {roleLabel}
        </span>
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {/* Bell */}
        <button
          style={{
            width:36, height:36, borderRadius:9, border:'none', cursor:'pointer',
            background: stats?.unreadMessages > 0 ? bellBg : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            color: stats?.unreadMessages > 0 ? bellColor : 'rgba(0,0,0,0.4)',
            transition:'all 0.2s', position:'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = bellBg; e.currentTarget.style.color = bellColor; }}
          onMouseLeave={e => {
            e.currentTarget.style.background = stats?.unreadMessages > 0 ? bellBg : 'transparent';
            e.currentTarget.style.color = stats?.unreadMessages > 0 ? bellColor : 'rgba(0,0,0,0.4)';
          }}
          data-testid="header-bell"
        >
          <Bell size={17} />
          {stats?.unreadMessages > 0 && (
            <span style={{
              position:'absolute', top:4, right:4, width:8, height:8,
              background: isPrincipalAdmin ? '#f59e0b' : '#14b8a6',
              borderRadius:'50%', border:'2px solid #fff',
            }} />
          )}
        </button>

        {/* Divider */}
        <div style={{ width:1, height:28, background:'rgba(0,0,0,0.08)' }} />

        {/* User info */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center',
            justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13,
            background: avatarBg,
            boxShadow: isPrincipalAdmin ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(20,184,166,0.3)',
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div style={{ display:'none' }} className="md:block">
            <p style={{ fontSize:13, fontWeight:600, color:'#0f172a', margin:0 }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p style={{ fontSize:10, fontWeight:600, color: accent, margin:0, letterSpacing:'0.05em', textTransform:'uppercase' }}>
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

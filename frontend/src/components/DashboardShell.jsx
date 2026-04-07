import React, { useState, useEffect, useRef } from 'react';
import { Home, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Animated counter hook ────────────────────────────────────────────────────
export const useCountUp = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
};

// ── Glassmorphism stat card ──────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, accent, sub }) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
      {/* glow corner */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-2xl"
        style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-3xl font-black text-white tabular-nums">
            {typeof value === 'number' ? animated : value}
          </p>
          <p className="text-sm font-medium text-white/60 mt-1">{label}</p>
          {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accent}25` }}>
            <Icon size={18} style={{ color: accent }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Glass panel for content sections ────────────────────────────────────────
export const GlassPanel = ({ children, className = '' }) => (
  <div className={`rounded-3xl overflow-hidden ${className}`}
    style={{ backgroundColor: 'rgba(255,255,255,0.96)', boxShadow: '0 25px 50px rgba(0,0,0,0.35)' }}>
    {children}
  </div>
);

// ── Accent button ────────────────────────────────────────────────────────────
export const AccentBtn = ({ children, accent, onClick, className = '', ...props }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 ${className}`}
    style={{ backgroundColor: accent }}
    {...props}>
    {children}
  </button>
);

// ── Main shell ───────────────────────────────────────────────────────────────
const DashboardShell = ({
  accent = '#3b82f6',
  orbA = '#1a56db',
  orbB = '#7c3aed',
  roleLabel = 'Espace membre',
  roleIcon: RoleIcon,
  user,
  navItems = [],
  activeTab,
  setActiveTab,
  onLogout,
  children,
}) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '?';

  const NavContent = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button key={item.id}
            onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
            data-testid={`shell-nav-${item.id}`}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
            style={active
              ? { backgroundColor: `${accent}20`, color: accent }
              : { color: 'rgba(255,255,255,0.5)' }}>
            {/* Active indicator */}
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                style={{ backgroundColor: accent }} />
            )}
            <Icon size={17} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: accent }}>
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
            {active && <ChevronRight size={13} style={{ color: accent }} />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#050d1a' }}>
      {/* ── Background orbs ── */}
      <div className="absolute pointer-events-none inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl animate-pulse"
          style={{ backgroundColor: orbA }} />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: orbB, animation: 'pulse 4s ease-in-out 1.5s infinite' }} />
        {/* Mesh */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)`, backgroundSize: '52px 52px' }} />
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-60 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:flex-shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accent}25` }}>
            {RoleIcon && <RoleIcon size={18} style={{ color: accent }} />}
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5">AccessHub</p>
            <p className="text-sm font-bold text-white leading-tight">{roleLabel}</p>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mb-4 p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ backgroundColor: accent }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] truncate" style={{ color: `${accent}cc` }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <NavContent />

        {/* Footer actions */}
        <div className="px-3 pb-6 space-y-1 border-t mt-2 pt-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
            <Home size={16} /> Retour au site
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'rgba(239,68,68,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
            data-testid="shell-logout-btn">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
          style={{ backgroundColor: 'rgba(5,13,26,0.95)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accent}25` }}>
              {RoleIcon && <RoleIcon size={14} style={{ color: accent }} />}
            </div>
            <p className="text-sm font-bold text-white">{roleLabel}</p>
          </div>
          <button onClick={() => setMobileOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;

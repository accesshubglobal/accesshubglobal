import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Globe, Briefcase, ArrowRight, ExternalLink,
  Sparkles, Users, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CompaniesSection = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/companies-showcase`)
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { main, others, employers } = data;
  const allOthers = [...(others || []), ...(employers || [])];
  const hasContent = main || allOthers.length > 0;
  if (!hasContent) return null;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* subtle bg decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a56db]/8 border border-[#1a56db]/15 rounded-full text-sm text-[#1a56db] mb-4">
              <Sparkles size={14} />
              <span>Écosystème de confiance</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a56db] to-blue-400">entreprises</span> partenaires
            </h2>
            <p className="text-gray-500 mt-3 text-base max-w-lg">
              Des organisations de confiance qui font confiance à AccessHub Global pour recruter leurs talents.
            </p>
          </div>
        </div>

        {/* Main company (AccessHub Global) — special card */}
        {main && (
          <div className="mb-10">
            <MainCompanyCard company={main} onClick={() => navigate(`/featured-companies/${main.id}`)} />
          </div>
        )}

        {/* Other companies grid */}
        {allOthers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allOthers.map((company, i) => (
              <CompanyCard
                key={company.id || i}
                company={company}
                colorIndex={i}
                onNavigate={() => company.type === 'employer' ? navigate(`/companies/${company.id}`) : null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const MainCompanyCard = ({ company, onClick }) => (
  <div
    onClick={onClick}
    className="relative rounded-3xl overflow-hidden cursor-pointer group"
    style={{ minHeight: '280px' }}
    data-testid="main-company-card"
  >
    {/* ── Background layer ── */}
    {company.coverUrl ? (
      <img src={company.coverUrl} alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    ) : (
      <div className="absolute inset-0 bg-[#0a0f1e] overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#1a56db] rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-violet-600 rounded-full opacity-20 blur-3xl"
          style={{ animation: 'pulse 3.5s ease-in-out 1s infinite' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-400 rounded-full opacity-15 blur-2xl"
          style={{ animation: 'pulse 4s ease-in-out 0.5s infinite' }} />
        {/* Grid mesh */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '56px 56px'
          }} />
        {/* Floating dots */}
        {[...Array(10)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-50"
            style={{ left: `${5 + i * 10}%`, top: `${15 + (i % 5) * 18}%`, animation: `pulse ${2 + (i % 3)}s ease-in-out ${i * 0.25}s infinite` }} />
        ))}
      </div>
    )}

    {/* ── Overlay gradient ── */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    {/* ── Hover shimmer ── */}
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

    {/* ── Content ── */}
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6 p-8 h-full" style={{ minHeight: '280px' }}>
      <div className="flex-1">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium mb-5">
          <Sparkles size={12} className="text-blue-300" />
          Fondateur de la plateforme
        </div>

        {/* Logo + Name */}
        <div className="flex items-center gap-4 mb-4">
          {company.logo ? (
            <img src={company.logo} alt={company.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/25 shadow-2xl flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center flex-shrink-0">
              <Building2 size={28} className="text-white" />
            </div>
          )}
          <div>
            <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{company.name}</h3>
            {company.sector && <p className="text-white/60 text-sm mt-0.5">{company.sector}</p>}
          </div>
        </div>

        {company.description && (
          <p className="text-white/70 text-sm leading-relaxed max-w-lg line-clamp-2">{company.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-4">
          {company.city && (
            <span className="flex items-center gap-1.5 text-white/60 text-xs">
              <MapPin size={12} /> {company.city}{company.country ? `, ${company.country}` : ''}
            </span>
          )}
          {company.website && (
            <span className="flex items-center gap-1.5 text-blue-300 text-xs">
              <Globe size={12} /> {company.website}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 px-5 py-3 bg-white text-[#1a56db] rounded-2xl font-semibold text-sm shadow-xl group-hover:shadow-blue-500/25 transition-all group-hover:gap-3">
          En savoir plus
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </div>
);

// Palette de couleurs selon le secteur ou l'index
const SECTOR_COLORS = [
  { bg: 'bg-[#1a56db]', light: 'bg-[#1a56db]/10', text: 'text-[#1a56db]', border: 'border-[#1a56db]/20' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
];

const ORB_SETS = [
  { a: '#1a56db', b: '#7c3aed' },
  { a: '#059669', b: '#0891b2' },
  { a: '#7c3aed', b: '#db2777' },
  { a: '#d97706', b: '#dc2626' },
  { a: '#0891b2', b: '#1a56db' },
  { a: '#db2777', b: '#7c3aed' },
];

const CompanyCard = ({ company, onNavigate, colorIndex = 0 }) => {
  const isClickable = company.type === 'employer';
  const logoSrc = company.logo || company.logoUrl;
  const name = company.name || company.companyName;
  const orb = ORB_SETS[colorIndex % ORB_SETS.length];

  return (
    <div
      onClick={isClickable ? onNavigate : undefined}
      className={`group relative rounded-3xl overflow-hidden transition-all duration-300 ${
        isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : ''
      }`}
      style={{ minHeight: '220px' }}
      data-testid={`company-card-${company.id}`}
    >
      {/* Background */}
      {logoSrc && company.coverUrl ? (
        <img src={company.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-[#0a0f1e] overflow-hidden">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-30 blur-3xl animate-pulse" style={{ backgroundColor: orb.a }} />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: orb.b, animation: 'pulse 3.5s ease-in-out 1s infinite' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-40"
              style={{ left: `${10 + i * 16}%`, top: `${20 + (i % 3) * 25}%`, animation: `pulse ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }} />
          ))}
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />

      {/* Badge offres — coin haut droit */}
      {company.activeOffers > 0 && (
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold rounded-full z-10">
          <Briefcase size={9} /> {company.activeOffers} offre{company.activeOffers > 1 ? 's' : ''}
        </span>
      )}

      {/* Contenu bas */}
      <div className="relative z-10 flex items-end gap-3 p-5 h-full" style={{ minHeight: '220px' }}>
        <div className="flex-1">
          {logoSrc ? (
            <img src={logoSrc} alt={name} className="w-10 h-10 rounded-xl object-cover border-2 border-white/25 shadow-lg mb-3" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center mb-3">
              <Building2 size={18} className="text-white" />
            </div>
          )}
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow">{name}</h3>
          {company.sector && <p className="text-white/60 text-xs mt-0.5">{company.sector}</p>}
          {company.city && (
            <p className="flex items-center gap-1 text-white/50 text-[10px] mt-1">
              <MapPin size={9} /> {company.city}{company.country ? `, ${company.country}` : ''}
            </p>
          )}
        </div>
        {isClickable && (
          <div className="flex-shrink-0 w-8 h-8 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#1a56db] transition-all">
            <ArrowRight size={14} className="text-white group-hover:text-[#1a56db] transition-colors" />
          </div>
        )}
        {!isClickable && company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="flex-shrink-0 w-8 h-8 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center hover:bg-white transition-all">
            <Globe size={13} className="text-white hover:text-[#1a56db]" />
          </a>
        )}
      </div>
    </div>
  );
};

export default CompaniesSection;

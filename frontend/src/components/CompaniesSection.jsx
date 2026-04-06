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

const CompanyCard = ({ company, onNavigate }) => {
  const isClickable = company.type === 'employer';

  return (
    <div
      onClick={isClickable ? onNavigate : undefined}
      className={`group bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:border-[#1a56db]/30 hover:shadow-md' : ''
      }`}
      data-testid={`company-card-${company.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        {company.logo || company.logoUrl ? (
          <img src={company.logo || company.logoUrl} alt={company.name}
            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#1a56db]/8 flex items-center justify-center flex-shrink-0">
            <Building2 size={22} className="text-[#1a56db]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate group-hover:text-[#1a56db] transition-colors">
            {company.name || company.companyName}
          </h3>
          {company.sector && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{company.sector}</p>
          )}
        </div>
      </div>

      {company.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{company.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
        <span className="flex items-center gap-1">
          {company.city && <><MapPin size={11} /> {company.city}</>}
        </span>
        {company.activeOffers > 0 && (
          <span className="flex items-center gap-1 text-[#1a56db] font-medium">
            <Briefcase size={11} /> {company.activeOffers} offre{company.activeOffers > 1 ? 's' : ''}
          </span>
        )}
        {isClickable && (
          <ArrowRight size={13} className="text-gray-300 group-hover:text-[#1a56db] transition-colors" />
        )}
        {company.website && !isClickable && (
          <a href={company.website} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[#1a56db] hover:underline">
            <Globe size={11} /> Site <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

export default CompaniesSection;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Globe, Briefcase, ArrowRight, ExternalLink,
  Sparkles, Users
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
            <MainCompanyCard company={main} />
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

const MainCompanyCard = ({ company }) => (
  <div className="relative rounded-2xl overflow-hidden border border-[#1a56db]/20 shadow-lg" data-testid="main-company-card">
    {/* Cover */}
    {company.coverUrl ? (
      <div className="h-40 w-full">
        <img src={company.coverUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 h-40 bg-gradient-to-r from-[#1a56db]/60 to-transparent" />
      </div>
    ) : (
      <div className="h-40 bg-gradient-to-r from-[#1a56db] to-[#2a5298]" />
    )}

    <div className="bg-white px-6 pb-6">
      <div className="flex items-start gap-5 -mt-8 mb-4">
        {company.logo ? (
          <img src={company.logo} alt={company.name}
            className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[#1a56db] flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
            <Building2 size={28} className="text-white" />
          </div>
        )}
        <div className="pt-8 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-black text-gray-900">{company.name}</h3>
            <span className="px-2.5 py-0.5 bg-[#1a56db] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
              Fondateur
            </span>
          </div>
          {company.sector && <p className="text-sm text-gray-500 mt-0.5">{company.sector}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {company.description && (
          <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-2">{company.description}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          {company.city && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> {company.city}{company.country ? `, ${company.country}` : ''}
            </span>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#1a56db] hover:underline">
              <Globe size={12} /> Site web <ExternalLink size={10} />
            </a>
          )}
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

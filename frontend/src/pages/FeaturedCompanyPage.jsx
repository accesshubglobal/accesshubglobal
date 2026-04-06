import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Globe, Phone, Mail, ArrowLeft,
  Loader2, ExternalLink, Sparkles, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const FeaturedCompanyPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/featured-companies/${companyId}`)
      .then(r => setCompany(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#1a56db]" />
    </div>
  );
  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <ImmersiveHero company={company} onBack={() => navigate(-1)} />

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 pb-24 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Company header */}
          <div className="flex items-start gap-5 p-7 border-b border-gray-100">
            {company.logo ? (
              <img src={company.logo} alt={company.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a56db] to-[#2a5298] flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
                <Building2 size={34} className="text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{company.name}</h1>
                {company.isMain && (
                  <span className="px-3 py-1 bg-[#1a56db] text-white text-xs font-bold rounded-full">Fondateur</span>
                )}
              </div>
              {company.sector && <p className="text-gray-500 mt-1">{company.sector}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {company.city && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" /> {company.city}{company.country ? `, ${company.country}` : ''}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#1a56db] hover:underline">
                    <Globe size={14} /> {company.website} <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="px-7 py-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">À propos</h2>
              <p className="text-gray-700 leading-relaxed text-base">{company.description}</p>
            </div>
          )}

          {/* Contact grid */}
          {(company.email || company.phone || company.website) && (
            <div className="px-7 py-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Contact</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {company.phone && (
                  <a href={`tel:${company.phone}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-[#1a56db]/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a56db] transition-colors">
                      <Phone size={16} className="text-[#1a56db] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Téléphone</p>
                      <p className="text-sm font-semibold text-gray-800">{company.phone}</p>
                    </div>
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-[#1a56db]/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a56db] transition-colors">
                      <Mail size={16} className="text-[#1a56db] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Email</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{company.email}</p>
                    </div>
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-[#1a56db]/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a56db]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a56db] transition-colors">
                      <Globe size={16} className="text-[#1a56db] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Site web</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{company.website}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ── Immersive Hero ──────────────────────────────────────────────────────────
const ImmersiveHero = ({ company, onBack }) => {
  const hasCover = !!company.coverUrl;

  return (
    <div className="relative h-72 md:h-96 overflow-hidden">
      {/* Background */}
      {hasCover ? (
        <img src={company.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
      ) : (
        <AbstractBackground />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a56db]/30 to-transparent" />

      {/* Back button */}
      <button onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors z-10">
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Company info overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 z-10">
        <div className="flex items-end gap-5 max-w-4xl mx-auto">
          {company.logo ? (
            <img src={company.logo} alt={company.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-2xl flex-shrink-0 backdrop-blur-sm" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0">
              <Building2 size={36} className="text-white" />
            </div>
          )}
          <div className="pb-1">
            <div className="flex items-center gap-3 mb-1">
              {company.isMain && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full text-white text-xs font-medium">
                  <Sparkles size={11} /> Fondateur
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
              {company.name}
            </h1>
            {company.sector && (
              <p className="text-white/70 mt-1 text-sm font-medium">{company.sector}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Abstract animated background (when no cover image) ─────────────────────
const AbstractBackground = () => (
  <div className="absolute inset-0 bg-[#0a0f1e] overflow-hidden">
    {/* Animated gradient orbs */}
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1a56db] rounded-full opacity-25 blur-3xl animate-pulse" />
    <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-violet-600 rounded-full opacity-20 blur-3xl"
      style={{ animation: 'pulse 3s ease-in-out 1s infinite' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-2xl"
      style={{ animation: 'pulse 4s ease-in-out 0.5s infinite' }} />

    {/* Grid mesh overlay */}
    <div className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '48px 48px'
      }} />

    {/* Floating dots */}
    {[...Array(12)].map((_, i) => (
      <div key={i}
        className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40"
        style={{
          left: `${8 + i * 8}%`,
          top: `${20 + (i % 4) * 20}%`,
          animation: `pulse ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`
        }} />
    ))}
  </div>
);

export default FeaturedCompanyPage;

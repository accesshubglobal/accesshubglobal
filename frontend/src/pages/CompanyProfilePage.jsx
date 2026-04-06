import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Globe, Phone, Mail, Users, Calendar, ArrowLeft,
  Briefcase, Star, ExternalLink, Loader2, Linkedin, Twitter, Award
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { JobOfferCard, JobDetailModal } from '../components/JobOffersSection';
import JobApplyModal from '../components/JobApplyModal';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CompanyProfilePage = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [applyOffer, setApplyOffer] = useState(null);

  useEffect(() => {
    axios.get(`${API}/companies/${employerId}`)
      .then(r => setData(r.data))
      .catch(() => navigate('/emploi'))
      .finally(() => setLoading(false));
  }, [employerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a56db]" />
      </div>
    );
  }

  if (!data) return null;

  const { company, offers, memberSince } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero / Cover */}
      <div className="relative">
        {company.coverUrl ? (
          <div className="h-56 md:h-72 w-full overflow-hidden">
            <img src={company.coverUrl} alt="Couverture" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-r from-[#1a56db] to-[#2a5298]" />
        )}
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors z-10"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 -mt-8 relative">
        {/* Company card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#1a56db]/10 flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
                <Building2 size={36} className="text-[#1a56db]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-gray-900">{company.companyName}</h1>
              <p className="text-gray-500 mt-1">{company.sector}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {company.city && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" /> {company.city}, {company.country}
                  </span>
                )}
                {company.employeeCount && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users size={14} className="text-gray-400" /> {company.employeeCount} employés
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" /> Fondée en {company.foundedYear}
                  </span>
                )}
                {offers.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-[#1a56db] font-medium">
                    <Briefcase size={14} /> {offers.length} offre(s) active(s)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-gray-100 hover:bg-[#1a56db] hover:text-white text-gray-600 rounded-xl transition-colors"
                  title="Site web">
                  <Globe size={18} />
                </a>
              )}
              {company.socialLinkedIn && (
                <a href={company.socialLinkedIn} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl transition-colors">
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Contact */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-4">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a56db] transition-colors">
                <Phone size={15} className="text-gray-400" /> {company.phone}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a56db] transition-colors">
                <Mail size={15} className="text-gray-400" /> {company.email}
              </a>
            )}
          </div>
        </div>

        {/* Offers */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Offres d'emploi ({offers.length})
          </h2>
          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Aucune offre active pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {offers.map((offer, i) => (
                <JobOfferCard key={offer.id} offer={offer} index={i} light
                  onView={() => setSelectedOffer(offer)}
                  onApply={() => setApplyOffer(offer)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOffer && (
        <JobDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)}
          onApply={() => { setApplyOffer(selectedOffer); setSelectedOffer(null); }} />
      )}
      {applyOffer && (
        <JobApplyModal offer={applyOffer} onClose={() => setApplyOffer(null)} />
      )}
      <Footer />
    </div>
  );
};

export default CompanyProfilePage;

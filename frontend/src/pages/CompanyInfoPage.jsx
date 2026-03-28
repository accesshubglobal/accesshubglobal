import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Mail, Users, Handshake, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const CompanyInfoPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/pages/company`).then(r => r.json()).then(d => { setPage(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full"></div></div>;
  if (!page) return null;

  const s = page.sections || {};

  return (
    <div className="min-h-screen bg-white" data-testid="company-info-page">
      <Header onOpenAuth={() => navigate('/')} />

      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{page.title}</h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">{page.subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Identity */}
        {s.identity && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center"><Building size={20} className="text-[#1e3a5f]" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Identification de l'entreprise</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {[['Raison sociale', s.identity.name], ["Numéro d'immatriculation", s.identity.registration], ['Dirigeant', s.identity.director], ['Email de contact', s.identity.email], ['Année de création', s.identity.founded], ["Secteur d'activité", s.identity.sector]].filter(([,v]) => v).map(([label, value], i) => (
                    <tr key={i} className="hover:bg-gray-100/50"><td className="px-6 py-4 text-sm font-medium text-gray-500 w-1/3">{label}</td><td className="px-6 py-4 text-sm text-gray-900 font-medium">{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Offices */}
        {s.offices?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><MapPin size={20} className="text-[#1a56db]" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Nos sièges</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {s.offices.map((office, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4"><span className="text-2xl">{office.flag}</span><h3 className="font-bold text-gray-900 text-lg">Siège {office.country}</h3></div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-2"><MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" /><span>{office.address}</span></div>
                    {s.identity?.email && <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400 flex-shrink-0" /><span>{s.identity.email}</span></div>}
                  </div>
                  {office.label && <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs text-gray-500">{office.label}</p></div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Structure */}
        {s.departments?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Users size={20} className="text-purple-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Structure de l'entreprise</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] text-white rounded-2xl px-8 py-5 text-center shadow-lg">
                  <p className="font-bold text-lg">Direction Générale</p>
                  <p className="text-blue-200 text-sm mt-1">{s.identity?.director}</p>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {s.departments.map((dept, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                      <div className="w-px h-4 bg-gray-300 mx-auto mb-3"></div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{dept.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{dept.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Clients & Partners */}
        {(s.clients?.length > 0 || s.partners?.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Handshake size={20} className="text-green-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Clients & Partenaires</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {s.clients?.length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-4">Nos clients</h3>
                  <ul className="space-y-3 text-sm text-gray-700">{s.clients.map((c, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>{c}</li>)}</ul>
                </div>
              )}
              {s.partners?.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="font-bold text-gray-900 mb-4">Nos partenaires</h3>
                  <ul className="space-y-3 text-sm text-gray-700">{s.partners.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>{p}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        {s.stats?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><BarChart3 size={20} className="text-orange-500" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Chiffres clés</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {s.stats.map((stat, i) => {
                const gradients = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600'];
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                    <p className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${gradients[i % gradients.length]} bg-clip-text text-transparent mb-2`}>{stat.number}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CompanyInfoPage;

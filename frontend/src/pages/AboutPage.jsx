import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Heart, Users, Award, Globe, BookOpen, Briefcase, TrendingUp, Shield, GraduationCap, ImageIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const AboutPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/pages/about`).then(r => r.json()).catch(() => null),
      fetch(`${API}/certificates`).then(r => r.json()).catch(() => []),
      fetch(`${API}/admissions`).then(r => r.json()).catch(() => []),
    ]).then(([p, c, a]) => {
      setPage(p);
      setCertificates(Array.isArray(c) ? c : []);
      setAdmissions(Array.isArray(a) ? a : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full"></div></div>;
  if (!page) return null;

  const s = page.sections || {};
  const pillarIcons = [Globe, Shield, Award];

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      <Header onOpenAuth={() => navigate('/')} />

      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{page.title}</h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">{page.subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">
        {/* History */}
        {s.history && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center"><BookOpen size={20} className="text-[#1e3a5f]" /></div>
              <h2 className="text-2xl font-bold text-gray-900">{s.history.title}</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 space-y-4 text-gray-700 leading-relaxed">
              {(s.history.content || '').split('\n').filter(Boolean).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
            </div>
          </section>
        )}

        {/* Mission */}
        {s.mission && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Target size={20} className="text-[#1a56db]" /></div>
              <h2 className="text-2xl font-bold text-gray-900">{s.mission.title}</h2>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <p className="text-lg text-gray-800 leading-relaxed">{s.mission.content}</p>
              {s.mission.pillars?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                  {s.mission.pillars.map((item, i) => {
                    const Icon = pillarIcons[i % pillarIcons.length];
                    return (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm"><Icon size={22} className="text-[#1a56db]" /></div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Values */}
        {s.values?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Heart size={20} className="text-red-500" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Nos valeurs</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {s.values.map((val, i) => {
                const colors = ['border-blue-200 bg-blue-50/50', 'border-green-200 bg-green-50/50', 'border-purple-200 bg-purple-50/50', 'border-orange-200 bg-orange-50/50'];
                return (
                  <div key={i} className={`rounded-2xl p-6 border ${colors[i % colors.length]}`}>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{val.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Team */}
        {s.team?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Users size={20} className="text-green-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Notre équipe</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {s.team.map((member, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-full flex items-center justify-center text-white text-lg font-bold mb-4">
                    {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-[#1a56db] font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {s.services?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Briefcase size={20} className="text-orange-500" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Nos services</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {s.services.map((service, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#1a56db]/20 hover:shadow-sm transition-all">
                  <div className="w-8 h-8 bg-[#1a56db]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><TrendingUp size={16} className="text-[#1a56db]" /></div>
                  <div><h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3><p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Certificats ── */}
        {certificates.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Nos Certificats</h2>
                <p className="text-gray-500 text-sm">Certifications d'honneur, d'excellence et d'appréciation</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1">
                  {cert.imageUrl ? (
                    <div className="h-52 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4 overflow-hidden">
                      <img src={cert.imageUrl} alt={cert.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                      <Award size={48} className="text-amber-200" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{cert.title}</h3>
                    {cert.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{cert.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Admissions ── */}
        {admissions.length > 0 && (
          <section className="bg-white rounded-3xl py-10 px-6 md:px-10">
            {/* Purple ribbon banner — "Most Professional and Trustworthy" */}
            <div className="relative inline-block mb-12">
              <div
                className="bg-[#6b46c1] text-white px-10 py-4 pr-16 font-bold text-xl md:text-2xl tracking-tight shadow-md"
                style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%)' }}
              >
                Most Professional and Trustworthy
              </div>
              <div
                className="absolute -bottom-2 left-0 h-2 w-1/2 bg-[#6b46c1]/40"
                aria-hidden="true"
              />
            </div>

            {/* Certificate / authorization paper grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
              {admissions.map((adm) => (
                <div
                  key={adm.id}
                  className="group relative aspect-[3/4] bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(107,70,193,0.18)] transition-shadow duration-300 overflow-hidden border border-gray-100"
                  title={adm.title}
                >
                  {adm.imageUrl ? (
                    <img
                      src={adm.imageUrl}
                      alt={adm.title}
                      className="w-full h-full object-contain bg-white p-2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
                      <GraduationCap size={40} className="text-purple-200" />
                    </div>
                  )}

                  {/* Hover overlay with title — only visible on hover, doesn't change the paper aesthetic */}
                  {(adm.title || adm.university) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[11px] font-semibold leading-tight line-clamp-2">{adm.title}</p>
                      {adm.university && (
                        <p className="text-[10px] text-purple-200 mt-1 line-clamp-1">
                          {adm.university}{adm.year ? ` · ${adm.year}` : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Prêt à commencer votre aventure ?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Rejoignez les centaines d'étudiants qui ont réalisé leur rêve d'étudier à l'international avec AccessHub Global.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-[#1e3a5f] rounded-xl font-semibold hover:bg-blue-50 transition-colors">Voir nos programmes</button>
            <a href="mailto:accesshubglobal@gmail.com" className="px-8 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">Nous contacter</a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;

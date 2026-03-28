import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const GenericLegalPage = ({ slug }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/pages/${slug}`).then(r => r.json()).then(d => { setPage(d); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full"></div></div>;
  if (!page) return null;

  return (
    <div className="min-h-screen bg-white" data-testid={`${slug}-page`}>
      <Header onOpenAuth={() => navigate('/')} />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{page.title}</h1>
          <p className="text-blue-200">{page.subtitle}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-10">
          {(page.sections || []).map((sec, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{sec.heading}</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                {(sec.content || '').split('\n').filter(Boolean).map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export const LegalNoticePage = () => <GenericLegalPage slug="legal" />;
export const PrivacyPolicyPage = () => <GenericLegalPage slug="privacy" />;
export const TermsOfUsePage = () => <GenericLegalPage slug="terms" />;

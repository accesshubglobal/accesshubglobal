import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Music2, Facebook, Instagram, Youtube, ArrowRight, Users, ArrowUp } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [showWeChatQR, setShowWeChatQR] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    try {
      const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;
      await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Erreur');
        setNewsletterStatus('success');
        setNewsletterMsg(t('footer.subscribeSuccess'));
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 4000);
      });
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg(err.message || 'Erreur lors de l\'inscription');
      setTimeout(() => setNewsletterStatus(null), 4000);
    }
  };

  const scrollToService = (serviceId) => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openServiceModal', { detail: { serviceId } }));
      }, 600);
    }
  };

  const scrollToProgram = (filter) => {
    const el = document.getElementById('programs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('filterProgram', { detail: { filter } }));
      }, 600);
    }
  };

  const serviceLinks = [
    { label: "Études à l'étranger", serviceId: 1 },
    { label: "Traduction de documents", serviceId: 3 },
    { label: "CHSI", serviceId: 6 },
    { label: "Orientation Académique", serviceId: 7 },
    { label: "Recherche de Logement", serviceId: 4 },
    { label: "Accompagnement Visa", serviceId: 2 },
    { label: "Cours de Langues", serviceId: 8 },
  ];

  const programLinks = [
    { label: "Bourses CSC", filter: 'fullScholarship' },
    { label: "Bourses Campus France", filter: 'fullScholarship' },
    { label: "Bourse Partielle", filter: 'partialScholarship' },
    { label: "Auto-financement", filter: 'selfFinanced' },
    { label: "Stages", filter: 'all' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('footer.stayInformed')}</h3>
              <p className="text-gray-400">{t('footer.newsletterSubtitle')}</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col w-full md:w-auto">
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  data-testid="newsletter-email-input"
                  className="flex-1 md:w-80 px-4 py-3 rounded-l-lg bg-gray-800 border border-gray-700 focus:border-[#1a56db] outline-none"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  data-testid="newsletter-submit-btn"
                  className="bg-[#1a56db] hover:bg-[#1648b8] px-6 py-3 rounded-r-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {newsletterStatus === 'loading' ? t('footer.subscribing') : t('footer.subscribe')}
                  <ArrowRight size={16} />
                </button>
              </div>
              {newsletterStatus && (
                <p data-testid="newsletter-feedback" className={`mt-2 text-sm ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_d923ae2e-8158-4a92-a0e5-0f06423a47f2/artifacts/he94oysv_sans.PNG" 
                alt="AccessHub Global" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, link: "https://www.facebook.com/share/1JuB8dae6F/?mibextid=wwXIfr" },
                { Icon: Music2, link: "https://www.tiktok.com/@accesshubglobal" },
                { Icon: Instagram, link: "https://www.youtube.com/redirect?event=channel_description&redir_token=QUFFLUhqbUFYWFkyaE1aZEtGMlBsb2ZJbmNiSjJtUVlsZ3xBQ3Jtc0trRkFUTTNwazdXdW5yeDhJTU0xM0FoaGxBUDJ2eDVLcG1WTFBDbHZaZkZxcDhTOTJMM0VkZXBOaGZ0TTR4Y3ltR1pqZ2p2NElvUndiMXpydkVqTWxhT2FYQmJDWkdpYUEyZnowUVhuRzRzdlA4c2pOWQ&q=https%3A%2F%2Fwww.instagram.com%2Faccesshubglobal%3Figsh%3DM3U3cjY2dWZkNHUy%26utm_source%3Dqr" },
                { Icon: Youtube, link: "http://www.youtube.com/@AccessHubGlobal" },
              ].map(({ Icon, link }, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-[#1a56db] rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-3 text-gray-400">
              {serviceLinks.map((svc) => (
                <li key={svc.serviceId}>
                  <button
                    onClick={() => scrollToService(svc.serviceId)}
                    data-testid={`footer-service-${svc.serviceId}`}
                    className="hover:text-white transition-colors text-left"
                  >
                    {svc.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.programsTitle')}</h4>
            <ul className="space-y-3 text-gray-400">
              {programLinks.map((prog, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToProgram(prog.filter)}
                    data-testid={`footer-program-${i}`}
                    className="hover:text-white transition-colors text-left"
                  >
                    {prog.label}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-gray-800">
                <button
                  onClick={() => navigate('/agent/register')}
                  data-testid="footer-become-partner"
                  className="hover:text-white transition-colors flex items-center gap-2 text-[#1a56db]"
                >
                  <Users size={16} />
                  {t('footer.becomePartner')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#1a56db]" />
                <span>+86 138 811 301 75</span>
              </li>
              <li className="flex items-center gap-3">
                <FaWhatsapp size={16} className="text-[#25D366]" />
                <a
                  href="https://wa.me/message/4KVMCWCH4LQPN1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-[#1a56db]" />
                <button
                  onClick={() => setShowWeChatQR(true)}
                  className="hover:text-white transition-colors"
                >
                  WeChat
                </button>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#1a56db]" />
                <span>accesshubglobal@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#1a56db] mt-1" />
                <span>Vanke, Panyu District, Guangzhou, Chine</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#1a56db] mt-1" />
                <span>34 rue Lénine, Moungali, Brazzaville, Congo</span>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.companyTitle')}</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="/company" className="hover:text-white transition-colors">{t('footer.companyInfo')}</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2019 - {currentYear} AccessHub Global. {t('footer.allRights')}</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="/legal" className="hover:text-white transition-colors">{t('footer.legal')}</a>
            </div>
          </div>
        </div>
        {showWeChatQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-lg p-6 relative max-w-sm w-full">
              <button
                onClick={() => setShowWeChatQR(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ✕
              </button>
              <h4 className="text-center font-semibold mb-4 text-gray-800">
                {t('footer.scanWeChat')}
              </h4>
              <img
                src="/wechat-qr.jpg"
                alt="WeChat QR Code"
                className="w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          data-testid="scroll-to-top"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1a56db] hover:bg-[#1648b8] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Retour en haut"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </footer>
  );
};

export default Footer;

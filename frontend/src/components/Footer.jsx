import React from 'react';
import { Mail, Phone, MessageCircle, MapPin, Music2, Facebook, Instagram, Youtube, ArrowRight, Users } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showWeChatQR, setShowWeChatQR] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null); // 'success' | 'error' | 'loading'
  const [newsletterMsg, setNewsletterMsg] = useState('');

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
        setNewsletterMsg('Inscription réussie !');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus(null), 4000);
      });
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg(err.message || 'Erreur lors de l\'inscription');
      setTimeout(() => setNewsletterStatus(null), 4000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Restez Informé</h3>
              <p className="text-gray-400">Recevez les dernières opportunités de bourses et actualités.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col w-full md:w-auto">
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
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
                  {newsletterStatus === 'loading' ? 'Envoi...' : "S'inscrire"}
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
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_chinese-education/artifacts/gc6ncp0j_0C3E8C4F-6FA9-4406-98A9-D40F8A0065C9-removebg-preview.png" 
                alt="Winner's Consulting" 
                className="h-12 w-auto"
              />
              <span className="text-xl font-bold">Winner's Consulting</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Votre partenaire de confiance pour réaliser vos rêves d'études internationales. Expertise en Chine et France.
            </p>
         <div className="flex gap-3">
          {[
            { Icon: Facebook, link: "https://www.facebook.com/share/14VpiUC1fpP/?mibextid=wwXIfr" },
            { Icon: Music2, link: "https://www.tiktok.com/@winnersconsulting" },
            { Icon: Instagram, link: "https://www.instagram.com/winnerssconsulting?igsh=M3U3cjY2dWZkNHUy&utm_source=qr" },
            { Icon: Youtube, link: "https://youtube.com/@winnersconsulting?si=bIT3rN-NJn2Yi-Sn" },
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
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Études à l’étranger</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Traduction de documents</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">CHSI</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Orientation Académique</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Recherche de Logement</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Accompagnement Visa</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Cours de Langues</a></li>
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Programmes</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Bourses CSC</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Bourses Campus France</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Bourse Partielle</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Auto-financement</a></li>
              <li><a href="#" target="_blank" className="hover:text-white transition-colors">Stages</a></li>
              {/* Devenir Partenaire Link - Only here */}
              <li className="pt-2 border-t border-gray-800">
                <a href="#" target="_blank" className="hover:text-white transition-colors flex items-center gap-2 text-[#1a56db]">
                  <Users size={16} />
                  Devenir Partenaire
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
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
                <span>contact@winnersc.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#1a56db] mt-1" />
                <span>Avenue , Brazzaville, Rép du Congo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2019 - {currentYear} Winner's Consulting. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" target="_blank" className="hover:text-white transition-colors">Politique de Confidentialité</a>
              <a href="#" target="_blank" className="hover:text-white transition-colors">Conditions d'Utilisation</a>
              <a href="#" target="_blank" className="hover:text-white transition-colors">Mentions Légales</a>
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
              Scannez le QR Code WeChat
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
    </footer>
  );
};

export default Footer;

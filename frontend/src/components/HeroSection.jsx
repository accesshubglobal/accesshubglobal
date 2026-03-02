import React from 'react';
import { stats } from '../data/mockData';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const HeroSection = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-gradient-to-br from-[#1a56db] via-[#1e40af] to-[#1e3a8a] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
              <span className="block text-blue-200">{t('hero.subtitle')}</span>
            </h1>
            
            <p className="text-lg text-blue-100 mb-8 max-w-xl">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={() => !isAuthenticated && onOpenAuth ? onOpenAuth('register') : null}
                className="bg-white text-[#1a56db] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                data-testid="hero-cta-button"
              >
                {isAuthenticated ? t('hero.ctaLoggedIn') : t('hero.cta')}
                <ArrowRight size={18} />
              </button>
              <a 
                href="#contact" 
                className="border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                {t('hero.consultation')}
              </a>
            </div>

            <div className="flex flex-wrap gap-6">
              {[t('hero.features.scholarships'), t('hero.features.visa'), t('hero.features.housing')].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-blue-100">
                  <CheckCircle size={18} className="text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${
                  index === 0 ? 'col-span-2' : ''
                } ${index === stats.length - 1 && stats.length % 2 === 0 ? '' : ''}`}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;

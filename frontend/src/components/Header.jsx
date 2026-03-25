import React, { useState } from 'react';
import { Menu, X, ChevronDown, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';

const Header = ({ onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const { user, isAuthenticated, isAdmin, isAgent, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language?.toUpperCase()?.substring(0, 2) || 'FR';

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang.toLowerCase());
    setShowLangDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
    <header className="w-full">
      {/* Main Header */}
      <div className="bg-white py-4 px-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_d923ae2e-8158-4a92-a0e5-0f06423a47f2/artifacts/w2g70eik_40325035-1C06-41C7-B7A1-07655A801D38.jpg" 
              alt="AccessHub Global" 
              className="h-16 sm:h-20 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#services" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.services')}</a>
            <a href="#destinations" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.destinations')}</a>
            <a href="#scholarships" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.scholarships')}</a>
            <a href="#housing" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.housing')}</a>
            <a href="#contact" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.contact')}</a>
            <a href="/blog" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">Blog</a>
            <a href="/community" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">Communauté</a>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-200"></div>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 text-gray-700 hover:text-[#1a56db] font-medium transition-colors"
                data-testid="language-selector"
              >
                <Globe size={16} />
                {currentLang}
                <ChevronDown size={14} />
              </button>
              {showLangDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button 
                    onClick={() => changeLanguage('FR')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${currentLang === 'FR' ? 'text-[#1a56db] font-medium' : 'text-gray-700'}`}
                  >
                    FR Français
                  </button>
                  <button 
                    onClick={() => changeLanguage('EN')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${currentLang === 'EN' ? 'text-[#1a56db] font-medium' : 'text-gray-700'}`}
                  >
                    EN English
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 text-gray-700 hover:text-[#1a56db] font-medium transition-colors"
                    data-testid="user-menu-button"
                  >
                    <div className="w-8 h-8 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span className="hidden xl:inline">{user?.firstName}</span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[200px]">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => { navigate(isAgent ? '/agent' : '/dashboard'); setShowUserDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        data-testid="dashboard-link"
                      >
                        <User size={16} />
                        {isAgent ? 'Espace Agent' : t('header.dashboard')}
                      </button>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => { navigate('/admin'); setShowUserDropdown(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-purple-600"
                          data-testid="admin-link"
                        >
                          <LayoutDashboard size={16} />
                          {t('header.admin')}
                        </button>
                      )}
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                          data-testid="logout-button"
                        >
                          <LogOut size={16} />
                          {t('header.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors"
                  data-testid="login-button"
                >
                  {t('header.login')}
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="bg-[#1a56db] hover:bg-[#1648b8] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  data-testid="register-button"
                >
                  {t('header.register')}
                </button>
              </>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 lg:hidden">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <button
                  onClick={() => { navigate(isAgent ? '/agent' : isAdmin ? '/admin' : '/dashboard'); }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a56db] text-white text-xs font-bold"
                  data-testid="mobile-user-btn"
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </button>
              </>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
                data-testid="mobile-login-button"
              >
                {t('header.login')}
              </button>
            )}

            {/* Mobile Language */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-0.5 px-2 py-1.5 text-gray-600 hover:text-[#1a56db] transition-colors"
                data-testid="mobile-lang-selector"
              >
                <Globe size={18} />
                <ChevronDown size={12} />
              </button>
              {showLangDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  <button
                    onClick={() => changeLanguage('FR')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${currentLang === 'FR' ? 'text-[#1a56db] font-medium' : 'text-gray-700'}`}
                  >
                    FR Français
                  </button>
                  <button
                    onClick={() => changeLanguage('EN')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${currentLang === 'EN' ? 'text-[#1a56db] font-medium' : 'text-gray-700'}`}
                  >
                    EN English
                  </button>
                </div>
              )}
            </div>

            <button
              className="p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col gap-3">
              <a href="#services" className="text-gray-700 hover:text-[#1a56db] font-medium">{t('header.services')}</a>
              <a href="#destinations" className="text-gray-700 hover:text-[#1a56db] font-medium">{t('header.destinations')}</a>
              <a href="#scholarships" className="text-gray-700 hover:text-[#1a56db] font-medium">{t('header.scholarships')}</a>
              <a href="#housing" className="text-gray-700 hover:text-[#1a56db] font-medium">{t('header.housing')}</a>
              <a href="#contact" className="text-gray-700 hover:text-[#1a56db] font-medium">{t('header.contact')}</a>
              <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#1a56db] font-medium">Blog</a>
              <a href="/community" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-[#1a56db] font-medium">Communauté</a>
              
              <div className="border-t border-gray-100 pt-3 mt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <div className="w-8 h-8 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <button 
                      onClick={() => { navigate(isAgent ? '/agent' : '/dashboard'); setMobileMenuOpen(false); }}
                      className="w-full text-left text-gray-700 font-medium"
                    >
                      {isAgent ? 'Espace Agent' : t('header.dashboard')}
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                        className="w-full text-left text-purple-600 font-medium"
                      >
                        {t('header.admin')}
                      </button>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left text-red-600 font-medium"
                    >
                      {t('header.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                      className="bg-[#1a56db] text-white px-4 py-2 rounded-lg font-medium text-center flex-1"
                    >
                      {t('header.register')}
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

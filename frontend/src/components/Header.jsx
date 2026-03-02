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
  
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
          <a href="/" className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_chinese-education/artifacts/gc6ncp0j_0C3E8C4F-6FA9-4406-98A9-D40F8A0065C9-removebg-preview.png" 
              alt="Winner's Consulting" 
              className="h-14 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-[#1a56db] text-xl font-bold">Winner's Consulting</h1>
              <span className="text-gray-500 text-xs">{t('header.tagline')}</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#services" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.services')}</a>
            <a href="#destinations" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.destinations')}</a>
            <a href="#scholarships" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.scholarships')}</a>
            <a href="#housing" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.housing')}</a>
            <a href="#contact" className="text-gray-700 hover:text-[#1a56db] font-medium transition-colors">{t('header.contact')}</a>
            
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
                        onClick={() => { navigate('/dashboard'); setShowUserDropdown(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        data-testid="dashboard-link"
                      >
                        <User size={16} />
                        {t('header.dashboard')}
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && <NotificationBell />}
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center gap-4 mb-3">
                  <button 
                    onClick={() => changeLanguage('FR')}
                    className={`text-sm ${currentLang === 'FR' ? 'text-[#1a56db] font-medium' : 'text-gray-600'}`}
                  >
                    FR
                  </button>
                  <button 
                    onClick={() => changeLanguage('EN')}
                    className={`text-sm ${currentLang === 'EN' ? 'text-[#1a56db] font-medium' : 'text-gray-600'}`}
                  >
                    EN
                  </button>
                </div>
                
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <div className="w-8 h-8 bg-[#1a56db] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <button 
                      onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                      className="w-full text-left text-gray-700 font-medium"
                    >
                      {t('header.dashboard')}
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
                      onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                      className="text-gray-700 font-medium"
                    >
                      {t('header.login')}
                    </button>
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Layout
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';

// Section components
import DashboardSection from './admin/DashboardSection';
import OffersSection from './admin/OffersSection';
import UniversitiesSection from './admin/UniversitiesSection';
import ScholarshipsSection from './admin/ScholarshipsSection';
import UsersSection from './admin/UsersSection';
import AgentsSection from './admin/AgentsSection';
import ApplicationsSection from './admin/ApplicationsSection';
import HousingSection from './admin/HousingSection';
import MessagesSection from './admin/MessagesSection';
import ChatsSection from './admin/ChatsSection';
import ContactsSection from './admin/ContactsSection';
import NewsletterSection from './admin/NewsletterSection';
import BlogSection from './admin/BlogSection';
import BannersSection from './admin/BannersSection';
import TestimonialsSection from './admin/TestimonialsSection';
import FaqSection from './admin/FaqSection';
import CommunitySection from './admin/CommunitySection';
import PaymentSettingsSection from './admin/PaymentSettingsSection';
import TermsSection from './admin/TermsSection';
import PagesSection from './admin/PagesSection';
import PartnersSection from './admin/PartnersSection';
import EmployersSection from './admin/EmployersSection';
import JobOffersAdminSection from './admin/JobOffersAdminSection';
import AdminCompaniesSection from './admin/AdminCompaniesSection';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const AdminCMS = ({ onClose }) => {
  const { user, token, logout, isPrincipalAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState('dashboard');
  const [badges, setBadges] = useState({});

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (err) { console.error('Error loading stats:', err); }
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleNavigate = (sectionId, options) => {
    setActiveSection(sectionId);
  };

  const handleBadgeUpdate = (key, value) => {
    setBadges(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection stats={stats} onNavigate={handleNavigate} />;
      case 'offers':
        return <OffersSection />;
      case 'universities':
        return <UniversitiesSection />;
      case 'scholarships':
        return <ScholarshipsSection onNavigate={handleNavigate} />;
      case 'users':
        return isPrincipalAdmin ? <UsersSection /> : null;
      case 'agents':
        return isPrincipalAdmin ? <AgentsSection onBadgeUpdate={handleBadgeUpdate} /> : null;
      case 'partners':
        return isPrincipalAdmin ? <PartnersSection onBadgeUpdate={handleBadgeUpdate} /> : null;
      case 'employers':
        return isPrincipalAdmin ? <EmployersSection /> : null;
      case 'job-offers-admin':
        return isPrincipalAdmin ? <JobOffersAdminSection /> : null;
      case 'companies-admin':
        return isPrincipalAdmin ? <AdminCompaniesSection /> : null;
      case 'applications':
        return <ApplicationsSection />;
      case 'housing':
        return <HousingSection />;
      case 'messages':
        return <MessagesSection />;
      case 'chats':
        return <ChatsSection onBadgeUpdate={handleBadgeUpdate} />;
      case 'contacts':
        return <ContactsSection />;
      case 'newsletter':
        return <NewsletterSection onBadgeUpdate={handleBadgeUpdate} />;
      case 'blog':
        return <BlogSection onBadgeUpdate={handleBadgeUpdate} />;
      case 'banners':
        return isPrincipalAdmin ? <BannersSection /> : null;
      case 'testimonials':
        return <TestimonialsSection />;
      case 'faqs':
        return <FaqSection />;
      case 'community':
        return <CommunitySection onBadgeUpdate={handleBadgeUpdate} />;
      case 'payment-settings':
        return isPrincipalAdmin ? <PaymentSettingsSection /> : null;
      case 'terms-conditions':
        return isPrincipalAdmin ? <TermsSection /> : null;
      case 'pages':
        return isPrincipalAdmin ? <PagesSection /> : null;
      default:
        return <DashboardSection stats={stats} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" data-testid="admin-cms">
      <AdminSidebar
        user={user}
        isPrincipalAdmin={isPrincipalAdmin}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        expandedGroup={expandedGroup}
        setExpandedGroup={setExpandedGroup}
        onSectionClick={handleSectionClick}
        onLogout={handleLogout}
        stats={stats}
        badges={badges}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader activeSection={activeSection} stats={stats} />

        <main className="flex-1 overflow-auto p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminCMS;

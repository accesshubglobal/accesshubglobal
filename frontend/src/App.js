import React, { useState } from "react";
import "./App.css";
import "./i18n";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProgramsSection from "./components/ProgramsSection";
import ServicesSection from "./components/ServicesSection";
import DestinationsSection from "./components/DestinationsSection";
import ScholarshipsSection from "./components/ScholarshipsSection";
import JobOffersSection from "./components/JobOffersSection";
import CompaniesSection from "./components/CompaniesSection";
import HousingSection from "./components/HousingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import UserDashboard from "./components/UserDashboard";
import AdminCMS from "./components/AdminCMS";
import LiveChat from "./components/LiveChat";
import BlogPage from "./components/BlogPage";
import BlogDetailPage from "./components/BlogDetailPage";
import CommunityPage from "./components/CommunityPage";
import CommunityPostPage from "./components/CommunityPostPage";
import AgentRegisterPage from "./components/AgentRegisterPage";
import PartnerRegisterPage from "./components/PartnerRegisterPage";
import EmployerRegisterPage from "./components/EmployerRegisterPage";
import PartnerDashboard from "./components/PartnerDashboard";
import AgentDashboard from "./components/AgentDashboard";
import EmployerDashboard from "./components/EmployerDashboard";
import UniversityDetailPage from "./components/UniversityDetailPage";
import UniversitiesListPage from "./components/UniversitiesListPage";
import JobOffersPage from "./pages/JobOffersPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import FeaturedCompanyPage from "./pages/FeaturedCompanyPage";
import PartnerLandingPage from "./pages/PartnerLandingPage";
import AboutPage from "./pages/AboutPage";
import CompanyInfoPage from "./pages/CompanyInfoPage";
import { LegalNoticePage, PrivacyPolicyPage, TermsOfUsePage } from "./pages/LegalPages";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireAgent = false, requireEmployer = false }) => {
  const { isAuthenticated, isAdmin, isAgent, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireAgent && !isAgent) {
    return <Navigate to="/" replace />;
  }

  if (requireEmployer && user?.role !== 'employeur') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { isAuthenticated } = useAuth();

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onOpenAuth={openAuth} />
      <HeroSection onOpenAuth={openAuth} />
      <ProgramsSection onOpenAuth={openAuth} />
      <ServicesSection />
      <DestinationsSection />
      <JobOffersSection />
      <CompaniesSection />
      <HousingSection />
      <TestimonialsSection onOpenAuth={openAuth} />
      <ContactSection />
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      
      {/* Live Chat */}
      <LiveChat onOpenAuth={openAuth} />
    </div>
  );
};

const DashboardPage = () => {
  return (
    <UserDashboard onClose={() => window.location.href = '/'} />
  );
};

const AdminPage = () => {
  return (
    <AdminCMS onClose={() => window.location.href = '/'} />
  );
};

const AgentPage = () => {
  return <AgentDashboard />;
};

const EmployerPage = () => {
  return <EmployerDashboard />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:id" element={<CommunityPostPage />} />
              <Route path="/agent/register" element={<AgentRegisterPage />} />
              <Route path="/partner/register" element={<PartnerRegisterPage />} />
              <Route path="/employer/register" element={<EmployerRegisterPage />} />
              <Route path="/rejoindre/:type" element={<PartnerLandingPage />} />
              <Route path="/partner" element={<PartnerDashboard />} />
              <Route path="/emploi" element={<JobOffersPage />} />
              <Route path="/companies/:employerId" element={<CompanyProfilePage />} />
              <Route path="/featured-companies/:companyId" element={<FeaturedCompanyPage />} />
              <Route path="/universities" element={<UniversitiesListPage />} />
              <Route path="/universities/:id" element={<UniversityDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/company" element={<CompanyInfoPage />} />
              <Route path="/legal" element={<LegalNoticePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfUsePage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agent" 
                element={
                  <ProtectedRoute requireAgent>
                    <AgentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer" 
                element={
                  <ProtectedRoute requireEmployer>
                    <EmployerPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;


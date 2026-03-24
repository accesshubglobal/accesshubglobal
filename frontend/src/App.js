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
import HousingSection from "./components/HousingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import UserDashboard from "./components/UserDashboard";
import AdminCMS from "./components/AdminCMS";
import LiveChat from "./components/LiveChat";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
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
      <ScholarshipsSection />
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

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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

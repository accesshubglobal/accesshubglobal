import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordResetModal from './PasswordResetModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) { setMode(initialMode); setError(''); setShowVerification(false); }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (mode === 'login') {
      result = await login(formData.email, formData.password);
      if (result.success) {
        // Check if email needs verification
        if (result.user?.emailVerified === false) {
          setVerificationEmail(formData.email);
          setShowVerification(true);
          setLoading(false);
          // Resend a verification code
          try { await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, { email: formData.email }); } catch(e) {}
          return;
        }
        onClose();
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
        if (result.user?.role === 'agent') navigate('/agent');
        else if (result.user?.role === 'partenaire') navigate('/partner');
        else if (result.user?.role === 'employeur') navigate('/employer');
      } else {
        setError(result.error);
      }
    } else {
      result = await register(formData);
      if (result.success) {
        // After registration, show verification screen
        setVerificationEmail(formData.email);
        setShowVerification(true);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    setVerificationError('');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/verify-email`, {
        email: verificationEmail,
        code: verificationCode,
      });
      // Refresh user data
      const loginResult = await login(formData.email, formData.password);
      setShowVerification(false);
      onClose();
      setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      setVerificationCode('');
      if (loginResult.user?.role === 'agent') navigate('/agent');
      else if (loginResult.user?.role === 'partenaire') navigate('/partner');
      else if (loginResult.user?.role === 'employeur') navigate('/employer');
    } catch (err) {
      setVerificationError(err.response?.data?.detail || 'Code invalide');
    }
    setVerificationLoading(false);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, { email: verificationEmail });
      setResendCooldown(60);
    } catch (err) { setVerificationError('Erreur lors du renvoi'); }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  // Email Verification Screen
  if (showVerification) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">Verification de votre email</h2>
            <p className="text-white/70 text-sm mt-1">Un code a ete envoye a <strong>{verificationEmail}</strong></p>
          </div>
          <form onSubmit={handleVerify} className="p-6 space-y-4" data-testid="email-verification-form">
            {verificationError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="verification-error">{verificationError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code de verification (6 chiffres)</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-bold tracking-[12px] focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                maxLength={6}
                required
                data-testid="verification-code-input"
              />
            </div>
            <button type="submit" disabled={verificationLoading || verificationCode.length !== 6}
              className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="verify-email-btn">
              {verificationLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verifier'}
            </button>
            <div className="text-center">
              <button type="button" onClick={handleResendCode} disabled={resendCooldown > 0}
                className="text-sm text-[#1e3a5f] hover:underline disabled:text-gray-400 disabled:no-underline"
                data-testid="resend-code-btn">
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a56db] to-[#3b82f6] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <p className="text-blue-100 mt-1">
            {mode === 'login' 
              ? 'Connectez-vous a votre compte AccessHub Global'
              : 'Creez votre compte pour acceder a nos services'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="auth-form">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm" data-testid="auth-error">{error}</div>
          )}

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Prenom" value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
                  required data-testid="register-firstname" />
              </div>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Nom" value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
                  required data-testid="register-lastname" />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Adresse email" value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
              required data-testid="auth-email" />
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="Telephone (optionnel)" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
                data-testid="register-phone" />
            </div>
          )}

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
              required minLength={6} data-testid="auth-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowPasswordReset(true)}
                className="text-sm text-[#1a56db] hover:underline" data-testid="forgot-password-btn">
                Mot de passe oublie?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} data-testid="auth-submit-btn"
            className="w-full bg-[#1a56db] hover:bg-[#1648b8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={20} className="animate-spin" /> : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
          </button>

          <div className="text-center text-sm text-gray-600">
            {mode === 'login' ? (
              <>Pas encore de compte?{' '}
                <button type="button" onClick={switchMode} className="text-[#1a56db] font-medium hover:underline">S'inscrire</button>
              </>
            ) : (
              <>Deja un compte?{' '}
                <button type="button" onClick={switchMode} className="text-[#1a56db] font-medium hover:underline">Se connecter</button>
              </>
            )}
          </div>
        </form>
      </div>
      
      <PasswordResetModal 
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onBackToLogin={() => { setShowPasswordReset(false); setMode('login'); }}
      />
    </div>
  );
};

export default AuthModal;

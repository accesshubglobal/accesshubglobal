import React, { useState } from 'react';
import { X, Mail, Lock, ArrowLeft, Check, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PasswordResetModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/password-reset-request`, { email });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.get(`${BACKEND_URL}/api/auth/password-reset-verify/${code}`);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'Code invalide ou expire');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caracteres'); return; }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/password-reset`, { token: code, newPassword });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" data-testid="password-reset-modal">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] p-6 text-white">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24} /></button>
          <div className="flex items-center gap-3">
            {step !== 'request' && step !== 'success' && (
              <button onClick={() => setStep(step === 'reset' ? 'verify' : 'request')} className="text-white/80 hover:text-white">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold">
                {step === 'request' && 'Mot de passe oublie'}
                {step === 'verify' && 'Entrez le code'}
                {step === 'reset' && 'Nouveau mot de passe'}
                {step === 'success' && 'Mot de passe modifie'}
              </h2>
              <p className="text-white/70 text-sm mt-0.5">
                {step === 'request' && 'Entrez votre email pour recevoir un code'}
                {step === 'verify' && `Un code a ete envoye a ${email}`}
                {step === 'reset' && 'Choisissez votre nouveau mot de passe'}
                {step === 'success' && 'Vous pouvez maintenant vous connecter'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4" data-testid="reset-error">{error}</div>
          )}

          {/* Step 1: Request */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4" data-testid="reset-request-form">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Votre adresse email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  data-testid="reset-email-input" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="reset-request-btn">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer le code'}
              </button>
              <button type="button" onClick={onBackToLogin}
                className="w-full text-sm text-gray-500 hover:text-[#1e3a5f]">
                Retour a la connexion
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4" data-testid="reset-verify-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code de reinitialisation</label>
                <input type="text" value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-bold tracking-[12px] focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  maxLength={6} required data-testid="reset-code-input" />
              </div>
              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="reset-verify-btn">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verifier le code'}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4" data-testid="reset-password-form">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe" required minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  data-testid="reset-new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe" required minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  data-testid="reset-confirm-password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="reset-submit-btn">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Changer le mot de passe'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-4" data-testid="reset-success">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">Votre mot de passe a ete modifie avec succes.</p>
              <button onClick={() => { handleClose(); if (onBackToLogin) onBackToLogin(); }}
                className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg font-medium hover:opacity-90"
                data-testid="reset-back-to-login-btn">
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;

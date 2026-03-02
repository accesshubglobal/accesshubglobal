import React, { useState } from 'react';
import { X, Mail, Lock, ArrowLeft, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PasswordResetModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [step, setStep] = useState('request'); // request, verify, reset, success
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState(''); // For dev mode only

  if (!isOpen) return null;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/password-reset-request`, {
        email
      });
      
      // Store dev token if provided (dev mode only)
      if (response.data.dev_token) {
        setDevToken(response.data.dev_token);
        setToken(response.data.dev_token);
      }
      
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.get(`${BACKEND_URL}/api/auth/password-reset-verify/${token}`);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'Token invalide ou expiré');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/password-reset`, {
        token,
        newPassword
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setDevToken('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a56db] to-[#1e40af] px-6 py-8 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold mb-1">
            {step === 'request' && 'Mot de passe oublié ?'}
            {step === 'verify' && 'Vérification'}
            {step === 'reset' && 'Nouveau mot de passe'}
            {step === 'success' && 'Succès !'}
          </h2>
          <p className="text-blue-100 text-sm">
            {step === 'request' && 'Entrez votre email pour réinitialiser'}
            {step === 'verify' && 'Entrez le code reçu par email'}
            {step === 'reset' && 'Créez votre nouveau mot de passe'}
            {step === 'success' && 'Votre mot de passe a été mis à jour'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Request */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Envoyer le lien'
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-sm text-gray-500 hover:text-[#1a56db] flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </button>
            </form>
          )}

          {/* Step 2: Verify Token */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              {devToken && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800">Mode développement</p>
                  <p className="text-yellow-700 text-xs mt-1">Token: {devToken}</p>
                </div>
              )}

              <p className="text-gray-600 text-sm">
                Un code de vérification a été envoyé à <strong>{email}</strong>
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Code de vérification"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] transition-colors text-center tracking-widest font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Vérifier'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-sm text-gray-500 hover:text-[#1a56db] flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16} />
                Renvoyer le code
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Réinitialiser'
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button
                onClick={onBackToLogin}
                className="w-full py-3 bg-[#1a56db] hover:bg-[#1648b8] text-white font-semibold rounded-xl transition-colors"
              >
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

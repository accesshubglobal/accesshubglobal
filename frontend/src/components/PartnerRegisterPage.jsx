import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Handshake, Eye, EyeOff, ArrowLeft, Building2, Key, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const PartnerRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    confirmPassword: '', company: '', website: '', activationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('register');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    if (!form.activationCode.trim()) { setError("Le code d'activation est requis"); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/register-partner`, {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone,
        password: form.password, company: form.company,
        website: form.website, activationCode: form.activationCode,
      });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationError('');
    try {
      await axios.post(`${API}/auth/verify-email`, { email: form.email, code: verificationCode });
      setStep('success');
      setTimeout(async () => {
        const result = await login(form.email, form.password);
        if (result.success) navigate('/partner');
      }, 2000);
    } catch (err) {
      setVerificationError(err.response?.data?.detail || 'Code invalide');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post(`${API}/auth/resend-verification`, { email: form.email });
      setResendCooldown(60);
    } catch (e) {}
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">Vérification de votre email</h2>
            <p className="text-white/70 text-sm mt-1">Un code a été envoyé à <strong>{form.email}</strong></p>
          </div>
          <form onSubmit={handleVerify} className="p-6 space-y-4" data-testid="partner-verify-form">
            {verificationError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{verificationError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code de vérification (6 chiffres)</label>
              <input type="text" value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-bold tracking-[12px] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                maxLength={6} required data-testid="partner-verify-code" />
            </div>
            <button type="submit" disabled={loading || verificationCode.length !== 6}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="partner-verify-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
            </button>
            <div className="text-center">
              <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                className="text-sm text-emerald-700 hover:underline disabled:text-gray-400">
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center" data-testid="partner-register-success">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h2>
          <p className="text-gray-600 mb-2">Votre email a été vérifié et votre compte partenaire a été créé.</p>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
            Votre compte est en attente d'approbation par un administrateur. Vous serez redirigé automatiquement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 text-white">
          <Link to="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft size={16} /> Retour au site
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Espace Partenaire</h1>
              <p className="text-white/70 text-sm">Créez votre compte partenaire AccessHub Global</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="partner-register-form">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-200" data-testid="partner-register-error">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                data-testid="partner-firstname" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                data-testid="partner-lastname" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              data-testid="partner-email" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                data-testid="partner-phone" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Établissement / Université</label>
              <input name="company" value={form.company} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                data-testid="partner-company" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Site web</label>
            <input name="website" type="url" value={form.website} onChange={handleChange}
              placeholder="https://www.exemple.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              data-testid="partner-website" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe *</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10"
                data-testid="partner-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <PasswordStrengthIndicator password={form.password} />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirmer le mot de passe *</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              data-testid="partner-confirm-password" />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <label className="flex items-center gap-2 text-xs font-medium text-emerald-800 mb-2">
              <Key size={14} /> Code d'activation partenaire *
            </label>
            <input name="activationCode" value={form.activationCode} onChange={handleChange} required
              placeholder="Ex: PA-XXXXXXXX"
              className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 font-mono tracking-wider"
              data-testid="partner-activation-code" />
            <p className="text-[11px] text-emerald-600 mt-1">Ce code vous est fourni par AccessHub Global</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="partner-register-submit">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Inscription en cours...</> : 'Créer mon compte partenaire'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ? <Link to="/" className="text-emerald-700 font-medium hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PartnerRegisterPage;

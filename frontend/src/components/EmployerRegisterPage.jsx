import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, ArrowLeft, Building2, Key, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const EmployerRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    confirmPassword: '', company: '', activationCode: ''
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
    if (!form.company.trim()) { setError("Le nom de l'entreprise est requis"); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/register-employer`, {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone,
        password: form.password, company: form.company,
        activationCode: form.activationCode,
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
        if (result.success) navigate('/employer');
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

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] to-[#1a3a6b] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-600">Votre compte est en cours de validation par l'équipe AccessHub. Vous serez redirigé automatiquement.</p>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] to-[#1a3a6b] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-[#1a56db]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Vérification email</h2>
            <p className="text-sm text-gray-500 mt-1">Code envoyé à <strong>{form.email}</strong></p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text" maxLength={6} placeholder="Code à 6 chiffres"
              value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#1a56db]"
              data-testid="verification-code-input"
            />
            {verificationError && <p className="text-red-500 text-sm text-center">{verificationError}</p>}
            <button type="submit" disabled={loading || verificationCode.length < 6}
              className="w-full py-3 bg-[#1a56db] text-white rounded-xl font-semibold hover:bg-[#1648b8] disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="verify-submit-btn">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Vérifier mon email
            </button>
            <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
              className="w-full text-sm text-[#1a56db] hover:underline disabled:text-gray-400">
              {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] via-[#1a3a6b] to-[#0f1f3d] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} /> Retour au site
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a56db] to-[#2a5298] p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Partenaires d'emploi</h1>
                <p className="text-blue-200 text-sm">Publiez vos offres d'emploi sur AccessHub Global</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {['Publiez des offres', 'Gérez les candidatures', 'Touchez nos talents'].map((t, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-2 text-center text-xs">{t}</div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                    data-testid="employer-firstname" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                    data-testid="employer-lastname" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Entreprise *</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input name="company" value={form.company} onChange={handleChange} required
                    placeholder="Nom de votre entreprise"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                    data-testid="employer-company" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email professionnel *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                  data-testid="employer-email" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                  data-testid="employer-phone" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Code d'activation *</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input name="activationCode" value={form.activationCode} onChange={handleChange} required
                    placeholder="EM-XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm font-mono uppercase"
                    data-testid="employer-activation-code" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Code fourni par l'équipe AccessHub Global</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm pr-10"
                      data-testid="employer-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer *</label>
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a56db] text-sm"
                    data-testid="employer-confirm-password" />
                </div>
              </div>
              <PasswordStrengthIndicator password={form.password} />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#1a56db] to-[#2a5298] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="employer-register-submit">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Briefcase size={18} />}
                Créer mon compte employeur
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              Déjà un compte ?{' '}
              <button onClick={() => navigate('/')} className="text-[#1a56db] hover:underline">Se connecter</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerRegisterPage;

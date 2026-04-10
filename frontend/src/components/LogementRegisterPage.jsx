import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home2, Eye, EyeOff, ArrowLeft, Building2, Loader2, CheckCircle, Upload, Home } from 'lucide-react';
import axios from 'axios';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;
const inp = "w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm transition-colors";
const label = "block text-sm font-medium text-white/70 mb-1.5";

const LogementRegisterPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', companyName: '', companyDoc: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('register');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) { const t = setTimeout(() => setCooldown(cooldown - 1), 1000); return () => clearTimeout(t); }
  }, [cooldown]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${API}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('companyDoc', r.data.url);
    } catch { setError('Erreur upload document'); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Mot de passe trop court (min. 6 caractères)'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/logement/register`, {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone,
        password: form.password, companyName: form.companyName, companyDoc: form.companyDoc,
      });
      setStep('verify');
    } catch (err) { setError(err.response?.data?.detail || "Erreur lors de l'inscription"); }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setCodeError('');
    try {
      await axios.post(`${API}/auth/verify-email`, { email: form.email, token: code });
      setStep('success');
    } catch (err) { setCodeError(err.response?.data?.detail || 'Code invalide'); }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try { await axios.post(`${API}/auth/resend-verification`, { email: form.email }); setCooldown(60); }
    catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#050d1a' }}>
      {/* Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" style={{ backgroundColor: '#0891b2' }} />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#0e7490', animation: 'pulse 4s ease-in-out 1s infinite' }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-10">
        <button onClick={() => navigate('/rejoindre/logement')} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft size={15} /> Retour
        </button>

        {step === 'register' && (
          <div className="rounded-3xl border border-white/10 p-8" style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(8,145,178,0.2)' }}>
                <Home size={20} style={{ color: '#0891b2' }} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Partenaire Logement</h1>
                <p className="text-white/40 text-xs">Créez votre espace partenaire</p>
              </div>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Prénom *</label><input className={inp} value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></div>
                <div><label className={label}>Nom *</label><input className={inp} value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></div>
              </div>
              <div><label className={label}>Email *</label><input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} required /></div>
              <div><label className={label}>Téléphone</label><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (000) 000-0000" /></div>
              <div><label className={label}>Nom de l'agence / résidence</label><input className={inp} value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Ex: Résidence Les Étudiants" /></div>

              {/* Doc upload */}
              <div>
                <label className={label}>Document justificatif (optionnel)</label>
                <input type="file" ref={fileRef} className="hidden" accept=".pdf,.doc,.docx,image/*" onChange={handleDocUpload} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 text-sm transition-all">
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {form.companyDoc ? '✓ Document chargé' : 'Ajouter un document'}
                </button>
              </div>

              <div><label className={label}>Mot de passe *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className={`${inp} pr-10`} value={form.password} onChange={e => set('password', e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="px-1">
                <PasswordStrengthIndicator password={form.password} />
              </div>
              <div><label className={label}>Confirmer mot de passe *</label><input type="password" className={inp} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required /></div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base mt-2 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: '#0891b2' }}>
                {loading ? <Loader2 size={17} className="animate-spin" /> : <><CheckCircle size={17} /> Créer mon compte</>}
              </button>

              <p className="text-center text-white/30 text-sm">Déjà inscrit ? <button type="button" onClick={() => navigate('/')} className="text-cyan-400 hover:underline">Se connecter</button></p>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <div className="rounded-3xl border border-white/10 p-8 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(8,145,178,0.2)' }}>
              <CheckCircle size={28} style={{ color: '#0891b2' }} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Vérifiez votre email</h2>
            <p className="text-white/50 text-sm mb-6">Un code de vérification a été envoyé à <span className="text-cyan-400">{form.email}</span></p>
            {codeError && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{codeError}</div>}
            <form onSubmit={handleVerify} className="space-y-4">
              <input value={code} onChange={e => setCode(e.target.value)} className={`${inp} text-center text-2xl tracking-widest`} placeholder="••••••" maxLength={8} required />
              <button type="submit" className="w-full py-3 rounded-2xl text-white font-bold" style={{ backgroundColor: '#0891b2' }}>Vérifier</button>
            </form>
            <button onClick={handleResend} disabled={cooldown > 0} className="mt-4 text-sm text-white/40 hover:text-white disabled:opacity-40">
              {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer le code'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="rounded-3xl border border-white/10 p-8 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#0891b2' }} />
            <h2 className="text-2xl font-black text-white mb-3">Compte créé !</h2>
            <p className="text-white/50 mb-6">Votre compte est en attente d'approbation par notre équipe. Vous serez notifié par email.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ backgroundColor: '#0891b2' }}>Retour à l'accueil</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogementRegisterPage;

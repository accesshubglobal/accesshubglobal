import React, { useState, useEffect, useRef } from 'react';
import {
  Users, FileText, MessageCircle, BarChart3, Plus, Trash2, Edit3, Eye,
  LogOut, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Send,
  GraduationCap, Heart, Star, Search, X, Loader2, Home, Building2,
  Download, ChevronLeft, ChevronDown, User, BookOpen, Briefcase,
  Activity, Globe, Shield, MapPin, Phone, Upload, Key, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardShell, { StatCard, GlassPanel, AccentBtn } from './DashboardShell';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const ACCENT = '#3b82f6';
const API = `${BACKEND_URL}/api`;

// ── Shared form helpers ───────────────────────────────────────────────────────
const Field = ({ label, required, children, half }) => (
  <div className={half ? '' : 'col-span-2 sm:col-span-1'}>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);
const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f] text-sm";
const sel = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f] text-sm bg-white";

const SectionHeader = ({ icon: Icon, title, color = 'bg-[#1e3a5f]' }) => (
  <div className={`flex items-center gap-2 px-4 py-2.5 ${color} text-white rounded-xl mb-4 mt-6`}>
    {Icon && <Icon size={15} />}
    <span className="font-semibold text-sm">{title}</span>
  </div>
);

const defaultEdu = { instituteName: '', yearsFrom: '', yearsTo: '', fieldOfStudy: '', educationLevel: '' };
const defaultWork = { companyName: '', position: '', industryType: '', yearsFrom: '', yearsTo: '', contactPerson: '', contactPhone: '', contactEmail: '' };
const defaultFamily = { name: '', nationality: '', dob: '', idNo: '', mobile: '', email: '', occupation: '', employer: '' };

const EMPTY_STUDENT = {
  firstName: '', lastName: '', email: '', phone: '',
  sex: '', dateOfBirth: '', nationality: '', countryOfBirth: '', placeOfBirth: '',
  nativeLanguage: '', religion: '', maritalStatus: '', occupation: '', hobby: '',
  highestEducation: '', majorInChina: '', currentEmployer: '', personalEmail: '',
  address: '', addressDetailed: '', addressPhone: '', zipCode: '',
  currentAddress: '', currentAddressDetailed: '', currentAddressPhone: '', currentAddressZipCode: '',
  bloodGroup: '', height: '', weight: '',
  inChinaNow: false, chinaSchool: '', chinaLearningPeriodStart: '', chinaLearningPeriodEnd: '',
  chinaVisaType: '', chinaVisaNo: '', chinaVisaExpiry: '',
  passportNumber: '', passportIssuedDate: '', passportExpiryDate: '',
  oldPassportNo: '', oldPassportIssuedDate: '', oldPassportExpiryDate: '',
  educationalBackground: [{ ...defaultEdu }, { ...defaultEdu }, { ...defaultEdu }],
  workExperience: [{ ...defaultWork }, { ...defaultWork }],
  fatherInfo: { ...defaultFamily },
  motherInfo: { ...defaultFamily },
  spouseInfo: { ...defaultFamily },
  financialSponsor: { relationship: '', address: '' },
  emergencyContact: { name: '', relationship: '', occupation: '', nationality: '', idNo: '', employer: '', addressChina: '', phone: '', email: '' },
};

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  pending: { label: 'En attente', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  approved: { label: 'Approuvée', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejetée', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  processing: { label: 'En cours', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: AlertCircle },
  modify: { label: 'À modifier', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: AlertCircle },
};

// ── Student Form Modal (full profile, identical to application form) ───────────
const StudentFormModal = ({ student, onClose, onSave, loading }) => {
  const [form, setForm] = useState(student ? { ...EMPTY_STUDENT, ...student } : { ...EMPTY_STUDENT });
  const [step, setStep] = useState(1);
  const [missing, setMissing] = useState(new Set()); // tracks missing required fields
  const [stepErr, setStepErr] = useState('');

  const STEPS = [
    { id: 1, label: 'Identité', icon: User },
    { id: 2, label: 'Résidence', icon: MapPin },
    { id: 3, label: 'Santé & Chine', icon: Activity },
    { id: 4, label: 'Passeport', icon: Shield },
    { id: 5, label: 'Scolarité', icon: BookOpen },
    { id: 6, label: 'Travail', icon: Briefcase },
    { id: 7, label: 'Famille', icon: Users },
  ];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNested = (parent, k, v) => setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }));
  const setArray = (key, idx, field, val) => setForm(f => {
    const arr = [...f[key]]; arr[idx] = { ...arr[idx], [field]: val }; return { ...f, [key]: arr };
  });

  // ── Per-step validation ────────────────────────────────────────────────────
  const validateStep = (s) => {
    const m = new Set();

    if (s === 1) {
      ['firstName','lastName','email','phone','sex','dateOfBirth','nationality',
       'countryOfBirth','placeOfBirth','nativeLanguage','religion','maritalStatus',
       'highestEducation','occupation','personalEmail','majorInChina','hobby'
      ].forEach(k => { if (!form[k]?.toString().trim()) m.add(k); });
    }

    if (s === 2) {
      ['address','addressDetailed','addressPhone','zipCode',
       'currentAddress','currentAddressDetailed','currentAddressPhone','currentAddressZipCode'
      ].forEach(k => { if (!form[k]?.toString().trim()) m.add(k); });
    }

    if (s === 3) {
      ['bloodGroup','height','weight'
      ].forEach(k => { if (!form[k]?.toString().trim()) m.add(k); });
    }

    if (s === 4) {
      ['passportNumber','passportIssuedDate','passportExpiryDate'
      ].forEach(k => { if (!form[k]?.toString().trim()) m.add(k); });
    }

    if (s === 5) {
      (form.educationalBackground || []).forEach((edu, i) => {
        ['instituteName','fieldOfStudy','educationLevel','yearsFrom','yearsTo'].forEach(f => {
          if (!edu[f]?.toString().trim()) m.add(`edu_${i}_${f}`);
        });
      });
    }

    if (s === 7) {
      ['fatherInfo','motherInfo'].forEach(parent => {
        ['name','nationality','dob','idNo','mobile','occupation'].forEach(f => {
          if (!form[parent]?.[f]?.toString().trim()) m.add(`${parent}_${f}`);
        });
      });
      ['name','relationship','nationality','phone','email','addressChina'].forEach(f => {
        if (!form.emergencyContact?.[f]?.toString().trim()) m.add(`emergency_${f}`);
      });
    }

    return m;
  };

  const goNext = () => {
    const currentStep = step;
    const m = validateStep(currentStep);
    if (m.size > 0) {
      setMissing(m);
      setStepErr(`Veuillez remplir tous les champs obligatoires (${m.size} manquant${m.size > 1 ? 's' : ''}).`);
      return;
    }
    setMissing(new Set());
    setStepErr('');
    if (currentStep >= STEPS.length) {
      // Final step: save directly to avoid browser auto-submitting form
      // when button type dynamically changes from "button" to "submit"
      onSave(form);
    } else {
      setStep(s => Math.min(STEPS.length, s + 1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Defensive: validate final step if form is submitted via native form submit
    const m = validateStep(step);
    if (m.size > 0) {
      setMissing(m);
      setStepErr(`Veuillez remplir tous les champs obligatoires (${m.size} manquant${m.size > 1 ? 's' : ''}).`);
      return;
    }
    onSave(form);
  };

  // Helper: border turns red if the field is missing
  const fi = (key) => `${inp} ${missing.has(key) ? 'border-red-400 bg-red-50 focus:border-red-500' : ''}`;
  const si = (key) => `${sel} ${missing.has(key) ? 'border-red-400 bg-red-50 focus:border-red-500' : ''}`;
  const fiArr = (arrKey, i, f) => {
    const key = `${arrKey}_${i}_${f}`;
    return `${inp} ${missing.has(key) ? 'border-red-400 bg-red-50 focus:border-red-500' : ''}`;
  };
  const siArr = (arrKey, i, f) => {
    const key = `${arrKey}_${i}_${f}`;
    return `${sel} ${missing.has(key) ? 'border-red-400 bg-red-50 focus:border-red-500' : ''}`;
  };
  const fiNested = (parent, f) => {
    const key = `${parent}_${f}`;
    return `${inp} ${missing.has(key) ? 'border-red-400 bg-red-50 focus:border-red-500' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900">{student ? 'Modifier' : 'Ajouter'} un étudiant</h3>
            <p className="text-xs text-gray-500 mt-0.5">Profil complet utilisé pour les candidatures</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X size={18} /></button>
        </div>

        {/* Steps */}
        <div className="flex gap-1 px-6 py-3 border-b border-gray-100 overflow-x-auto flex-shrink-0">
          {STEPS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setStep(s.id)} type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${step === s.id ? 'bg-[#1e3a5f] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Icon size={12} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">

            {/* Error banner */}
            {stepErr && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                {stepErr}
              </div>
            )}

            {/* Step 1 — Identité */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" required><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className={fi('firstName')} /></Field>
                  <Field label="Nom" required><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className={fi('lastName')} /></Field>
                  <Field label="Email" required><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={fi('email')} /></Field>
                  <Field label="Téléphone" required><input value={form.phone} onChange={e => set('phone', e.target.value)} className={fi('phone')} /></Field>
                  <Field label="Sexe" required>
                    <select value={form.sex} onChange={e => set('sex', e.target.value)} className={si('sex')}>
                      <option value="">--</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </Field>
                  <Field label="Date de naissance" required><input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={fi('dateOfBirth')} /></Field>
                  <Field label="Nationalité" required><input value={form.nationality} onChange={e => set('nationality', e.target.value)} className={fi('nationality')} /></Field>
                  <Field label="Pays de naissance" required><input value={form.countryOfBirth} onChange={e => set('countryOfBirth', e.target.value)} className={fi('countryOfBirth')} /></Field>
                  <Field label="Lieu de naissance" required><input value={form.placeOfBirth} onChange={e => set('placeOfBirth', e.target.value)} className={fi('placeOfBirth')} /></Field>
                  <Field label="Langue maternelle" required><input value={form.nativeLanguage} onChange={e => set('nativeLanguage', e.target.value)} className={fi('nativeLanguage')} /></Field>
                  <Field label="Religion" required><input value={form.religion} onChange={e => set('religion', e.target.value)} className={fi('religion')} /></Field>
                  <Field label="Situation matrimoniale" required>
                    <select value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} className={si('maritalStatus')}>
                      <option value="">--</option>
                      <option>Célibataire</option><option>Marié(e)</option><option>Divorcé(e)</option><option>Veuf/Veuve</option>
                    </select>
                  </Field>
                  <Field label="Niveau d'études le plus élevé" required>
                    <select value={form.highestEducation} onChange={e => set('highestEducation', e.target.value)} className={si('highestEducation')}>
                      <option value="">--</option>
                      <option>Baccalauréat</option><option>Licence</option><option>Master</option><option>Doctorat</option><option>Autre</option>
                    </select>
                  </Field>
                  <Field label="Profession actuelle" required><input value={form.occupation} onChange={e => set('occupation', e.target.value)} className={fi('occupation')} /></Field>
                  <Field label="Employeur actuel"><input value={form.currentEmployer} onChange={e => set('currentEmployer', e.target.value)} className={inp} placeholder="Optionnel" /></Field>
                  <Field label="Email personnel" required><input type="email" value={form.personalEmail} onChange={e => set('personalEmail', e.target.value)} className={fi('personalEmail')} /></Field>
                  <Field label="Domaine souhaité en Chine" required><input value={form.majorInChina} onChange={e => set('majorInChina', e.target.value)} className={fi('majorInChina')} /></Field>
                  <Field label="Hobbies / Loisirs" required><input value={form.hobby} onChange={e => set('hobby', e.target.value)} className={fi('hobby')} /></Field>
                </div>
              </>
            )}

            {/* Step 2 — Résidence */}
            {step === 2 && (
              <>
                <SectionHeader icon={MapPin} title="Adresse permanente" color="bg-blue-700" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pays / Ville" required><input value={form.address} onChange={e => set('address', e.target.value)} className={fi('address')} /></Field>
                  <Field label="Rue / Quartier" required><input value={form.addressDetailed} onChange={e => set('addressDetailed', e.target.value)} className={fi('addressDetailed')} /></Field>
                  <Field label="Téléphone domicile" required><input value={form.addressPhone} onChange={e => set('addressPhone', e.target.value)} className={fi('addressPhone')} /></Field>
                  <Field label="Code postal" required><input value={form.zipCode} onChange={e => set('zipCode', e.target.value)} className={fi('zipCode')} /></Field>
                </div>
                <SectionHeader icon={MapPin} title="Adresse actuelle (si différente)" color="bg-indigo-700" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pays / Ville" required><input value={form.currentAddress} onChange={e => set('currentAddress', e.target.value)} className={fi('currentAddress')} /></Field>
                  <Field label="Rue / Quartier" required><input value={form.currentAddressDetailed} onChange={e => set('currentAddressDetailed', e.target.value)} className={fi('currentAddressDetailed')} /></Field>
                  <Field label="Téléphone" required><input value={form.currentAddressPhone} onChange={e => set('currentAddressPhone', e.target.value)} className={fi('currentAddressPhone')} /></Field>
                  <Field label="Code postal" required><input value={form.currentAddressZipCode} onChange={e => set('currentAddressZipCode', e.target.value)} className={fi('currentAddressZipCode')} /></Field>
                </div>
              </>
            )}

            {/* Step 3 — Santé & Chine */}
            {step === 3 && (
              <>
                <SectionHeader icon={Activity} title="État de santé" color="bg-green-700" />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Groupe sanguin" required><select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className={si('bloodGroup')}>
                    <option value="">--</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                  </select></Field>
                  <Field label="Taille (cm)" required><input type="number" value={form.height} onChange={e => set('height', e.target.value)} className={fi('height')} placeholder="170" /></Field>
                  <Field label="Poids (kg)" required><input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} className={fi('weight')} placeholder="65" /></Field>
                </div>
                <SectionHeader icon={Globe} title="Séjour en Chine" color="bg-red-700" />
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input type="checkbox" checked={form.inChinaNow} onChange={e => set('inChinaNow', e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Actuellement en Chine</span>
                </label>
                {form.inChinaNow && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Établissement"><input value={form.chinaSchool} onChange={e => set('chinaSchool', e.target.value)} className={inp} /></Field>
                    <Field label="Type de visa"><input value={form.chinaVisaType} onChange={e => set('chinaVisaType', e.target.value)} className={inp} /></Field>
                    <Field label="N° de visa"><input value={form.chinaVisaNo} onChange={e => set('chinaVisaNo', e.target.value)} className={inp} /></Field>
                    <Field label="Expiration visa"><input type="date" value={form.chinaVisaExpiry} onChange={e => set('chinaVisaExpiry', e.target.value)} className={inp} /></Field>
                    <Field label="Période de début"><input type="date" value={form.chinaLearningPeriodStart} onChange={e => set('chinaLearningPeriodStart', e.target.value)} className={inp} /></Field>
                    <Field label="Période de fin"><input type="date" value={form.chinaLearningPeriodEnd} onChange={e => set('chinaLearningPeriodEnd', e.target.value)} className={inp} /></Field>
                  </div>
                )}
              </>
            )}

            {/* Step 4 — Passeport */}
            {step === 4 && (
              <>
                <SectionHeader icon={Shield} title="Passeport actuel" color="bg-purple-700" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Numéro" required><input value={form.passportNumber} onChange={e => set('passportNumber', e.target.value)} className={fi('passportNumber')} /></Field>
                  <Field label="Date d'émission" required><input type="date" value={form.passportIssuedDate} onChange={e => set('passportIssuedDate', e.target.value)} className={fi('passportIssuedDate')} /></Field>
                  <Field label="Date d'expiration" required><input type="date" value={form.passportExpiryDate} onChange={e => set('passportExpiryDate', e.target.value)} className={fi('passportExpiryDate')} /></Field>
                </div>
                <SectionHeader icon={Shield} title="Ancien passeport (si applicable)" color="bg-gray-600" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Numéro"><input value={form.oldPassportNo} onChange={e => set('oldPassportNo', e.target.value)} className={inp} /></Field>
                  <Field label="Date d'émission"><input type="date" value={form.oldPassportIssuedDate} onChange={e => set('oldPassportIssuedDate', e.target.value)} className={inp} /></Field>
                  <Field label="Date d'expiration"><input type="date" value={form.oldPassportExpiryDate} onChange={e => set('oldPassportExpiryDate', e.target.value)} className={inp} /></Field>
                </div>
              </>
            )}

            {/* Step 5 — Scolarité */}
            {step === 5 && (
              <>
                {(form.educationalBackground || []).map((edu, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                      École {i + 1} <span className="text-red-500 font-bold">*</span>
                      <span className="text-gray-400 font-normal normal-case">— tous les champs obligatoires</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Établissement" required><input value={edu.instituteName} onChange={e => setArray('educationalBackground', i, 'instituteName', e.target.value)} className={fiArr('edu', i, 'instituteName')} /></Field>
                      <Field label="Domaine d'études" required><input value={edu.fieldOfStudy} onChange={e => setArray('educationalBackground', i, 'fieldOfStudy', e.target.value)} className={fiArr('edu', i, 'fieldOfStudy')} /></Field>
                      <Field label="Niveau" required>
                        <select value={edu.educationLevel} onChange={e => setArray('educationalBackground', i, 'educationLevel', e.target.value)} className={siArr('edu', i, 'educationLevel')}>
                          <option value="">--</option>
                          <option>Lycée</option><option>Licence</option><option>Master</option><option>Doctorat</option>
                        </select>
                      </Field>
                      <Field label="De (année)" required><input value={edu.yearsFrom} onChange={e => setArray('educationalBackground', i, 'yearsFrom', e.target.value)} className={fiArr('edu', i, 'yearsFrom')} placeholder="2018" /></Field>
                      <Field label="À (année)" required><input value={edu.yearsTo} onChange={e => setArray('educationalBackground', i, 'yearsTo', e.target.value)} className={fiArr('edu', i, 'yearsTo')} placeholder="2022" /></Field>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Step 6 — Travail */}
            {step === 6 && (
              <>
                {(form.workExperience || []).map((w, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Expérience {i + 1} <span className="font-normal text-gray-400 normal-case">(optionnelle)</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Entreprise"><input value={w.companyName} onChange={e => setArray('workExperience', i, 'companyName', e.target.value)} className={inp} /></Field>
                      <Field label="Poste"><input value={w.position} onChange={e => setArray('workExperience', i, 'position', e.target.value)} className={inp} /></Field>
                      <Field label="Secteur"><input value={w.industryType} onChange={e => setArray('workExperience', i, 'industryType', e.target.value)} className={inp} /></Field>
                      <Field label="De"><input value={w.yearsFrom} onChange={e => setArray('workExperience', i, 'yearsFrom', e.target.value)} className={inp} placeholder="2020" /></Field>
                      <Field label="À"><input value={w.yearsTo} onChange={e => setArray('workExperience', i, 'yearsTo', e.target.value)} className={inp} placeholder="2024" /></Field>
                      <Field label="Contact (nom)"><input value={w.contactPerson} onChange={e => setArray('workExperience', i, 'contactPerson', e.target.value)} className={inp} /></Field>
                      <Field label="Contact (tél.)"><input value={w.contactPhone} onChange={e => setArray('workExperience', i, 'contactPhone', e.target.value)} className={inp} /></Field>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Step 7 — Famille */}
            {step === 7 && (
              <>
                {[
                  { key: 'fatherInfo', label: 'Père', required: true },
                  { key: 'motherInfo', label: 'Mère', required: true },
                  { key: 'spouseInfo', label: 'Conjoint(e)', required: false },
                ].map(({ key, label, required: isReq }) => (
                  <div key={key} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                      {label}
                      {isReq
                        ? <span className="text-red-500 font-bold">*</span>
                        : <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
                      }
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nom complet" required={isReq}><input value={form[key]?.name || ''} onChange={e => setNested(key, 'name', e.target.value)} className={isReq ? fiNested(key, 'name') : inp} /></Field>
                      <Field label="Nationalité" required={isReq}><input value={form[key]?.nationality || ''} onChange={e => setNested(key, 'nationality', e.target.value)} className={isReq ? fiNested(key, 'nationality') : inp} /></Field>
                      <Field label="Date de naissance" required={isReq}><input type="date" value={form[key]?.dob || ''} onChange={e => setNested(key, 'dob', e.target.value)} className={isReq ? fiNested(key, 'dob') : inp} /></Field>
                      <Field label="N° pièce d'identité" required={isReq}><input value={form[key]?.idNo || ''} onChange={e => setNested(key, 'idNo', e.target.value)} className={isReq ? fiNested(key, 'idNo') : inp} /></Field>
                      <Field label="Mobile" required={isReq}><input value={form[key]?.mobile || ''} onChange={e => setNested(key, 'mobile', e.target.value)} className={isReq ? fiNested(key, 'mobile') : inp} /></Field>
                      <Field label="Profession" required={isReq}><input value={form[key]?.occupation || ''} onChange={e => setNested(key, 'occupation', e.target.value)} className={isReq ? fiNested(key, 'occupation') : inp} /></Field>
                    </div>
                  </div>
                ))}

                <div className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50/30">
                  <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    Contact d'urgence en Chine <span className="text-red-500 font-bold">*</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nom" required><input value={form.emergencyContact?.name || ''} onChange={e => setNested('emergencyContact', 'name', e.target.value)} className={fiNested('emergency', 'name')} /></Field>
                    <Field label="Lien de parenté" required><input value={form.emergencyContact?.relationship || ''} onChange={e => setNested('emergencyContact', 'relationship', e.target.value)} className={fiNested('emergency', 'relationship')} /></Field>
                    <Field label="Nationalité" required><input value={form.emergencyContact?.nationality || ''} onChange={e => setNested('emergencyContact', 'nationality', e.target.value)} className={fiNested('emergency', 'nationality')} /></Field>
                    <Field label="Téléphone" required><input value={form.emergencyContact?.phone || ''} onChange={e => setNested('emergencyContact', 'phone', e.target.value)} className={fiNested('emergency', 'phone')} /></Field>
                    <Field label="Email" required><input value={form.emergencyContact?.email || ''} onChange={e => setNested('emergencyContact', 'email', e.target.value)} className={fiNested('emergency', 'email')} /></Field>
                    <Field label="Adresse en Chine" required><input value={form.emergencyContact?.addressChina || ''} onChange={e => setNested('emergencyContact', 'addressChina', e.target.value)} className={fiNested('emergency', 'addressChina')} /></Field>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0 sticky bottom-0">
            <button type="button" onClick={() => { setStep(s => Math.max(1, s - 1)); setStepErr(''); setMissing(new Set()); }}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft size={15} /> Précédent
            </button>
            <span className="text-xs text-gray-400">{step} / {STEPS.length}</span>
            {step < STEPS.length ? (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90">
                Suivant <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={goNext} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                data-testid="student-submit-btn">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : <><CheckCircle size={14} /> Enregistrer</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Activation Code Gate ─────────────────────────────────────────────────────
const ActivationCodeGate = ({ user, onVerified, onLogout }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/agent/verify-login-code`, { code: code.trim().toUpperCase() });
      sessionStorage.setItem(`agent_code_${user?.id}`, 'true');
      onVerified();
    } catch (err) {
      setError(err.response?.data?.detail || 'Code incorrect. Vérifiez votre code d\'activation.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: '#050d1a' }}>
      <div className="absolute pointer-events-none inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl animate-pulse" style={{ backgroundColor: '#1a56db' }} />
        <div className="absolute -bottom-32 right-0 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-3xl" style={{ backgroundColor: '#7c3aed', animation: 'pulse 4s ease-in-out 1.5s infinite' }} />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
          <Key size={30} style={{ color: ACCENT }} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Vérification d'identité</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Saisissez votre <strong style={{ color: 'rgba(255,255,255,0.7)' }}>code d'activation agent</strong> (format AG-XXXXXXXX).<br />
          C'est le code que l'administrateur vous a fourni lors de votre inscription.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="Ex : AG-XXXXXXXX"
            className="w-full px-4 py-3.5 rounded-2xl text-white text-center text-lg font-mono tracking-widest focus:outline-none transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            autoFocus
            data-testid="activation-code-input"
          />
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={!code.trim() || loading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
            data-testid="verify-code-btn">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Vérification...' : 'Accéder à mon espace'}
          </button>
          <button type="button" onClick={onLogout}
            className="w-full py-2 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Offer Detail Modal ────────────────────────────────────────────────────────
const OfferDetailModal = ({ offer, onClose, onApply }) => {
  const [offerDetails, setOfferDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!offer?.id) return;
    setLoadingDetails(true);
    axios.get(`${API}/offers/${offer.id}`)
      .then(r => setOfferDetails(r.data))
      .catch(() => setOfferDetails(offer))
      .finally(() => setLoadingDetails(false));
  }, [offer?.id]);

  const o = offerDetails || offer;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-start justify-between px-6 py-4 bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-t-2xl flex-shrink-0">
          <div className="text-white flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight">{o.title}</h3>
            <p className="text-blue-200 text-sm mt-0.5">{o.university}{o.city ? ` — ${o.city}` : ''}{o.country ? `, ${o.country}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl ml-3 flex-shrink-0"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loadingDetails && <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-gray-300 mx-auto" /></div>}

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">{o.degree}</span>
            <span className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full">{o.duration}</span>
            {o.hasScholarship && <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Bourse disponible</span>}
            {o.teachingLanguage && <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">{o.teachingLanguage}</span>}
            {o.intake && <span className="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">Rentrée : {o.intake}</span>}
            {o.deadline && <span className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full">Clôture : {o.deadline}</span>}
          </div>

          {o.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{o.description}</p>
            </div>
          )}

          {o.fees && Object.values(o.fees).some(v => v > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Frais</h4>
              <div className="grid grid-cols-2 gap-2 bg-amber-50 rounded-xl p-4 border border-amber-100">
                {o.fees.originalTuition > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Scolarité</p><p className="font-semibold text-sm">{Number(o.fees.originalTuition).toLocaleString()} {o.currency || 'CNY'}</p></div>}
                {o.fees.scholarshipTuition > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Après bourse</p><p className="font-semibold text-sm text-green-700">{Number(o.fees.scholarshipTuition).toLocaleString()} {o.currency || 'CNY'}</p></div>}
                {o.fees.registrationFee > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Inscription</p><p className="font-semibold text-sm">{Number(o.fees.registrationFee).toLocaleString()} {o.currency || 'CNY'}</p></div>}
                {o.fees.applicationFee > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Dossier</p><p className="font-semibold text-sm">{Number(o.fees.applicationFee).toLocaleString()} {o.currency || 'CNY'}</p></div>}
                {o.fees.accommodationSingle > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Héberg. single</p><p className="font-semibold text-sm">{Number(o.fees.accommodationSingle).toLocaleString()} {o.currency || 'CNY'}</p></div>}
                {o.fees.accommodationDouble > 0 && <div><p className="text-[10px] text-gray-400 uppercase">Héberg. double</p><p className="font-semibold text-sm">{Number(o.fees.accommodationDouble).toLocaleString()} {o.currency || 'CNY'}</p></div>}
              </div>
              {o.serviceFee > 0 && (
                <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-gray-600">Frais de service AccessHub Global</span>
                  <span className="font-bold text-[#1e3a5f]">{Number(o.serviceFee).toLocaleString()} {o.currency || 'CNY'}</span>
                </div>
              )}
            </div>
          )}

          {o.requiredDocuments?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Documents requis ({o.requiredDocuments.length})</h4>
              <div className="space-y-1.5">
                {o.requiredDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                    <FileText size={13} className="text-blue-500 flex-shrink-0" /> {doc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {o.admissionConditions?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions d'admission</h4>
              <div className="space-y-1">
                {o.admissionConditions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{typeof c === 'string' ? c : c.condition || c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {o.hasScholarship && o.scholarshipDetails && Object.keys(o.scholarshipDetails).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Détails de la bourse</h4>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-sm text-gray-600 space-y-1">
                {o.scholarshipType && <p><span className="font-medium">Type :</span> {o.scholarshipType}</p>}
                {o.scholarshipDetails?.coverage && <p><span className="font-medium">Couverture :</span> {o.scholarshipDetails.coverage}</p>}
                {o.scholarshipDetails?.amount && <p><span className="font-medium">Montant :</span> {o.scholarshipDetails.amount}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
          <button onClick={() => { onApply(offer); onClose(); }}
            className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2"
            data-testid="offer-detail-apply-btn">
            <Send size={14} /> Postuler à cette offre
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Apply Select Modal (multi-step) ──────────────────────────────────────────
const ApplySelectModal = ({ offer, students, onClose, onSubmit, loading }) => {
  const [step, setStep] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [stepError, setStepError] = useState('');

  const requiredDocs = offer?.requiredDocuments || [];
  const fees = offer?.fees || {};

  const handleDocUpload = async (e, docName) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDocuments(prev => [...prev.filter(d => d.name !== docName), { name: docName, url: r.data.url }]);
    } catch { setStepError('Erreur lors du téléchargement'); }
    setUploading(false);
  };

  const handlePaymentUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPaymentProof(r.data.url);
    } catch { setStepError('Erreur upload reçu de paiement'); }
    setUploading(false);
  };

  const goNext = () => {
    setStepError('');
    if (step === 1 && !selectedStudentId) { setStepError('Sélectionnez un étudiant'); return; }
    if (step === 2 && requiredDocs.length > 0) {
      const missing = requiredDocs.filter(doc => !documents.find(d => d.name === doc));
      if (missing.length > 0) { setStepError(`Documents manquants : ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '...' : ''}`); return; }
    }
    if (step === 3 && !paymentProof && !paymentMethod) { setStepError('Veuillez renseigner les informations de paiement'); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!termsAccepted) { setStepError('Veuillez accepter les conditions générales'); return; }
    onSubmit({ studentId: selectedStudentId, offerId: offer.id, offerTitle: offer.title, documents, paymentProof, paymentAmount: parseFloat(paymentAmount) || 0, paymentMethod, termsAccepted });
  };

  const STEPS = ['Étudiant', 'Documents', 'Paiement', 'Confirmation'];
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] p-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg">Soumettre une candidature</h3>
              <p className="text-blue-200 text-sm mt-0.5 line-clamp-1">{offer?.title}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg ml-2 flex-shrink-0"><X size={18} /></button>
          </div>
          <div className="flex gap-1 mt-4">
            {STEPS.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i + 1 <= step ? 'bg-white' : 'bg-white/25'}`} />)}
          </div>
          <p className="text-xs text-blue-200 mt-1.5">Étape {step}/{STEPS.length} — {STEPS[step - 1]}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {stepError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={14} /> {stepError}
            </div>
          )}

          {/* Step 1: Étudiant */}
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Sélectionner l'étudiant à inscrire</p>
              {students.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
                  <Users size={20} className="mx-auto mb-2 text-amber-500" />
                  Aucun étudiant enregistré. Ajoutez d'abord un étudiant dans la section "Étudiants".
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {students.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedStudentId === s.id ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="student" value={s.id} checked={selectedStudentId === s.id} onChange={() => setSelectedStudentId(s.id)} className="text-[#1e3a5f]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-500">{s.nationality || s.email}</p>
                      </div>
                      {selectedStudentId === s.id && <CheckCircle size={16} className="text-[#1e3a5f] flex-shrink-0" />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Documents requis pour cette offre</p>
              <p className="text-xs text-gray-400 mb-3">Téléchargez chaque document (PDF, JPG, PNG).</p>
              {requiredDocs.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 text-center">
                  <CheckCircle size={18} className="mx-auto mb-1 text-green-500" />
                  Aucun document requis pour cette offre. Passez à l'étape suivante.
                </div>
              ) : (
                <div className="space-y-2">
                  {requiredDocs.map((docName, i) => {
                    const uploaded = documents.find(d => d.name === docName);
                    return (
                      <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${uploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {uploaded ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" /> : <FileText size={15} className="text-gray-300 flex-shrink-0" />}
                          <span className="text-sm text-gray-700 truncate">{docName}</span>
                        </div>
                        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex-shrink-0 ${uploaded ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                          {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                          {uploaded ? 'Remplacer' : 'Charger'}
                          <input type="file" className="hidden" onChange={e => handleDocUpload(e, docName)} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 cursor-pointer hover:border-blue-300 hover:text-blue-500 transition-colors">
                  <Plus size={12} /> Ajouter un document supplémentaire
                  <input type="file" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    setUploading(true);
                    try { const fd = new FormData(); fd.append('file', file); const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setDocuments(p => [...p, { name: file.name, url: r.data.url }]); } catch {}
                    setUploading(false);
                  }} />
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Paiement */}
          {step === 3 && (
            <div className="space-y-4">
              {(fees.registrationFee > 0 || fees.applicationFee > 0 || offer?.serviceFee > 0) && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Frais à régler</p>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2 text-sm">
                    {fees.registrationFee > 0 && <div className="flex justify-between"><span className="text-gray-600">Frais d'inscription</span><span className="font-semibold">{Number(fees.registrationFee).toLocaleString()} {offer.currency || 'CNY'}</span></div>}
                    {fees.applicationFee > 0 && <div className="flex justify-between"><span className="text-gray-600">Frais de dossier</span><span className="font-semibold">{Number(fees.applicationFee).toLocaleString()} {offer.currency || 'CNY'}</span></div>}
                    {offer.serviceFee > 0 && <div className="flex justify-between border-t border-amber-200 pt-2 mt-1"><span className="text-gray-600">Frais de service AccessHub</span><span className="font-bold text-[#1e3a5f]">{Number(offer.serviceFee).toLocaleString()} {offer.currency || 'CNY'}</span></div>}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mode de paiement *</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={sel}>
                  <option value="">Sélectionner...</option>
                  <option value="virement">Virement bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="especes">Espèces (bureau)</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Montant payé ({offer?.currency || 'CNY'})</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className={inp} placeholder="0.00" min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Preuve de paiement * (reçu, capture d'écran)</label>
                <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${paymentProof ? 'border-green-300 bg-green-50 text-green-700' : 'border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : paymentProof ? <CheckCircle size={14} /> : <Upload size={14} />}
                  {paymentProof ? 'Preuve téléchargée — Cliquer pour remplacer' : 'Télécharger le reçu de paiement'}
                  <input type="file" className="hidden" onChange={handlePaymentUpload} accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm border border-gray-100">
                <p className="font-semibold text-gray-700 mb-3">Récapitulatif de la candidature</p>
                <div className="flex justify-between"><span className="text-gray-500">Offre</span><span className="font-medium text-right ml-2 text-gray-900 max-w-[60%] truncate">{offer.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Université</span><span className="font-medium text-gray-900">{offer.university}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Étudiant</span><span className="font-medium text-gray-900">{(() => { const s = students.find(s => s.id === selectedStudentId); return s ? `${s.firstName} ${s.lastName}` : '-'; })()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Documents</span><span className={`font-medium ${documents.length > 0 ? 'text-green-700' : 'text-amber-600'}`}>{documents.length} fichier(s) joint(s)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span className={`font-medium ${paymentProof ? 'text-green-700' : 'text-amber-600'}`}>{paymentProof ? 'Reçu joint' : 'Non fourni'}{paymentMethod ? ` (${paymentMethod})` : ''}</span></div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); setStepError(''); }} className="mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 leading-relaxed">Je confirme que toutes les informations et documents fournis sont exacts et authentiques. J'accepte les conditions générales d'AccessHub Global pour la soumission de cette candidature.</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          {step > 1 ? (
            <button type="button" onClick={() => { setStep(s => s - 1); setStepError(''); }}
              className="flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              <ChevronLeft size={14} /> Retour
            </button>
          ) : (
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          )}
          {step < 4 ? (
            <button type="button" onClick={goNext} disabled={students.length === 0 && step === 1}
              className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1"
              data-testid="apply-next-btn">
              Continuer <ChevronRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!termsAccepted || loading}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-40 flex items-center justify-center gap-2"
              data-testid="apply-submit-btn">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? 'Soumission...' : 'Confirmer la candidature'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Application Preview Modal ──────────────────────────────────────────────────
const AppPreviewModal = ({ app, onClose }) => {
  const printRef = useRef(null);
  const [offerDetails, setOfferDetails] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  useEffect(() => {
    if (!app?.offerId) return;
    setLoadingOffer(true);
    axios.get(`${API}/offers/${app.offerId}`)
      .then(r => setOfferDetails(r.data))
      .catch(() => {})
      .finally(() => setLoadingOffer(false));
  }, [app?.offerId]);

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = printRef.current;
    if (!element) return;
    const opt = {
      margin: 8,
      filename: `candidature-${app.firstName}-${app.lastName}-${app.id?.substring(0, 8)}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const sc = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = sc.icon;

  // Helper components for the preview
  const Section = ({ icon: Icon, title, color = 'bg-[#1e3a5f]', children }) => (
    <div className="mb-5">
      <h2 className={`flex items-center gap-2 px-4 py-2.5 ${color} text-white rounded-xl mb-3 text-sm font-semibold`}>
        {Icon && <Icon size={14} />} {title}
      </h2>
      {children}
    </div>
  );

  const Field = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div>
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    );
  };

  const FamilyCard = ({ title, data, required }) => {
    if (!data || (!data.name && !data.nationality)) return null;
    return (
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase">{title}{!required && <span className="ml-1 text-gray-400 font-normal normal-case">(optionnel)</span>}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Nom complet" value={data.name} />
          <Field label="Nationalité" value={data.nationality} />
          <Field label="Date de naissance" value={data.dob} />
          <Field label="N° pièce d'identité" value={data.idNo} />
          <Field label="Mobile" value={data.mobile} />
          <Field label="Email" value={data.email} />
          <Field label="Profession" value={data.occupation} />
          <Field label="Employeur" value={data.employer} />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col" style={{ maxHeight: '93vh' }}>

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-t-2xl">
          <div className="text-white min-w-0 flex-1">
            <h3 className="font-bold text-lg leading-tight">{app.firstName} {app.lastName}</h3>
            <p className="text-blue-200 text-sm truncate">{app.offerTitle}</p>
            <p className="text-blue-300 text-xs mt-0.5">Réf : #{app.id?.substring(0, 8)}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
            <button onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm transition-colors"
              data-testid={`download-app-${app.id}`}>
              <Download size={15} /> PDF
            </button>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"><X size={18} /></button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5" ref={printRef}>

          {/* Status banner */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-5 ${sc.color}`}>
            <StatusIcon size={16} />
            <span className="font-semibold text-sm">Statut : {sc.label}</span>
            <span className="text-xs ml-auto opacity-70">
              {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* ── Programme (Offer Details) ── */}
          <Section icon={GraduationCap} title="Programme" color="bg-[#1e3a5f]">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="font-bold text-gray-900 mb-1">{app.offerTitle}</p>
              {loadingOffer ? (
                <p className="text-xs text-gray-400">Chargement des détails...</p>
              ) : offerDetails ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <Field label="Université" value={offerDetails.university} />
                  <Field label="Ville / Pays" value={offerDetails.city && offerDetails.country ? `${offerDetails.city}, ${offerDetails.country}` : offerDetails.city || offerDetails.country} />
                  <Field label="Diplôme" value={offerDetails.degree} />
                  <Field label="Durée" value={offerDetails.duration} />
                  <Field label="Langue d'enseignement" value={offerDetails.teachingLanguage} />
                  <Field label="Rentrée" value={offerDetails.intake} />
                  <Field label="Date limite" value={offerDetails.deadline || 'Ouvert'} />
                  {offerDetails.hasScholarship && <Field label="Type de bourse" value={offerDetails.scholarshipType} />}
                  <Field label="Catégorie" value={offerDetails.categoryLabel || offerDetails.category} />
                </div>
              ) : (
                app.university && <p className="text-sm text-gray-600 mt-1">{app.university}</p>
              )}
            </div>
          </Section>

          {/* ── Frais ── */}
          {offerDetails?.fees && Object.values(offerDetails.fees).some(v => v > 0) && (
            <Section title="Frais et Tarifs" color="bg-amber-700">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 grid grid-cols-2 gap-3">
                {offerDetails.fees.originalTuition > 0 && <Field label="Frais de scolarité" value={`${Number(offerDetails.fees.originalTuition).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.scholarshipTuition > 0 && <Field label="Scolarité après bourse" value={`${Number(offerDetails.fees.scholarshipTuition).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.accommodationDouble > 0 && <Field label="Hébergement (double)" value={`${Number(offerDetails.fees.accommodationDouble).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.accommodationSingle > 0 && <Field label="Hébergement (single)" value={`${Number(offerDetails.fees.accommodationSingle).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.registrationFee > 0 && <Field label="Frais d'inscription" value={`${Number(offerDetails.fees.registrationFee).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.insuranceFee > 0 && <Field label="Assurance" value={`${Number(offerDetails.fees.insuranceFee).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {offerDetails.fees.applicationFee > 0 && <Field label="Frais de dossier" value={`${Number(offerDetails.fees.applicationFee).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />}
                {(offerDetails.fees.otherFees || []).map((fee, idx) => (
                  <Field key={idx} label={fee.name || fee.label} value={`${Number(fee.amount).toLocaleString()} ${offerDetails.currency || 'CNY'}`} />
                ))}
              </div>
              {offerDetails.serviceFee > 0 && (
                <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Frais de service AccessHub Global</span>
                  <span className="font-bold text-[#1e3a5f]">{Number(offerDetails.serviceFee).toLocaleString()} {offerDetails.currency || 'CNY'}</span>
                </div>
              )}
            </Section>
          )}

          {/* ── Informations Personnelles ── */}
          <Section icon={User} title="Informations personnelles" color="bg-[#1e3a5f]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <Field label="Prénom" value={app.firstName} />
              <Field label="Nom" value={app.lastName} />
              <Field label="Sexe" value={app.sex} />
              <Field label="Date de naissance" value={app.dateOfBirth} />
              <Field label="Nationalité" value={app.nationality} />
              <Field label="Pays de naissance" value={app.countryOfBirth} />
              <Field label="Lieu de naissance" value={app.placeOfBirth} />
              <Field label="Langue maternelle" value={app.nativeLanguage} />
              <Field label="Religion" value={app.religion} />
              <Field label="Situation matrimoniale" value={app.maritalStatus} />
              <Field label="Profession" value={app.occupation} />
              <Field label="Niveau d'études" value={app.highestEducation} />
              <Field label="Domaine souhaité (Chine)" value={app.majorInChina} />
              <Field label="Hobbies / Loisirs" value={app.hobby} />
              <Field label="Téléphone" value={app.phoneNumber} />
              <Field label="Email principal" value={app.userEmail || app.personalEmail} />
              <Field label="Email personnel" value={app.personalEmail !== app.userEmail ? app.personalEmail : null} />
            </div>
          </Section>

          {/* ── Santé & Séjour en Chine ── */}
          {(app.bloodGroup || app.height || app.weight || app.inChinaNow) && (
            <Section icon={Activity} title="Santé & Séjour en Chine" color="bg-green-700">
              <div className="space-y-3">
                {(app.bloodGroup || app.height || app.weight) && (
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <Field label="Groupe sanguin" value={app.bloodGroup} />
                    <Field label="Taille" value={app.height ? `${app.height} cm` : null} />
                    <Field label="Poids" value={app.weight ? `${app.weight} kg` : null} />
                  </div>
                )}
                {app.inChinaNow && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="col-span-full text-xs font-semibold text-red-700 uppercase mb-1">Actuellement en Chine</p>
                    <Field label="Établissement" value={app.chinaSchool} />
                    <Field label="Type de visa" value={app.chinaVisaType} />
                    <Field label="N° de visa" value={app.chinaVisaNo} />
                    <Field label="Expiration visa" value={app.chinaVisaExpiry} />
                    <Field label="Période début" value={app.chinaLearningPeriodStart} />
                    <Field label="Période fin" value={app.chinaLearningPeriodEnd} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── Passeport ── */}
          {(app.passportNumber || app.passportIssuedDate || app.passportExpiryDate) && (
          <Section icon={Shield} title="Passeport" color="bg-purple-700">
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="col-span-full text-xs font-semibold text-gray-500 uppercase mb-1">Passeport actuel</p>
                <Field label="Numéro" value={app.passportNumber} />
                <Field label="Date d'émission" value={app.passportIssuedDate} />
                <Field label="Date d'expiration" value={app.passportExpiryDate} />
              </div>
              {app.oldPassportNo && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="col-span-full text-xs font-semibold text-gray-500 uppercase mb-1">Ancien passeport</p>
                  <Field label="Numéro" value={app.oldPassportNo} />
                  <Field label="Date d'émission" value={app.oldPassportIssuedDate} />
                  <Field label="Date d'expiration" value={app.oldPassportExpiryDate} />
                </div>
              )}
            </div>
          </Section>
          )}

          {/* ── Résidence ── */}
          {(app.address || app.currentAddress) && (
            <Section icon={MapPin} title="Résidence" color="bg-blue-700">
              <div className="space-y-3">
                {app.address && (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="col-span-full text-xs font-semibold text-gray-500 uppercase mb-1">Adresse permanente</p>
                    <Field label="Pays / Ville" value={app.address} />
                    <Field label="Rue / Quartier" value={app.addressDetailed} />
                    <Field label="Téléphone" value={app.addressPhone} />
                    <Field label="Code postal" value={app.zipCode} />
                  </div>
                )}
                {app.currentAddress && (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="col-span-full text-xs font-semibold text-gray-500 uppercase mb-1">Adresse actuelle</p>
                    <Field label="Pays / Ville" value={app.currentAddress} />
                    <Field label="Rue / Quartier" value={app.currentAddressDetailed} />
                    <Field label="Téléphone" value={app.currentAddressPhone} />
                    <Field label="Code postal" value={app.currentAddressZipCode} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── Parcours Académique ── */}
          {(app.educationalBackground || []).some(e => e.instituteName) && (
            <Section icon={BookOpen} title="Parcours académique" color="bg-teal-700">
              <div className="space-y-2">
                {(app.educationalBackground || []).filter(e => e.instituteName).map((e, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-100">
                    <Field label="Établissement" value={e.instituteName} />
                    <Field label="Domaine d'études" value={e.fieldOfStudy} />
                    <Field label="Niveau" value={e.educationLevel} />
                    <Field label="Période" value={e.yearsFrom && e.yearsTo ? `${e.yearsFrom} → ${e.yearsTo}` : e.yearsFrom || e.yearsTo} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Expérience Professionnelle ── */}
          {(app.workExperience || []).some(w => w.companyName) && (
            <Section icon={Briefcase} title="Expérience professionnelle" color="bg-amber-700">
              <div className="space-y-2">
                {(app.workExperience || []).filter(w => w.companyName).map((w, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-100">
                    <Field label="Entreprise" value={w.companyName} />
                    <Field label="Poste" value={w.position} />
                    <Field label="Secteur" value={w.industryType} />
                    <Field label="Période" value={w.yearsFrom && w.yearsTo ? `${w.yearsFrom} → ${w.yearsTo}` : w.yearsFrom || w.yearsTo} />
                    <Field label="Contact" value={w.contactPerson} />
                    <Field label="Tél. contact" value={w.contactPhone} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Famille ── */}
          {(app.fatherInfo?.name || app.motherInfo?.name || app.emergencyContact?.name) && (
            <Section icon={Users} title="Informations familiales" color="bg-indigo-700">
              <div className="space-y-3">
                <FamilyCard title="Père" data={app.fatherInfo} required />
                <FamilyCard title="Mère" data={app.motherInfo} required />
                <FamilyCard title="Conjoint(e)" data={app.spouseInfo} required={false} />
                {app.emergencyContact?.name && (
                  <div className="bg-red-50 rounded-xl p-4 space-y-2 border border-red-100">
                    <p className="text-xs font-semibold text-red-700 uppercase">Contact d'urgence en Chine</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Field label="Nom" value={app.emergencyContact.name} />
                      <Field label="Lien de parenté" value={app.emergencyContact.relationship} />
                      <Field label="Nationalité" value={app.emergencyContact.nationality} />
                      <Field label="Téléphone" value={app.emergencyContact.phone} />
                      <Field label="Email" value={app.emergencyContact.email} />
                      <Field label="Adresse en Chine" value={app.emergencyContact.addressChina} />
                      <Field label="Profession" value={app.emergencyContact.occupation} />
                      <Field label="Employeur" value={app.emergencyContact.employer} />
                    </div>
                  </div>
                )}
                {app.financialSponsor?.relationship && (
                  <div className="bg-green-50 rounded-xl p-4 space-y-2 border border-green-100">
                    <p className="text-xs font-semibold text-green-700 uppercase">Sponsor financier</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Lien de parenté" value={app.financialSponsor.relationship} />
                      <Field label="Adresse" value={app.financialSponsor.address} />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── Documents Soumis ── */}
          {(app.documents || []).length > 0 && (
            <Section icon={FileText} title={`Documents soumis (${app.documents.length})`} color="bg-teal-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {app.documents.map((d, i) => {
                  const docUrl = typeof d === 'string' ? d : d?.url;
                  const docName = typeof d === 'object' ? d?.name : `Document ${i + 1}`;
                  return (
                    <a key={i} href={docUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100 hover:bg-teal-100 transition-colors">
                      <FileText size={16} className="text-teal-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{docName}</p>
                        <p className="text-xs text-gray-500">Cliquez pour voir</p>
                      </div>
                      <Download size={13} className="text-teal-600 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ── Suivi de Candidature ── */}
          <Section title="Suivi de candidature" color="bg-gray-700">
            <div className="space-y-3 pl-2">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Candidature soumise</p>
                  <p className="text-xs text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {app.status !== 'pending' && (
                <div className="flex gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    app.status === 'approved' ? 'bg-green-500' :
                    app.status === 'rejected' ? 'bg-red-500' :
                    app.status === 'modify' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {app.status === 'approved' && 'Candidature approuvée'}
                      {app.status === 'rejected' && 'Candidature rejetée'}
                      {app.status === 'modify' && 'Modification demandée'}
                      {app.status === 'processing' && 'En cours de traitement'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
            <p>Réf : #{app.id?.substring(0, 8)} · AccessHub Global</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const AgentDashboard = () => {
  const { user, logout, addToFavorites, removeFromFavorites } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Student form
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Apply modal (shown globally)
  const [applyModal, setApplyModal] = useState(null); // { offer }
  const [applyLoading, setApplyLoading] = useState(false);

  // Application preview
  const [previewApp, setPreviewApp] = useState(null);

  // Message form
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgForm, setMsgForm] = useState({ subject: '', content: '' });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const isApproved = user?.isApproved;

  // Activation code gate
  const [codeVerified, setCodeVerified] = useState(() =>
    sessionStorage.getItem(`agent_code_${user?.id}`) === 'true'
  );

  // Offer detail modal
  const [offerDetailModal, setOfferDetailModal] = useState(null);

  // Contract
  const [contractData, setContractData] = useState(null);

  // Documents
  const [agentProfile, setAgentProfile] = useState(null);
  const [docUploading, setDocUploading] = useState({});
  const [docSaving, setDocSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'students') { loadStudents(); loadAgentProfile(); }
    if (activeTab === 'applications') { loadApplications(); loadStudents(); loadAgentProfile(); }
    if (activeTab === 'offers') { loadOffers(); loadStudents(); }
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'messages') loadMessages();
    if (activeTab === 'contrat') loadContract();
    if (activeTab === 'documents') loadAgentProfile();
  }, [activeTab]);

  useEffect(() => { loadStats(); loadAgentProfile(); }, []);

  const loadStats = async () => {
    try { const r = await axios.get(`${API}/agent/dashboard-stats`); setStats(r.data); } catch {}
  };
  const loadStudents = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/agent/students`); setStudents(r.data); } catch {}
    setLoading(false);
  };
  const loadApplications = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/agent/applications`); setApplications(r.data); } catch {}
    setLoading(false);
  };
  const loadOffers = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/offers`); setOffers(r.data); } catch {}
    setLoading(false);
  };
  const loadFavorites = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/user/favorites`); setFavorites(r.data); } catch {}
    setLoading(false);
  };
  const loadMessages = async () => {
    setLoading(true);
    try { const r = await axios.get(`${API}/agent/messages`); setMessages(r.data); } catch {}
    setLoading(false);
  };

  const loadContract = async () => {
    try { const r = await axios.get(`${API}/agent/contract`); setContractData(r.data); } catch {}
  };

  const loadAgentProfile = async () => {
    try { const r = await axios.get(`${API}/agent/profile`); setAgentProfile(r.data); } catch {}
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0]; if (!file) return;
    setDocUploading(d => ({ ...d, [docType]: true }));
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await axios.post(`${BACKEND_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = r.data.url;
      const nameKey = docType === 'idDocUrl' ? 'idDocName' : 'addressDocName';
      const updated = { ...agentProfile, [docType]: url, [nameKey]: file.name };
      setAgentProfile(updated);
      await axios.put(`${API}/agent/profile`, { [docType]: url, [nameKey]: file.name });
    } catch { alert('Erreur lors du téléchargement'); }
    setDocUploading(d => ({ ...d, [docType]: false }));
  };

  const handleStudentSave = async (data) => {
    setLoading(true);
    try {
      if (editingStudent) {
        await axios.put(`${API}/agent/students/${editingStudent.id}`, data);
      } else {
        await axios.post(`${API}/agent/students`, data);
      }
      setShowStudentForm(false);
      setEditingStudent(null);
      loadStudents();
      loadStats();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setLoading(false);
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Supprimer cet étudiant ?')) return;
    try { await axios.delete(`${API}/agent/students/${id}`); loadStudents(); loadStats(); }
    catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
  };

  const handleApplySubmit = async (data) => {
    setApplyLoading(true);
    try {
      await axios.post(`${API}/agent/applications`, data);
      setApplyModal(null);
      loadApplications();
      loadStats();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur lors de la candidature'); }
    setApplyLoading(false);
  };

  const handleMsgSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/agent/messages`, msgForm);
      setShowMsgForm(false);
      setMsgForm({ subject: '', content: '' });
      loadMessages();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    setLoading(false);
  };

  const toggleFav = async (offerId) => {
    if (user?.favorites?.includes(offerId)) await removeFromFavorites(offerId);
    else await addToFavorites(offerId);
    if (activeTab === 'favorites') loadFavorites();
  };

  // ── Not approved screen ────────────────────────────────────────────────────
  if (user && user.role === 'agent' && !isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center" data-testid="agent-pending-approval">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte en attente d'approbation</h2>
          <p className="text-gray-600 mb-4 text-sm">Votre compte agent est en cours de vérification par un administrateur.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Retour au site</button>
            <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'documents', label: 'Mes Documents', icon: Shield },
    { id: 'students', label: 'Étudiants', icon: Users, count: students.length },
    { id: 'applications', label: 'Candidatures', icon: FileText, count: applications.length },
    { id: 'offers', label: 'Offres', icon: GraduationCap },
    { id: 'favorites', label: 'Favoris', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'contrat', label: 'Contrat', icon: FileText },
  ];

  const docsOk = agentProfile?.documentsVerified;
  const docsSubmitted = agentProfile?.documentsSubmitted;

  const filteredOffers = offers.filter(o =>
    !searchQuery || o.title?.toLowerCase().includes(searchQuery.toLowerCase()) || o.university?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!codeVerified) {
    return (
      <ActivationCodeGate
        user={user}
        onVerified={() => setCodeVerified(true)}
        onLogout={() => { logout(); }}
      />
    );
  }

  return (
    <DashboardShell
      accent={ACCENT} orbA="#1a56db" orbB="#7c3aed"
      roleLabel="Espace Agent" roleIcon={Building2}
      user={user} navItems={tabs}
      activeTab={activeTab} setActiveTab={setActiveTab}
      onLogout={logout}
      data-testid="agent-dashboard"
    >
      {/* Global modals */}
      {showStudentForm && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => { setShowStudentForm(false); setEditingStudent(null); }}
          onSave={handleStudentSave}
          loading={loading}
        />
      )}
      {offerDetailModal && (
        <OfferDetailModal
          offer={offerDetailModal}
          onClose={() => setOfferDetailModal(null)}
          onApply={(offer) => { setApplyModal({ offer }); loadStudents(); }}
        />
      )}
      {applyModal && (
        <ApplySelectModal
          offer={applyModal.offer}
          students={students}
          onClose={() => setApplyModal(null)}
          onSubmit={handleApplySubmit}
          loading={applyLoading}
        />
      )}
      {previewApp && <AppPreviewModal app={previewApp} onClose={() => setPreviewApp(null)} />}

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Documents warning */}
            {!docsOk && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
                style={{ backgroundColor: docsSubmitted ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${docsSubmitted ? 'rgba(59,130,246,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                <AlertCircle size={18} className={docsSubmitted ? 'text-blue-400' : 'text-red-400'} style={{ marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1">
                  {docsSubmitted ? (
                    <>
                      <p className="text-blue-300 font-semibold text-sm">Documents en cours de vérification</p>
                      <p className="text-blue-400/70 text-xs mt-0.5">Vos documents sont soumis. L'inscription d'étudiants sera débloquée après validation par l'administrateur.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-300 font-semibold text-sm">Documents obligatoires manquants</p>
                      <p className="text-red-400/70 text-xs mt-0.5">Vous devez soumettre une pièce d'identité et un justificatif de domicile avant d'inscrire des étudiants.</p>
                    </>
                  )}
                </div>
                <button onClick={() => setActiveTab('documents')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 text-white ${docsSubmitted ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {docsSubmitted ? 'Voir' : 'Soumettre'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Étudiants" value={stats?.students || 0} icon={Users} accent={ACCENT} />
              <StatCard label="Candidatures" value={stats?.totalApplications || 0} icon={FileText} accent="#8b5cf6" />
              <StatCard label="En attente" value={stats?.pendingApplications || 0} icon={Clock} accent="#f59e0b" />
              <StatCard label="Approuvées" value={stats?.approvedApplications || 0} icon={CheckCircle} accent="#10b981" />
              <StatCard label="Rejetées" value={stats?.rejectedApplications || 0} icon={XCircle} accent="#ef4444" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Gérer mes étudiants', icon: Users, tab: 'students' },
                { label: 'Voir les offres et postuler', icon: GraduationCap, tab: 'offers' },
              ].map(a => (
                <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                  className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:-translate-y-0.5 text-left group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                      <a.icon size={16} style={{ color: ACCENT }} />
                    </div>
                    <span className="font-semibold text-white">{a.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Documents gate */}
            {!docsOk && (
              <div className="flex items-start gap-3 px-4 py-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Shield size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-300 font-semibold text-sm">Accès restreint</p>
                  <p className="text-red-400/70 text-xs mt-0.5">
                    {docsSubmitted
                      ? "Vos documents sont en cours de vérification. L'inscription d'étudiants sera disponible après validation."
                      : "Vous devez soumettre une pièce d'identité et un justificatif de domicile avant d'inscrire des étudiants."}
                  </p>
                </div>
                <button onClick={() => setActiveTab('documents')}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-semibold flex-shrink-0">
                  {docsSubmitted ? 'Voir statut' : 'Soumettre docs'}
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mes Étudiants ({students.length})</h2>
              <button onClick={() => { if (!docsOk) { setActiveTab('documents'); return; } setEditingStudent(null); setShowStudentForm(true); }} data-testid="add-student-btn"
                className={`px-4 py-2 text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2 ${docsOk ? 'bg-[#1e3a5f]' : 'bg-gray-400 cursor-not-allowed'}`}
                title={docsOk ? '' : 'Documents requis avant inscription'}>
                <Plus size={15} /> Ajouter un étudiant
              </button>
            </div>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun étudiant enregistré</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Ajoutez vos étudiants pour pouvoir soumettre des candidatures en leur nom.</p>
                <button onClick={() => { setEditingStudent(null); setShowStudentForm(true); }}
                  className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90">
                  Ajouter un étudiant
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#1e3a5f]/30 transition-colors" data-testid={`student-card-${s.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-[#1e3a5f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{s.firstName} {s.lastName}</h4>
                        <p className="text-xs text-gray-500 truncate">{s.email}</p>
                        {s.nationality && <p className="text-xs text-gray-400 mt-0.5">{s.nationality}{s.phone ? ` · ${s.phone}` : ''}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditingStudent(s); setShowStudentForm(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-testid={`edit-student-${s.id}`}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteStudent(s.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-testid={`delete-student-${s.id}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      <button onClick={() => { setApplyModal(null); setActiveTab('offers'); }}
                        className="flex-1 text-xs py-1.5 bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/10 transition-colors font-medium">
                        Voir les offres
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Candidatures ({applications.length})</h2>
              <button onClick={() => { setActiveTab('offers'); }}
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2" data-testid="new-application-btn">
                <Plus size={15} /> Nouvelle candidature
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune candidature soumise</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Allez dans "Offres" pour postuler pour un étudiant.</p>
                <button onClick={() => setActiveTab('offers')} className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90">
                  Voir les offres
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const sc = statusConfig[app.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors" data-testid={`application-card-${app.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h4 className="font-semibold text-gray-900">{app.offerTitle}</h4>
                              <p className="text-sm text-gray-600 mt-0.5">Étudiant : {app.firstName} {app.lastName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(app.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 ${sc.color}`}>
                              <StatusIcon size={12} /> {sc.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button onClick={() => setPreviewApp(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1e3a5f] bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
                          data-testid={`preview-app-${app.id}`}>
                          <Eye size={13} /> Aperçu
                        </button>
                        <button onClick={() => setPreviewApp(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          data-testid={`download-app-btn-${app.id}`}>
                          <Download size={13} /> Télécharger
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Offers Tab ── */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-bold text-gray-900">Offres disponibles ({filteredOffers.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher une offre..."
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-56" data-testid="offers-search" />
              </div>
            </div>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOffers.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#1e3a5f]/20 transition-all" data-testid={`offer-card-${o.id}`}>
                    {o.image ? (
                      <div className="h-36 overflow-hidden">
                        <img src={o.image} alt={o.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] flex items-center justify-center">
                        <GraduationCap size={32} className="text-white/50" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{o.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{o.university}{o.city ? ` — ${o.city}` : ''}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{o.degree}</span>
                        <span className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{o.duration}</span>
                        {o.hasScholarship && <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Bourse</span>}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <button onClick={() => toggleFav(o.id)} data-testid={`fav-offer-${o.id}`}
                          className={`p-1.5 rounded-lg transition-colors ${user?.favorites?.includes(o.id) ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'}`}>
                          <Heart size={16} fill={user?.favorites?.includes(o.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => setOfferDetailModal(o)}
                          data-testid={`view-offer-${o.id}`}
                          className="flex items-center gap-1.5 text-xs bg-[#1e3a5f] text-white px-4 py-2 rounded-xl hover:opacity-90 font-medium transition-opacity">
                          <Eye size={12} /> Voir les détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Favorites Tab ── */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Mes Favoris ({favorites.length})</h2>
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Aucun favori enregistré</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {o.image && <img src={o.image} alt={o.title} className="w-full h-32 object-cover" />}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm">{o.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{o.university}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => toggleFav(o.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Heart size={16} fill="currentColor" />
                        </button>
                        <button onClick={() => { setOfferDetailModal(o); loadStudents(); }}
                          className="flex items-center gap-1.5 text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-xl hover:opacity-90 font-medium">
                          <Eye size={12} /> Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Messages ({messages.length})</h2>
              <button onClick={() => setShowMsgForm(true)} data-testid="new-message-btn"
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus size={15} /> Nouveau message
              </button>
            </div>
            {showMsgForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMsgForm(false)}>
                <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Nouveau message</h3>
                    <button onClick={() => setShowMsgForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleMsgSubmit} className="p-5 space-y-3" data-testid="message-form">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sujet *</label>
                      <input value={msgForm.subject} onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })} required
                        className={inp} data-testid="msg-subject" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                      <textarea value={msgForm.content} onChange={e => setMsgForm({ ...msgForm, content: e.target.value })} required rows={4}
                        className={`${inp} resize-none`} data-testid="msg-content" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowMsgForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Annuler</button>
                      <button type="submit" disabled={loading} data-testid="msg-submit-btn"
                        className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Send size={14} /> Envoyer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Aucun message</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-[#1e3a5f]/20 transition-colors"
                    onClick={() => setSelectedMessage(selectedMessage?.id === m.id ? null : m)} data-testid={`message-card-${m.id}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm">{m.subject}</h4>
                      <span className="text-[11px] text-gray-400">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.content}</p>
                    {selectedMessage?.id === m.id && m.replies?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {m.replies.map((r, i) => (
                          <div key={i} className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-blue-800">{r.adminName || 'Admin'}</p>
                            <p className="text-xs text-blue-700 mt-1">{r.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Contract Tab ── */}
        {activeTab === 'contrat' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Mon Contrat</h2>
            {contractData?.contractUrl ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={28} className="text-[#1e3a5f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{contractData.contractName || 'Contrat Agent'}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {contractData.contractUploadedAt
                        ? `Mis à jour le ${new Date(contractData.contractUploadedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Document PDF'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Contrat de partenariat AccessHub Global</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <a href={contractData.contractUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                    data-testid="view-contract-btn">
                    <Eye size={15} /> Visualiser
                  </a>
                  <a href={contractData.contractUrl} download
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    data-testid="download-contract-btn">
                    <Download size={15} /> Télécharger
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-gray-200" />
                </div>
                <p className="text-gray-500 font-medium">Aucun contrat disponible</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Votre contrat de partenariat sera disponible ici une fois que l'administrateur l'aura téléversé.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Documents Tab ── */}
        {activeTab === 'documents' && agentProfile !== null && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mes Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Ces documents sont requis avant de pouvoir inscrire des étudiants.</p>
            </div>

            {/* Status */}
            <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl ${agentProfile.documentsVerified ? 'bg-green-50 border border-green-200' : agentProfile.documentsSubmitted ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
              {agentProfile.documentsVerified
                ? <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                : agentProfile.documentsSubmitted
                ? <Clock size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                : <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />}
              <div>
                <p className={`font-semibold text-sm ${agentProfile.documentsVerified ? 'text-green-800' : agentProfile.documentsSubmitted ? 'text-blue-800' : 'text-amber-800'}`}>
                  {agentProfile.documentsVerified ? 'Documents vérifiés — Vous êtes opérationnel' : agentProfile.documentsSubmitted ? 'Documents soumis — En attente de vérification admin' : 'Documents non soumis'}
                </p>
                <p className={`text-xs mt-0.5 ${agentProfile.documentsVerified ? 'text-green-600' : agentProfile.documentsSubmitted ? 'text-blue-600' : 'text-amber-600'}`}>
                  {agentProfile.documentsVerified
                    ? "Votre pièce d'identité et justificatif de domicile ont été vérifiés. Vous pouvez inscrire des étudiants."
                    : agentProfile.documentsSubmitted
                    ? "L'administrateur va vérifier vos documents sous peu."
                    : "Soumettez les deux documents ci-dessous pour débloquer l'inscription d'étudiants."}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Shield size={16} className="text-blue-600" /> Documents d'identité
              </h3>

              {[
                { key: 'idDocUrl', nameKey: 'idDocName', label: "Pièce d'identité valide *", desc: "Carte nationale d'identité ou passeport en cours de validité" },
                { key: 'addressDocUrl', nameKey: 'addressDocName', label: "Justificatif de domicile *", desc: "Facture d'électricité, de gaz, internet ou relevé bancaire récent (moins de 3 mois)" },
              ].map(({ key, nameKey, label, desc }) => (
                <div key={key} className={`border-2 border-dashed rounded-2xl p-4 transition-colors ${agentProfile[key] ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      {agentProfile[key] && (
                        <a href={agentProfile[key]} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline mt-1 flex items-center gap-1">
                          <Eye size={11} /> {agentProfile[nameKey] || 'Document téléchargé'} — voir
                        </a>
                      )}
                    </div>
                    <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${agentProfile[key] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                      {docUploading[key] ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      {agentProfile[key] ? 'Remplacer' : 'Téléverser'}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleDocUpload(e, key)} />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {agentProfile.documentsSubmitted && !agentProfile.documentsVerified && (
              <p className="text-center text-xs text-gray-500">
                Documents soumis. En attente de validation par l'administrateur.
              </p>
            )}
          </div>
        )}
    </DashboardShell>
  );
};

export default AgentDashboard;

import React, { useState, useEffect, useRef } from 'react';
import {
  Users, FileText, MessageCircle, BarChart3, Plus, Trash2, Edit3, Eye,
  LogOut, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Send,
  GraduationCap, Heart, Star, Search, X, Loader2, Home, Building2,
  Download, ChevronLeft, ChevronDown, User, BookOpen, Briefcase,
  Activity, Globe, Shield, MapPin, Phone
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
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
    const m = validateStep(step);
    if (m.size > 0) {
      setMissing(m);
      setStepErr(`Veuillez remplir tous les champs obligatoires (${m.size} manquant${m.size > 1 ? 's' : ''}).`);
      return;
    }
    setMissing(new Set());
    setStepErr('');
    setStep(s => Math.min(STEPS.length, s + 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <button type="submit" disabled={loading}
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

// ── Apply Select Modal ─────────────────────────────────────────────────────────
const ApplySelectModal = ({ offer, students, onClose, onSubmit, loading }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    onSubmit({ studentId: selectedStudentId, offerId: offer.id, offerTitle: offer.title, termsAccepted });
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">Postuler à une offre</h3>
              <p className="text-blue-200 text-sm mt-1 line-clamp-2">{offer?.title}</p>
              <p className="text-blue-300 text-xs mt-0.5">{offer?.university} — {offer?.city}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"><X size={18} /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Sélectionner l'étudiant</label>
            {students.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
                <Users size={20} className="mx-auto mb-2 text-amber-500" />
                Aucun étudiant enregistré. Ajoutez d'abord un étudiant.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.map(s => (
                  <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedStudentId === s.id ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="student" value={s.id} checked={selectedStudentId === s.id}
                      onChange={() => setSelectedStudentId(s.id)} className="text-[#1e3a5f]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{s.email} {s.nationality ? `· ${s.nationality}` : ''}</p>
                    </div>
                    {selectedStudentId === s.id && <CheckCircle size={16} className="text-[#1e3a5f] flex-shrink-0" />}
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedStudentId && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-0.5" required />
              <span className="text-xs text-gray-600">Je confirme que les informations de l'étudiant sont exactes et j'accepte les conditions générales.</span>
            </label>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={!selectedStudentId || loading || students.length === 0}
              className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              data-testid="apply-submit-btn">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? 'Envoi...' : 'Soumettre la candidature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Application Preview Modal ──────────────────────────────────────────────────
const AppPreviewModal = ({ app, onClose }) => {
  const printRef = useRef(null);

  const handleDownload = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Candidature — ${app.firstName} ${app.lastName} — ${app.offerTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
        h1 { font-size: 18px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px; }
        h2 { font-size: 13px; background: #1e3a5f; color: white; padding: 6px 12px; margin-top: 16px; border-radius: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
        .field { margin-bottom: 6px; }
        .label { font-size: 10px; color: #666; text-transform: uppercase; }
        .value { font-weight: 600; color: #1a1a1a; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .pending { background: #fef3c7; color: #92400e; }
        .approved { background: #d1fae5; color: #065f46; }
        .rejected { background: #fee2e2; color: #991b1b; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>
      ${el.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const Row = ({ label, value }) => value ? (
    <div className="field">
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  ) : null;

  const sc = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = sc.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] rounded-t-2xl">
          <div className="text-white">
            <h3 className="font-bold text-lg">{app.firstName} {app.lastName}</h3>
            <p className="text-blue-200 text-sm">{app.offerTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm transition-colors"
              data-testid={`download-app-${app.id}`}>
              <Download size={15} /> Télécharger
            </button>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"><X size={18} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4" ref={printRef}>
          <h1 style={{ display: 'none' }}>Candidature — {app.firstName} {app.lastName} — {app.offerTitle}</h1>

          {/* Status banner */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-5 ${sc.color}`}>
            <StatusIcon size={16} />
            <span className="font-semibold text-sm">Statut : {sc.label}</span>
            <span className="text-xs ml-auto opacity-70">{new Date(app.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>

          {/* Programme */}
          <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-xl p-4 mb-5">
            <h2 className="hidden">Programme</h2>
            <p className="text-xs font-medium text-[#1e3a5f] uppercase tracking-wide mb-1">Programme</p>
            <p className="font-bold text-gray-900">{app.offerTitle}</p>
            {app.university && <p className="text-sm text-gray-600">{app.university}</p>}
          </div>

          {/* Personal info */}
          <h2 className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl mb-3 text-sm font-semibold">
            <User size={14} /> Informations personnelles
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <Row label="Prénom" value={app.firstName} />
            <Row label="Nom" value={app.lastName} />
            <Row label="Sexe" value={app.sex} />
            <Row label="Date de naissance" value={app.dateOfBirth} />
            <Row label="Nationalité" value={app.nationality} />
            <Row label="Pays de naissance" value={app.countryOfBirth} />
            <Row label="Lieu de naissance" value={app.placeOfBirth} />
            <Row label="Langue maternelle" value={app.nativeLanguage} />
            <Row label="Religion" value={app.religion} />
            <Row label="Situation matrimoniale" value={app.maritalStatus} />
            <Row label="Profession" value={app.occupation} />
            <Row label="Téléphone" value={app.phoneNumber} />
            <Row label="Email" value={app.userEmail || app.personalEmail} />
          </div>

          {/* Passport */}
          <h2 className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-xl mb-3 text-sm font-semibold">
            <Shield size={14} /> Passeport
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <Row label="N° passeport" value={app.passportNumber} />
            <Row label="Date d'émission" value={app.passportIssuedDate} />
            <Row label="Date d'expiration" value={app.passportExpiryDate} />
          </div>

          {/* Address */}
          {(app.address || app.addressDetailed) && (
            <>
              <h2 className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl mb-3 text-sm font-semibold">
                <MapPin size={14} /> Résidence
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Row label="Adresse" value={app.address} />
                <Row label="Détails" value={app.addressDetailed} />
                <Row label="Téléphone" value={app.addressPhone} />
                <Row label="Code postal" value={app.zipCode} />
              </div>
            </>
          )}

          {/* Education */}
          {(app.educationalBackground || []).some(e => e.instituteName) && (
            <>
              <h2 className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl mb-3 text-sm font-semibold">
                <BookOpen size={14} /> Parcours académique
              </h2>
              <div className="space-y-2 mb-4">
                {(app.educationalBackground || []).filter(e => e.instituteName).map((e, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Row label="Établissement" value={e.instituteName} />
                    <Row label="Domaine" value={e.fieldOfStudy} />
                    <Row label="Niveau" value={e.educationLevel} />
                    <Row label="Période" value={e.yearsFrom && e.yearsTo ? `${e.yearsFrom} → ${e.yearsTo}` : e.yearsFrom || e.yearsTo} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Work */}
          {(app.workExperience || []).some(w => w.companyName) && (
            <>
              <h2 className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-xl mb-3 text-sm font-semibold">
                <Briefcase size={14} /> Expérience professionnelle
              </h2>
              <div className="space-y-2 mb-4">
                {(app.workExperience || []).filter(w => w.companyName).map((w, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Row label="Entreprise" value={w.companyName} />
                    <Row label="Poste" value={w.position} />
                    <Row label="Secteur" value={w.industryType} />
                    <Row label="Période" value={w.yearsFrom && w.yearsTo ? `${w.yearsFrom} → ${w.yearsTo}` : w.yearsFrom || w.yearsTo} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Documents */}
          {(app.documents || []).length > 0 && (
            <>
              <h2 className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl mb-3 text-sm font-semibold">
                <FileText size={14} /> Documents soumis
              </h2>
              <div className="space-y-1.5 mb-4">
                {app.documents.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100">
                    <FileText size={13} className="text-teal-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                        <Download size={11} /> Voir
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
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

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'students') loadStudents();
    if (activeTab === 'applications') { loadApplications(); loadStudents(); }
    if (activeTab === 'offers') { loadOffers(); loadStudents(); }
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  useEffect(() => { loadStats(); }, []);

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
    { id: 'students', label: 'Étudiants', icon: Users, count: students.length },
    { id: 'applications', label: 'Candidatures', icon: FileText, count: applications.length },
    { id: 'offers', label: 'Offres', icon: GraduationCap },
    { id: 'favorites', label: 'Favoris', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
  ];

  const filteredOffers = offers.filter(o =>
    !searchQuery || o.title?.toLowerCase().includes(searchQuery.toLowerCase()) || o.university?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]" data-testid="agent-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Espace Agent</h1>
              <p className="text-[11px] text-gray-500">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Retour au site">
              <Home size={18} />
            </button>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" data-testid="agent-logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Global modals (rendered outside tabs) */}
      {showStudentForm && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => { setShowStudentForm(false); setEditingStudent(null); }}
          onSave={handleStudentSave}
          loading={loading}
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`agent-tab-${tab.id}`}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Icon size={15} /> {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Étudiants', value: stats?.students || 0, icon: Users, color: 'bg-blue-600' },
                { label: 'Candidatures', value: stats?.totalApplications || 0, icon: FileText, color: 'bg-violet-600' },
                { label: 'En attente', value: stats?.pendingApplications || 0, icon: Clock, color: 'bg-amber-500' },
                { label: 'Approuvées', value: stats?.approvedApplications || 0, icon: CheckCircle, color: 'bg-emerald-600' },
                { label: 'Rejetées', value: stats?.rejectedApplications || 0, icon: XCircle, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('students')} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:border-[#1e3a5f]/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="font-semibold text-gray-900">Gérer mes étudiants</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
                </div>
              </button>
              <button onClick={() => setActiveTab('offers')} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:border-[#1e3a5f]/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#1e3a5f]" />
                    <span className="font-semibold text-gray-900">Voir les offres et postuler</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a5f]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mes Étudiants ({students.length})</h2>
              <button onClick={() => { setEditingStudent(null); setShowStudentForm(true); }} data-testid="add-student-btn"
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2">
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
                          onClick={() => { setApplyModal({ offer: o }); }}
                          data-testid={`apply-offer-${o.id}`}
                          className="flex items-center gap-1.5 text-xs bg-[#1e3a5f] text-white px-4 py-2 rounded-xl hover:opacity-90 font-medium transition-opacity">
                          <Send size={12} /> Postuler
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
                        <button onClick={() => { setApplyModal({ offer: o }); loadStudents(); }}
                          className="flex items-center gap-1.5 text-xs bg-[#1e3a5f] text-white px-3 py-1.5 rounded-xl hover:opacity-90 font-medium">
                          <Send size={12} /> Postuler
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
      </div>
    </div>
  );
};

export default AgentDashboard;

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

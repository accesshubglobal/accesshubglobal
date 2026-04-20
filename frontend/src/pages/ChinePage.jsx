import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Globe, GraduationCap, MapPin, Users, DollarSign, Clock, BookOpen, Award, Plane } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn{from{opacity:0;transform:translateX(-30px);}to{opacity:1;transform:translateX(0);}}
@keyframes countAnim{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.6;}}
.tab-btn{transition:all .25s;border-bottom:3px solid transparent;}
.tab-btn.active{border-bottom-color:#dc2626;color:#dc2626;}
.info-card{transition:all .3s;}
.info-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.12);}
`;

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Globe },
  { id: 'system', label: 'Système éducatif', icon: GraduationCap },
  { id: 'apply', label: 'Candidature', icon: FileText },
  { id: 'visa', label: 'Visa & Séjour', icon: Plane },
  { id: 'costs', label: 'Coût de vie', icon: DollarSign },
];

const STATS = [
  { v: '3 000+', l: 'Universités', icon: GraduationCap },
  { v: '500 000', l: 'Étudiants internationaux/an', icon: Users },
  { v: '4 000+', l: 'Programmes en anglais', icon: BookOpen },
  { v: '#2', l: 'Destination mondiale', icon: Award },
];

export default function ChinePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-screen bg-white">
        <Header onOpenAuth={() => {}} />

        {/* ── Hero ── */}
        <div className="relative h-[60vh] min-h-[440px] overflow-hidden">
          <img
            src="https://images.pexels.com/photos/32421367/pexels-photo-32421367.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt="Étudier en Chine"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl">
            <button
              onClick={() => navigate('/etudes')}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors w-fit text-sm"
            >
              <ArrowLeft size={16} /> Retour aux destinations
            </button>
            <div className="flex items-center gap-4 mb-4" style={{ animation: vis ? 'slideIn .7s ease forwards' : 'none' }}>
              <span className="text-6xl">🇨🇳</span>
              <div>
                <p className="text-red-400 text-sm font-bold uppercase tracking-widest">Destination</p>
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-none">Chine</h1>
              </div>
            </div>
            <p className="text-white/75 text-lg max-w-xl" style={{ animation: vis ? 'fadeUp .7s ease .15s forwards' : 'none', opacity: vis ? 1 : 0 }}>
              Rejoignez plus de 500 000 étudiants internationaux dans l'une des civilisations les plus riches du monde.
            </p>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="bg-[#dc2626] py-8 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center" style={{ animation: vis ? `countAnim .6s ease ${.1 + i*.1}s forwards` : 'none', opacity: vis ? 1 : 0 }}>
                <p className="text-3xl font-black text-white leading-none">{s.v}</p>
                <p className="text-red-200 text-xs mt-1 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto gap-0 scrollbar-none">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`tab-btn flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap ${tab === t.id ? 'active text-[#dc2626]' : 'text-gray-500 hover:text-gray-800'}`}
                  data-testid={`tab-${t.id}`}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-5xl mx-auto px-4 py-14">

          {/* ── Vue d'ensemble ── */}
          {tab === 'overview' && (
            <div className="space-y-12" style={{ animation: 'fadeUp .5s ease forwards' }}>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Pourquoi étudier en Chine ?</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    La Chine — officiellement la République Populaire de Chine — est la destination d'études internationales la plus dynamique d'Asie. Avec sa superficie de <strong>9,6 millions km²</strong>, ses <strong>56 groupes ethniques</strong> et <strong>3 500 ans d'histoire écrite</strong>, elle offre une expérience académique et humaine unique.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Voisine de <strong>14 pays</strong>, la Chine est le pays le plus peuplé de la planète et la deuxième économie mondiale. Étudier en Chine, c'est rejoindre le futur.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Le gouvernement chinois fait des efforts importants pour attirer les étudiants internationaux et propose de nombreuses <strong>bourses partiellement ou entièrement financées</strong> couvrant la scolarité et l'hébergement.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: GraduationCap, t: "Près de 3 000 établissements d'enseignement supérieur", c: 'text-red-600', b: 'bg-red-50 border-red-100' },
                    { icon: BookOpen, t: "Plus de 4 000 diplômes proposés en anglais — aucun mandarin requis", c: 'text-orange-600', b: 'bg-orange-50 border-orange-100' },
                    { icon: Globe, t: "Accords de reconnaissance académique avec plus de 180 pays", c: 'text-blue-600', b: 'bg-blue-50 border-blue-100' },
                    { icon: Award, t: "Bourses gouvernementales nombreuses et accessibles", c: 'text-green-600', b: 'bg-green-50 border-green-100' },
                    { icon: MapPin, t: "Grande Muraille, Mont Everest (8 849m), mégapoles modernes", c: 'text-purple-600', b: 'bg-purple-50 border-purple-100' },
                  ].map((item, i) => (
                    <div key={i} className={`info-card flex gap-4 p-4 rounded-2xl border ${item.b}`}>
                      <div className="flex-shrink-0 mt-0.5"><item.icon size={18} className={item.c} /></div>
                      <p className="text-gray-800 text-sm leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Majeurs populaires */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap size={20} className="text-[#dc2626]" /> Filières populaires</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Médecine', 'Ingénierie', 'Langue & Culture chinoise', 'Administration des affaires', 'Informatique', 'Économie internationale'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#dc2626] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Système éducatif ── */}
          {tab === 'system' && (
            <div className="space-y-10" style={{ animation: 'fadeUp .5s ease forwards' }}>
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Le système éducatif chinois</h2>
                <p className="text-gray-500 mb-8">Le plus grand système d'enseignement supérieur au monde, réformé depuis les années 1980 vers un modèle internationalisé.</p>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      level: 'Licence (Bachelor)', duration: '4 ans (6 ans pour Médecine)', emoji: '🎓',
                      color: 'border-red-200 bg-red-50/50',
                      details: [
                        '12 ans d\'études formelles requis',
                        'Maîtrise de l\'anglais suffisante',
                        'Lettre personnelle + recommandations',
                        'Documents certifiés par le Ministère',
                      ],
                      note: 'Système de notation : A(85-100%), B(75-84%), C(64-74%), D(60-63%), F(<60%)',
                    },
                    {
                      level: 'Master', duration: '2 à 3 ans', emoji: '📚',
                      color: 'border-orange-200 bg-orange-50/50',
                      details: [
                        'Bachelor terminé requis',
                        'Enseigné ou basé sur recherche',
                        'Possible en anglais (preuve requise)',
                        'Année académique : mars → octobre',
                      ],
                      note: 'Les dates peuvent varier selon le Nouvel An chinois',
                    },
                    {
                      level: 'Doctorat (PhD)', duration: '3 à 4 ans', emoji: '🔬',
                      color: 'border-blue-200 bg-blue-50/50',
                      details: [
                        'Master terminé + examens d\'entrée',
                        '2-3 ans de cours + 1 an thèse',
                        'La Chine a le plus de doctorants au monde',
                        'Programmes publiés annuellement',
                      ],
                      note: 'Conditions d\'entrée propres à chaque université',
                    },
                  ].map((l, i) => (
                    <div key={i} className={`info-card rounded-2xl border p-6 ${l.color}`}>
                      <div className="text-4xl mb-3">{l.emoji}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{l.level}</h3>
                      <div className="flex items-center gap-1 mb-4">
                        <Clock size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">{l.duration}</span>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {l.details.map((d, j) => (
                          <li key={j} className="flex gap-2 text-sm text-gray-700">
                            <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {d}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">{l.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Globe size={18} className="text-red-600" /> Universités publiques vs privées</h3>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Universités publiques</h4>
                    <p className="text-gray-600 text-sm">Entièrement financées par l'État. Plus prestigieuses, coût entre <strong>2 000 et 10 000 USD/an</strong>. Universités de Pékin, Tsinghua, Zhejiang font partie du top mondial.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Universités privées</h4>
                    <p className="text-gray-600 text-sm">Financées par des organisations non-gouvernementales. Coût jusqu'à <strong>30 000 USD/an</strong>. Souvent plus flexibles sur les admissions. MBA jusqu'à 40 000 USD/an.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Candidature ── */}
          {tab === 'apply' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Processus de candidature</h2>
              <p className="text-gray-500 mb-10">La procédure est accessible et bien structurée. Voici les 7 étapes clés :</p>

              <div className="space-y-6">
                {[
                  {
                    n: 1, title: 'Choisissez votre filière', color: 'bg-red-500',
                    desc: 'Réfléchissez à votre vision de carrière. La Chine propose des diplômes dans toutes les disciplines. Choisissez selon votre passion et votre projet professionnel.',
                  },
                  {
                    n: 2, title: 'Vérifiez les conditions d\'admission', color: 'bg-orange-500',
                    desc: 'Chaque université a des exigences propres. Consultez les sites officiels et préparez la documentation requise selon le niveau visé (licence, master, doctorat).',
                  },
                  {
                    n: 3, title: 'Préparez les documents', color: 'bg-yellow-500',
                    desc: 'Passeport, déclaration personnelle, relevés de notes, certificat médical, casier judiciaire, lettres de recommandation, preuve de niveau en anglais (IELTS/TOEFL) ou en mandarin (HSK pour programmes en chinois).',
                  },
                  {
                    n: 4, title: 'Soumettez la candidature', color: 'bg-green-500',
                    desc: 'Directement sur le site de l\'université OU via des services officiels (CUCAS, China Admissions, CUAC) qui servent de médiateurs entre les étudiants et les universités.',
                  },
                  {
                    n: 5, title: 'Demande de visa étudiant', color: 'bg-blue-500',
                    desc: 'Dès la lettre d\'acceptation reçue, commencez immédiatement les démarches de visa auprès de l\'ambassade ou consulat chinois le plus proche.',
                  },
                  {
                    n: 6, title: 'Souscrivez une assurance médicale', color: 'bg-purple-500',
                    desc: 'Obligation légale pour tous les étudiants internationaux. Le système de santé chinois ne couvre pas les étrangers. Principaux assureurs : China Taiping, China Life, China Pacific Insurance.',
                  },
                  {
                    n: 7, title: 'Réservez votre vol et logement', color: 'bg-pink-500',
                    desc: 'Recherchez les dortoirs universitaires (150-400 USD/mois) ou des appartements. Emportez vos vêtements et partez confiant pour cette nouvelle aventure !',
                  },
                ].map((step) => (
                  <div key={step.n} className="info-card flex gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl ${step.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>{step.n}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-red-50 border border-red-200 rounded-2xl p-6">
                <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Award size={18} /> Conseil AccessHub Global</h4>
                <p className="text-red-800 text-sm leading-relaxed">Commencez vos démarches 6 à 12 mois avant la rentrée. Nos conseillers vous accompagnent à chaque étape : choix d'université, traduction de documents, préparation des dossiers et suivi des visas.</p>
              </div>
            </div>
          )}

          {/* ── Visa ── */}
          {tab === 'visa' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Visa et permis de séjour</h2>
              <p className="text-gray-500 mb-10">À demander peu après avoir reçu votre lettre d'acceptation universitaire.</p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                  {
                    type: 'Visa X', period: 'Études de plus de 6 mois', color: 'border-red-200 bg-red-50',
                    badge: 'bg-red-100 text-red-700',
                    points: ['Pour les étudiants en licence, master ou doctorat', 'Le plus courant pour les études longues durées', 'À convertir en titre de séjour sous 30 jours'],
                  },
                  {
                    type: 'Visa F', period: 'Stage ou cours de moins de 6 mois', color: 'border-blue-200 bg-blue-50',
                    badge: 'bg-blue-100 text-blue-700',
                    points: ['Idéal pour un cours de langue chinoise (HSK)', 'Pour les stages courts', 'Plus simple à obtenir'],
                  },
                ].map((v, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 ${v.color}`}>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block ${v.badge}`}>{v.period}</span>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">{v.type}</h3>
                    <ul className="space-y-2">
                      {v.points.map((p, j) => (
                        <li key={j} className="flex gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><FileText size={18} className="text-red-600" /> Documents requis pour le visa</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Document JW201 ou JW202 (obtenu auprès de l\'ambassade ou université)',
                    'Passeport valide (+6 mois de validité restante)',
                    'Photos récentes format passeport',
                    'Avis d\'admission de l\'université',
                    'Formulaire d\'examen physique complété',
                    'Frais de demande (~140 USD)',
                  ].map((d, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><Clock size={16} /> Délai de traitement</h4>
                  <p className="text-amber-800 text-sm">Environ <strong>1 semaine</strong> pour le traitement standard.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><MapPin size={16} /> Après votre arrivée</h4>
                  <p className="text-blue-800 text-sm"><strong>30 jours</strong> pour demander votre titre de séjour auprès de la Division d'administration des entrées-sorties du bureau local de sécurité publique.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Coût de vie ── */}
          {tab === 'costs' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Coût de vie en Chine</h2>
              <p className="text-gray-500 mb-10">La Chine est l'une des destinations les plus abordables pour les étudiants internationaux.</p>

              <div className="grid md:grid-cols-3 gap-5 mb-10">
                {[
                  { city: 'Petites villes', cost: '~550 USD/mois', icon: '🏘️', ex: 'Chengdu, Hangzhou', color: 'bg-green-50 border-green-200' },
                  { city: 'Villes moyennes', cost: '~700 USD/mois', icon: '🏙️', ex: 'Shenzhen, Nanjing', color: 'bg-blue-50 border-blue-200' },
                  { city: 'Grandes métropoles', cost: '~850 USD/mois', icon: '🌆', ex: 'Shanghai, Pékin', color: 'bg-purple-50 border-purple-200' },
                ].map((c, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 text-center ${c.color}`}>
                    <div className="text-4xl mb-3">{c.city}</div>
                    <p className="text-sm text-gray-500 mb-2">{c.ex}</p>
                    <p className="text-2xl font-black text-gray-900">{c.cost}</p>
                    <p className="text-xs text-gray-500 mt-1">toutes dépenses incluses</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={18} className="text-red-600" /> Options de logement</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'Dortoir universitaire', price: '150 – 400 USD/mois', desc: 'Proposé directement par l\'université. Option économique et pratique.', color: 'bg-green-50 border-green-100' },
                      { type: 'Appartement (seul/coloc)', price: '300 – 1 000 USD/mois', desc: 'Selon l\'emplacement et la ville. Plus d\'indépendance.', color: 'bg-blue-50 border-blue-100' },
                      { type: 'Famille chinoise (homestay)', price: '300 – 550 USD/mois', desc: 'Immersion culturelle et linguistique. Idéal pour progresser en mandarin.', color: 'bg-orange-50 border-orange-100' },
                    ].map((l, i) => (
                      <div key={i} className={`rounded-xl border p-4 ${l.color}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{l.type}</h4>
                          <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border">{l.price}</span>
                        </div>
                        <p className="text-xs text-gray-600">{l.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen size={18} className="text-red-600" /> Dépenses courantes (en yuan)</h3>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="text-left px-5 py-3 font-bold text-gray-700">Dépense</th>
                          <th className="text-right px-5 py-3 font-bold text-gray-700">Coût moyen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { item: 'Repas', cost: '20 ¥' },
                          { item: 'Billet de cinéma', cost: '45 ¥' },
                          { item: 'Loyer mensuel (depuis)', cost: '1 900 ¥' },
                          { item: 'Transport mensuel (depuis)', cost: '60 ¥' },
                          { item: 'Transport étudiant (~)', cost: '~20 USD/mois' },
                        ].map((r, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-5 py-3 text-gray-700">{r.item}</td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-900">{r.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm text-red-800"><strong>Conseil :</strong> Profitez des transports en commun chinois et des réductions étudiantes. Excellent réseau dans toutes les grandes villes.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">Études gratuites possibles !</h3>
                <p className="text-red-100 text-sm leading-relaxed">Il est possible d'étudier en Chine sans frais de scolarité grâce aux nombreuses bourses du gouvernement chinois et des universités. AccessHub Global vous aide à identifier et postuler aux meilleures bourses disponibles.</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors">
                  Voir nos offres de bourses
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Nav buttons ── */}
        <div className="max-w-5xl mx-auto px-4 pb-16 flex gap-4 flex-wrap">
          <button onClick={() => navigate('/etudes')} className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
            <ArrowLeft size={16} /> Toutes les destinations
          </button>
          <button onClick={() => navigate('/etudes/france')} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Découvrir la France 🇫🇷 <ArrowRight size={16} />
          </button>
        </div>

        <Footer />
      </div>
    </>
  );
}

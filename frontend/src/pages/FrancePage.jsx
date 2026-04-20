import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Globe, GraduationCap, MapPin, Users, DollarSign, Clock, BookOpen, Award, Plane, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn{from{opacity:0;transform:translateX(-30px);}to{opacity:1;transform:translateX(0);}}
@keyframes countAnim{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
.tab-btn{transition:all .25s;border-bottom:3px solid transparent;}
.tab-btn.active{border-bottom-color:#1d4ed8;color:#1d4ed8;}
.info-card{transition:all .3s;}
.info-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.1);}
`;

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Globe },
  { id: 'system', label: 'Système éducatif', icon: GraduationCap },
  { id: 'apply', label: 'Candidature', icon: FileText },
  { id: 'visa', label: 'Visa & Séjour', icon: Plane },
  { id: 'costs', label: 'Coût de vie', icon: DollarSign },
];

const STATS = [
  { v: '3 500+', l: 'Universités', icon: GraduationCap },
  { v: '350 000', l: 'Étudiants internationaux', icon: Users },
  { v: '230+', l: 'Grandes Écoles', icon: Award },
  { v: '#3', l: 'Destination mondiale', icon: Star },
];

export default function FrancePage() {
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
          <img src="https://images.pexels.com/photos/34773160/pexels-photo-34773160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Étudier en France" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl">
            <button onClick={() => navigate('/etudes')} className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors w-fit text-sm">
              <ArrowLeft size={16} /> Retour aux destinations
            </button>
            <div className="flex items-center gap-4 mb-4" style={{ animation: vis ? 'slideIn .7s ease forwards' : 'none' }}>
              <span className="text-6xl">🇫🇷</span>
              <div>
                <p className="text-blue-300 text-sm font-bold uppercase tracking-widest">Destination</p>
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-none">France</h1>
              </div>
            </div>
            <p className="text-white/75 text-lg max-w-xl" style={{ animation: vis ? 'fadeUp .7s ease .15s forwards' : 'none', opacity: vis ? 1 : 0 }}>
              Universités prestigieuses, Grandes Écoles reconnues et une vie culturelle incomparable au cœur de l'Europe.
            </p>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="bg-[#1d4ed8] py-8 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center" style={{ animation: vis ? `countAnim .6s ease ${.1 + i*.1}s forwards` : 'none', opacity: vis ? 1 : 0 }}>
                <p className="text-3xl font-black text-white leading-none">{s.v}</p>
                <p className="text-blue-200 text-xs mt-1 font-medium">{s.l}</p>
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
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`tab-btn flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap ${tab === t.id ? 'active text-[#1d4ed8]' : 'text-gray-500 hover:text-gray-800'}`}
                  data-testid={`tab-${t.id}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-5xl mx-auto px-4 py-14">

          {tab === 'overview' && (
            <div className="space-y-12" style={{ animation: 'fadeUp .5s ease forwards' }}>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Pourquoi étudier en France ?</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">La France est la 3ème destination mondiale pour les étudiants internationaux, avec plus de <strong>350 000 étudiants étrangers</strong>. Son système d'enseignement supérieur est reconnu pour son excellence académique et la diversité de ses formations.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Entre les universités publiques très accessibles financièrement et les Grandes Écoles reconnues mondialement (HEC, Polytechnique, Sciences Po), la France offre des parcours d'exception dans tous les domaines.</p>
                  <p className="text-gray-600 leading-relaxed">La langue française est un atout majeur sur le marché international du travail, et de nombreux programmes sont disponibles entièrement en anglais.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: GraduationCap, t: 'Plus de 3 500 établissements dont 230+ Grandes Écoles', c: 'text-blue-600', b: 'bg-blue-50 border-blue-100' },
                    { icon: DollarSign, t: 'Frais de scolarité très bas dans les universités publiques (environ 170 – 600 €/an)', c: 'text-green-600', b: 'bg-green-50 border-green-100' },
                    { icon: Award, t: 'Bourses du gouvernement français et d\'institutions comme Campus France', c: 'text-orange-600', b: 'bg-orange-50 border-orange-100' },
                    { icon: Globe, t: 'Nombreux programmes enseignés entièrement en anglais', c: 'text-purple-600', b: 'bg-purple-50 border-purple-100' },
                    { icon: MapPin, t: 'Paris, Lyon, Toulouse, Bordeaux, Marseille — villes étudiantes dynamiques', c: 'text-red-600', b: 'bg-red-50 border-red-100' },
                  ].map((item, i) => (
                    <div key={i} className={`info-card flex gap-4 p-4 rounded-2xl border ${item.b}`}>
                      <item.icon size={18} className={`${item.c} flex-shrink-0 mt-0.5`} />
                      <p className="text-gray-800 text-sm leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap size={20} className="text-blue-600" /> Filières populaires</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Droit & Sciences politiques', 'Management & Business', 'Architecture & Design', 'Médecine & Santé', 'Sciences & Ingénierie', 'Arts & Lettres', 'Informatique & IA', 'Mode & Luxe', 'Sciences sociales'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div className="space-y-10" style={{ animation: 'fadeUp .5s ease forwards' }}>
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Le système LMD</h2>
                <p className="text-gray-500 mb-8">La France a adopté le système Licence-Master-Doctorat (LMD) harmonisé avec toute l'Europe (Processus de Bologne).</p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { level: 'Licence (L1-L3)', dur: '3 ans (180 ECTS)', emoji: '🎓', color: 'border-blue-200 bg-blue-50/50', pts: ['Bac ou équivalent requis', 'Très faibles frais (~170€/an public)', 'Études générales ou professionnelles', 'L3 Pro = insertion professionnelle directe'] },
                    { level: 'Master (M1-M2)', dur: '2 ans (120 ECTS)', emoji: '📚', color: 'border-indigo-200 bg-indigo-50/50', pts: ['Licence ou équivalent 3 ans requis', 'Master Recherche ou Professionnel', 'Sélectif selon les établissements', 'Frais ~243€/an en universités publiques'] },
                    { level: 'Doctorat', dur: '3 ans minimum', emoji: '🔬', color: 'border-violet-200 bg-violet-50/50', pts: ['Master 2 Recherche requis', 'Financé par contrat doctoral ou bourse', 'Travaux de recherche originaux', 'Soutenance devant jury'] },
                  ].map((l, i) => (
                    <div key={i} className={`info-card rounded-2xl border p-6 ${l.color}`}>
                      <div className="text-4xl mb-3">{l.emoji}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{l.level}</h3>
                      <div className="flex items-center gap-1 mb-4"><Clock size={13} className="text-gray-400" /><span className="text-xs text-gray-500 font-medium">{l.dur}</span></div>
                      <ul className="space-y-2">
                        {l.pts.map((p, j) => <li key={j} className="flex gap-2 text-sm text-gray-700"><CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />{p}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-3">Grandes Écoles — l'élite française</h3>
                <p className="text-blue-800 text-sm leading-relaxed mb-3">Les Grandes Écoles sont spécifiques au système français. Sélectives et très renommées, elles forment les élites dans les domaines du management, de l'ingénierie, de la politique et des arts. Les plus connues sont HEC Paris, École Polytechnique, Sciences Po, ESSEC, CentraleSupélec.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {['HEC Paris — Business', 'Polytechnique — Ingénierie', 'Sciences Po — Sciences sociales', 'ESSEC Business School', 'CentraleSupélec', 'INSEAD — MBA'].map((e, i) => (
                    <div key={i} className="bg-white rounded-xl px-3 py-2 text-xs font-semibold text-blue-800 border border-blue-200 text-center">{e}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'apply' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Candidature en France</h2>
              <p className="text-gray-500 mb-10">La France dispose de plateformes officielles dédiées aux étudiants internationaux.</p>
              <div className="space-y-5">
                {[
                  { n: 1, t: 'Campus France — étape obligatoire', c: 'bg-blue-600', d: 'Pour la majorité des pays africains (dont le Maroc, la Côte d\'Ivoire, le Sénégal...), la procédure Campus France est obligatoire avant toute demande de visa. Créez votre dossier sur campusfrance.org.' },
                  { n: 2, t: 'Choisissez votre établissement', c: 'bg-indigo-500', d: 'Université publique (frais très bas), Grandes Écoles (sélectives, frais variables), écoles spécialisées (commerce, design, architecture, ingénierie).' },
                  { n: 3, t: 'Parcoursup ou plateforme directe', c: 'bg-violet-500', d: 'Pour les licences : Parcoursup (etudiant-etranger.fr pour les non-Européens). Pour les masters : MonMaster.gouv.fr. Pour les grandes écoles : directement sur leurs sites.' },
                  { n: 4, t: 'Préparez le dossier', c: 'bg-purple-500', d: 'Relevés de notes apostillés, CV académique, lettre de motivation, lettres de recommandation, preuve de niveau en français (TCF/DELF) ou en anglais (IELTS/TOEFL) selon le programme.' },
                  { n: 5, t: 'Visa Étudiant VLS-TS', c: 'bg-pink-500', d: 'Visa long séjour valant titre de séjour, valable 1 an renouvelable. Déposez la demande dans le centre VFS Global ou à l\'ambassade de France.' },
                  { n: 6, t: 'Logement et CAF', c: 'bg-red-500', d: 'CROUS pour les résidences universitaires (très bon marché). Demandez les aides APL de la CAF dès votre arrivée — réduction significative de votre loyer.' },
                ].map((s) => (
                  <div key={s.n} className="info-card flex gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl ${s.c} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>{s.n}</div>
                    <div><h3 className="font-bold text-gray-900 mb-1">{s.t}</h3><p className="text-gray-600 text-sm leading-relaxed">{s.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'visa' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Visa étudiant pour la France</h2>
              <p className="text-gray-500 mb-8">Le visa long séjour étudiant (VLS-TS) est le document clé pour étudier en France plus de 3 mois.</p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { t: 'Visa court séjour', p: 'Études < 3 mois', b: 'border-blue-200 bg-blue-50', pts: ['Cours de langue d\'été', 'Stage court', 'Conférence académique', 'Pas de renouvellement possible'] },
                  { t: 'VLS-TS Étudiant', p: 'Études > 3 mois (standard)', b: 'border-indigo-200 bg-indigo-50', pts: ['Valable 1 an renouvelable', 'Permet de travailler 964h/an', 'Validation OFII à l\'arrivée obligatoire', 'Mène à la carte de séjour pluriannuelle'] },
                ].map((v, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 ${v.b}`}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 mb-4 inline-block">{v.p}</span>
                    <h3 className="text-xl font-black text-gray-900 mb-4">{v.t}</h3>
                    <ul className="space-y-2">{v.pts.map((p, j) => <li key={j} className="flex gap-2 text-sm text-gray-700"><CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-600" /> Documents requis</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Passeport valide (+6 mois)', 'Attestation d\'inscription / lettre d\'admission', 'Justificatif de ressources (615€/mois minimum)', 'Assurance maladie internationale', 'Justificatif de logement en France', 'Photos d\'identité', 'Formulaire de demande de visa', 'Attestation Campus France (si applicable)'].map((d, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'costs' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Coût de vie en France</h2>
              <p className="text-gray-500 mb-10">La France offre un excellent rapport qualité/prix, surtout hors Paris, avec de nombreuses aides sociales pour les étudiants.</p>
              <div className="grid md:grid-cols-3 gap-5 mb-10">
                {[
                  { city: 'Province', cost: '800 – 1 100 €/mois', ex: 'Lille, Bordeaux, Lyon', color: 'bg-green-50 border-green-200' },
                  { city: 'Toulouse / Nantes', cost: '1 000 – 1 300 €/mois', ex: 'Villes dynamiques', color: 'bg-blue-50 border-blue-200' },
                  { city: 'Paris', cost: '1 400 – 2 000 €/mois', ex: 'Île-de-France', color: 'bg-purple-50 border-purple-200' },
                ].map((c, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 text-center ${c.color}`}>
                    <p className="text-sm font-bold text-gray-700 mb-2">{c.city}</p>
                    <p className="text-xs text-gray-500 mb-3">{c.ex}</p>
                    <p className="text-xl font-black text-gray-900">{c.cost}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">Aides financières disponibles</h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {['APL (Aide Personnalisée au Logement) : -100 à -300€/mois sur le loyer', 'Bourse Eiffel : jusqu\'à 1 181€/mois pour master/doctorat', 'Bourses d\'excellence : Sciences Po, INSEAD...', 'Aides des régions et collectivités locales'].map((a, i) => (
                    <div key={i} className="flex gap-2 bg-white/10 rounded-xl p-3">
                      <CheckCircle size={14} className="text-green-300 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-blue-100">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16 flex gap-4 flex-wrap">
          <button onClick={() => navigate('/etudes/chine')} className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
            <ArrowLeft size={16} /> Voir la Chine
          </button>
          <button onClick={() => navigate('/etudes/canada')} className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
            Découvrir le Canada 🇨🇦 <ArrowRight size={16} />
          </button>
        </div>
        <Footer />
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Globe, GraduationCap, Users, DollarSign, Clock, BookOpen, Award, Plane, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn{from{opacity:0;transform:translateX(-30px);}to{opacity:1;transform:translateX(0);}}
@keyframes countAnim{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
.tab-btn{transition:all .25s;border-bottom:3px solid transparent;}
.tab-btn.active{border-bottom-color:#b91c1c;color:#b91c1c;}
.info-card{transition:all .3s;}
.info-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.1);}
`;

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: Globe },
  { id: 'system', label: "Système éducatif", icon: GraduationCap },
  { id: 'apply', label: "Candidature", icon: FileText },
  { id: 'visa', label: "Visa & Séjour", icon: Plane },
  { id: 'costs', label: "Coût de vie", icon: DollarSign },
];

const STATS = [
  { v: '200+', l: 'Universités', icon: GraduationCap },
  { v: '800 000', l: 'Étudiants internationaux', icon: Users },
  { v: '2 langues', l: 'Anglais & Français', icon: BookOpen },
  { v: 'PGWP', l: 'Permis travail post-diplôme', icon: Award },
];

export default function CanadaPage() {
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
          <img src="https://images.unsplash.com/photo-1601269140247-ede0bbd75c00?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxDYW5hZGElMjBUb3JvbnRvJTIwdW5pdmVyc2l0eSUyMGNhbXB1cyUyMGF1dHVtbnxlbnwwfHx8fDE3NzY3MTAyNDd8MA&ixlib=rb-4.1.0&q=85" alt="Étudier au Canada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl">
            <button onClick={() => navigate('/etudes')} className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors w-fit text-sm">
              <ArrowLeft size={16} /> Retour aux destinations
            </button>
            <div className="flex items-center gap-4 mb-4" style={{ animation: vis ? 'slideIn .7s ease forwards' : 'none' }}>
              <span className="text-6xl">🇨🇦</span>
              <div>
                <p className="text-red-300 text-sm font-bold uppercase tracking-widest">Destination</p>
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-none">Canada</h1>
              </div>
            </div>
            <p className="text-white/75 text-lg max-w-xl" style={{ animation: vis ? 'fadeUp .7s ease .15s forwards' : 'none', opacity: vis ? 1 : 0 }}>
              La qualité nord-américaine, la sécurité et des voies d'immigration parmi les plus accessibles du monde.
            </p>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="bg-[#b91c1c] py-8 px-4">
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
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`tab-btn flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap ${tab === t.id ? 'active' : 'text-gray-500 hover:text-gray-800'}`}
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
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Pourquoi étudier au Canada ?</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">Le Canada est l'une des destinations d'études les plus prisées au monde, avec un système éducatif classé dans le <strong>top 5 mondial</strong>. Le pays accueille plus de <strong>800 000 étudiants internationaux</strong> par an grâce à ses politiques d'accueil ouvertes.</p>
                  <p className="text-gray-600 leading-relaxed mb-4">Pays bilingue (anglais et français), le Canada offre des formations dans les deux langues, ce qui représente un avantage unique pour les étudiants francophones notamment au Québec.</p>
                  <p className="text-gray-600 leading-relaxed">Le <strong>Permis de Travail Post-Diplôme (PGWP)</strong> permet aux diplômés de rester et travailler jusqu'à 3 ans, ouvrant la voie à la résidence permanente.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Award, t: 'Université de Toronto, McGill, UBC, Waterloo — parmi les meilleures mondiales', c: 'text-red-600', b: 'bg-red-50 border-red-100' },
                    { icon: Globe, t: 'Bilinguisme : programmes disponibles en anglais ET en français', c: 'text-blue-600', b: 'bg-blue-50 border-blue-100' },
                    { icon: Users, t: 'Société multiculturelle et très accueillante pour les immigrants', c: 'text-green-600', b: 'bg-green-50 border-green-100' },
                    { icon: DollarSign, t: 'Coûts inférieurs aux USA avec une qualité de vie supérieure', c: 'text-orange-600', b: 'bg-orange-50 border-orange-100' },
                    { icon: Plane, t: 'Voies d\'immigration claires et accessibles après les études (PGWP, Express Entry)', c: 'text-purple-600', b: 'bg-purple-50 border-purple-100' },
                  ].map((item, i) => (
                    <div key={i} className={`info-card flex gap-4 p-4 rounded-2xl border ${item.b}`}>
                      <item.icon size={18} className={`${item.c} flex-shrink-0 mt-0.5`} />
                      <p className="text-gray-800 text-sm leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><GraduationCap size={20} className="text-red-700" /> Filières populaires</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Intelligence artificielle', 'Génie informatique', 'Sciences de la santé', 'Finance & Comptabilité', 'Environnement & Durabilité', 'Sciences de l\'éducation', 'Commerce international', 'Droit', 'Architecture'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-300 hover:bg-red-50/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div className="space-y-10" style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Le système éducatif canadien</h2>
              <p className="text-gray-500 mb-8">Géré par les provinces, le système est décentralisé mais uniformément de haute qualité. Les principaux types d'établissements :</p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { t: 'Université (4 ans)', e: '🏛️', c: 'border-red-200 bg-red-50/50', pts: ['Baccalauréat (licence) en 4 ans', 'Master en 1-2 ans', 'Doctorat en 4-5 ans', 'Toronto, McGill, UBC, Waterloo'] },
                  { t: 'Collège (2-3 ans)', e: '🏫', c: 'border-orange-200 bg-orange-50/50', pts: ['Diplôme technique ou professionnel', 'Admission plus accessible', 'Passerelle vers l\'université possible', 'Très bonne intégration au marché du travail'] },
                  { t: 'CÉGEP (Québec)', e: '📗', c: 'border-blue-200 bg-blue-50/50', pts: ['Spécifique au Québec', '2 ans pré-universitaire', 'Ou 3 ans technique', 'Passerelle obligatoire pour université au Québec'] },
                ].map((l, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 ${l.c}`}>
                    <div className="text-4xl mb-3">{l.e}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{l.t}</h3>
                    <ul className="space-y-2">{l.pts.map((p, j) => <li key={j} className="flex gap-2 text-sm text-gray-700"><CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 mb-3">Meilleures universités canadiennes</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {['Université de Toronto', 'McGill University', 'Université de Colombie-Britannique (UBC)', 'Université de Waterloo', 'Queen\'s University', 'Université de Montréal (FR)'].map((u, i) => (
                    <div key={i} className="bg-white rounded-xl px-3 py-2 text-xs font-semibold text-red-800 border border-red-200 text-center">{u}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'apply' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Candidature au Canada</h2>
              <p className="text-gray-500 mb-10">Le processus est direct et se fait principalement en ligne.</p>
              <div className="space-y-5">
                {[
                  { n: 1, t: 'Choisissez votre province et programme', c: 'bg-red-600', d: 'Ontario (Toronto), Québec (Montréal), Colombie-Britannique (Vancouver), Alberta (Calgary). Le Québec requiert un Certificat d\'Acceptation du Québec (CAQ) en plus du permis d\'études fédéral.' },
                  { n: 2, t: 'Préparez les documents', c: 'bg-orange-500', d: 'Relevés de notes officiels, preuve de langue (IELTS/TOEFL pour EN, TEF/TCF pour FR), lettre de motivation, références académiques, preuve financière (~10 000 CAD/an minimum).' },
                  { n: 3, t: 'Candidature directe à l\'université', c: 'bg-yellow-500', d: 'Chaque université a son propre portail de candidature. Pas de plateforme nationale unifiée contrairement à la France. Dates limites généralement en janvier pour la rentrée de septembre.' },
                  { n: 4, t: 'Lettre d\'acceptation (LOA)', c: 'bg-green-500', d: 'La Letter of Acceptance est indispensable pour demander le Permis d\'Études. Conservez-la soigneusement.' },
                  { n: 5, t: 'Permis d\'études (Gouvernement Canada)', c: 'bg-blue-500', d: 'Déposez votre demande sur le site IRCC (Immigration Canada). Délai moyen : 4 à 8 semaines. SDS (Student Direct Stream) disponible pour certains pays francophones — délai réduit à 20 jours.' },
                  { n: 6, t: 'Arrivée et installation', c: 'bg-purple-500', d: 'La plupart des universités proposent des services d\'accueil dédiés aux étudiants internationaux (orientation, logement, accompagnement culturel).' },
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
              <h2 className="text-3xl font-black text-gray-900 mb-2">Permis d'études & Immigration</h2>
              <p className="text-gray-500 mb-8">Le Canada dispose du système d'immigration le plus accessible parmi les grandes destinations d'études.</p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { t: "Permis d'études", p: "Études > 6 mois", b: "border-red-200 bg-red-50", pts: ["Lettre d'acceptation d'un DSD (école désignée)", "Preuve financière (~10 000 CAD/an)", "Examen médical si requis", "Validité = durée des études + 90 jours"] },
                  { t: "PGWP (Post-Graduation)", p: "Après le diplôme", b: "border-green-200 bg-green-50", pts: ["Permis travail ouvert jusqu'à 3 ans", "Durée = durée du programme d'études", "Passerelle vers la résidence permanente", "Express Entry, Provincial Nominee Program"] },
                ].map((v, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 ${v.b}`}>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border text-gray-600 mb-4 inline-block">{v.p}</span>
                    <h3 className="text-xl font-black text-gray-900 mb-4">{v.t}</h3>
                    <ul className="space-y-2">{v.pts.map((p, j) => <li key={j} className="flex gap-2 text-sm text-gray-700"><CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />{p}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 mb-3">🍁 Spécificité Québec</h3>
                <p className="text-red-800 text-sm mb-3">En plus du permis fédéral, le Québec exige un <strong>Certificat d'Acceptation du Québec (CAQ)</strong>. Ce document est spécifique à la province et doit être obtenu avant le permis d'études. Il témoigne de la volonté du Québec d'accueillir des étudiants francophones en priorité.</p>
                <p className="text-red-700 text-xs">Délai CAQ : 3 à 4 semaines | Frais : 112 CAD</p>
              </div>
            </div>
          )}

          {tab === 'costs' && (
            <div style={{ animation: 'fadeUp .5s ease forwards' }}>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Coût de vie au Canada</h2>
              <p className="text-gray-500 mb-8">Variable selon la province et la ville. Plus abordable que les USA avec une qualité de vie supérieure.</p>
              <div className="grid md:grid-cols-3 gap-5 mb-10">
                {[
                  { c: 'Winnipeg / Halifax', p: '1 200 – 1 500 CAD/mois', e: 'Villes abordables', col: 'bg-green-50 border-green-200' },
                  { c: 'Montréal (QC)', p: '1 500 – 2 000 CAD/mois', e: 'Francophone, dynamic', col: 'bg-blue-50 border-blue-200' },
                  { c: 'Toronto / Vancouver', p: '2 000 – 3 000 CAD/mois', e: 'Métropoles', col: 'bg-purple-50 border-purple-200' },
                ].map((c, i) => (
                  <div key={i} className={`info-card rounded-2xl border p-6 text-center ${c.col}`}>
                    <p className="text-sm font-bold text-gray-700 mb-1">{c.c}</p>
                    <p className="text-xs text-gray-500 mb-3">{c.e}</p>
                    <p className="text-lg font-black text-gray-900">{c.p}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Scolarité indicative (par an)</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { i: 'Licence (anglophone)', p: '15 000 – 35 000 CAD/an' },
                    { i: 'Master', p: '15 000 – 40 000 CAD/an' },
                    { i: 'Québec (FR)', p: '9 000 – 20 000 CAD/an' },
                    { i: 'Collège', p: '8 000 – 18 000 CAD/an' },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">{r.i}</span>
                      <span className="text-sm font-bold text-red-700">{r.p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">Travail pendant les études</h3>
                <p className="text-red-100 text-sm leading-relaxed">Les étudiants internationaux peuvent travailler <strong>jusqu'à 24h/semaine</strong> hors campus pendant les sessions et à temps plein pendant les vacances. Cela représente un revenu complémentaire significatif pour financer les études et le logement.</p>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-16 flex gap-4 flex-wrap">
          <button onClick={() => navigate('/etudes/france')} className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
            <ArrowLeft size={16} /> Voir la France
          </button>
          <button onClick={() => navigate('/etudes')} className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Toutes les destinations <ArrowRight size={16} />
          </button>
        </div>
        <Footer />
      </div>
    </>
  );
}

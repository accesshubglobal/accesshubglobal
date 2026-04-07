import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Users, Building2, Briefcase,
  Globe, TrendingUp, Shield, Star, ChevronDown,
  GraduationCap, Award, Zap, HeartHandshake, BarChart3,
  FileText, UserCheck, BadgeCheck, Sparkles, Clock, Home
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ── Config par type de partenariat ──────────────────────────────────────────
const CONFIGS = {
  agent: {
    registerPath: '/agent/register',
    accentColor: '#3b82f6',
    accentLight: 'rgba(59,130,246,0.15)',
    orbA: '#1a56db',
    orbB: '#7c3aed',
    label: 'Programme Agent',
    title: 'Accompagnez des étudiants.',
    titleHighlight: 'Développez votre activité.',
    subtitle: 'Rejoignez notre réseau d\'agents agréés et aidez des étudiants du monde entier à intégrer les meilleures universités partenaires d\'AccessHub Global.',
    ctaLabel: 'Devenir Agent Partenaire',
    icon: UserCheck,
    stats: [
      { value: '500+', label: 'Universités partenaires' },
      { value: '30+', label: 'Pays couverts' },
      { value: '95%', label: 'Taux d\'acceptation' },
    ],
    benefits: [
      { icon: TrendingUp, title: 'Commissions attractives', desc: 'Recevez une commission compétitive pour chaque candidature acceptée par nos universités partenaires.' },
      { icon: Globe, title: 'Réseau international', desc: 'Accédez à un réseau de 500+ universités dans 30+ pays pour diversifier vos offres.' },
      { icon: BarChart3, title: 'Tableau de bord dédié', desc: 'Suivez vos candidatures, vos étudiants et vos performances en temps réel.' },
      { icon: Shield, title: 'Support & Formation', desc: 'Bénéficiez d\'un support dédié et de formations pour maximiser votre efficacité.' },
      { icon: FileText, title: 'Outils de gestion', desc: 'Gérez facilement tous vos dossiers étudiants depuis une interface unique et intuitive.' },
      { icon: BadgeCheck, title: 'Accréditation officielle', desc: 'Obtenez votre certification d\'agent agréé AccessHub Global, reconnue par nos partenaires.' },
    ],
    steps: [
      { num: '01', title: 'Obtenez votre code', desc: 'Contactez AccessHub Global pour recevoir votre code d\'activation agent.' },
      { num: '02', title: 'Créez votre compte', desc: 'Inscrivez-vous avec votre code d\'activation et complétez votre profil.' },
      { num: '03', title: 'Soumettez des dossiers', desc: 'Utilisez notre plateforme pour gérer et soumettre les candidatures de vos étudiants.' },
      { num: '04', title: 'Recevez vos commissions', desc: 'Soyez rémunéré automatiquement à chaque acceptation réussie.' },
    ],
    requirement: 'Un code d\'activation est requis. Contactez-nous à contact@accesshubglobal.com pour l\'obtenir.',
  },
  partenaire: {
    registerPath: '/partner/register',
    accentColor: '#10b981',
    accentLight: 'rgba(16,185,129,0.15)',
    orbA: '#059669',
    orbB: '#0891b2',
    label: 'Partenariat Universitaire',
    title: 'Attirez les meilleurs',
    titleHighlight: 'étudiants du monde.',
    subtitle: 'Rejoignez notre réseau d\'institutions académiques et accédez à des milliers d\'étudiants internationaux motivés, prêts à intégrer vos programmes.',
    ctaLabel: 'Devenir Partenaire Universitaire',
    icon: GraduationCap,
    stats: [
      { value: '10k+', label: 'Étudiants actifs' },
      { value: '50+', label: 'Nationalités représentées' },
      { value: '98%', label: 'Satisfaction institutions' },
    ],
    benefits: [
      { icon: Globe, title: 'Visibilité internationale', desc: 'Présentez vos programmes à une audience mondiale d\'étudiants qualifiés et motivés.' },
      { icon: FileText, title: 'Publication de programmes', desc: 'Publiez vos formations, bourses et opportunités directement sur la plateforme.' },
      { icon: Users, title: 'Candidatures qualifiées', desc: 'Recevez uniquement des candidatures sérieuses, vérifiées par nos agents partenaires.' },
      { icon: BarChart3, title: 'Analytics avancés', desc: 'Accédez à des statistiques détaillées sur les candidatures et l\'intérêt pour vos programmes.' },
      { icon: HeartHandshake, title: 'Partenariat long terme', desc: 'Construisez une relation durable avec AccessHub Global et notre réseau d\'agents.' },
      { icon: Award, title: 'Label de qualité', desc: 'Affichez le badge "Partenaire Certifié AccessHub" sur vos supports de communication.' },
    ],
    steps: [
      { num: '01', title: 'Soumettez votre demande', desc: 'Remplissez le formulaire d\'inscription et fournissez vos documents officiels.' },
      { num: '02', title: 'Validation par notre équipe', desc: 'Notre équipe examine votre candidature et valide votre institution sous 72h.' },
      { num: '03', title: 'Publiez vos programmes', desc: 'Configurez votre profil et ajoutez vos formations, programmes et bourses.' },
      { num: '04', title: 'Recevez des candidatures', desc: 'Commencez à recevoir des candidatures qualifiées d\'étudiants du monde entier.' },
    ],
    requirement: null,
  },
  logement: {
    registerPath: '/logement/register',
    accentColor: '#0891b2',
    accentLight: 'rgba(8,145,178,0.15)',
    orbA: '#0891b2',
    orbB: '#0e7490',
    label: 'Partenariat Logement',
    title: 'Logez les étudiants',
    titleHighlight: 'du monde entier.',
    subtitle: 'Devenez partenaire logement AccessHub Global et proposez vos hébergements à des milliers d\'étudiants internationaux à la recherche d\'un toit fiable et sécurisé.',
    ctaLabel: 'Devenir Partenaire Logement',
    icon: Home,
    stats: [
      { value: '10k+', label: 'Étudiants en mobilité' },
      { value: '30+', label: 'Villes couvertes' },
      { value: '98%', label: 'Taux d\'occupation' },
    ],
    benefits: [
      { icon: Users, title: 'Visibilité garantie', desc: 'Vos annonces sont visibles par des milliers d\'étudiants en recherche de logement.' },
      { icon: Globe, title: 'Clientèle internationale', desc: 'Accédez à une clientèle internationale stable, sérieuse et recommandée par nos partenaires.' },
      { icon: BarChart3, title: 'Gestion centralisée', desc: 'Gérez toutes vos propriétés et candidatures depuis un tableau de bord dédié.' },
      { icon: Shield, title: 'Partenaires vérifiés', desc: 'Tous les étudiants passent par notre système de recommandation — logement sécurisé.' },
      { icon: Star, title: 'Mise en avant', desc: 'Vos logements sont mis en avant sur la page d\'accueil et dans nos newsletters.' },
      { icon: Zap, title: 'Publication rapide', desc: 'Publiez vos annonces en quelques minutes avec photos, équipements et disponibilités.' },
    ],
    steps: [
      { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement et soumettez votre dossier partenaire.' },
      { num: '02', title: 'Validation de l\'équipe', desc: 'Notre équipe vérifie votre profil et vous active sous 48h.' },
      { num: '03', title: 'Ajoutez vos logements', desc: 'Publiez vos annonces avec photos, prix, équipements et disponibilités.' },
      { num: '04', title: 'Recevez des locataires', desc: 'Les étudiants contactent directement depuis la plateforme.' },
    ],
    requirement: null,
  },
    registerPath: '/employer/register',
    accentColor: '#f59e0b',
    accentLight: 'rgba(245,158,11,0.15)',
    orbA: '#d97706',
    orbB: '#dc2626',
    label: 'Partenariat Employeur',
    title: 'Recrutez des talents',
    titleHighlight: 'internationaux d\'exception.',
    subtitle: 'Accédez à un vivier de candidats qualifiés, multilingues et prêts à travailler. Publiez vos offres et trouvez le profil idéal pour vos besoins.',
    ctaLabel: 'Devenir Partenaire Employeur',
    icon: Briefcase,
    stats: [
      { value: '5k+', label: 'Candidats actifs' },
      { value: '40+', label: 'Secteurs couverts' },
      { value: '72h', label: 'Délai de traitement' },
    ],
    benefits: [
      { icon: Users, title: 'Talents qualifiés', desc: 'Accédez à des profils de candidats internationaux formés dans les meilleures universités.' },
      { icon: Zap, title: 'Publication rapide', desc: 'Publiez vos offres d\'emploi en quelques minutes et commencez à recevoir des candidatures.' },
      { icon: Building2, title: 'Profil entreprise', desc: 'Créez une page entreprise attractive et renforcez votre marque employeur à l\'international.' },
      { icon: BarChart3, title: 'Suivi des candidatures', desc: 'Gérez toutes vos candidatures depuis un tableau de bord centralisé et intuitif.' },
      { icon: Globe, title: 'Portée internationale', desc: 'Touchez des candidats en France, en Afrique, en Asie et partout dans le monde.' },
      { icon: Star, title: 'Mise en avant', desc: 'Vos offres sont diffusées par newsletter à l\'ensemble de notre communauté.' },
    ],
    steps: [
      { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement et configurez votre profil entreprise.' },
      { num: '02', title: 'Validez votre profil', desc: 'Notre équipe vérifie et approuve votre espace employeur sous 48h.' },
      { num: '03', title: 'Publiez vos offres', desc: 'Rédigez et publiez vos offres d\'emploi avec tous les détails nécessaires.' },
      { num: '04', title: 'Gérez vos candidatures', desc: 'Recevez, triez et contactez vos candidats depuis votre tableau de bord.' },
    ],
    requirement: null,
  },
};

// ── Page principale ──────────────────────────────────────────────────────────
const PartnerLandingPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = CONFIGS[type];

  useEffect(() => {
    if (!config) navigate('/');
  }, [type, config, navigate]);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050d1a]">
        <AnimatedBackground orbA={config.orbA} orbB={config.orbB} />

        {/* Grid mesh */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Radial glow center */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${config.accentLight} 0%, transparent 60%)` }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          {/* Label pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-8 text-sm font-medium"
            style={{ backgroundColor: config.accentLight, borderColor: `${config.accentColor}30`, color: config.accentColor }}>
            <Icon size={15} />
            {config.label}
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
            {config.title}{' '}
            <span className="relative inline-block">
              <span style={{ color: config.accentColor }}>{config.titleHighlight}</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full opacity-40" style={{ backgroundColor: config.accentColor }} />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {config.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={config.registerPath}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: config.accentColor }}
              data-testid="hero-cta-btn">
              {config.ctaLabel}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#benefits"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all">
              En savoir plus <ChevronDown size={15} />
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/10">
            {config.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black" style={{ color: config.accentColor }}>{s.value}</p>
                <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs animate-bounce">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" className="py-24 bg-[#050d1a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: config.accentLight, color: config.accentColor }}>
              <Sparkles size={13} /> Avantages exclusifs
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Pourquoi nous rejoindre ?</h2>
            <p className="text-white/50 mt-3 text-base max-w-xl mx-auto">Tout ce dont vous avez besoin pour réussir avec AccessHub Global.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {config.benefits.map((b, i) => {
              const BIcon = b.icon;
              return (
                <div key={i}
                  className="group relative rounded-2xl border border-white/8 p-6 hover:border-opacity-20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', '--tw-border-opacity': 0.08 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${config.accentColor}35`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${config.accentLight}, transparent 60%)` }} />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: config.accentLight }}>
                      <BIcon size={22} style={{ color: config.accentColor }} />
                    </div>
                    <h3 className="text-white font-bold text-base mb-2">{b.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-[#030810]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: config.accentLight, color: config.accentColor }}>
              <Clock size={13} /> Comment ça marche
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white">En 4 étapes simples</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-6 bottom-6 w-px hidden sm:block"
              style={{ background: `linear-gradient(to bottom, ${config.accentColor}60, transparent)` }} />

            <div className="space-y-8">
              {config.steps.map((step, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  {/* Number */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0 relative z-10 transition-all group-hover:scale-110"
                    style={{ backgroundColor: i === 0 ? config.accentColor : config.accentLight, color: i === 0 ? '#fff' : config.accentColor }}>
                    {step.num}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-2 pb-2 rounded-2xl">
                    <h3 className="text-white font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-24 overflow-hidden bg-[#050d1a]">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 100% 80% at 50% 50%, ${config.accentLight}, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.2) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{ backgroundColor: config.accentColor }}>
            <Icon size={36} className="text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Prêt à nous rejoindre ?</h2>
          <p className="text-white/55 text-base mb-8 leading-relaxed">
            Créez votre compte maintenant et faites partie de l'écosystème AccessHub Global.
          </p>

          {config.requirement && (
            <div className="mb-8 px-5 py-4 rounded-2xl border text-sm text-left"
              style={{ backgroundColor: `${config.accentColor}12`, borderColor: `${config.accentColor}30`, color: `${config.accentColor}dd` }}>
              <strong>Note :</strong> {config.requirement}
            </div>
          )}

          <Link to={config.registerPath}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: config.accentColor }}
            data-testid="final-cta-btn">
            {config.ctaLabel}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="text-white/30 text-sm mt-6">
            Déjà membre ?{' '}
            <Link to="/" className="hover:text-white transition-colors underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ── Animated dark background ─────────────────────────────────────────────────
const AnimatedBackground = ({ orbA, orbB }) => (
  <>
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-pulse"
      style={{ backgroundColor: orbA }} />
    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
      style={{ backgroundColor: orbB, animation: 'pulse 4s ease-in-out 1.5s infinite' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-2xl"
      style={{ backgroundColor: orbA, animation: 'pulse 5s ease-in-out 0.5s infinite' }} />
    {[...Array(16)].map((_, i) => (
      <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-20"
        style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 20}%`, animation: `pulse ${2 + (i % 4)}s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
  </>
);

export default PartnerLandingPage;

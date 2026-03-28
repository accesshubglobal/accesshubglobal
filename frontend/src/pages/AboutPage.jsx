import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Heart, Users, Award, Globe, BookOpen, Briefcase, TrendingUp, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      <Header onOpenAuth={() => navigate('/')} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">À propos d'AccessHub Global</h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">Votre passerelle vers l'excellence académique internationale</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Histoire */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center"><BookOpen size={20} className="text-[#1e3a5f]" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Notre histoire</h2>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 space-y-4 text-gray-700 leading-relaxed">
            <p>
              AccessHub Global a vu le jour en <strong>2019</strong> à Guangzhou, en Chine, née de la vision de <strong>Mr. MOUNTSOUKA Aaron Depousse</strong>. 
              Ayant lui-même vécu l'expérience d'étudiant international en Chine, il a constaté les difficultés que rencontrent 
              les étudiants africains et francophones dans leurs démarches d'admission, de visa et d'installation à l'étranger.
            </p>
            <p>
              Ce qui a commencé comme un accompagnement informel entre amis et compatriotes s'est rapidement transformé en une 
              structure professionnelle. En quelques années, AccessHub Global a accompagné des <strong>centaines d'étudiants</strong> vers 
              des universités de renom en Chine et en France, nouant des partenariats solides avec des institutions académiques 
              de premier plan.
            </p>
            <p>
              Aujourd'hui, avec des bureaux à <strong>Guangzhou (Chine)</strong> et à <strong>Brazzaville (Congo)</strong>, 
              AccessHub Global est devenu un acteur incontournable de la mobilité étudiante internationale en Afrique francophone.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Target size={20} className="text-[#1a56db]" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Notre mission</h2>
          </div>
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <p className="text-lg text-gray-800 leading-relaxed">
              Rendre l'éducation internationale <strong>accessible</strong>, <strong>transparente</strong> et <strong>sécurisée</strong> pour 
              chaque étudiant, quel que soit son pays d'origine. Nous croyons que le talent n'a pas de frontières et que chaque 
              jeune mérite l'opportunité de réaliser son potentiel académique à l'international.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              {[
                { icon: Globe, title: 'Accessibilité', desc: 'Simplifier les démarches complexes d\'admission et de visa pour tous' },
                { icon: Shield, title: 'Transparence', desc: 'Des processus clairs, des frais détaillés, aucune surprise' },
                { icon: Award, title: 'Excellence', desc: 'Des partenariats avec les meilleures universités de Chine et France' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <item.icon size={22} className="text-[#1a56db]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Heart size={20} className="text-red-500" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Nos valeurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Engagement', desc: 'Nous nous investissons personnellement dans la réussite de chaque étudiant, du premier contact jusqu\'à l\'installation dans le pays d\'accueil.', color: 'border-blue-200 bg-blue-50/50' },
              { title: 'Intégrité', desc: 'Nous agissons avec honnêteté et transparence dans toutes nos interactions. Nos étudiants sont informés de chaque étape et de chaque coût.', color: 'border-green-200 bg-green-50/50' },
              { title: 'Innovation', desc: 'Nous utilisons la technologie pour simplifier les processus et offrir une expérience fluide à nos étudiants, partenaires et agents.', color: 'border-purple-200 bg-purple-50/50' },
              { title: 'Diversité', desc: 'Nous célébrons la richesse culturelle de nos étudiants et favorisons les échanges interculturels comme moteur de croissance personnelle.', color: 'border-orange-200 bg-orange-50/50' },
            ].map((val, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${val.color}`}>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{val.title}</h3>
                <p className="text-gray-700 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Équipe */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Users size={20} className="text-green-600" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Notre équipe</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            Une équipe multiculturelle et passionnée, présente en Chine et en Afrique, qui comprend les défis 
            des étudiants internationaux pour les avoir vécus elle-même.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Mr. MOUNTSOUKA Aaron Depousse', role: 'Fondateur & Directeur Général', desc: 'Visionnaire et entrepreneur, il dirige AccessHub Global depuis sa création avec une passion pour l\'éducation internationale.' },
              { name: 'Département Admissions', role: 'Équipe Admissions & Suivi', desc: 'Nos conseillers spécialisés accompagnent chaque étudiant dans le choix de programme et la préparation du dossier d\'admission.' },
              { name: 'Département Logistique', role: 'Équipe Visa & Installation', desc: 'De la demande de visa à la recherche de logement, notre équipe assure une transition fluide vers le pays d\'accueil.' },
            ].map((member, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-full flex items-center justify-center text-white text-lg font-bold mb-4">
                  {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-[#1a56db] font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Briefcase size={20} className="text-orange-500" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Nos services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Orientation académique', desc: 'Analyse de votre profil, recommandation de programmes et universités adaptés à vos objectifs et votre budget.' },
              { title: 'Accompagnement admission', desc: 'Préparation complète du dossier de candidature, traduction de documents, et suivi jusqu\'à l\'obtention de la lettre d\'admission.' },
              { title: 'Assistance visa', desc: 'Aide à la constitution du dossier visa, préparation à l\'entretien consulaire, et suivi de la demande.' },
              { title: 'Recherche de logement', desc: 'Mise en relation avec des résidences universitaires et des logements privés vérifiés dans la ville d\'accueil.' },
              { title: 'Bourses d\'études', desc: 'Identification des opportunités de bourses (CSC, bourses provinciales, bourses universitaires) et aide à la candidature.' },
              { title: 'Accueil & Installation', desc: 'Accueil à l\'aéroport, aide à l\'inscription universitaire, ouverture de compte bancaire et carte SIM.' },
            ].map((service, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#1a56db]/20 hover:shadow-sm transition-all">
                <div className="w-8 h-8 bg-[#1a56db]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp size={16} className="text-[#1a56db]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Prêt à commencer votre aventure ?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Rejoignez les centaines d'étudiants qui ont réalisé leur rêve d'étudier à l'international avec AccessHub Global.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-[#1e3a5f] rounded-xl font-semibold hover:bg-blue-50 transition-colors">Voir nos programmes</button>
            <a href="mailto:accesshubglobal@gmail.com" className="px-8 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">Nous contacter</a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;

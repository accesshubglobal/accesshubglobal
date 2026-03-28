import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfUsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="terms-of-use-page">
      <Header onOpenAuth={() => navigate('/')} />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Conditions d'Utilisation</h1>
          <p className="text-blue-200">Dernière mise à jour : Mars 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Objet</h2>
            <p className="text-gray-700 leading-relaxed">Les présentes conditions générales d'utilisation (ci-après "CGU") ont pour objet de définir les modalités d'accès et d'utilisation du site web AccessHub Global (ci-après "le Site") et des services proposés par AccessHub Global (ci-après "les Services").</p>
            <p className="text-gray-700 leading-relaxed mt-3">L'accès au Site et l'utilisation des Services impliquent l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Description des Services</h2>
            <p className="text-gray-700 leading-relaxed">AccessHub Global propose une plateforme en ligne permettant aux étudiants de :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Consulter les programmes d'études et les universités partenaires</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Soumettre des candidatures en ligne auprès des universités</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Suivre l'avancement de leurs candidatures</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Communiquer avec l'équipe AccessHub Global</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Rechercher des logements dans les villes universitaires</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Accéder à des informations sur les bourses d'études disponibles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Inscription et compte utilisateur</h2>
            <p className="text-gray-700 leading-relaxed">L'utilisation de certains Services nécessite la création d'un compte utilisateur. L'utilisateur s'engage à :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Fournir des informations exactes, complètes et à jour lors de l'inscription</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Notifier immédiatement AccessHub Global de toute utilisation non autorisée de son compte</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Vérifier son adresse email via le code de vérification envoyé lors de l'inscription</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">AccessHub Global se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Processus de candidature</h2>
            <p className="text-gray-700 leading-relaxed">En soumettant une candidature via le Site, l'utilisateur reconnaît et accepte que :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>AccessHub Global agit en tant qu'intermédiaire entre l'étudiant et l'université. La décision finale d'admission revient à l'université.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>Les documents soumis doivent être authentiques. La soumission de faux documents entraîne l'annulation immédiate de la candidature.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>Les frais de service sont non remboursables une fois le dossier transmis à l'université, sauf disposition contraire explicite.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>Le paiement des frais de service ne garantit pas l'acceptation de la candidature par l'université.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Tarification et paiement</h2>
            <p className="text-gray-700 leading-relaxed">Les frais de service AccessHub Global sont clairement indiqués sur chaque fiche de programme. Ces frais couvrent :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>L'accompagnement personnalisé dans le processus de candidature</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>La vérification et la préparation du dossier</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>La soumission de la candidature auprès de l'université</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>Le suivi jusqu'à l'obtention de la réponse de l'université</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">Les frais universitaires (scolarité, logement, assurance) sont distincts des frais de service AccessHub Global et sont payés directement à l'université.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Obligations de l'utilisateur</h2>
            <p className="text-gray-700 leading-relaxed">L'utilisateur s'engage à :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>Utiliser le Site et les Services de manière conforme à leur finalité</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>Ne pas porter atteinte au fonctionnement du Site</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>Ne pas usurper l'identité d'un tiers</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>Ne pas diffuser de contenu illicite, offensant ou contraire à l'ordre public via le forum communautaire ou la messagerie</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>Respecter les droits de propriété intellectuelle d'AccessHub Global et des tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">AccessHub Global ne peut être tenu responsable :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></span>Des décisions d'admission ou de refus prises par les universités partenaires</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></span>Des décisions de refus de visa prises par les autorités consulaires</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></span>Des interruptions temporaires du Site pour maintenance ou force majeure</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></span>Des dommages indirects résultant de l'utilisation du Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Modifications des CGU</h2>
            <p className="text-gray-700 leading-relaxed">AccessHub Global se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation du Site après modification des CGU vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Contact</h2>
            <p className="text-gray-700 leading-relaxed">Pour toute question relative aux présentes CGU, veuillez nous contacter à : <a href="mailto:accesshubglobal@gmail.com" className="text-[#1a56db] hover:underline">accesshubglobal@gmail.com</a></p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfUsePage;

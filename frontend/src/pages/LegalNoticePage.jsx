import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LegalNoticePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="legal-notice-page">
      <Header onOpenAuth={() => navigate('/')} />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Mentions Légales</h1>
          <p className="text-blue-200">Dernière mise à jour : Mars 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Éditeur du site</h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2 text-sm text-gray-700">
              <p><strong>Raison sociale :</strong> AccessHub Global</p>
              <p><strong>Numéro d'immatriculation :</strong> DFS3455677 (Chine)</p>
              <p><strong>Directeur de la publication :</strong> Mr. MOUNTSOUKA Aaron Depousse</p>
              <p><strong>Siège social (Chine) :</strong> Vanke, Panyu District, GuangDong Province, Guangzhou City, Chine</p>
              <p><strong>Siège social (Congo) :</strong> 34 rue Lénine, Moungali, Brazzaville, République du Congo</p>
              <p><strong>Email :</strong> accesshubglobal@gmail.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Hébergement</h2>
            <p className="text-gray-700 leading-relaxed">Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Pour toute question relative à l'hébergement, veuillez consulter <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#1a56db] hover:underline">vercel.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">L'ensemble du contenu de ce site (textes, images, logos, graphismes, icônes, logiciels, bases de données) est la propriété exclusive d'AccessHub Global ou de ses partenaires et est protégé par les lois relatives à la propriété intellectuelle.</p>
            <p className="text-gray-700 leading-relaxed mt-3">Toute reproduction, représentation, modification, publication, distribution ou retransmission, totale ou partielle, du contenu de ce site, par quelque procédé que ce soit, sans l'autorisation préalable écrite d'AccessHub Global, est strictement interdite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">AccessHub Global s'efforce de fournir des informations aussi précises que possible sur ce site. Toutefois, AccessHub Global ne saurait être tenu responsable des omissions, inexactitudes et carences dans la mise à jour, qu'elles soient de son fait ou du fait de tiers partenaires.</p>
            <p className="text-gray-700 leading-relaxed mt-3">AccessHub Global n'est en aucun cas responsable de l'utilisation faite de ces informations, et de tout préjudice direct ou indirect pouvant en découler.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Liens hypertextes</h2>
            <p className="text-gray-700 leading-relaxed">Le site peut contenir des liens hypertextes vers d'autres sites. AccessHub Global n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu ou aux éventuels traitements de données personnelles qu'ils effectuent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (authentification, préférences de langue). Aucun cookie de traçage publicitaire n'est utilisé. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies techniques.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Droit applicable</h2>
            <p className="text-gray-700 leading-relaxed">Les présentes mentions légales sont régies par le droit applicable au lieu du siège social principal de l'entreprise. Tout litige relatif à l'utilisation du site sera soumis à la compétence des tribunaux compétents.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Contact</h2>
            <p className="text-gray-700 leading-relaxed">Pour toute question relative aux mentions légales, vous pouvez nous contacter à l'adresse : <a href="mailto:accesshubglobal@gmail.com" className="text-[#1a56db] hover:underline">accesshubglobal@gmail.com</a></p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalNoticePage;

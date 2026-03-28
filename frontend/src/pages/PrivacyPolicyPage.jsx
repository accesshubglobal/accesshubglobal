import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="privacy-policy-page">
      <Header onOpenAuth={() => navigate('/')} />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Politique de Confidentialité</h1>
          <p className="text-blue-200">Dernière mise à jour : Mars 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">AccessHub Global (ci-après "nous", "notre") s'engage à protéger la vie privée de ses utilisateurs. La présente politique de confidentialité décrit les types d'informations personnelles que nous collectons, la manière dont nous les utilisons et les mesures que nous prenons pour les protéger.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Nous collectons les données suivantes dans le cadre de nos services :</p>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span><strong>Données d'identification :</strong> nom, prénom, date de naissance, nationalité, sexe, numéro de passeport</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span><strong>Coordonnées :</strong> adresse email, numéro de téléphone, adresse postale</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span><strong>Données académiques :</strong> diplômes, relevés de notes, certificats de langue</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span><strong>Documents :</strong> copie de passeport, photos d'identité, preuves de paiement</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (via cookies techniques)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Finalités du traitement</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Vos données personnelles sont traitées pour les finalités suivantes :</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Gestion de votre compte utilisateur et authentification</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Traitement de vos candidatures auprès des universités partenaires</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Communication relative à vos dossiers (emails, notifications, messages)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Envoi de newsletters et informations sur nos services (avec votre consentement)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Amélioration de nos services et de l'expérience utilisateur</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Respect de nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed">Vos données personnelles peuvent être partagées avec :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span><strong>Universités partenaires :</strong> dans le cadre de votre candidature (dossier académique, documents d'identité)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span><strong>Prestataires techniques :</strong> hébergement (Vercel), stockage de fichiers (Cloudinary), envoi d'emails (Resend)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span><strong>Agents partenaires :</strong> uniquement si vous avez été orienté par un agent et avec votre accord</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">Nous ne vendons jamais vos données personnelles à des tiers. Le partage se fait uniquement dans le cadre strict de la fourniture de nos services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Durée de conservation</h2>
            <p className="text-gray-700 leading-relaxed">Vos données sont conservées pendant toute la durée de votre relation avec AccessHub Global, puis pendant une durée de 3 ans après votre dernière interaction avec nos services. Les données relatives aux candidatures sont conservées pendant 5 ans pour des raisons de suivi et de traçabilité.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Sécurité des données</h2>
            <p className="text-gray-700 leading-relaxed">Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données, incluant :</p>
            <ul className="space-y-2 text-sm text-gray-700 mt-3">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>Chiffrement des mots de passe (bcrypt)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>Communication sécurisée via HTTPS/TLS</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>Authentification par token JWT avec expiration</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>Vérification d'email obligatoire</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>Contrôle d'accès basé sur les rôles (RBAC)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Vos droits</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Droit d'accès", desc: "Obtenir la confirmation que vos données sont traitées et en recevoir une copie" },
                { title: "Droit de rectification", desc: "Faire corriger vos données inexactes ou incomplètes" },
                { title: "Droit de suppression", desc: "Demander l'effacement de vos données personnelles" },
                { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données pour des motifs légitimes" },
                { title: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré et lisible" },
                { title: "Droit de retrait du consentement", desc: "Retirer votre consentement à tout moment pour les traitements basés sur celui-ci" },
              ].map((right, i) => (
                <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{right.title}</h4>
                  <p className="text-xs text-gray-600">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">Pour exercer vos droits, contactez-nous à : <a href="mailto:accesshubglobal@gmail.com" className="text-[#1a56db] hover:underline">accesshubglobal@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.</p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

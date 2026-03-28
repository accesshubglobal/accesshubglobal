import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Mail, User, Globe, Users, Handshake, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CompanyInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" data-testid="company-info-page">
      <Header onOpenAuth={() => navigate('/')} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Informations sur l'entreprise</h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">Toutes les informations officielles sur AccessHub Global</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* Identification */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center"><Building size={20} className="text-[#1e3a5f]" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Identification de l'entreprise</h2>
          </div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                {[
                  { label: 'Raison sociale', value: 'AccessHub Global' },
                  { label: "Numéro d'immatriculation", value: 'DFS3455677 (Chine)' },
                  { label: 'Dirigeant', value: 'Mr. MOUNTSOUKA Aaron Depousse' },
                  { label: 'Email de contact', value: 'accesshubglobal@gmail.com' },
                  { label: "Année de création", value: '2019' },
                  { label: "Secteur d'activité", value: "Conseil en éducation internationale & Mobilité étudiante" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-100/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 w-1/3">{row.label}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sièges */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><MapPin size={20} className="text-[#1a56db]" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Nos sièges</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇨🇳</span>
                <h3 className="font-bold text-gray-900 text-lg">Siège Chine</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>Vanke, Panyu District, GuangDong Province, Guangzhou City, Chine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <span>accesshubglobal@gmail.com</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Bureau principal - Opérations Asie</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇨🇬</span>
                <h3 className="font-bold text-gray-900 text-lg">Siège Congo</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>34 rue Lénine, Moungali, Brazzaville, République du Congo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <span>accesshubglobal@gmail.com</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Bureau Afrique - Recrutement & Relations étudiants</p>
              </div>
            </div>
          </div>
        </section>

        {/* Structure */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Users size={20} className="text-purple-600" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Structure de l'entreprise</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex flex-col items-center">
              {/* Direction */}
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a5298] text-white rounded-2xl px-8 py-5 text-center shadow-lg">
                <p className="font-bold text-lg">Direction Générale</p>
                <p className="text-blue-200 text-sm mt-1">Mr. MOUNTSOUKA Aaron Depousse</p>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              {/* Departments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[
                  { title: 'Admissions', desc: 'Gestion des dossiers, suivi des candidatures, relations universités' },
                  { title: 'Relations Étudiants', desc: 'Conseil, orientation, accompagnement personnalisé' },
                  { title: 'Logistique & Visa', desc: 'Démarches visa, logement, accueil et installation' },
                  { title: 'Marketing & Communication', desc: 'Promotion, événements, réseaux sociaux, partenariats' },
                ].map((dept, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                    <div className="w-px h-4 bg-gray-300 mx-auto mb-3"></div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{dept.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{dept.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Clients & Partenaires */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Handshake size={20} className="text-green-600" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Clients & Partenaires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4">Nos clients</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Étudiants africains francophones souhaitant étudier en Chine ou en France</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Professionnels en reconversion cherchant des programmes de MBA ou certifications internationales</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Parents et familles accompagnant leurs enfants dans un projet d'études à l'étranger</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-[#1a56db] rounded-full mt-1.5 flex-shrink-0"></span>Agents et partenaires locaux dans plusieurs pays africains</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="font-bold text-gray-900 mb-4">Nos partenaires</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Universités partenaires en Chine (Beijing, Shanghai, Guangzhou, Wuhan...)</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Établissements d'enseignement supérieur en France</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Résidences universitaires et agences de logement vérifiées</li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>Réseau d'agents recruteurs dans plus de 10 pays africains</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><BarChart3 size={20} className="text-orange-500" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Chiffres clés</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { number: '500+', label: 'Étudiants accompagnés', color: 'from-blue-500 to-blue-600' },
              { number: '50+', label: 'Universités partenaires', color: 'from-green-500 to-green-600' },
              { number: '10+', label: "Pays d'origine couverts", color: 'from-purple-500 to-purple-600' },
              { number: '6+', label: "Années d'expérience", color: 'from-orange-500 to-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>{stat.number}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default CompanyInfoPage;

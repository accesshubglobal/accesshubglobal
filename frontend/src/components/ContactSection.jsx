import React, { useState } from 'react';
import { faqItems } from '../data/siteContent';
import { ChevronDown, Send, MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactSection = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message envoyé! Nous vous contacterons bientôt.');
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Contact</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Contactez-Nous
            </h2>
            <p className="text-gray-600 mb-8">
              Vous avez des questions? Notre équipe est là pour vous aider.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                  required
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                />
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all text-gray-600"
                >
                  <option value="">Service souhaité</option>
                  <option value="china">Études en Chine</option>
                  <option value="france">Études en France</option>
                  <option value="housing">Recherche de Logement</option>
                  <option value="visa">Accompagnement Visa</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <textarea
                placeholder="Votre message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all resize-none"
                required
              />
              <button 
                type="submit"
                className="w-full bg-[#1a56db] hover:bg-[#1648b8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Envoyer le message
              </button>
            </form>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">+86 138 811 301 75</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">contact@winnersc.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">Avenue , Brazzaville, Rép du Congo</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horaires</p>
                  <p className="font-medium">Lun-Ven 9h-18h</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-8">
              Questions Fréquentes
            </h2>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-[#1a56db] transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

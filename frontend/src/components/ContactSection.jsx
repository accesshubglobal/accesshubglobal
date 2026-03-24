import React, { useState, useEffect } from 'react';
import { faqItems as defaultFaqs } from '../data/siteContent';
import { ChevronDown, Send, MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const ContactSection = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const res = await axios.get(`${API}/faqs`);
      if (res.data.faqs && res.data.faqs.length > 0) {
        setFaqs(res.data.faqs);
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
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
              {"Vous avez des questions? Notre équipe est là pour vous aider."}
            </p>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3" data-testid="contact-success">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">{"Message envoyé avec succès !"}</p>
                  <p className="text-sm text-green-600">{"Nous vous contacterons bientôt."}</p>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                  required
                  data-testid="contact-name"
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                  required
                  data-testid="contact-email"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="tel"
                  placeholder={"Téléphone"}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all"
                  data-testid="contact-phone"
                />
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition-all text-gray-600"
                  data-testid="contact-service"
                >
                  <option value="">{"Service souhaité"}</option>
                  <option value="china">{"Études en Chine"}</option>
                  <option value="france">{"Études en France"}</option>
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
                data-testid="contact-message"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a56db] hover:bg-[#1648b8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="contact-submit"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{"Téléphone"}</p>
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
                  <p className="font-medium">{"Avenue, Brazzaville, Rép du Congo"}</p>
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
              {"Questions Fréquentes"}
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                  data-testid={`faq-item-${index}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-[#1a56db] transition-transform flex-shrink-0 ml-2 ${
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

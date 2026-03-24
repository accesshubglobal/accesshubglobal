import React, { useState, useEffect } from 'react';
import { Star, Quote, Send, Loader2, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const defaultTestimonials = [
  {
    id: '1',
    userName: 'Marie Dubois',
    userCountry: 'France',
    program: 'Master en Commerce - Université de Pékin',
    text: "Winner's Consulting m'a accompagnée du début à la fin. J'ai obtenu ma bourse CSC et trouvé un logement parfait à Beijing!",
    rating: 5
  },
  {
    id: '2',
    userName: 'Ahmed Benali',
    userCountry: 'Maroc',
    program: 'Doctorat - Sorbonne Université',
    text: "Service exceptionnel! L'équipe est très professionnelle et réactive. Je recommande vivement pour les études en France.",
    rating: 5
  },
  {
    id: '3',
    userName: 'Sophie Chen',
    userCountry: 'Belgique',
    program: 'Médecine (MBBS) - Université de Shanghai',
    text: "Grâce à Winner's Consulting, j'ai réalisé mon rêve d'étudier la médecine en Chine. Merci pour tout!",
    rating: 5
  }
];

const TestimonialsSection = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ text: '', program: '', rating: 5 });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const res = await axios.get(`${API}/testimonials`);
      if (res.data && res.data.length > 0) {
        setTestimonials(res.data);
      }
    } catch (err) {
      console.error('Error loading testimonials:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/testimonials`, formData);
      setSuccess(true);
      setFormData({ text: '', program: '', rating: 5 });
      setTimeout(() => { setShowForm(false); setSuccess(false); }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    setShowForm(true);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Témoignages</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Ce Que Disent Nos Étudiants
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Découvrez les expériences de nos étudiants qui ont réalisé leur rêve d'étudier à l'étranger.
          </p>
          <button
            onClick={handleOpenForm}
            className="inline-flex items-center gap-2 bg-[#1a56db] hover:bg-[#1648b8] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            data-testid="add-testimonial-btn"
          >
            <Send size={18} />
            Partager votre expérience
          </button>
        </div>

        {/* Testimonial Submission Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-[#1a56db] to-[#3b82f6] p-6 text-white">
                <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24} /></button>
                <h3 className="text-xl font-bold">Partagez votre expérience</h3>
                <p className="text-blue-100 mt-1">{"Votre témoignage sera publié après validation par l'équipe."}</p>
              </div>
              {success ? (
                <div className="p-12 text-center">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Merci pour votre témoignage !</h4>
                  <p className="text-gray-600">Il sera visible après validation par notre équipe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Programme suivi</label>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={(e) => setFormData({...formData, program: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20"
                      placeholder="Ex: Master en Commerce - Université de Pékin"
                      required
                      data-testid="testimonial-program"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre témoignage</label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 resize-none"
                      rows={4}
                      placeholder="Partagez votre expérience avec Winner's Consulting..."
                      required
                      data-testid="testimonial-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className="p-1" data-testid={`testimonial-star-${star}`}>
                          <Star size={28} className={`transition-colors ${star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#1a56db] hover:bg-[#1648b8] text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50" data-testid="testimonial-submit">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} />Envoyer mon témoignage</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#1a56db] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {(testimonial.userName || testimonial.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.userName || testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.userCountry || testimonial.country}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              <Quote size={24} className="text-[#1a56db]/20 mb-2" />
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <div className="text-sm text-[#1a56db] font-medium">{testimonial.program}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

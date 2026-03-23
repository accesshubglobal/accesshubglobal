import React from 'react';
import { testimonials } from '../data/siteContent';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Témoignages</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Ce Que Disent Nos Étudiants
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les expériences de nos étudiants qui ont réalisé leur rêve d'étudier à l'étranger.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.country}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              <Quote size={24} className="text-[#1a56db]/20 mb-2" />
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <div className="text-sm text-[#1a56db] font-medium">
                {testimonial.program}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

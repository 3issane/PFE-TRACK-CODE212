import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Dr. Sarah Martin',
      role: 'Directrice Pédagogique',
      company: 'École Supérieure de Commerce',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'PFETrack a révolutionné notre gestion des projets de fin d\'études. Nous avons réduit de 70% le temps administratif et amélioré significativement le suivi des étudiants.',
      rating: 5
    },
    {
      name: 'Prof. Michel Dubois',
      role: 'Responsable des Stages',
      company: 'Université de Technologie',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      content: 'Interface intuitive et fonctionnalités complètes. Nos étudiants adorent la facilité d\'utilisation et les professeurs apprécient les outils de suivi avancés.',
      rating: 5
    },
    {
      name: 'Marie Leroy',
      role: 'Étudiante en Master',
      company: 'Institut National Polytechnique',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      content: 'Grâce à PFETrack, j\'ai pu suivre facilement l\'avancement de mon PFE, communiquer avec mon encadrant et respecter tous les délais. Une expérience exceptionnelle !',
      rating: 5
    },
    {
      name: 'Jean-Pierre Moreau',
      role: 'Directeur Général',
      company: 'TechCorp Solutions',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'En tant qu\'entreprise partenaire, PFETrack nous permet de mieux collaborer avec les établissements et de suivre efficacement nos stagiaires.',
      rating: 5
    },
    {
      name: 'Dr. Fatima Benali',
      role: 'Coordinatrice Académique',
      company: 'École d\'Ingénieurs',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
      content: 'La plateforme a transformé notre approche de la gestion académique. Les rapports automatisés et les analytics nous aident à prendre de meilleures décisions.',
      rating: 5
    },
    {
      name: 'Alexandre Petit',
      role: 'Étudiant en Informatique',
      company: 'Université Paris-Saclay',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'L\'application mobile est fantastique ! Je peux suivre mon projet, recevoir des notifications et collaborer avec mon équipe depuis n\'importe où.',
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            💬 Témoignages clients
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ce que disent nos utilisateurs
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              de PFETrack
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment PFETrack transforme l'expérience académique de milliers d'utilisateurs à travers le monde.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-full">
                {/* Stars */}
                <div className="flex mb-6">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Content */}
                <blockquote className="text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-8">Ils nous font confiance :</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              'Université Paris-Saclay',
              'École Polytechnique',
              'INSA Lyon',
              'Centrale Supélec',
              'ENSAM',
              'UTC Compiègne'
            ].map((university, index) => (
              <motion.div
                key={index}
                className="text-gray-500 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {university}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
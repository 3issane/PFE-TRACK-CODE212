import React from 'react';
import { motion } from 'framer-motion';

const Roles = () => {
  const roles = [
    {
      title: 'Étudiants',
      subtitle: 'Votre parcours académique simplifié',
      description: 'Une interface intuitive pour gérer vos projets, suivre votre progression et collaborer efficacement.',
      features: [
        'Tableau de bord personnalisé',
        'Soumission de projets en ligne',
        'Suivi temps réel de progression',
        'Communication directe avec encadrants',
        'Gestion centralisée des documents',
        'Notifications intelligentes'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Professeurs',
      subtitle: 'Encadrement moderne et efficace',
      description: 'Outils avancés pour superviser vos étudiants et optimiser votre processus d\'encadrement.',
      features: [
        'Dashboard de supervision',
        'Gestion multi-projets',
        'Évaluation et feedback',
        'Planification des soutenances',
        'Rapports automatisés',
        'Collaboration inter-départements'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Administration',
      subtitle: 'Contrôle total et insights avancés',
      description: 'Vue d\'ensemble complète avec analytics puissants pour optimiser la gestion institutionnelle.',
      features: [
        'Analytics et métriques avancées',
        'Gestion globale des utilisateurs',
        'Rapports institutionnels',
        'Configuration système',
        'Monitoring en temps réel',
        'Intégrations tierces'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    }
  ];

  return (
    <section id="roles" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            👥 Pour tous les acteurs
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Une solution adaptée à
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              chaque utilisateur
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            PFETrack offre des interfaces et fonctionnalités spécialisées pour répondre aux besoins uniques 
            de chaque acteur de l'écosystème académique.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className={`relative ${role.bgColor} rounded-3xl p-8 h-full border border-white/50 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2`}>
                {/* Gradient Border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`${role.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {role.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  <p className={`text-sm font-medium bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent mb-4`}>
                    {role.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {role.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {role.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center text-gray-700"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-8">
                    <button className={`w-full bg-gradient-to-r ${role.gradient} text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                      Découvrir les fonctionnalités
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à transformer votre gestion académique ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Rejoignez les établissements qui ont déjà adopté PFETrack pour optimiser 
              leur processus de gestion des projets et stages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                Demander une démo
              </button>
              <button className="border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300">
                Voir les tarifs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Roles;
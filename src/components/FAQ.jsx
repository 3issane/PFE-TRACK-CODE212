import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Comment PFETrack s\'intègre-t-il avec nos systèmes existants ?',
      answer: 'PFETrack propose des API robustes et des connecteurs pré-configurés pour s\'intégrer facilement avec vos systèmes existants (LMS, ERP, bases de données étudiantes). Notre équipe technique vous accompagne dans le processus d\'intégration pour assurer une transition fluide.'
    },
    {
      question: 'Quelles sont les mesures de sécurité mises en place ?',
      answer: 'Nous appliquons les plus hauts standards de sécurité : chiffrement AES-256, authentification multi-facteurs, conformité RGPD, sauvegardes automatiques, et surveillance 24/7. Vos données sont hébergées dans des centres de données certifiés ISO 27001.'
    },
    {
      question: 'Combien de temps faut-il pour déployer PFETrack ?',
      answer: 'Le déploiement standard prend entre 2 à 4 semaines selon la complexité de votre établissement. Cela inclut la configuration, l\'import des données, la formation des équipes et les tests. Nous proposons également un déploiement express en 1 semaine pour les besoins urgents.'
    },
    {
      question: 'PFETrack est-il adapté aux petits établissements ?',
      answer: 'Absolument ! PFETrack est conçu pour s\'adapter à tous les types d\'établissements, des petites écoles aux grandes universités. Nos plans tarifaires flexibles permettent de commencer petit et d\'évoluer selon vos besoins.'
    },
    {
      question: 'Quel support technique proposez-vous ?',
      answer: 'Nous offrons un support technique complet : assistance 24/7 par chat et email, formation initiale et continue, documentation détaillée, webinaires réguliers, et un gestionnaire de compte dédié pour les établissements premium.'
    },
    {
      question: 'Peut-on personnaliser l\'interface selon notre charte graphique ?',
      answer: 'Oui, PFETrack permet une personnalisation complète de l\'interface : logo, couleurs, polices, et même des modules spécifiques selon vos besoins. Notre équipe design vous accompagne pour créer une expérience unique à votre établissement.'
    },
    {
      question: 'Comment gérez-vous les mises à jour et la maintenance ?',
      answer: 'Toutes les mises à jour sont automatiques et transparentes, sans interruption de service. Nous déployons régulièrement de nouvelles fonctionnalités et corrections. La maintenance préventive est programmée en dehors des heures d\'utilisation.'
    },
    {
      question: 'Proposez-vous une période d\'essai gratuite ?',
      answer: 'Oui, nous offrons un essai gratuit de 30 jours avec accès complet à toutes les fonctionnalités. Notre équipe vous accompagne pendant cette période pour vous aider à évaluer la solution et configurer votre environnement de test.'
    },
    {
      question: 'Comment fonctionne la tarification ?',
      answer: 'Notre tarification est basée sur le nombre d\'utilisateurs actifs et les modules choisis. Nous proposons des remises pour les établissements publics et les contrats pluriannuels. Contactez-nous pour un devis personnalisé adapté à vos besoins.'
    },
    {
      question: 'PFETrack fonctionne-t-il sur mobile ?',
      answer: 'Oui, PFETrack dispose d\'applications mobiles natives pour iOS et Android, ainsi qu\'une interface web responsive. Les utilisateurs peuvent accéder à toutes les fonctionnalités depuis leur smartphone ou tablette, avec synchronisation en temps réel.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            ❓ Questions fréquentes
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Vous avez des questions ?
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Nous avons les réponses
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trouvez rapidement les réponses aux questions les plus courantes sur PFETrack.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                className="w-full px-8 py-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </h3>
            <p className="text-gray-600 mb-6">
              Notre équipe d'experts est là pour vous aider. Contactez-nous pour obtenir des réponses personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Nous contacter
              </motion.button>
              <motion.button
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat en direct
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
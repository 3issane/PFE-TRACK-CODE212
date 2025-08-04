import React from 'react';
import { motion } from 'framer-motion';
import universityBg from '../assets/flat-university-background.png';
import heroVector from '../assets/hero-vector.svg';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {/* Background university image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img 
          src={universityBg} 
          alt="University Background" 
          className="absolute right-0 top-0 w-full h-full object-cover opacity-10"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2 }}
        />
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-green-200 to-green-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-15 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 md:py-16 lg:py-20">
          {/* Left side - Main content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ✨ Nouveau système de gestion académique
            </motion.div>
            
            {/* Main heading */}
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Système de gestion
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                PFE & Stages
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              className="text-xl text-gray-600 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Plateforme moderne pour la gestion complète des projets de fin d'études, stages et soutenances avec suivi en temps réel et collaboration avancée.
            </motion.p>
            
            {/* Key Features Highlight */}
            <motion.div 
              className="flex flex-wrap gap-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 font-medium">Gestion automatisée</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-gray-700 font-medium">100% Sécurisé</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-gray-700 font-medium">Temps réel</span>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Commencer maintenant
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voir la démo
              </button>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Professeurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </motion.div>
            
            {/* Testimonial */}
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 italic mb-2">
                    "PFETrack a révolutionné notre gestion des projets étudiants. Interface intuitive et fonctionnalités complètes."
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Dr. Marie Dubois</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600 text-sm">Directrice Pédagogique, ENSAM</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div 
              className="flex items-center gap-6 mt-8 text-sm text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Certifié ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>RGPD Conforme</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Support 24/7</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right side - Hero Vector */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Hero Vector Image */}
            <motion.div
              className="relative z-10"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={heroVector} 
                alt="PFETrack Platform Illustration" 
                className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl"
              />
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute top-10 -left-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 -right-6 w-16 h-16 bg-purple-500/20 rounded-full blur-xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            {/* Main dashboard card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg"></div>
                  <span className="font-semibold text-gray-900">PFETrack Dashboard</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                {/* Progress card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Projets en cours</span>
                    <span className="text-sm text-green-600 font-semibold">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">24</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">156</div>
                    <div className="text-xs text-gray-600">Soutenances</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">89</div>
                    <div className="text-xs text-gray-600">Rapports</div>
                  </div>
                </div>
                
                {/* Chart mockup */}
                <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-end justify-between">
                  <div className="w-4 bg-green-400 rounded-t" style={{height: '60%'}}></div>
                  <div className="w-4 bg-blue-400 rounded-t" style={{height: '80%'}}></div>
                  <div className="w-4 bg-green-400 rounded-t" style={{height: '45%'}}></div>
                  <div className="w-4 bg-blue-400 rounded-t" style={{height: '90%'}}></div>
                  <div className="w-4 bg-green-400 rounded-t" style={{height: '70%'}}></div>
                  <div className="w-4 bg-blue-400 rounded-t" style={{height: '55%'}}></div>
                </div>
              </div>
            </div>
            
            {/* Floating cards */}
            <motion.div 
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">En ligne</span>
              </div>
              <div className="text-lg font-bold text-gray-900">127</div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="text-sm text-gray-600 mb-1">Taux de réussite</div>
              <div className="text-xl font-bold text-green-600">94.2%</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
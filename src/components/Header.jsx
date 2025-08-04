import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">PFETrack</span>
          </motion.div>
          <motion.nav 
            className="hidden md:flex space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.a 
              href="#features" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
            >Fonctionnalités</motion.a>
            <motion.a 
              href="#roles" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
            >Rôles</motion.a>
            <motion.a 
              href="#about" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
            >À propos</motion.a>
            <motion.a 
              href="#contact" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
            >Contact</motion.a>
          </motion.nav>
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isAuthenticated ? (
              <>
                <motion.div 
                  className="hidden md:flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-sm font-medium text-gray-700">
                    Bonjour, {currentUser?.firstName || currentUser?.username}
                  </span>
                  <motion.button 
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Déconnexion
                  </motion.button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div className="hidden md:flex items-center space-x-3">
                  <Link to="/login">
                    <motion.button 
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Se connecter
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button 
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      S'inscrire
                    </motion.button>
                  </Link>
                </motion.div>
              </>
            )}
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden bg-white overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <span className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">PFETrack</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-col space-y-4">
              <a href="#features" className="text-lg font-medium py-2 border-b border-gray-100">Fonctionnalités</a>
              <a href="#roles" className="text-lg font-medium py-2 border-b border-gray-100">Rôles</a>
              <a href="#about" className="text-lg font-medium py-2 border-b border-gray-100">À propos</a>
              <a href="#contact" className="text-lg font-medium py-2 border-b border-gray-100">Contact</a>
              
              {isAuthenticated ? (
                <>
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-lg font-medium">Bonjour, {currentUser?.firstName || currentUser?.username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-black text-white font-medium rounded-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-black text-white font-medium rounded-md">
                      Se connecter
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="mt-2 w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-md">
                      S'inscrire
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
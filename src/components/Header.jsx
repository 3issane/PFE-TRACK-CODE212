import React, { useState, useEffect } from 'react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">PFETrack</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#roles" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Rôles</a>
            <a href="#about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">À propos</a>
            <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center space-x-4">
            <a href="/login">
              <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 transition-colors">Se connecter</button>
            </a>
            <a href="/register">
              <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">S'inscrire</button>
            </a>
            <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-white overflow-y-auto">
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
            <a href="/login">
              <button className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-black text-white font-medium rounded-md">Se connecter</button>
            </a>
            <a href="/register">
              <button className="mt-2 w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-md">S'inscrire</button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
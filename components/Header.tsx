import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center mb-8 animate-fade-in">
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-pixel text-white mb-4" style={{ textShadow: '2px 2px 0px #4f46e5' }}>
      Generador <span className="text-indigo-400">ASCII</span>
    </h1>
    <div className="h-1 w-full max-w-xl mx-auto bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
      Crea banners y arte a partir de texto e imágenes. Perfecto para terminales, perfiles y más.
    </p>
  </header>
);
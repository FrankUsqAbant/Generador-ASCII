import React, { useState } from 'react';
import { Header } from './components/Header';
import { TextGenerator } from './components/TextGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { Footer } from './components/Footer';

type GeneratorMode = 'text' | 'image';

const App: React.FC = () => {
  const [mode, setMode] = useState<GeneratorMode>('text');

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 font-sans antialiased">
      <div className="w-full max-w-7xl mx-auto">
        <Header />

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setMode('text')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'text'
                  ? 'border-b-2 border-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Texto a ASCII
            </button>
            <button
              onClick={() => setMode('image')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'image'
                  ? 'border-b-2 border-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Imagen a ASCII
            </button>
          </div>

          {/* Content */}
          <div key={mode} className="animate-fade-in">
            {mode === 'text' && <TextGenerator />}
            {mode === 'image' && <ImageGenerator />}
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
};

export default App;
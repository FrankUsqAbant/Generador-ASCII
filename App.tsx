import React, { useState } from 'react';
import { Header } from './components/Header';
import { TextGenerator } from './components/TextGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { Footer } from './components/Footer';

type GeneratorMode = 'text' | 'image';

const App: React.FC = () => {
  const [mode, setMode] = useState<GeneratorMode>('text');

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 md:px-8 font-sans antialiased">
      <div className="w-full max-w-7xl mx-auto">
        <Header />

        <div className="relative p-[1px] bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-lg shadow-2xl shadow-indigo-500/10">
          <div className="bg-gray-900 rounded-lg">
            {/* Tabs */}
            <div className="flex px-2 pt-2">
              <button
                onClick={() => setMode('text')}
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                  mode === 'text'
                    ? 'bg-gray-800 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                Texto a ASCII
              </button>
              <button
                onClick={() => setMode('image')}
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                  mode === 'image'
                    ? 'bg-gray-800 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                Imagen a ASCII
              </button>
            </div>

            {/* Content */}
            <div className="bg-gray-800 rounded-b-lg rounded-tr-lg p-6">
                <div key={mode} className="animate-fade-in">
                  {mode === 'text' && <TextGenerator />}
                  {mode === 'image' && <ImageGenerator />}
                </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
};

export default App;
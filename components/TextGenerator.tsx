import React, { useState, useEffect, useCallback } from 'react';
import { AsciiOutput } from './AsciiOutput';
import { threeDFontData } from '../utils/threeDFont';
import { bannerFontData } from '../utils/bannerFont';
import { doomFontData } from '../utils/doomFont';
import { lineFontData } from '../utils/lineFont';
import figlet from '../utils/figlet';
import { useDebounce } from '../hooks/useDebounce';

// The types for figlet are not readily available, so we'll use 'any' for simplicity.
const figletWithTypes = figlet as any;

const fontStyles = [
  { id: 'Big', name: 'Banner', isBlockStyle: false },
  { id: 'Doom', name: 'Doom', isBlockStyle: false },
  { id: 'Ivrit', name: 'Línea Limpia', isBlockStyle: false },
  { id: '3-D', name: 'Bloque 3D', isBlockStyle: true },
];


// Load all fonts once when the module is loaded.
try {
  figletWithTypes.parseFont('Big', bannerFontData);
  figletWithTypes.parseFont('Doom', doomFontData);
  figletWithTypes.parseFont('Ivrit', lineFontData);
  figletWithTypes.parseFont('3-D', threeDFontData);
} catch (e) {
  console.error('Critical Error: Could not parse Figlet fonts.', e);
}


type BorderStyle = 'none' | 'simple' | 'double' | 'lines';

const borderStyles: { id: BorderStyle; name: string }[] = [
  { id: 'none', name: 'Ninguno' },
  { id: 'simple', name: 'Caja Simple' },
  { id: 'double', name: 'Caja Doble' },
  { id: 'lines', name: 'Líneas' },
];

const applyBorder = (text: string | null, style: BorderStyle): string => {
  if (!text || style === 'none') return text || '';
  
  let lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1].length === 0) {
      lines.pop();
  }

  if (lines.length === 0) return '';
  
  const maxWidth = Math.max(...lines.map(line => line.length));
  const paddedLines = lines.map(line => line.padEnd(maxWidth));

  switch (style) {
    case 'simple':
      const top = '┌' + '─'.repeat(maxWidth + 2) + '┐';
      const bottom = '└' + '─'.repeat(maxWidth + 2) + '┘';
      const bordered = paddedLines.map(line => `│ ${line} │`);
      return [top, ...bordered, bottom].join('\n');
    case 'double':
      const dTop = '╔' + '═'.repeat(maxWidth + 2) + '╗';
      const dBottom = '╚' + '═'.repeat(maxWidth + 2) + '╝';
      const dBordered = paddedLines.map(line => `║ ${line} ║`);
      return [dTop, ...dBordered, dBottom].join('\n');
    case 'lines':
        const line = '─'.repeat(maxWidth);
        return [line, ...paddedLines, line].join('\n');
    default:
      return text;
  }
};

const toBlockArt = (text: string): string => {
  return text
    .replace(/#/g, '█')   // Main face of the letter
    .replace(/[|/\\]/g, '▒') // Sides of the 3D effect
    .replace(/_/g, '▒');   // Bottom of the 3D effect
};


export const TextGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('Arte ASCII');
  const [selectedBorder, setSelectedBorder] = useState<BorderStyle>('none');
  const [selectedFont, setSelectedFont] = useState<string>('Big');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const debouncedInputText = useDebounce(inputText, 300);

  const generateAsciiArt = useCallback(async (text: string, border: BorderStyle, font: string) => {
    setIsGenerating(true);
    setError(null);
    
    if (!text) {
      setOutputText('');
      setIsGenerating(false);
      return;
    }
    
    if (!figletWithTypes.fonts || !figletWithTypes.fonts[font]) {
      setError(`Error crítico: La fuente "${font}" no se pudo cargar.`);
      setOutputText('');
      setIsGenerating(false);
      return;
    }

    try {
      const data = await new Promise<string>((resolve, reject) => {
        figletWithTypes.text(text, {
          font: font,
          horizontalLayout: 'default',
          verticalLayout: 'default',
          width: 100,
          whitespaceBreak: true
        }, (err: Error | null, result: string) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      let processedArt = data;
      const currentFontStyle = fontStyles.find(f => f.id === font);
      if (currentFontStyle?.isBlockStyle) {
        processedArt = toBlockArt(data);
      }
      
      const finalArt = applyBorder(processedArt, border);
      setOutputText(finalArt);
    } catch (err) {
      console.error('Figlet text generation error:', err);
      setError('Error al generar el arte ASCII base.');
      setOutputText('');
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  useEffect(() => {
    generateAsciiArt(debouncedInputText, selectedBorder, selectedFont);
  }, [debouncedInputText, selectedBorder, selectedFont, generateAsciiArt]);
  
  const currentFont = fontStyles.find(f => f.id === selectedFont);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Controls Panel */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-200">Controles de Texto</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="inputText" className="block text-sm font-medium text-gray-400 mb-2">Texto</label>
            <input
              type="text"
              id="inputText"
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Escribe algo aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              aria-label="Input Text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Estilo de Fuente</label>
            <div className="grid grid-cols-2 gap-2">
              {fontStyles.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setSelectedFont(id)}
                  className={`px-3 py-2 text-sm rounded-md transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
                    selectedFont === id
                      ? 'bg-indigo-600 text-white font-semibold border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Diseño de Borde</label>
            <div className="grid grid-cols-2 gap-2">
              {borderStyles.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setSelectedBorder(id)}
                  className={`px-3 py-2 text-sm rounded-md transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 ${
                    selectedBorder === id
                      ? 'bg-indigo-600 text-white font-semibold border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Output Panel */}
      <div className="lg:col-span-3 min-w-0">
        <AsciiOutput 
          outputText={outputText} 
          error={error} 
          mode="text" 
          isBlockStyle={currentFont?.isBlockStyle} 
          isLoading={isGenerating} 
        />
      </div>
    </div>
  );
};
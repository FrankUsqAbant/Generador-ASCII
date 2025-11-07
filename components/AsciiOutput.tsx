import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon } from './DownloadIcon';
import { CodeIcon } from './CodeIcon';

interface AsciiOutputProps {
  outputText: string;
  error?: string | null;
  mode: 'text' | 'image';
  isBlockStyle?: boolean;
  isLoading?: boolean;
}

export const AsciiOutput: React.FC<AsciiOutputProps> = ({ outputText, error, mode, isBlockStyle, isLoading }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copiar');
  const [downloadButtonText, setDownloadButtonText] = useState('Descargar');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const useBlockStyle = mode === 'text' && isBlockStyle;

  // Reset button text when output changes
  useEffect(() => {
    setCopyButtonText('Copiar');
    setDownloadButtonText('Descargar');
  }, [outputText]);

  // Effect to draw the output to a hidden canvas whenever it changes.
  useEffect(() => {
    const renderToCanvas = async () => {
        if (!outputText || error || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Define font properties based on style
            const fontSize = useBlockStyle ? 16 : 15;
            const fontName = useBlockStyle ? 'VT323' : 'Source Code Pro';
            const font = `${fontSize}px ${fontName}`;
            
            // Ensure font is loaded before measuring
            await document.fonts.load(font);
            ctx.font = font;

            const lines = outputText.split('\n');

            // Calculate character dimensions
            const charHeight = useBlockStyle ? fontSize * 0.8 : fontSize * 1.2;
            const testChar = 'W'; // Use a consistent wide character for measurement
            const charWidth = ctx.measureText(testChar).width * (useBlockStyle ? 1.1 : 0.6); // Adjust multiplier for better fit
            
            // Set canvas dimensions
            const canvasWidth = Math.max(...lines.map(l => l.length)) * charWidth + 20; // Add padding
            const canvasHeight = lines.length * charHeight + 20; // Add padding
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Redraw background and text
            ctx.fillStyle = '#111827'; // bg-gray-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#E5E7EB'; // text-gray-200
            ctx.textBaseline = 'top';
            ctx.font = font;

            lines.forEach((line, i) => {
                ctx.fillText(line, 10, 10 + i * charHeight);
            });

        } catch (e) {
            console.error("Failed to render canvas:", e);
        }
    };
    renderToCanvas();
  }, [outputText, error, useBlockStyle]);


  const handleCopy = async () => {
    if (error || !outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Error');
      setTimeout(() => setCopyButtonText('Copiar'), 2000);
    }
  };

  const handleDownload = () => {
    if (error || !outputText || !canvasRef.current) return;
    
    setDownloadButtonText('Preparando...');

    // Use a timeout to ensure canvas has finished drawing from the latest state update
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `ascii-art-${mode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadButtonText('Descargar');
      } catch (e) {
        console.error("Download failed:", e);
        setDownloadButtonText('Error');
        setTimeout(() => setDownloadButtonText('Descargar'), 2000);
      }
    }, 100); // Small delay to allow canvas redraw
  };
  
  const fontClass = useBlockStyle ? 'font-pixel text-lg leading-tight' : 'font-clean-mono text-sm leading-relaxed';

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">Resultado</h2>
            {!error && outputText && (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-all duration-200 border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                        <CodeIcon />
                        <span>{copyButtonText}</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-all duration-200 border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                        <DownloadIcon />
                        <span>{downloadButtonText}</span>
                    </button>
                </div>
            )}
        </div>
        <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700 min-h-[300px] max-h-[60vh] overflow-auto shadow-inner">
            <pre className={`text-gray-300 whitespace-pre break-words ${fontClass}`}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full min-h-[250px] text-gray-500">
                      <span className="animate-pulse">Generando...</span>
                      <span className="w-2 h-4 bg-gray-500 ml-2 cursor-blink"></span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-yellow-500 text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                ) : (
                    <code>{outputText}</code>
                )}
            </pre>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
        </div>
    </div>
  );
};
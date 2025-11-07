import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AsciiOutput } from './AsciiOutput';
import { imageToAscii } from '../utils/imageToAscii';

export const ImageGenerator: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [outputText, setOutputText] = useState('');
    const [error, setError] = useState<string | null>('Sube una imagen para empezar.');
    const [asciiWidth, setAsciiWidth] = useState(100);
    const [fileName, setFileName] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const processImage = useCallback((src: string, width: number) => {
        setOutputText('Procesando imagen...');
        setError(null);
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d', { willReadFrequently: true });
            if (!context || !canvas) {
                setError('No se pudo obtener el contexto del canvas.');
                return;
            }
            try {
                const ascii = imageToAscii(img, context, width);
                setOutputText(ascii);
            } catch (err) {
                setError('Hubo un error al procesar la imagen.');
                console.error(err);
            }
        };
        img.onerror = () => {
            setError('No se pudo cargar la imagen desde la fuente de datos.');
        };
        img.src = src;
    }, []);

    // Effect to auto-generate only when a new image is uploaded
    useEffect(() => {
        if (imageSrc) {
            processImage(imageSrc, asciiWidth);
        }
    }, [imageSrc, processImage]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImageSrc(result); // This triggers the useEffect
        };
        reader.onerror = () => {
            setError('Error al leer el archivo.');
        }
        reader.readAsDataURL(file);
    };

    const handleGenerateClick = () => {
        if (imageSrc) {
            processImage(imageSrc, asciiWidth);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Controls Panel */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Controles de Imagen</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-400 mb-2">
                            Sube una imagen
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-500">
                                    <label htmlFor="imageUpload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500">
                                        <span>Carga un archivo</span>
                                        <input id="imageUpload" name="imageUpload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <p className="pl-1">o arrástralo aquí</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {fileName || 'PNG, JPG, GIF hasta 10MB'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="asciiWidth" className="block text-sm font-medium text-gray-400 mb-2">
                            Ancho del ASCII (caracteres): <span className="font-bold text-indigo-400">{asciiWidth}</span>
                        </label>
                        <input
                            id="asciiWidth"
                            type="range"
                            min="30"
                            max="300"
                            step="10"
                            value={asciiWidth}
                            onChange={(e) => setAsciiWidth(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            aria-label="ASCII Art Width"
                            disabled={!imageSrc}
                        />
                         <p className="text-xs text-gray-500 mt-1">Un ancho mayor captura más detalles, pero puede que no se vea bien en pantallas pequeñas.</p>
                    </div>

                     <div>
                        <button
                          onClick={handleGenerateClick}
                          disabled={!imageSrc}
                          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          Generar Arte
                        </button>
                    </div>
                </div>
                <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-3">
              <AsciiOutput outputText={outputText} error={error} mode="image" />
            </div>
        </div>
    );
};
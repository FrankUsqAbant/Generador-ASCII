import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon } from './DownloadIcon';

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
            const fontToLoad = useBlockStyle ? '16px VT323' : '16px Source Code Pro';
            await document.fonts.load(fontToLoad);

            const lines = outputText.split('\n');
            const fontSize = useBlockStyle ? 16 : 15;
            const fontName = useBlockStyle ? 'VT323' : 'Source Code Pro';
            const font = `${fontSize}px ${fontName}`;
            ctx.font = font;

            const charHeight = useBlockStyle ? fontSize * 0.8 : fontSize * 1.2;
            const testChar = useBlockStyle ? '█' : 'W';
            const charWidth = ctx.measureText(testChar).width * (useBlockStyle ? 1 : 0.6);
            
            const canvasWidth = Math.max(...lines.map(l => l.length)) * charWidth;
            const canvasHeight = lines.length * charHeight;
            
            canvas.width = canvasWidth + 2
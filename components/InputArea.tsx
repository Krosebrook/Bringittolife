/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useState } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, PaintBrushIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from './ui/Tooltip';
import { CyclingText } from './ui/CyclingText';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  onTextToImage: (prompt: string) => void;
  isGenerating: boolean;
  error?: string | null;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onGenerate, 
  onTextToImage, 
  isGenerating, 
  error,
  disabled = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [textPrompt, setTextPrompt] = useState("");

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onGenerate(textPrompt, file);
    } else {
      alert("Invalid file type. Please provide an image or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [disabled, isGenerating, textPrompt]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isGenerating) setIsDragging(true);
  }, [disabled, isGenerating]);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = textPrompt.trim();
    if (!prompt || disabled || isGenerating) return;
    onTextToImage(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-4">
      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* DROP ZONE */}
      <div className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}>
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-64 sm:h-72 md:h-80
            bg-zinc-900/30 backdrop-blur-sm
            rounded-2xl border-2 border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isGenerating ? 'pointer-events-none opacity-80' : ''}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-8">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : ''}`}>
                    {isGenerating ? (
                        <CpuChipIcon className="w-10 h-10 text-blue-400 animate-spin-slow" />
                    ) : (
                        <ArrowUpTrayIcon className={`w-10 h-10 text-zinc-300 transition-all ${isDragging ? 'text-blue-400 -translate-y-1' : ''}`} />
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl text-zinc-100 font-bold tracking-tighter flex flex-col md:flex-row items-center gap-2">
                        <span>Manifest</span>
                        <CyclingText />
                    </h3>
                    <p className="text-zinc-500 font-light text-sm md:text-lg">
                        Drop any visual artifact to bring it to life
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
                aria-label="Upload artifact image or PDF"
            />
        </label>
      </div>

      <div className="relative flex items-center py-2 opacity-30">
        <div className="flex-grow border-t border-zinc-800"></div>
        <span className="mx-4 text-xs font-mono uppercase tracking-widest">or prompt manifestation</span>
        <div className="flex-grow border-t border-zinc-800"></div>
      </div>

      {/* TEXT INPUT */}
      <form onSubmit={handleTextSubmit} className="relative w-full group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
        
        <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-2 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-2xl">
            <PaintBrushIcon className="w-5 h-5 text-zinc-500 ml-3 shrink-0" />
            <input 
                type="text" 
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Describe an interface or add context for your file..."
                className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 focus:ring-0 text-base px-4 py-2"
                disabled={isGenerating || disabled}
                aria-label="Manifestation prompt"
            />
            
            <button 
                type="submit"
                disabled={!textPrompt.trim() || isGenerating || disabled}
                className="bg-white hover:bg-zinc-200 text-black disabled:bg-zinc-800 disabled:text-zinc-600 px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
                {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Manifest</span>
                        <SparklesIcon className="w-4 h-4 text-blue-600" />
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

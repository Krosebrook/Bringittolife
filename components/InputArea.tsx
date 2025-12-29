
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 px-4 mt-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 animate-in zoom-in-95 duration-300">
          <ExclamationCircleIcon className="w-6 h-6 text-red-500 shrink-0" />
          <p className="text-red-200 text-sm font-medium tracking-tight">{error}</p>
        </div>
      )}

      <div className={`relative group transition-all duration-500 ease-out ${isDragging ? 'scale-[1.02]' : ''}`}>
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isDragging ? 'opacity-60' : ''}`}></div>
        
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-64 sm:h-80
            glass rounded-3xl border border-white/10
            cursor-pointer overflow-hidden
            transition-all duration-500
            ${isDragging ? 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-zinc-900/40' : 'hover:bg-zinc-900/20 hover:border-white/20'}
            ${isGenerating ? 'pointer-events-none opacity-40' : ''}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
            <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-10">
                <div className={`w-20 h-20 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center transition-all duration-700 ${isDragging ? 'scale-110 shadow-blue-500/20' : ''}`}>
                    {isGenerating ? (
                        <CpuChipIcon className="w-10 h-10 text-blue-400 animate-spin-slow" />
                    ) : (
                        <ArrowUpTrayIcon className={`w-10 h-10 text-zinc-400 transition-all ${isDragging ? 'text-blue-400 -translate-y-1' : ''}`} />
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-3xl md:text-4xl text-white font-black tracking-tight flex flex-col md:flex-row items-center gap-3">
                        <span>Manifest</span>
                        <CyclingText />
                    </h3>
                    <p className="text-zinc-500 font-medium text-sm md:text-base tracking-tight">
                        Drop any visual blueprint to transfigure reality
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
                aria-label="Upload artifact"
            />
        </label>
      </div>

      <div className="flex flex-col gap-6">
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="mx-6 text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-600">Contextual Prompt</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <form onSubmit={handleTextSubmit} className="relative w-full group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          
          <div className="relative flex items-center bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all shadow-2xl">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 ml-1">
                  <PaintBrushIcon className="w-5 h-5 text-zinc-500" />
              </div>
              <input 
                  type="text" 
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Describe an interface or set context..."
                  className="w-full bg-transparent border-none text-white placeholder-zinc-700 focus:ring-0 text-base px-5 py-3 font-medium"
                  disabled={isGenerating || disabled}
              />
              
              <button 
                  type="submit"
                  disabled={!textPrompt.trim() || isGenerating || disabled}
                  className="bg-white hover:bg-zinc-100 text-black disabled:bg-zinc-900 disabled:text-zinc-700 px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-3 shrink-0 active:scale-95 shadow-xl shadow-white/5"
              >
                  {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-zinc-500 border-t-black rounded-full animate-spin"></div>
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
    </div>
  );
};

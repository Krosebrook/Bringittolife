/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { Tooltip } from './ui/Tooltip';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  onTextToImage: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const CyclingText = () => {
    const words = [
        "a napkin sketch",
        "a chaotic whiteboard",
        "a game level design",
        "a sci-fi interface",
        "a diagram of a machine",
        "an ancient scroll"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 3000); // Slower cycle to read longer text
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} text-white font-medium pb-1 border-b-2 border-blue-500/50`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, onTextToImage, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [textPrompt, setTextPrompt] = useState("");

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onGenerate("", file);
    } else {
      alert("Please upload an image or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textPrompt.trim() && !disabled && !isGenerating) {
        onTextToImage(textPrompt.trim());
        setTextPrompt("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000 flex flex-col gap-6">
      <div 
        className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-56 sm:h-64 md:h-[22rem]
            bg-zinc-900/30 
            backdrop-blur-sm
            rounded-xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Corner Brackets for technical feel */}
            <div className={`absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 md:space-y-8 p-6 md:p-8 w-full">
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-400 animate-spin-slow" />
                        ) : (
                            <ArrowUpTrayIcon className={`w-8 h-8 md:w-10 md:h-10 text-zinc-300 transition-all duration-300 ${isDragging ? '-translate-y-1 text-blue-400' : ''}`} />
                        )}
                    </div>
                </div>

                <div className="space-y-2 md:space-y-4 w-full max-w-3xl">
                    <h3 className="flex flex-col items-center justify-center text-xl sm:text-2xl md:text-4xl text-zinc-100 leading-none font-bold tracking-tighter gap-3">
                        <span>Bring</span>
                        {/* Fixed height container to prevent layout shifts */}
                        <div className="h-8 sm:h-10 md:h-14 flex items-center justify-center w-full">
                           <CyclingText />
                        </div>
                        <span>to life</span>
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-base md:text-lg font-light tracking-wide">
                        <span className="hidden md:inline">Drag & Drop</span>
                        <span className="md:hidden">Tap</span> to upload any file
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>

      {/* Image Generation Section */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-zinc-800"></div>
        <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-mono uppercase tracking-widest">or generate from text</span>
        <div className="flex-grow border-t border-zinc-800"></div>
      </div>

      <form onSubmit={handleTextSubmit} className="relative w-full">
        <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative flex items-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-700/50 rounded-lg p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-lg">
                <PaintBrushIcon className="w-5 h-5 text-zinc-500 ml-2 mr-2" />
                <Tooltip content="Describe the user interface you want to create" className="flex-1 flex">
                    <input 
                        type="text" 
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder="Describe an interface (e.g., 'A cyberpunk hacker dashboard' or 'A vintage radio player')"
                        className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 focus:ring-0 text-sm sm:text-base px-3 py-2"
                        disabled={isGenerating || disabled}
                    />
                </Tooltip>
                
                <Tooltip content="Create interface from description">
                    <button 
                        type="submit"
                        disabled={!textPrompt.trim() || isGenerating || disabled}
                        className="
                        bg-zinc-100 hover:bg-white text-zinc-900 
                        disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed 
                        px-4 py-2 rounded-md text-sm font-semibold 
                        transition-all duration-200 flex items-center gap-2
                        hover:shadow-lg hover:shadow-blue-500/20
                        ml-2
                        "
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></div>
                            <span>Dreaming...</span>
                            </span>
                        ) : (
                            <>
                                <span>Generate</span>
                                <SparklesIcon className="w-4 h-4 text-blue-600" />
                            </>
                        )}
                    </button>
                </Tooltip>
            </div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 text-center font-mono">
            Powered by Gemini Imagen 3
        </p>
      </form>
    </div>
  );
};

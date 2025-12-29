
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DesignPersona } from '../../types';
import { PaperAirplaneIcon, GlobeAltIcon, SparklesIcon, MicrophoneIcon, PlusCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import { PersonaSelector } from './PersonaSelector';

interface ChatPanelProps {
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  persona: DesignPersona;
  onPersonaChange: (p: DesignPersona) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  history, onSendMessage, isLoading, isListening, onToggleVoice, persona, onPersonaChange
}) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleInjectData = (source: any) => {
    onSendMessage(`Inject real data from "${source.title}" into the UI elements. Specifically use this snippet: ${source.snippet}`);
  };

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500 overflow-hidden">
      <header className="px-5 py-4 border-b border-zinc-800 bg-[#121214] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
             <SparklesIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Refinement Agent</span>
            <PersonaSelector active={persona} onChange={onPersonaChange} />
          </div>
        </div>
        <button 
          onClick={onToggleVoice}
          aria-label={isListening ? "Stop listening" : "Start voice command"}
          className={`p-2.5 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] ring-1 ring-red-500/50' : 'bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-700'}`}
        >
          <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-40">
            <BoltIcon className="w-12 h-12 mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Initialize Refinement Cycle</p>
          </div>
        )}
        
        {history.map((msg, idx) => (
          <article key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`
              max-w-[85%] px-5 py-4 rounded-3xl text-sm shadow-2xl leading-relaxed font-medium
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-none'}
            `}>
              {msg.isVoiceInput && (
                <div className="flex items-center space-x-2 mb-3 text-[9px] font-black opacity-60 border-b border-white/10 pb-2 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Transcribed Signal</span>
                </div>
              )}
              {msg.text}
            </div>
            
            {msg.grounding && msg.grounding.length > 0 && (
              <section className="mt-5 w-full space-y-4 animate-in fade-in duration-700">
                <div className="flex items-center space-x-3">
                   <div className="h-px flex-1 bg-zinc-800/50" />
                   <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-black">Spatial Grounding Matrix</p>
                   <div className="h-px flex-1 bg-zinc-800/50" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {msg.grounding.map((src, sIdx) => (
                    <div 
                      key={sIdx} 
                      className="group flex flex-col p-4 bg-[#09090b] border border-zinc-800/50 rounded-2xl hover:border-blue-500/30 hover:bg-zinc-900/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <a href={src.uri} target="_blank" className="flex items-center space-x-2.5 text-blue-400/80 hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                          <GlobeAltIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px] font-black truncate max-w-[180px] uppercase tracking-wider">{src.title || 'Extracted Node'}</span>
                        </a>
                        <button 
                          onClick={() => handleInjectData(src)}
                          className="flex items-center space-x-1.5 text-[9px] font-black bg-zinc-800 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                          <PlusCircleIcon className="w-3.5 h-3.5" />
                          <span>SYNTHESIZE</span>
                        </button>
                      </div>
                      {src.snippet && (
                        <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 font-mono opacity-80 italic pl-6 border-l border-zinc-800">
                          "{src.snippet}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
        
        {isLoading && (
          <div className="flex items-start animate-in fade-in duration-300">
            <div className="bg-zinc-900/40 border border-zinc-800/50 text-zinc-500 px-5 py-4 rounded-3xl rounded-tl-none flex items-center space-x-4">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce"></div>
              </div>
              <span className="font-mono uppercase tracking-[0.2em] text-[9px] font-black">Recalculating Manifestation</span>
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 border-t border-zinc-800 bg-[#0c0c0e] shrink-0">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
          <div className="relative flex items-center bg-[#121214] border border-zinc-800 rounded-2xl transition-all focus-within:border-blue-500/50 shadow-2xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject design mutation requirements..."
              className="w-full bg-transparent border-none rounded-2xl px-6 py-4.5 text-sm text-white focus:ring-0 placeholder-zinc-700 font-medium"
              disabled={isLoading || isListening}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mr-3 p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:text-white hover:bg-blue-600 disabled:opacity-20 transition-all shadow-lg active:scale-95"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45 -translate-y-0.5 translate-x-0.5" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

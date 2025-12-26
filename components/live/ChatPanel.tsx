
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DesignPersona } from '../../types';
import { PaperAirplaneIcon, GlobeAltIcon, SparklesIcon, MicrophoneIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
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
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
      <div className="px-4 py-3 border-b border-zinc-800 bg-[#121214] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-4 h-4 text-purple-400" />
          <PersonaSelector active={persona} onChange={onPersonaChange} />
        </div>
        <button 
          onClick={onToggleVoice}
          className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          <MicrophoneIcon className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {history.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`
              max-w-[90%] px-4 py-3 rounded-2xl text-sm shadow-lg leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'}
            `}>
              {msg.isVoiceInput && (
                <div className="flex items-center space-x-1.5 mb-2 text-[10px] opacity-70 border-b border-white/10 pb-1.5 font-mono uppercase tracking-widest">
                  <MicrophoneIcon className="w-3 h-3" />
                  <span>Transcribed Design Command</span>
                </div>
              )}
              {msg.text}
            </div>
            {msg.grounding && msg.grounding.length > 0 && (
              <div className="mt-3 w-full space-y-3 pl-1">
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-black">Strategic Grounding</p>
                <div className="grid grid-cols-1 gap-2">
                  {msg.grounding.map((src, sIdx) => (
                    <div 
                      key={sIdx} 
                      className="group flex flex-col p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <a href={src.uri} target="_blank" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                          <GlobeAltIcon className="w-3 h-3 shrink-0" />
                          <span className="text-[10px] font-bold truncate max-w-[140px]">{src.title || 'Source'}</span>
                        </a>
                        <button 
                          onClick={() => handleInjectData(src)}
                          className="flex items-center space-x-1 text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          <PlusCircleIcon className="w-3 h-3" />
                          <span>Inject</span>
                        </button>
                      </div>
                      {src.snippet && (
                        <p className="text-[9px] text-zinc-500 leading-normal line-clamp-3 font-mono opacity-80 italic">{src.snippet}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-zinc-900/50 border border-zinc-800 text-zinc-400 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span className="font-mono uppercase tracking-widest text-[10px]">Processing Manifestation...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-[#121214]">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe design changes..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-zinc-600 pr-12"
            disabled={isLoading || isListening}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white hover:bg-blue-600 disabled:opacity-30 transition-all"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

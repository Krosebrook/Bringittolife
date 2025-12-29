
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ClockIcon, ArrowRightIcon, DocumentIcon, PhotoIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { Creation } from '../types';

interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
}

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center space-x-4 mb-6 px-2">
        <Square3Stack3DIcon className="w-4 h-4 text-zinc-700" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Fragment Archive</h2>
        <div className="h-px flex-1 bg-zinc-900/50"></div>
      </div>
      
      <div className="flex overflow-x-auto space-x-6 pb-6 px-2 scrollbar-hide">
        {history.map((item) => {
          const isPdf = item.originalImage?.startsWith('data:application/pdf');
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="group flex-shrink-0 relative flex flex-col text-left w-56 h-36 bg-[#0c0c0e] hover:bg-[#121214] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-500 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-dot-grid opacity-5 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative z-10 p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-white/5 rounded-xl group-hover:bg-zinc-800 transition-all duration-500">
                      {isPdf ? (
                          <DocumentIcon className="w-5 h-5 text-zinc-500 group-hover:text-blue-400" />
                      ) : item.originalImage ? (
                          <PhotoIcon className="w-5 h-5 text-zinc-500 group-hover:text-purple-400" />
                      ) : (
                          <DocumentIcon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-200" />
                      )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                      {item.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-700 mt-0.5">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-xs font-bold text-zinc-400 group-hover:text-white truncate tracking-tight transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Restore Signal</span>
                    <ArrowRightIcon className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
              </div>
              
              {/* Bottom Glow */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/40 transition-all duration-700"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

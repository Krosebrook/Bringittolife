
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SwatchIcon } from '@heroicons/react/24/outline';

interface CssEditorPanelProps {
  css: string;
  onChange: (newCss: string) => void;
}

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, onChange }) => {
  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214]">
        <div className="flex items-center space-x-2">
          <SwatchIcon className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">CSS Morphing Engine</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase">Live Injection</div>
      </div>
      <div className="flex-1 relative">
        <textarea
          value={css}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full p-6 bg-transparent text-zinc-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 custom-scrollbar"
          placeholder="/* Inject your custom CSS here... */"
          spellCheck={false}
        />
      </div>
      <div className="px-4 py-2 border-t border-zinc-800 bg-[#09090b] flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 font-mono">Real-time update active</span>
        <button 
          onClick={() => onChange("")}
          className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase font-bold"
        >
          Reset
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0c0c0e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </div>
  );
};

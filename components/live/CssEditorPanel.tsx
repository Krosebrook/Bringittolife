
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { SparklesIcon, AdjustmentsHorizontalIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { ThemeState } from '../../types';

interface CssEditorPanelProps {
  css: string;
  theme?: ThemeState;
  onChange: (newCss: string) => void;
  onThemeChange: (theme: ThemeState) => void;
}

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, theme: propTheme, onChange, onThemeChange }) => {
  const [mode, setMode] = useState<'code' | 'visual'>('code');
  const localTheme = propTheme || { h: 217, s: 91, l: 60 };

  useEffect(() => {
    const themeVarBlock = `
:root {
  --m-accent-h: ${localTheme.h};
  --m-accent-s: ${localTheme.s}%;
  --m-accent-l: ${localTheme.l}%;
}
`.trim();
    
    if (css.includes('/* THEME_STUDIO_START */')) {
      const newCss = css.replace(
        /\/\* THEME_STUDIO_START \*\/[\s\S]*?\/\* THEME_STUDIO_END \*\//,
        `/* THEME_STUDIO_START */\n${themeVarBlock}\n/* THEME_STUDIO_END */`
      );
      if (newCss !== css) onChange(newCss);
    } else {
      onChange(`/* THEME_STUDIO_START */\n${themeVarBlock}\n/* THEME_STUDIO_END */\n\n${css}`);
    }
  }, [localTheme.h, localTheme.s, localTheme.l]);

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMode('code')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${mode === 'code' ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${mode === 'visual' ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>Theme Studio</span>
          </button>
        </div>
        <SparklesIcon className="w-4 h-4 text-blue-500" />
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0c0c0e]">
        {mode === 'code' ? (
          <textarea
            value={css}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-6 bg-transparent font-mono text-sm text-zinc-300 resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-8 space-y-8 animate-in fade-in zoom-in-95">
            <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">Brand Color Synthesis</h4>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Hue Shift</span>
                  <span className="text-blue-400">{localTheme.h}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" value={localTheme.h} 
                  onChange={(e) => onThemeChange({...localTheme, h: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Saturation</span>
                  <span className="text-blue-400">{localTheme.s}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={localTheme.s} 
                  onChange={(e) => onThemeChange({...localTheme, s: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Luminosity</span>
                  <span className="text-blue-400">{localTheme.l}%</span>
                </div>
                <input 
                  type="range" min="10" max="90" value={localTheme.l} 
                  onChange={(e) => onThemeChange({...localTheme, l: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="pt-8">
              <div 
                className="w-full h-32 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center justify-center text-white space-y-2"
                style={{ backgroundColor: `hsl(${localTheme.h}, ${localTheme.s}%, ${localTheme.l}%)` }}
              >
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-[0.2em]">Sample Artifact Color</div>
                <div className="text-xl font-bold font-mono">#{localTheme.h} {localTheme.s}% {localTheme.l}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

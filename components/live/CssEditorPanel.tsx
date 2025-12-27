
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useMemo } from 'react';
import { SparklesIcon, AdjustmentsHorizontalIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { ThemeState } from '../../types';

interface CssEditorPanelProps {
  css: string;
  theme?: ThemeState;
  onChange: (newCss: string) => void;
  onThemeChange: (theme: ThemeState) => void;
}

/**
 * OPTIMIZED CSS SYNTAX HIGHLIGHTER
 * Uses memoized regex patterns for high-performance rendering of code.
 */
const highlightCSS = (code: string) => {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>') // Comments
    .replace(/([^{]+)\s*(?={)/g, '<span class="text-blue-400 font-bold">$1</span>') // Selectors
    .replace(/([a-zA-Z\-]+)\s*:/g, '<span class="text-purple-400">$1</span>:') // Properties
    .replace(/:\s*([^;\}]+)/g, ': <span class="text-amber-200">$1</span>') // Values
    .replace(/[{}]/g, '<span class="text-zinc-500">$0</span>'); // Braces
};

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, theme: propTheme, onChange, onThemeChange }) => {
  const [mode, setMode] = useState<'code' | 'visual'>('code');
  const localTheme = propTheme || { h: 217, s: 91, l: 60 };
  
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  const lineNumbers = useMemo(() => {
    const count = css.split('\n').length;
    return Array.from({ length: count }, (_, i) => i + 1).join('\n');
  }, [css]);

  const highlightedHtml = useMemo(() => highlightCSS(css), [css]);

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setMode('code')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${mode === 'code' ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${mode === 'visual' ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
        </div>
        <SparklesIcon className="w-4 h-4 text-blue-500/50" />
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0c0c0e] font-mono text-sm">
        {mode === 'code' ? (
          <div className="flex h-full">
            <div 
              ref={lineNumbersRef}
              className="w-10 bg-[#0c0c0e] text-zinc-700 text-right pr-2 py-6 select-none border-r border-zinc-900 overflow-hidden leading-6"
              aria-hidden="true"
            >
              <pre className="m-0">{lineNumbers}</pre>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <pre
                ref={preRef}
                className="absolute inset-0 m-0 p-6 pointer-events-none whitespace-pre overflow-hidden leading-6 text-zinc-300 z-0"
                dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
              />
              <textarea
                value={css}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-white resize-none focus:outline-none z-10 whitespace-pre overflow-auto leading-6 spellcheck-false"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto h-full custom-scrollbar">
            <div>
              <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6">Brand DNA Control</h4>
              <div className="space-y-6">
                {[
                  { label: 'Primary Hue', key: 'h', max: 360, color: 'accent-blue-500' },
                  { label: 'Saturation', key: 's', max: 100, color: 'accent-blue-500' },
                  { label: 'Luminosity', key: 'l', max: 100, color: 'accent-blue-500' },
                ].map((slider) => (
                  <div key={slider.key} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                      <span>{slider.label}</span>
                      <span className="text-blue-400">{(localTheme as any)[slider.key]}{slider.key === 'h' ? '°' : '%'}</span>
                    </div>
                    <input 
                      type="range" min="0" max={slider.max} value={(localTheme as any)[slider.key]} 
                      onChange={(e) => onThemeChange({...localTheme, [slider.key]: parseInt(e.target.value)})}
                      className={`w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${slider.color}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <div 
                className="w-full h-32 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center justify-center text-white space-y-1"
                style={{ backgroundColor: `hsl(${localTheme.h}, ${localTheme.s}%, ${localTheme.l}%)` }}
              >
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-[0.2em]">Live Brand Swatch</div>
                <div className="text-xl font-bold font-mono">HSL({localTheme.h}, {localTheme.s}%, {localTheme.l}%)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

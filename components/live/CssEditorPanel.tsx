
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { SwatchIcon, ExclamationTriangleIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface CssError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
  id: string;
}

interface CssEditorPanelProps {
  css: string;
  onChange: (newCss: string) => void;
}

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, onChange }) => {
  const [errors, setErrors] = useState<CssError[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevErrorCount = useRef(0);

  // Real-time CSS Validation Logic
  useEffect(() => {
    const validateCss = () => {
      const newErrors: CssError[] = [];
      const lines = css.split('\n');
      
      // 1. Structural Checks
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;

      if (openBraces > closeBraces) {
        newErrors.push({ 
          id: 'brace-missing',
          line: -1, 
          message: `Unclosed block: Expected ${openBraces - closeBraces} more '}'`, 
          severity: 'error' 
        });
      } else if (closeBraces > openBraces) {
        newErrors.push({ 
          id: 'brace-extra',
          line: -1, 
          message: `Unexpected '}': Found ${closeBraces - openBraces} extra brace(s)`, 
          severity: 'error' 
        });
      }

      // 2. Semantic & Syntax Heuristics
      let inBlock = false;
      const seenProperties = new Set<string>();

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('/*')) return;

        // Block Tracking
        if (trimmed.includes('{')) {
          inBlock = true;
          seenProperties.clear();
        }
        if (trimmed.includes('}')) {
          inBlock = false;
          seenProperties.clear();
        }

        // Property-Value Validation
        if (inBlock && trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const property = trimmed.substring(0, colonIndex).trim();
          const valueWithSemi = trimmed.substring(colonIndex + 1).trim();
          const value = valueWithSemi.replace(/;$/, '').trim();

          // Check: Duplicate Properties
          if (property && seenProperties.has(property)) {
            newErrors.push({
              id: `dup-${index}`,
              line: index + 1,
              message: `Duplicate property: "${property}" is already defined in this block`,
              severity: 'warning'
            });
          }
          if (property) seenProperties.add(property);

          // Check: Missing Semicolon
          if (!trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
             newErrors.push({ 
               id: `semi-${index}`,
               line: index + 1, 
               message: `Missing semicolon after property value`, 
               severity: 'warning' 
             });
          }

          // Check: CSS standard support
          if (property && !property.startsWith('--')) {
            // Validate property existence
            const isValidProp = CSS.supports(property, 'inherit');
            if (!isValidProp) {
              newErrors.push({
                id: `prop-inv-${index}`,
                line: index + 1,
                message: `Unknown property: "${property}"`,
                severity: 'warning'
              });
            } else if (value && !CSS.supports(property, value)) {
              // Validate value compatibility
              newErrors.push({
                id: `val-inv-${index}`,
                line: index + 1,
                message: `Invalid value "${value}" for "${property}"`,
                severity: 'warning'
              });
            }
          }
        }

        // Check: Naked selectors (Heuristic)
        if (!inBlock && trimmed.length > 0 && !trimmed.includes('{') && !trimmed.includes('}') && !trimmed.startsWith('@') && !trimmed.startsWith('/') && !trimmed.includes(':')) {
           // Might be a selector split across lines or just a floating string
           if (index < lines.length - 1 && !lines[index+1].trim().startsWith('{')) {
             newErrors.push({
               id: `select-err-${index}`,
               line: index + 1,
               message: `Selector might be missing an opening brace '{'`,
               severity: 'warning'
             });
           }
        }
      });

      setErrors(newErrors);
      
      // Trigger subtle shake animation if errors increased
      if (newErrors.length > prevErrorCount.current) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
      prevErrorCount.current = newErrors.length;
    };

    const debounce = setTimeout(validateCss, 250);
    return () => clearTimeout(debounce);
  }, [css]);

  const hasCriticalErrors = errors.some(e => e.severity === 'error');

  return (
    <div className={`w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r transition-all duration-500 flex flex-col shrink-0 ${hasCriticalErrors ? 'border-red-900/50 bg-[#0f0909]' : 'border-zinc-800 bg-[#0c0c0e]'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214] z-10">
        <div className="flex items-center space-x-2">
          <SwatchIcon className={`w-4 h-4 transition-colors duration-500 ${hasCriticalErrors ? 'text-red-500' : 'text-blue-500'}`} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Morphing Engine</span>
        </div>
        
        <div className="flex items-center space-x-3">
           {errors.length > 0 ? (
             <div className={`flex items-center space-x-1.5 ${isAnimating ? 'animate-shake' : ''}`}>
                <ExclamationTriangleIcon className={`w-3.5 h-3.5 ${hasCriticalErrors ? 'text-red-500' : 'text-amber-500'}`} />
                <span className={`text-[10px] font-mono uppercase font-bold tracking-tight ${hasCriticalErrors ? 'text-red-500' : 'text-amber-500'}`}>
                  {errors.length} {errors.length === 1 ? 'Diagnostic' : 'Diagnostics'}
                </span>
             </div>
           ) : (
             <div className="flex items-center space-x-1.5 text-emerald-500 animate-in fade-in duration-700">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-tight">System Ready</span>
             </div>
           )}
           <div className="h-3 w-px bg-zinc-800"></div>
           <SparklesIcon className={`w-3.5 h-3.5 ${css.length > 0 ? 'text-blue-400 animate-pulse' : 'text-zinc-700'}`} />
        </div>
      </div>

      <div className="flex-1 relative group">
        {/* Line Highlighting Gutter */}
        <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none z-10 bg-zinc-900/20">
          {errors.filter(e => e.line > 0).map((err) => (
            <div 
              key={err.id}
              className={`absolute left-0 w-1 transition-all duration-300 ${err.severity === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500/60'}`}
              style={{ top: `${(err.line - 1) * 1.25}rem`, height: '1.25rem' }} 
              title={err.message}
            />
          ))}
        </div>

        <textarea
          value={css}
          onChange={(e) => onChange(e.target.value)}
          className={`
            absolute inset-0 w-full h-full p-6 bg-transparent font-mono text-sm resize-none 
            focus:outline-none focus:ring-0 custom-scrollbar transition-colors duration-500
            ${hasCriticalErrors ? 'text-red-100/80' : 'text-zinc-300'}
          `}
          placeholder="/* Overwrite styles here. Use CSS variables or raw selectors. */"
          spellCheck={false}
          style={{ lineHeight: '1.25rem' }}
        />

        {/* Dynamic Diagnostics HUD */}
        {errors.length > 0 && (
          <div className={`
            absolute bottom-6 right-6 max-w-[300px] bg-[#121214]/95 backdrop-blur-xl border border-zinc-800 
            rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-20 transition-all duration-300
            ${isAnimating ? 'animate-bounce-subtle' : ''}
            group-hover:opacity-10 group-hover:translate-y-2 group-hover:pointer-events-none
          `}>
            <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Diagnostics</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20"></div>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
              {errors.map((err) => (
                <div key={err.id} className="flex gap-3 items-start animate-in slide-in-from-right-2 duration-300">
                  <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-[#121214] ${err.severity === 'error' ? 'bg-red-500 ring-red-500/20' : 'bg-amber-500 ring-amber-500/20'}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-zinc-200 font-medium leading-tight">{err.message}</span>
                    {err.line > 0 && (
                      <span className="text-[9px] text-zinc-500 font-mono font-bold">
                        Line {err.line}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-zinc-800 bg-[#09090b] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
            <span className={`text-[10px] font-mono transition-colors duration-500 ${hasCriticalErrors ? 'text-red-500' : 'text-zinc-600'}`}>
                {hasCriticalErrors ? 'Validation Blocked' : 'Hot-Reload Active'}
            </span>
            <div className={`h-1.5 w-1.5 rounded-full ${hasCriticalErrors ? 'bg-red-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
        </div>
        <button 
          onClick={() => onChange("")}
          className="text-[10px] text-zinc-500 hover:text-white transition-all uppercase font-black tracking-widest px-2 py-1 rounded hover:bg-zinc-800"
        >
          Purge Editor
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f1f23;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2d2d33;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.5s ease-in-out 1;
        }
      `}</style>
    </div>
  );
};

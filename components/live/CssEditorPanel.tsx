
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  AdjustmentsHorizontalIcon, 
  CodeBracketIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ThemeState } from '../../types';

interface CssIssue {
  id: string;
  line: number;
  message: string;
  type: 'error' | 'warning';
  code: string;
  suggestion?: string;
  fix?: (css: string) => string;
}

interface CssEditorPanelProps {
  css: string;
  theme?: ThemeState;
  onChange: (newCss: string) => void;
  onThemeChange: (theme: ThemeState) => void;
}

/**
 * ADVANCED CSS SYNTAX HIGHLIGHTER v2.1
 * Provides semantic tokenization for better visual clarity.
 */
const highlightCSS = (code: string) => {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>')
    // Selectors (Ids, Classes, Tags)
    .replace(/([^{}\n]+)\s*(?={)/g, (match) => {
       return match.replace(/(#[a-zA-Z0-9_-]+)/g, '<span class="text-amber-400">$1</span>')
                   .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-blue-400">$1</span>')
                   .replace(/\b(div|span|header|footer|main|section|article|nav|aside|button|input|a|p|h[1-6]|ul|li|ol|body|html)\b/g, '<span class="text-pink-400">$1</span>');
    })
    // Properties
    .replace(/([a-zA-Z\-]+)\s*:/g, '<span class="text-indigo-300 font-medium">$1</span>:')
    // Values (Keywords, Numbers, Units, Strings)
    .replace(/:\s*([^;\}]+)/g, (match, val) => {
       const highlightedVal = val
         .replace(/\b(important|auto|none|inherit|initial|revert|unset|absolute|relative|fixed|sticky|flex|grid|block|inline-block|inline)\b/g, '<span class="text-emerald-400">$1</span>')
         .replace(/(-?\d*\.?\d+)(px|rem|em|vh|vw|%|s|ms|deg|fr)?/g, '<span class="text-sky-300 font-mono">$1$2</span>')
         .replace(/(['"][^'"]*['"])/g, '<span class="text-orange-300">$1</span>')
         .replace(/(hsl|rgb|rgba|var)\([^)]+\)/g, '<span class="text-rose-300">$0</span>');
       return `: ${highlightedVal}`;
    })
    // Braces & Semicolons
    .replace(/[{}]/g, '<span class="text-zinc-500 font-bold">$0</span>')
    .replace(/;/g, '<span class="text-zinc-600">;</span>');
};

const performCssAudit = (css: string): CssIssue[] => {
  const issues: CssIssue[] = [];
  const lines = css.split('\n');
  let inBlock = false;
  let currentBlockProperties = new Set<string>();
  let currentSelector = "";
  const seenSelectors = new Set<string>();

  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({ 
      id: 'braces-balance',
      line: lines.length, 
      message: `Mismatched braces. Found ${openBraces} '{' and ${closeBraces} '}'.`, 
      type: 'error',
      code: 'braces-balance'
    });
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNum = index + 1;

    if (trimmedLine.includes('{')) {
      inBlock = true;
      currentBlockProperties.clear();
      currentSelector = trimmedLine.split('{')[0].trim();
      if (seenSelectors.has(currentSelector)) {
        issues.push({
          id: `no-duplicate-selectors-${lineNum}`,
          line: lineNum,
          message: `Selector "${currentSelector}" is redundant.`,
          type: 'warning',
          code: 'no-duplicate-selectors',
          suggestion: 'Consolidate styles into a single block.'
        });
      }
      seenSelectors.add(currentSelector);
    }
    
    if (inBlock && trimmedLine.includes(':')) {
      const parts = trimmedLine.split(':');
      const prop = parts[0].trim();
      if (!trimmedLine.endsWith(';') && !trimmedLine.includes('}')) {
          issues.push({
              id: `missing-semicolon-${lineNum}`,
              line: lineNum,
              message: `Missing trailing semicolon for "${prop}".`,
              type: 'error',
              code: 'declaration-block-trailing-semicolon',
              fix: (c) => {
                  const l = c.split('\n');
                  l[index] = l[index].trimEnd() + ';';
                  return l.join('\n');
              }
          });
      }
      if (currentBlockProperties.has(prop)) {
        issues.push({ 
          id: `duplicate-prop-${lineNum}`,
          line: lineNum, 
          message: `Duplicate property "${prop}" override.`, 
          type: 'error',
          code: 'declaration-block-no-duplicate-properties'
        });
      }
      currentBlockProperties.add(prop);
    }

    if (trimmedLine.includes('}')) {
      inBlock = false;
    }
  });

  return issues;
};

export const CssEditorPanel: React.FC<CssEditorPanelProps> = ({ css, theme: propTheme, onChange, onThemeChange }) => {
  const [mode, setMode] = useState<'code' | 'visual'>('code');
  const [showIssues, setShowIssues] = useState(false);
  const [issues, setIssues] = useState<CssIssue[]>([]);
  const [cursorLine, setCursorLine] = useState(1);
  
  const localTheme = propTheme || { h: 217, s: 91, l: 60 };
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIssues(performCssAudit(css));
    }, 400);
    return () => clearTimeout(timer);
  }, [css]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = css.substring(0, start) + "  " + css.substring(end);
      onChange(newValue);
      
      // Reset cursor position after React re-renders
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCursorUpdate = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const selectionStart = e.currentTarget.selectionStart;
    const linesBefore = css.substring(0, selectionStart).split('\n');
    setCursorLine(linesBefore.length);
  };

  const lineNumbers = useMemo(() => {
    const count = css.split('\n').length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [css]);

  const highlightedHtml = useMemo(() => highlightCSS(css), [css]);

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  const handleFix = (issue: CssIssue) => {
    if (issue.fix) {
        onChange(issue.fix(css));
    }
  };

  const scrollToLine = (line: number) => {
      if (!textareaRef.current) return;
      const lineHeight = 24; 
      textareaRef.current.scrollTop = (line - 1) * lineHeight - 40;
      textareaRef.current.focus();
  };

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214] shrink-0">
        <div className="flex items-center space-x-1 p-1 bg-zinc-950/50 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setMode('code')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md transition-all ${mode === 'code' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-3.5 h-3.5" />
            <span>Style Lab</span>
          </button>
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md transition-all ${mode === 'visual' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>Theme Lab</span>
          </button>
        </div>
        
        {mode === 'code' && (
          <button 
            onClick={() => setShowIssues(!showIssues)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              errorCount > 0 ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
              warningCount > 0 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 
              'bg-green-500/10 border-green-500/50 text-green-400'
            }`}
          >
            {errorCount > 0 ? <ExclamationCircleIcon className="w-3.5 h-3.5" /> : 
             warningCount > 0 ? <ExclamationTriangleIcon className="w-3.5 h-3.5" /> : 
             <CheckCircleIcon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{errorCount + warningCount} Static Messages</span>
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0c0c0e] font-mono text-sm">
        {mode === 'code' ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-hidden relative">
              {/* Line Numbers Container */}
              <div 
                ref={lineNumbersRef}
                className="w-12 bg-[#0c0c0e] text-zinc-800 text-right pr-3 py-6 select-none border-r border-zinc-900/50 overflow-hidden leading-6"
                aria-hidden="true"
              >
                {lineNumbers.map((num) => (
                  <div 
                    key={num} 
                    className={`transition-colors duration-200 ${num === cursorLine ? 'text-zinc-400 font-bold' : 'text-zinc-800'}`}
                  >
                    {num}
                  </div>
                ))}
              </div>

              {/* Editor Surface */}
              <div className="flex-1 relative overflow-hidden">
                {/* Active Line Highlight Overlay */}
                <div 
                   className="absolute left-0 right-0 h-6 bg-blue-500/5 pointer-events-none z-0 transition-all duration-100"
                   style={{ top: `${(cursorLine - 1) * 24 + 24}px` }}
                />
                
                <pre
                  ref={preRef}
                  className="absolute inset-0 m-0 p-6 pointer-events-none whitespace-pre overflow-hidden leading-6 text-zinc-300 z-10 font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
                />
                <textarea
                  ref={textareaRef}
                  value={css}
                  onKeyDown={handleKeyDown}
                  onSelect={handleCursorUpdate}
                  onClick={handleCursorUpdate}
                  onChange={(e) => {
                    onChange(e.target.value);
                    handleCursorUpdate(e);
                  }}
                  onScroll={handleScroll}
                  className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-blue-500 resize-none focus:outline-none z-20 whitespace-pre overflow-auto leading-6 font-mono"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            {showIssues && (
              <div className="h-64 border-t border-zinc-800 bg-[#09090b] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl shrink-0">
                <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/80 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-3">
                    <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em]">Problems</span>
                  </div>
                  <button onClick={() => setShowIssues(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                    &times;
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-[#0c0c0e]">
                  {issues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-3 opacity-40">
                      <CheckCircleIcon className="w-10 h-10" />
                      <p className="text-[9px] font-black uppercase tracking-[0.3em]">Integrity Verified</p>
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="group flex items-start gap-4 p-3 rounded-xl hover:bg-zinc-900/40 transition-all border border-transparent hover:border-zinc-800/50 cursor-pointer"
                        onClick={() => scrollToLine(issue.line)}
                      >
                        <div className="mt-1 shrink-0">
                          {issue.type === 'error' ? 
                            <ExclamationCircleIcon className="w-4 h-4 text-red-500" /> : 
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                             <span className="text-zinc-200 text-xs font-medium truncate">{issue.message}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                             <span className="text-[9px] font-mono text-zinc-600">Line {issue.line}</span>
                             {issue.fix && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleFix(issue); }}
                                 className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 text-[9px] font-black uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded border border-blue-500/20"
                               >
                                 <SparklesIcon className="w-3 h-3" />
                                 <span>Quick Fix</span>
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto h-full custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Global Brand DNA</h4>
                <p className="text-zinc-600 text-[11px] leading-relaxed">Modify the manifestation's core hue profile. This propagates through all design tokens.</p>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Hue', key: 'h', max: 360, unit: '°' },
                  { label: 'Saturation', key: 's', max: 100, unit: '%' },
                  { label: 'Luminosity', key: 'l', max: 100, unit: '%' },
                ].map((slider) => (
                  <div key={slider.key} className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      <span>{slider.label}</span>
                      <span className="text-blue-500">{(localTheme as any)[slider.key]}{slider.unit}</span>
                    </div>
                    <div className="relative group flex items-center">
                       <input 
                        type="range" min="0" max={slider.max} value={(localTheme as any)[slider.key]} 
                        onChange={(e) => onThemeChange({...localTheme, [slider.key]: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        aria-label={slider.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <div 
                className="w-full h-40 rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col items-center justify-center text-white space-y-2 transition-all duration-700"
                style={{ backgroundColor: `hsl(${localTheme.h}, ${localTheme.s}%, ${localTheme.l}%)` }}
              >
                <div className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em] font-black">Color Signature</div>
                <div className="text-xl font-bold font-mono tracking-tighter">
                  HSL({localTheme.h}, {localTheme.s}, {localTheme.l})
                </div>
                <div className="w-12 h-0.5 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

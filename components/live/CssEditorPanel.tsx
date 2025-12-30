
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
  SparklesIcon,
  ShieldCheckIcon
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
 * ADVANCED CSS SYNTAX HIGHLIGHTER v3.0
 * Provides semantic tokenization including media queries and keyframes.
 */
const highlightCSS = (code: string) => {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>')
    // At-Rules (Media, Keyframes, Import)
    .replace(/(@[a-z-]+)/g, '<span class="text-purple-400 font-bold">$1</span>')
    // Selectors (Ids, Classes, Tags)
    .replace(/([^{}\n]+)\s*(?={)/g, (match) => {
       // Avoid highlighting inside @media blocks incorrectly by checking indentation context roughly or just applying generally
       return match.replace(/(#[a-zA-Z0-9_-]+)/g, '<span class="text-amber-400 font-bold">$1</span>')
                   .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span class="text-blue-400">$1</span>')
                   .replace(/\b(div|span|header|footer|main|section|article|nav|aside|button|input|a|p|h[1-6]|ul|li|ol|body|html)\b/g, '<span class="text-pink-400">$1</span>');
    })
    // Properties
    .replace(/([a-zA-Z\-]+)\s*:/g, '<span class="text-indigo-300 font-medium">$1</span>:')
    // Values (Keywords, Numbers, Units, Strings)
    .replace(/:\s*([^;\}]+)/g, (match, val) => {
       const highlightedVal = val
         .replace(/\b(important|auto|none|inherit|initial|revert|unset|absolute|relative|fixed|sticky|flex|grid|block|inline-block|inline|center|hidden|visible)\b/g, '<span class="text-emerald-400 font-bold">$1</span>')
         .replace(/(-?\d*\.?\d+)(px|rem|em|vh|vw|%|s|ms|deg|fr)?/g, '<span class="text-sky-300 font-mono font-medium">$1$2</span>')
         .replace(/(['"][^'"]*['"])/g, '<span class="text-orange-300">$1</span>')
         .replace(/(hsl|rgb|rgba|var)\([^)]+\)/g, '<span class="text-rose-300">$0</span>');
       return `: ${highlightedVal}`;
    })
    // Braces & Semicolons
    .replace(/[{}]/g, '<span class="text-zinc-500 font-bold">$0</span>')
    .replace(/;/g, '<span class="text-zinc-600 font-bold">;</span>');
};

/**
 * PRODUCTION-GRADE INTERNAL CSS LINTER
 * Implements a subset of standard stylelint rules to ensure best practices.
 */
const performCssAudit = (css: string): CssIssue[] => {
  const issues: CssIssue[] = [];
  const lines = css.split('\n');
  let inBlock = false;
  let currentBlockProperties = new Set<string>();
  let currentSelector = "";
  let blockHasContent = false;
  const seenSelectors = new Set<string>();

  // Global Check: Braces Balance
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({ 
      id: 'braces-balance',
      line: lines.length, 
      message: `Mismatched braces. Found ${openBraces} '{' and ${closeBraces} '}'.`, 
      type: 'error',
      code: 'block-closing-brace-empty-line-before'
    });
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNum = index + 1;

    // Rule: Detect Block Start
    if (trimmedLine.includes('{')) {
      inBlock = true;
      blockHasContent = false;
      currentBlockProperties.clear();
      currentSelector = trimmedLine.split('{')[0].trim();
      
      // Rule: selector-no-redundant
      if (seenSelectors.has(currentSelector) && !currentSelector.startsWith('@')) {
        issues.push({
          id: `redundant-selector-${lineNum}`,
          line: lineNum,
          message: `Selector "${currentSelector}" is duplicated.`,
          type: 'warning',
          code: 'no-duplicate-selectors',
          suggestion: 'Consolidate multiple blocks into one to reduce CSS footprint.'
        });
      }
      seenSelectors.add(currentSelector);

      // Rule: selector-class-pattern (Kebab case enforcement)
      if (currentSelector.match(/\.[a-z0-9]+[A-Z]/)) {
        issues.push({
            id: `kebab-selector-${lineNum}`,
            line: lineNum,
            message: `Selector "${currentSelector}" uses CamelCase.`,
            type: 'warning',
            code: 'selector-class-pattern',
            suggestion: 'Use kebab-case (e.g. .main-header) for standard CSS conventions.'
        });
      }
    }
    
    // Rule: Property/Value Declarations
    if (inBlock && trimmedLine.includes(':') && !trimmedLine.startsWith('//')) {
      blockHasContent = true;
      const parts = trimmedLine.split(':');
      const prop = parts[0].trim();
      const val = parts.slice(1).join(':').trim();

      // Rule: declaration-block-no-duplicate-properties
      if (currentBlockProperties.has(prop)) {
        issues.push({ 
          id: `duplicate-prop-${lineNum}`,
          line: lineNum, 
          message: `Duplicate property "${prop}" in same block.`, 
          type: 'error',
          code: 'declaration-block-no-duplicate-properties'
        });
      }
      currentBlockProperties.add(prop);

      // Rule: declaration-block-trailing-semicolon
      if (!trimmedLine.endsWith(';') && !trimmedLine.includes('}')) {
          issues.push({
              id: `missing-semicolon-${lineNum}`,
              line: lineNum,
              message: `Missing semicolon after "${prop}".`,
              type: 'error',
              code: 'declaration-block-trailing-semicolon',
              fix: (c) => {
                  const l = c.split('\n');
                  l[index] = l[index].trimEnd() + ';';
                  return l.join('\n');
              }
          });
      }

      // Rule: declaration-no-important (Accessibility/Specificity)
      if (trimmedLine.includes('!important')) {
        issues.push({
            id: `no-important-${lineNum}`,
            line: lineNum,
            message: `Usage of !important detected.`,
            type: 'warning',
            code: 'declaration-no-important',
            suggestion: 'Use higher specificity selectors instead of !important to avoid global style override issues.'
        });
      }

      // Rule: color-no-invalid-hex
      const hexMatch = val.match(/#[a-zA-Z0-9]+/);
      if (hexMatch && ![4, 7, 9].includes(hexMatch[0].length)) {
        issues.push({
            id: `invalid-hex-${lineNum}`,
            line: lineNum,
            message: `Invalid hex color code: ${hexMatch[0]}`,
            type: 'error',
            code: 'color-no-invalid-hex'
        });
      }

      // Rule: font-size-unit (Accessibility recommendation)
      if (prop === 'font-size' && val.includes('px')) {
        issues.push({
            id: `font-size-px-${lineNum}`,
            line: lineNum,
            message: `Hardcoded pixel value for font-size.`,
            type: 'warning',
            code: 'font-size-unit-rem',
            suggestion: 'Use relative units like "rem" or "em" for better accessibility and user zoom support.'
        });
      }

      // Rule: vendor-prefix-check (Modern standards)
      if (prop.startsWith('-webkit-') || prop.startsWith('-moz-') || prop.startsWith('-ms-')) {
          const standardProp = prop.replace(/^-(webkit|moz|ms)-/, '');
          issues.push({
              id: `vendor-prefix-${lineNum}`,
              line: lineNum,
              message: `Vendor prefix "${prop}" is likely redundant.`,
              type: 'warning',
              code: 'property-no-vendor-prefix',
              suggestion: `Use standard "${standardProp}" property as modern browsers handle it natively.`
          });
      }

      // Rule: z-index scale limit
      if (prop === 'z-index' && !isNaN(parseInt(val)) && parseInt(val) > 1000) {
          issues.push({
              id: `z-index-high-${lineNum}`,
              line: lineNum,
              message: `High z-index value (${val}).`,
              type: 'warning',
              code: 'scale-unlimited-z-index',
              suggestion: 'Avoid excessive z-index values. Stick to a defined scale (e.g. 10, 20, 30, 40, 50) to manage stacking contexts.'
          });
      }
    }

    // Rule: Detect Block End
    if (trimmedLine.includes('}')) {
      if (inBlock && !blockHasContent && !currentSelector.startsWith('@')) {
        issues.push({
            id: `empty-block-${lineNum}`,
            line: lineNum,
            message: `Empty declaration block for "${currentSelector}".`,
            type: 'warning',
            code: 'block-no-empty',
            suggestion: 'Remove empty blocks to keep the stylesheet clean.'
        });
      }
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
      textareaRef.current.scrollTop = (line - 1) * lineHeight - 64;
      textareaRef.current.focus();
  };

  return (
    <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 animate-in slide-in-from-left duration-500 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214] shrink-0 z-10 shadow-lg">
        <div className="flex items-center space-x-1 p-1 bg-zinc-950/50 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setMode('code')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-md transition-all ${mode === 'code' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-3.5 h-3.5" />
            <span>Style Lab</span>
          </button>
          <button 
            onClick={() => setMode('visual')}
            className={`flex items-center space-x-2 text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-md transition-all ${mode === 'visual' ? 'text-white bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            <span>Theme Lab</span>
          </button>
        </div>
        
        {mode === 'code' && (
          <button 
            onClick={() => setShowIssues(!showIssues)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
              errorCount > 0 ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 
              warningCount > 0 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 
              'bg-zinc-800 border-zinc-700 text-zinc-500'
            }`}
          >
            {errorCount > 0 ? <ExclamationCircleIcon className="w-3.5 h-3.5" /> : 
             warningCount > 0 ? <ExclamationTriangleIcon className="w-3.5 h-3.5" /> : 
             <ShieldCheckIcon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{errorCount + warningCount} Linter Messages</span>
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0c0c0e] font-mono text-sm">
        {mode === 'code' ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-hidden relative">
              <div 
                ref={lineNumbersRef}
                className="w-12 bg-[#0c0c0e] text-zinc-800 text-right pr-3 py-6 select-none border-r border-zinc-900/50 overflow-hidden leading-6 font-mono"
                aria-hidden="true"
              >
                {lineNumbers.map((num) => {
                  const lineIssue = issues.find(i => i.line === num);
                  return (
                    <div 
                      key={num} 
                      className={`relative transition-colors duration-200 flex justify-end ${num === cursorLine ? 'text-zinc-400 font-bold' : 'text-zinc-800'}`}
                    >
                      {num}
                      {lineIssue && (
                          <div className={`absolute -right-2 top-2 w-1.5 h-1.5 rounded-full ${lineIssue.type === 'error' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 relative overflow-hidden group">
                <div 
                   className="absolute left-0 right-0 h-6 bg-blue-500/[0.03] pointer-events-none z-0 transition-all duration-100 border-y border-blue-500/[0.05]"
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
                  className="absolute inset-0 w-full h-full p-6 bg-transparent text-transparent caret-blue-500 resize-none focus:outline-none z-20 whitespace-pre overflow-auto leading-6 font-mono selection:bg-blue-500/20"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            {showIssues && (
              <div className="h-64 border-t border-zinc-800 bg-[#09090b] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0 z-30">
                <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/80 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-3">
                    <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em]">Static Analysis Pipeline</span>
                  </div>
                  <button 
                    onClick={() => setShowIssues(false)} 
                    className="text-zinc-500 hover:text-white transition-colors p-1 bg-zinc-800 rounded-md"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#0c0c0e]">
                  {issues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 opacity-40">
                      <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Style Integrity Validated</p>
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <div 
                        key={issue.id} 
                        className="group flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-900/60 transition-all border border-transparent hover:border-zinc-800/80 cursor-pointer"
                        onClick={() => scrollToLine(issue.line)}
                      >
                        <div className="mt-1 shrink-0">
                          {issue.type === 'error' ? 
                            <ExclamationCircleIcon className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" /> : 
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-zinc-200 text-xs font-bold truncate leading-tight">{issue.message}</span>
                          </div>
                          <div className="flex flex-col space-y-2">
                             {issue.suggestion && (
                               <div className="flex items-start gap-2 bg-zinc-950/50 p-2 rounded-lg border border-zinc-900">
                                 <SparklesIcon className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                 <p className="text-[10px] text-zinc-500 leading-relaxed italic">{issue.suggestion}</p>
                               </div>
                             )}
                             <div className="flex items-center justify-between">
                               <span className="text-[9px] font-mono text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">Line {issue.line} &bull; {issue.code}</span>
                               {issue.fix && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleFix(issue); }}
                                   className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 text-[9px] font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all hover:bg-blue-500/20 active:scale-95"
                                 >
                                   <SparklesIcon className="w-3 h-3" />
                                   <span>Apply Auto-Fix</span>
                                 </button>
                               )}
                             </div>
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
                <p className="text-zinc-600 text-[11px] leading-relaxed font-medium">Modify the manifestation's core hue profile. This propagates through all design tokens dynamically.</p>
              </div>

              <div className="space-y-8">
                {[
                  { label: 'Primary Hue', key: 'h', max: 360, unit: '°', desc: 'Base color spectrum index.' },
                  { label: 'Color Saturation', key: 's', max: 100, unit: '%', desc: 'Intensity of the chromatic signal.' },
                  { label: 'Color Luminosity', key: 'l', max: 100, unit: '%', desc: 'Brightness level of the design skin.' },
                ].map((slider) => (
                  <div key={slider.key} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{slider.label}</span>
                        <span className="text-[9px] text-zinc-600 font-mono">{slider.desc}</span>
                      </div>
                      <span className="text-blue-500 font-mono font-black">{(localTheme as any)[slider.key]}{slider.unit}</span>
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
                className="w-full h-48 rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col items-center justify-center text-white space-y-4 transition-all duration-700 relative overflow-hidden group"
                style={{ backgroundColor: `hsl(${localTheme.h}, ${localTheme.s}%, ${localTheme.l}%)` }}
              >
                <div className="absolute inset-0 bg-dot-grid opacity-10" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-[9px] font-black opacity-60 uppercase tracking-[0.4em] mb-4 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-md">Color Signature</div>
                  <div className="text-3xl font-black font-mono tracking-tighter drop-shadow-lg">
                    #{localTheme.h.toString(16).padStart(2,'0')}{localTheme.s.toString(16).padStart(2,'0')}{localTheme.l.toString(16).padStart(2,'0')}
                  </div>
                  <div className="text-[11px] font-mono opacity-80 mt-2">
                    HSL({localTheme.h}, {localTheme.s}%, {localTheme.l}%)
                  </div>
                </div>
                <div className="w-16 h-1 bg-white/30 rounded-full transition-all group-hover:w-24 group-hover:bg-white/50" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
